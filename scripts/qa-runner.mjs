// qa-runner.mjs
// 自动化自测、自玩、录屏证明脚本 (Autonomous Game QA & Proof Video Recorder)
// 使用方式: node scripts/qa-runner.mjs [--url http://localhost:5173] [--duration 15]

import { chromium } from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
function getArg(name, defaultValue) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultValue;
}

const TARGET_URL = getArg('url', 'http://localhost:5173');
const PLAY_DURATION_SEC = parseInt(getArg('duration', '15'), 10);
const OUTPUT_DIR = path.resolve(process.cwd(), 'proof-records');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log(`[QA_RUNNER] Starting Autonomous Playtesting...`);
console.log(`[QA_RUNNER] Target URL: ${TARGET_URL}`);
console.log(`[QA_RUNNER] Test Duration: ${PLAY_DURATION_SEC}s`);

async function main() {
  const browserLaunchOptions = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--use-angle=default'
    ]
  };

  if (fs.existsSync(CHROME_PATH)) {
    browserLaunchOptions.executablePath = CHROME_PATH;
  }

  const browser = await chromium.launch(browserLaunchOptions);
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();

  const consoleLogs = [];
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];

  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    consoleLogs.push({ type, text, time: Date.now() });
    if (type === 'error') {
      consoleErrors.push(text);
      console.error(`[BROWSER_CONSOLE_ERROR] ${text}`);
    }
  });

  page.on('pageerror', err => {
    const msg = err.stack || err.message;
    pageErrors.push(msg);
    console.error(`[BROWSER_PAGE_ERROR] ${msg}`);
  });

  page.on('requestfailed', req => {
    failedRequests.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
    console.warn(`[BROWSER_NETWORK_FAILED] ${req.url()}`);
  });

  try {
    console.log(`[QA_RUNNER] Navigating to ${TARGET_URL}...`);
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // 1. 等待游戏画布加载
    await page.waitForSelector('canvas', { timeout: 10000 });
    console.log(`[QA_RUNNER] Canvas element detected.`);

    // 点击一次 Canvas 确保激活焦点
    await page.click('canvas', { force: true }).catch(() => {});

    // 2. 等待游戏探针进入 ready 状态 (最多等待 12 秒)
    console.log(`[QA_RUNNER] Waiting for window.__GAME__.isReady...`);
    await page.waitForFunction(() => {
      return window.__GAME__ && window.__GAME__.isReady === true;
    }, { timeout: 12000 });
    console.log(`[QA_RUNNER] Game marked isReady: true!`);

    // 3. 自动化自玩模拟 (Autonomous Playback)
    console.log(`[QA_RUNNER] Simulating gameplay input for ${PLAY_DURATION_SEC} seconds...`);
    const startTime = Date.now();
    const endTime = startTime + (PLAY_DURATION_SEC * 1000);

    const keysToTry = ['Space', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'KeyZ', 'KeyX', 'Enter'];
    let step = 0;

    while (Date.now() < endTime) {
      step++;
      const elapsed = (Date.now() - startTime) / 1000;
      const key = keysToTry[step % keysToTry.length];
      
      // 模拟按键交互
      await page.keyboard.down(key).catch(() => {});
      await page.waitForTimeout(150);
      await page.keyboard.up(key).catch(() => {});

      // 阶段化探索玩法：
      // 前半程：测试《诗藏》猜字交互
      if (elapsed < PLAY_DURATION_SEC * 0.5) {
        // 查找灵感候选字盘按钮
        const candidateBtns = await page.$$('div.grid button');
        if (candidateBtns.length > 0) {
          const targetIndex = (step * 3) % candidateBtns.length;
          await candidateBtns[targetIndex].click({ force: true }).catch(() => {});
          await page.waitForTimeout(200);

          // 尝试点击“定稿推敲”
          const submitBtn = await page.$('button:has-text("定稿推敲"), button:has-text("定稿")');
          if (submitBtn && step % 3 === 0) {
            await submitBtn.click({ force: true }).catch(() => {});
            await page.waitForTimeout(300);
          }
        }
      } 
      // 中程：切换至《文脉》并测试典故四连
      else if (elapsed >= PLAY_DURATION_SEC * 0.5 && elapsed < PLAY_DURATION_SEC * 0.85) {
        // 点击切换到“文脉”模式
        const wenmaiTab = await page.$('button:has-text("文脉")');
        if (wenmaiTab && step % 4 === 0) {
          await wenmaiTab.click({ force: true }).catch(() => {});
          await page.waitForTimeout(300);
        }

        // 挑选词条方块点击
        const tiles = await page.$$('div.grid > div[role="button"], div.grid button');
        if (tiles.length > 0) {
          const randTile = tiles[(step * 5) % tiles.length];
          await randTile.click({ force: true }).catch(() => {});
          await page.waitForTimeout(200);
        }

        // 尝试点击论证归类按钮
        const wenmaiSubmit = await page.$('button:has-text("归类论证"), button:has-text("确认")');
        if (wenmaiSubmit && step % 4 === 0) {
          await wenmaiSubmit.click({ force: true }).catch(() => {});
          await page.waitForTimeout(300);
        }
      }
      // 后程：关闭可能的模态弹窗或切换规则，验证关闭状态
      else {
        const closeBtns = await page.$$('button:has-text("关闭"), button:has-text("×"), [aria-label="close"]');
        for (const btn of closeBtns) {
          await btn.click({ force: true }).catch(() => {});
        }
        await page.mouse.click(640, 360).catch(() => {});
      }

      await page.waitForTimeout(300);

      // 实时检测游戏探针中的错误
      const gameHarnessErrors = await page.evaluate(() => window.__GAME__?.errors || []);
      if (gameHarnessErrors.length > 0) {
        throw new Error(`Game harness caught error: ${JSON.stringify(gameHarnessErrors[0])}`);
      }
    }

    // 读取测试结束时的游戏状态
    const finalGameState = await page.evaluate(() => ({
      score: window.__GAME__?.score ?? 0,
      fps: window.__GAME__?.fps ?? 0,
      frameCount: window.__GAME__?.frameCount ?? 0,
      state: window.__GAME__?.state ?? 'unknown'
    }));

    console.log(`[QA_RUNNER] Gameplay simulation completed:`, finalGameState);

    if (finalGameState.frameCount < 30) {
      throw new Error(`Game render loop stalled! Total frames rendered: ${finalGameState.frameCount}`);
    }

  } catch (err) {
    console.error(`[QA_RUNNER_FATAL_ERROR] ${err.message}`);
    pageErrors.push(err.message);
  } finally {
    const video = page.video();
    await page.close();
    await context.close();
    await browser.close();

    let videoPath = null;
    if (video) {
      videoPath = await video.path();
      console.log(`[QA_RUNNER] Raw WebM video saved: ${videoPath}`);
      
      // 尝试转换为通用 MP4
      const mp4Path = path.join(OUTPUT_DIR, `proof_${Date.now()}.mp4`);
      try {
        execSync(`ffmpeg -y -i "${videoPath}" -c:v libx264 -pix_fmt yuv420p "${mp4Path}"`, { stdio: 'pipe' });
        console.log(`[QA_RUNNER] Proof MP4 video successfully created: ${mp4Path}`);
        videoPath = mp4Path;
      } catch {
        console.warn(`[QA_RUNNER] FFmpeg conversion skipped, using original format.`);
      }
    }

    // 汇总报告
    const hasFailures = consoleErrors.length > 0 || pageErrors.length > 0;
    const report = {
      passed: !hasFailures,
      timestamp: new Date().toISOString(),
      targetUrl: TARGET_URL,
      proofVideo: videoPath,
      stats: {
        consoleErrorsCount: consoleErrors.length,
        pageErrorsCount: pageErrors.length,
        failedRequestsCount: failedRequests.length
      },
      errors: {
        consoleErrors,
        pageErrors,
        failedRequests
      }
    };

    const reportPath = path.join(OUTPUT_DIR, 'qa-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`[QA_RUNNER] QA Report written to: ${reportPath}`);

    if (hasFailures) {
      console.error(`\n❌ [QA FAILED] Test detected runtime defects. Fix required.`);
      process.exit(1);
    } else {
      console.log(`\n✅ [QA PASSED] Zero console errors, render loop healthy, proof video ready.`);
      console.log(`PROOF_VIDEO_PATH: ${videoPath}`);
      process.exit(0);
    }
  }
}

main().catch(err => {
  console.error(`[QA_RUNNER] Unexpected crash:`, err);
  process.exit(1);
});
