// game-harness.js
// 浏览器游戏自省与可观测性探针（Standard Game Harness Contract）
// 在游戏初始化前或入口文件最顶部引入此文件

(function() {
  window.__GAME__ = {
    // 基础状态契约
    name: 'Browser Game',
    version: '1.0.0',
    isReady: false,          // 关键：所有资源加载完毕，主场景已渲染第一帧，且可以接收用户输入
    state: 'booting',        // 'booting' | 'ready' | 'playing' | 'paused' | 'game_over' | 'victory'
    score: 0,
    fps: 0,
    frameCount: 0,

    // 错误收集器
    errors: [],

    // 模拟玩家输入（供自测脚本或 AI 自玩使用）
    simulateInput: function(action, value) {
      if (typeof window.__GAME_INPUT_HANDLER__ === 'function') {
        window.__GAME_INPUT_HANDLER__(action, value);
      } else {
        // 默认模拟键盘事件
        const eventType = value ? 'keydown' : 'keyup';
        const event = new KeyboardEvent(eventType, {
          key: action,
          code: action,
          bubbles: true,
          cancelable: true
        });
        window.dispatchEvent(event);
      }
    },

    // 标记游戏就绪
    setReady: function(isReady = true) {
      this.isReady = isReady;
      if (isReady && this.state === 'booting') {
        this.state = 'ready';
      }
      console.log(`[GAME_HARNESS] Game isReady set to: ${isReady}`);
    },

    // 更新状态
    setState: function(newState) {
      this.state = newState;
      console.log(`[GAME_HARNESS] State changed to: ${newState}`);
    }
  };

  // 全局异常拦截（未捕获的 Error 与 Promise Rejection）
  window.addEventListener('error', function(event) {
    const errorInfo = {
      type: 'uncaught_error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error ? event.error.stack : null,
      time: Date.now()
    };
    window.__GAME__.errors.push(errorInfo);
    console.error('[GAME_HARNESS] Captured error:', errorInfo);
  });

  window.addEventListener('unhandledrejection', function(event) {
    const errorInfo = {
      type: 'unhandled_rejection',
      message: event.reason?.message || String(event.reason),
      stack: event.reason?.stack || null,
      time: Date.now()
    };
    window.__GAME__.errors.push(errorInfo);
    console.error('[GAME_HARNESS] Captured unhandled rejection:', errorInfo);
  });

  // FPS 监控探针
  let lastTime = performance.now();
  let frames = 0;
  function updateFpsProbe(now) {
    frames++;
    window.__GAME__.frameCount++;
    if (now >= lastTime + 1000) {
      window.__GAME__.fps = Math.round((frames * 1000) / (now - lastTime));
      frames = 0;
      lastTime = now;
    }
    requestAnimationFrame(updateFpsProbe);
  }
  requestAnimationFrame(updateFpsProbe);
})();
