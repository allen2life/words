// 纯前端 HTML5 Canvas 生成东方水墨金石打卡分享图
export interface ShareCardData {
  gameTitle: string;        // "《诗藏》第 249 期" 或 "《文脉》第 249 期"
  dateStr: string;          // "2026-09-06"
  formattedDate: string;    // "2026年 · 孟秋 · 初六日"
  highlightPoem: string;    // 核心展示句，如 "春风又绿江南岸"
  author: string;           // "宋 · 王安石"
  resultSummary: string;    // 如 "3次破局 · 意境洞开" 或 "四脉通达 · 零失误"
  blocks?: string[][];      // 像 Wordle 一样的色块阵列（朱砂红、松花黄、墨灰）
  streak: number;           // 连续解谜天数
  rankTitle: string;        // 功名称号，如 "一甲探花"
}

export async function generateShareCard(data: ShareCardData): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  // 画布尺寸：900 x 1200 (3:4 经典文雅比例)
  const width = 900;
  const height = 1200;
  canvas.width = width;
  canvas.height = height;

  // 1. 宣纸肌理底色
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#FAF6EE');
  bgGrad.addColorStop(1, '#F3ECE0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 细微米纸杂质点缀
  ctx.fillStyle = 'rgba(180, 160, 130, 0.08)';
  for (let i = 0; i < 400; i++) {
    const rx = Math.random() * width;
    const ry = Math.random() * height;
    const rSize = Math.random() * 2.5;
    ctx.fillRect(rx, ry, rSize, rSize);
  }

  // 2. 双层古典边框
  ctx.strokeStyle = '#3C3833';
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  ctx.strokeStyle = 'rgba(185, 58, 50, 0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(48, 48, width - 96, height - 96);

  // 3. 顶部题头
  ctx.fillStyle = '#6B655D';
  ctx.font = '22px "Noto Serif SC", serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '6px';
  ctx.fillText('国风日课 · 东方文脉轻解谜', width / 2, 105);

  // 游戏主标题
  ctx.fillStyle = '#1C1A17';
  ctx.font = 'bold 52px "Noto Serif SC", serif';
  ctx.letterSpacing = '10px';
  ctx.fillText(data.gameTitle, width / 2, 180);

  // 日期
  ctx.fillStyle = '#8C8377';
  ctx.font = '24px "Noto Serif SC", serif';
  ctx.letterSpacing = '3px';
  ctx.fillText(data.formattedDate, width / 2, 230);

  // 装饰分隔横线（中间带古典菱形纹）
  ctx.strokeStyle = 'rgba(140, 130, 115, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(120, 265);
  ctx.lineTo(width - 120, 265);
  ctx.stroke();

  // 4. 核心诗句展示区（仿宋雕版印刷木刻框）
  const poemBoxY = 310;
  const poemBoxH = 220;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillRect(100, poemBoxY, width - 200, poemBoxH);
  ctx.strokeStyle = 'rgba(180, 160, 130, 0.5)';
  ctx.strokeRect(100, poemBoxY, width - 200, poemBoxH);

  ctx.fillStyle = '#1A1918';
  ctx.font = 'bold 44px "Noto Serif SC", serif';
  ctx.letterSpacing = '8px';
  ctx.fillText(data.highlightPoem, width / 2, poemBoxY + 100);

  ctx.fillStyle = '#7C7469';
  ctx.font = '26px "Noto Serif SC", serif';
  ctx.letterSpacing = '4px';
  ctx.fillText(data.author, width / 2, poemBoxY + 160);

  // 5. 战绩评语
  ctx.fillStyle = '#B93A32';
  ctx.font = 'bold 36px "Noto Serif SC", serif';
  ctx.letterSpacing = '6px';
  ctx.fillText(`【 ${data.resultSummary} 】`, width / 2, 600);

  // 6. 如果有色块（Wordle 式朱砂/松花/墨灰方块）
  if (data.blocks && data.blocks.length > 0) {
    const startY = 660;
    const blockSize = 38;
    const gap = 12;
    data.blocks.forEach((row, rIdx) => {
      const rowW = row.length * blockSize + (row.length - 1) * gap;
      const startX = (width - rowW) / 2;
      row.forEach((color, cIdx) => {
        const bx = startX + cIdx * (blockSize + gap);
        const by = startY + rIdx * (blockSize + gap);
        ctx.fillStyle = color;
        ctx.fillRect(bx, by, blockSize, blockSize);
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.strokeRect(bx, by, blockSize, blockSize);
      });
    });
  }

  // 7. 连续打卡与当前功名
  const bottomY = 940;
  ctx.fillStyle = '#3E3B37';
  ctx.font = '26px "Noto Serif SC", serif';
  ctx.letterSpacing = '4px';
  ctx.fillText(`修习文脉连击 · ${data.streak} 宿  |  当朝功名 · ${data.rankTitle}`, width / 2, bottomY);

  // 8. 盖印：朱红闲章
  drawTraditionalSeal(ctx, width / 2 - 45, 1000, 90, 90, '文心雕龙');

  // 底部提示
  ctx.fillStyle = '#9C9387';
  ctx.font = '20px "Noto Serif SC", serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('君子日省 · 诗以言志 · 词以润德', width / 2, 1140);

  return canvas.toDataURL('image/png');
}

/**
 * 绘制传统九叠篆风格朱红印章
 */
function drawTraditionalSeal(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, text: string) {
  ctx.save();
  ctx.translate(x, y);

  // 印章外框带轻微微晃自然手感
  ctx.strokeStyle = '#B93A32';
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, w, h);
  
  // 内圈细框
  ctx.lineWidth = 1.5;
  ctx.strokeRect(4, 4, w - 8, h - 8);

  // 印油微溢效果
  ctx.fillStyle = 'rgba(185, 58, 50, 0.08)';
  ctx.fillRect(0, 0, w, h);

  // 印文
  ctx.fillStyle = '#B93A32';
  ctx.font = 'bold 22px "Noto Serif SC", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 4字印：右上一，右下一，左上一，左下一 (传统顺时针竖读)
  if (text.length === 4) {
    ctx.fillText(text[0], w * 0.72, h * 0.32);
    ctx.fillText(text[1], w * 0.72, h * 0.72);
    ctx.fillText(text[2], w * 0.28, h * 0.32);
    ctx.fillText(text[3], w * 0.28, h * 0.72);
  } else {
    ctx.fillText(text.slice(0, 2), w / 2, h * 0.35);
    ctx.fillText(text.slice(2, 4), w / 2, h * 0.68);
  }

  ctx.restore();
}
