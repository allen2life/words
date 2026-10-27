// verify-offline.mjs — 验证平台铁律 1「纯单机可玩 / 离线优先」
// 用法: node scripts/verify-offline.mjs [--url http://127.0.0.1:4175]
//
// 做法：先正常加载让 Service Worker 与静态资源就位，再切断网络并硬刷新，
// 断言应用仍能启动、棋盘仍能渲染、且能完成一次推敲。
import { chromium } from 'playwright';
import { resolveChromeBin } from './lib/chrome.mjs';

const args = process.argv.slice(2);
const getArg = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : d;
};
const URL = getArg('url', 'http://127.0.0.1:4175/');

const browser = await chromium.launch({
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  executablePath: resolveChromeBin(),
});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
page.setDefaultTimeout(20000);

const results = [];
const check = (n, p, d) => {
  results.push({ n, p });
  console.log(`${p ? '✅' : '❌'} ${n}${d ? ` — ${d}` : ''}`);
};

try {
  // 1. 正常加载，让 SW 完成注册与预缓存
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForFunction(() => !!(window.__GAME__ && window.__GAME__.isReady), { timeout: 30000 });
  check('online load OK', true);

  const swState = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return 'unsupported';
    const reg = await navigator.serviceWorker.getRegistration();
    return reg ? (reg.active ? 'active' : 'registered') : 'none';
  });
  check('service worker registered', swState === 'active' || swState === 'registered', swState);

  // 给 SW 一点时间完成预缓存
  await page.waitForTimeout(3000);

  const cached = await page.evaluate(async () => {
    const out = {};
    for (const k of await caches.keys()) {
      const c = await caches.open(k);
      out[k] = (await c.keys()).map((r) => new URL(r.url).pathname);
    }
    return out;
  });
  const cachedPaths = Object.values(cached).flat();
  console.log('   cached:', JSON.stringify(cachedPaths));
  check('hashed bundle is precached', cachedPaths.some((p) => /\/assets\/.*\.(js|css)$/.test(p)));

  // 2. 再访问一次，确保 Service Worker 已接管本页（controller 非空）。
  //    首次访问时 SW 尚未激活，子资源请求不经过它——这是浏览器规范行为，
  //    真实用户第二次打开时才进入离线可用状态。
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(1500);
  const controlled = await page.evaluate(() => !!navigator.serviceWorker.controller);
  check('service worker controls the page', controlled);

  // 3. 断网 + 硬刷新
  await ctx.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 45000 }).catch((e) => {
    check('offline reload served from cache', false, e.message);
  });

  const offlineReady = await page.evaluate(() => !!(window.__GAME__ && window.__GAME__.isReady)).catch(() => false);
  check('app boots with network offline', offlineReady);

  if (offlineReady) {
    const text = await page.locator('body').innerText();
    check('shizang board renders offline', /Poetic Eye|诗眼/.test(text));

    // 3. 离线状态仍能完成一次推敲（核心玩法不依赖网络）
    const keys = page.locator('div.grid button');
    if ((await keys.count()) > 0) {
      await keys.first().click({ force: true });
      await page.waitForTimeout(300);
      const submit = page.locator('button', { hasText: /Draft & Submit|定稿推敲/ }).first();
      if ((await submit.count()) > 0) {
        await submit.click({ force: true });
        await page.waitForTimeout(800);
        const after = await page.locator('body').innerText();
        check('offline guess accepted (core gameplay works)', /1\/6/.test(after));
      } else {
        check('offline guess accepted (core gameplay works)', false, 'submit not found');
      }
    }
  }

  await ctx.setOffline(false);
  await page.screenshot({ path: 'proof-records/offline-check.png' }).catch(() => {});
} catch (err) {
  check(`execution error: ${err?.message || err}`, false);
}

await browser.close();
const failed = results.filter((r) => !r.p);
console.log(`\n=== ${results.length - failed.length}/${results.length} checks passed ===`);
process.exit(failed.length ? 1 : 0);
