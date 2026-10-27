// e2e-ui.mjs — 端到端 UI 回归：模拟真实玩家完成《诗藏》一局，并校验语言切换。
// 用法: node scripts/e2e-ui.mjs [--url http://127.0.0.1:4173] [--lang en|zh]
// 与 smoke.mjs 的区别：smoke 只验证“页面能干净加载”，本脚本验证“游戏真的能玩通”。
import { chromium } from 'playwright';
import { resolveChromeBin } from './lib/chrome.mjs';
import { mkdirSync } from 'node:fs';

const args = process.argv.slice(2);
const getArg = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : d;
};
const URL = getArg('url', 'http://127.0.0.1:4173/');
const LANG = getArg('lang', 'en');

const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass });
  console.log(`${pass ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const browser = await chromium.launch({
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  executablePath: resolveChromeBin(),
});
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  locale: LANG === 'zh' ? 'zh-CN' : 'en-US',
});
const page = await ctx.newPage();
page.setDefaultTimeout(20000);

const consoleErrors = [];
const pageErrors = [];
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
page.on('pageerror', (e) => pageErrors.push(e.message));

try {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForFunction(() => !!(window.__GAME__ && window.__GAME__.isReady), { timeout: 30000 });
  check('app boots and harness ready', true);

  // ── 1. 默认语言应为英语（平台铁律 6）──
  const bodyText = await page.locator('body').innerText();
  const hasEnglish = /Poetic Eye|Literary Pulse|Draft & Submit|Ink Triad/.test(bodyText);
  check('default locale is English (platform rule #6)', hasEnglish);

  // ── 2. 《诗藏》棋盘存在，且答案位是空白的 ──
  const eyeSlots = await page.locator('text=/诗眼|^Eye$/').count();
  check('shizang board renders (poetic-eye marker present)', eyeSlots > 0, `${eyeSlots} marker(s)`);

  // ── 3. 字盘可交互：选一个字 → 提交，应产生一条推敲记录 ──
  const keypadButtons = page.locator('div.grid button');
  const keypadCount = await keypadButtons.count();
  check('keypad has candidate characters', keypadCount > 0, `${keypadCount} chars`);

  if (keypadCount > 0) {
    await keypadButtons.first().click({ force: true });
    await page.waitForTimeout(300);

    // 提交按钮（英文 "Draft & Submit" / 中文 "定稿推敲"）
    const submit = page.locator('button', { hasText: /Draft & Submit|定稿推敲/ }).first();
    const submitCount = await submit.count();
    check('submit button discoverable', submitCount > 0);

    if (submitCount > 0) {
      await submit.click({ force: true });
      await page.waitForTimeout(800);

      // 推敲历程应出现 1/6 或状态徽标（朱砂红/松花黄/墨灰 或其英文名）
      const afterText = await page.locator('body').innerText();
      const recorded = /\(1\/6\)|1\/6/.test(afterText);
      check('guess recorded in history (1/6)', recorded);

      // 首次推敲后应解锁第一重提示
      const clueUnlocked = /Rhyme & Tone|音韵/.test(afterText);
      check('first clue unsealed after 1 guess', clueUnlocked);
    }
  }

  // ── 4. 切换到《文脉》──
  const wenmaiTab = page.locator('button', { hasText: /Literary Pulse|文脉/ }).first();
  if ((await wenmaiTab.count()) > 0) {
    await wenmaiTab.click({ force: true });
    await page.waitForTimeout(700);
    const wenmaiText = await page.locator('body').innerText();
    const hasGrid = /Four Lineages|四脉|16/.test(wenmaiText);
    check('wenmai mode switches and renders', hasGrid);
  } else {
    check('wenmai mode switches and renders', false, 'tab not found');
  }

  // 截图留证
  mkdirSync('proof-records', { recursive: true });
  await page.screenshot({ path: `proof-records/e2e-${LANG}.png` });
} catch (err) {
  check(`execution error: ${err?.message || err}`, false);
  await page.screenshot({ path: 'proof-records/e2e-failure.png' }).catch(() => {});
}

await browser.close();

check('no console errors', consoleErrors.length === 0, consoleErrors.join(' | ') || undefined);
check('no page errors', pageErrors.length === 0, pageErrors.join(' | ') || undefined);

const failed = results.filter((r) => !r.pass);
console.log(`\n=== ${results.length - failed.length}/${results.length} checks passed ===`);
process.exit(failed.length ? 1 : 0);
