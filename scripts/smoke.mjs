// smoke.mjs — 轻量冒烟测试：加载首页、检查控制台错误、验证 __GAME__ 探针
// 用法: node scripts/smoke.mjs [--url https://words.loongclan.xyz]
import { chromium } from 'playwright';
import { existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const args = process.argv.slice(2);
const getArg = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : d;
};
const URL = getArg('url', 'http://127.0.0.1:4173/');

// 可选地指定 Chromium 路径：优先 CHROME_BIN，其次缓存目录中版本号最高的 chromium。
// 未命中则交给 Playwright 自行解析（CI 中由 `playwright install` 提供）。
const CACHE_ROOT = join(homedir(), '.cache', 'ms-playwright');
function resolveChromeBin() {
  if (process.env.CHROME_BIN && existsSync(process.env.CHROME_BIN)) return process.env.CHROME_BIN;
  if (!existsSync(CACHE_ROOT)) return undefined;
  const candidates = readdirSync(CACHE_ROOT)
    .filter((d) => /^chromium-\d+$/.test(d))
    .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))
    .map((d) => join(CACHE_ROOT, d, 'chrome-linux64', 'chrome'));
  return candidates.find((p) => existsSync(p));
}

function fail(msg) {
  console.error(`\n[SMOKE][FAIL] ${msg}\n`);
  process.exit(1);
}

const browser = await chromium.launch({
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  executablePath: resolveChromeBin(),
});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
page.setDefaultTimeout(20000);

const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
page.on('pageerror', (e) => pageErrors.push(e.message));
page.on('requestfailed', (r) => failedRequests.push(`${r.url()} ${r.failure()?.errorText || ''}`));

let harness = null;
let title = '';
let bodyText = '';
let stage = 'navigate';

try {
  // domcontentloaded 是确定性的；不用 networkidle（外部字体等长尾请求会导致偶发超时）
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });

  stage = 'wait-for-harness';
  await page.waitForFunction(() => !!(window.__GAME__ && window.__GAME__.isReady === true), {
    timeout: 30000,
  });

  stage = 'collect';
  title = await page.title();
  harness = await page.evaluate(() => ({
    isReady: window.__GAME__.isReady,
    state: window.__GAME__.state,
    name: window.__GAME__.name,
  }));
  bodyText = (await page.locator('body').innerText()).slice(0, 500);

  stage = 'screenshot';
  mkdirSync('proof-records', { recursive: true });
  await page.screenshot({ path: 'proof-records/smoke-home.png' });
} catch (err) {
  await page
    .screenshot({ path: 'proof-records/smoke-failure.png' })
    .catch(() => {});
  console.error(
    JSON.stringify(
      { stage, error: String(err?.message || err), consoleErrors, pageErrors, failedRequests },
      null,
      2
    )
  );
  await browser.close().catch(() => {});
  fail(`failed during "${stage}": ${err?.message || err}`);
}

await browser.close();

console.log(
  JSON.stringify(
    { url: URL, title, harness, consoleErrors, pageErrors, failedRequests, bodyText },
    null,
    2
  )
);

if (pageErrors.length) fail(`page errors: ${pageErrors.join(' | ')}`);
if (consoleErrors.length) fail(`console errors: ${consoleErrors.join(' | ')}`);
if (!harness?.isReady) fail('window.__GAME__.isReady was not true');

console.log('\n[SMOKE][PASS] page loaded clean, harness ready.');
process.exit(0);
