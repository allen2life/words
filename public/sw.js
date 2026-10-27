// sw.js — Service Worker：本地优先离线缓存 (LoongClan Words)
//
// 设计要点（为什么不是简单的 prerender + cache.addAll）：
// 1. 构建产物文件名带内容哈希（/assets/index-XXXX.js），无法在 SW 里写死；
// 2. 因此不能在 install 阶段只预缓存固定的几个文件——那样断网后 HTML 引用的
//    哈希 bundle 依然取不到，应用起不来；
// 3. 改为：install 预缓存「外壳」，运行时对首次访问的同源静态资源边用边存，
//    navigation 请求走「网络优先 → 回退缓存」，保证断网仍能启动。
const CACHE_NAME = 'loongclan-words-v2';
const PRECACHE = ['/', '/index.html', '/favicon.svg', '/manifest.webmanifest', '/game-harness.js', '/icons.svg'];

/**
 * 关键一步：构建产物的 JS/CSS 带内容哈希，SW 无法写死文件名。
 * 必须在 install 阶段抓取 index.html，解析出 <script src> / <link href> 指向的
 * /assets/* 资源一并预缓存——否则断网后 HTML 里的哈希 bundle 取不到，应用起不来。
 */
async function precacheShellAndAssets() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.allSettled(PRECACHE.map((u) => cache.add(u)));

  try {
    const res = await fetch('/index.html', { cache: 'reload' });
    if (!res.ok) return;
    const html = await res.clone().text();
    await cache.put('/index.html', res);

    const assetPaths = new Set();
    const re = /(?:src|href)\s*=\s*["']([^"']+\.(?:js|css))["']/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
      const p = m[1];
      if (p.startsWith('/') && !p.startsWith('//')) assetPaths.add(p);
    }
    await Promise.allSettled([...assetPaths].map((p) => cache.add(p)));
  } catch {
    // 预缓存失败不应阻断 SW 安装；运行时还会再次尝试缓存
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheShellAndAssets().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 只处理同源资源；跨域（字体/API）交给浏览器默认行为
  if (url.origin !== self.location.origin) return;

  // 平台同步/排行榜 API：网络优先，失败时给出明确的离线响应
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(JSON.stringify({ code: 503, message: 'Offline: cloud temporarily unreachable' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          })
      )
    );
    return;
  }

  // 导航请求（HTML）：网络优先 → 回退到缓存的 index.html
  // 这样每次上线都能拿到新版本，断网时也不至于白屏。
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put('/index.html', copy));
          return res;
        })
        .catch(() => caches.match('/index.html').then((r) => r || caches.match('/')))
    );
    return;
  }

  // 其余同源静态资源（含带哈希的 JS/CSS）：缓存优先 + 后台更新
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cached) => {
      if (cached) {
        // 后台静默更新，不阻塞当前响应
        fetch(request)
          .then((res) => {
            if (res && res.status === 200) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((c) => c.put(request, copy));
            }
          })
          .catch(() => {});
        return cached;
      }

      return fetch(request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => {
          // 兜底：仍找不到时给出明确响应，避免浏览器抛 ERR_FAILED
          if (request.destination === 'script') {
            return new Response('/* offline: asset unavailable */', {
              status: 200,
              headers: { 'Content-Type': 'application/javascript' }
            });
          }
          return new Response('', { status: 504, statusText: 'Offline and not cached' });
        });
    })
  );
});
