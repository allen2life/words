// chrome.mjs — 跨平台解析 Playwright 可用的 Chromium 可执行文件
// 优先级：CHROME_BIN 环境变量 → Playwright 缓存中版本号最高的 chromium → 交给 Playwright 自行解析
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const CACHE_ROOT = join(homedir(), '.cache', 'ms-playwright');

export function resolveChromeBin() {
  if (process.env.CHROME_BIN && existsSync(process.env.CHROME_BIN)) {
    return process.env.CHROME_BIN;
  }
  if (!existsSync(CACHE_ROOT)) return undefined;

  return readdirSync(CACHE_ROOT)
    .filter((d) => /^chromium-\d+$/.test(d))
    .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))
    .map((d) => join(CACHE_ROOT, d, 'chrome-linux64', 'chrome'))
    .find((p) => existsSync(p));
}
