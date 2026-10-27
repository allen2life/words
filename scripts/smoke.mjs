// smoke.mjs — 轻量冒烟测试：加载首页、检查控制台错误、验证 __GAME__ 探针
// 用法: node scripts/smoke.mjs [--url http://127.0.0.1:4173]
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

// 可选择性地指定 Chromium 路径：优先 CHROME_BIN，其次缓存目录中最新版本。
// 未命中则交给 Playwright 自行解析（CI 中由 `playwright install` 提供）。
const CACHE_ROOT = join(homedir(), '.cache', 'ms-playwright');
function resolveChromeBin() {
  if (process.env.CHROME_BIN && existsSync(process.env.CHROME_BIN)) return process.env.CHROME_BIN;
  if (!existsSync(CACHE_ROOT)) return undefined;
  const candidates = readdirSync(CACHE_ROOT)
    .filter((d) => d.startsWith('chromium-'))
    .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))
    .map((d) => join(CACHE_ROOT, d, 'chrome-linux64', 'chrome'));
  return candidates.find((p) => existsSync(p));
}

const browser = await chromium.launch({
  args: ['--no-sandbox'],
  executablePath: resolveChromeBin(),
});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
page.on('pageerror', (e) => pageErrors.push(e.message));
page.on('requestfailed', (r) => failedRequests.push(`${r.url()} ${r.failure()?.errorText || ''}`));

await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2500);

const title = await page.title();
const harness = await page.evaluate(() =>
  window.__GAME__
    ? { isReady: window.__GAME__.isReady, state: window.__GAME__.state, name: window.__GAME__.name }
    : null
);
const bodyText = (await page.locator('body').innerText()).slice(0, 500);

console.log(JSON.stringify({ url: URL, title, harness, consoleErrors, pageErrors, failedRequests, bodyText }, null, 2));
mkdirSync('proof-records', { recursive: true });
await page.screenshot({ path: 'proof-records/smoke-home.png' });
await browser.close();

const ok = pageErrors.length === 0 && consoleErrors.length === 0 && harness?.isReady === true;
process.exit(ok ? 0 : 1);
