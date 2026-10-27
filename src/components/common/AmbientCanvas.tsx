import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  rotation: number;
  rotSpeed: number;
  color: string;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

declare global {
  interface Window {
    __GAME__?: {
      name: string;
      version: string;
      isReady: boolean;
      state: string;
      score: number;
      fps: number;
      frameCount: number;
      errors: any[];
      simulateInput: (action: string, value: any) => void;
      setReady: (isReady?: boolean) => void;
      setState: (state: string) => void;
    };
    __GAME_INPUT_HANDLER__?: (action: string, value: any) => void;
  }
}

export const AmbientCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 焦点激活与防陷阱
    canvas.focus();

    // 动态调整尺寸
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // 粒子系统：国风水墨与落梅飞花
    const particles: Particle[] = [];
    const particleCount = 28;
    const colors = [
      'rgba(185, 58, 50, 0.45)',  // 朱砂红梅
      'rgba(201, 148, 39, 0.35)', // 澄金
      'rgba(60, 50, 40, 0.25)',   // 淡墨
      'rgba(46, 75, 110, 0.3)'    // 黛蓝
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.3) * 35,
        vy: (Math.random() * 25) + 15,
        radius: Math.random() * 3.5 + 1.5,
        alpha: Math.random() * 0.5 + 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 1.5,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    // 交互水墨波纹池
    const ripples: Ripple[] = [];

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      ripples.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        radius: 4,
        maxRadius: 65,
        alpha: 0.6
      });
    };
    canvas.addEventListener('click', handleCanvasClick);

    // 按键与失焦保护
    const handleBlur = () => {
      // 清理交互按键状态
    };
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) handleBlur();
    });

    // 动画主循环（Delta 时间防护）
    let lastTime = performance.now();
    let animationFrameId: number;
    let isFirstFrame = true;

    const render = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      // 关键防瞬移：边界截断 Math.min(dt, 0.1)
      const dt = Math.min(Math.max(rawDt, 0), 0.1);
      lastTime = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. 绘制水墨微波
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += dt * 50;
        r.alpha -= dt * 0.7;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(185, 58, 50, ${r.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // 2. 绘制国风飞花粒子
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.rotSpeed * dt;

        // 环绕边界循环
        if (p.y > canvas.height + 20) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width + 20) p.x = -10;
        if (p.x < -20) p.x = canvas.width + 10;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        // 花瓣/水滴造型
        ctx.beginPath();
        ctx.ellipse(0, 0, p.radius, p.radius * 1.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 首帧就绪信号通知探针
      if (isFirstFrame) {
        isFirstFrame = false;
        if (window.__GAME__) {
          window.__GAME__.setReady(true);
          window.__GAME__.setState('playing');
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', handleCanvasClick);
      window.removeEventListener('blur', handleBlur);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="ambient-canvas"
      tabIndex={0}
      className="fixed inset-0 pointer-events-none z-0 opacity-40 focus:outline-none"
      aria-label="国风意境微动效"
    />
  );
};
