// 确定性每日种子引擎（东八区统一基准日 + 离线高可用）
import { SHIZANG_PUZZLES } from '../data/shizangPuzzles';
import { WENMAI_PUZZLES } from '../data/wenmaiPuzzles';
import type { ShizangPuzzle, WenmaiPuzzle } from '../types/game';

// 基准日：2026-01-01 00:00:00 东八区时间
const EPOCH_DATE = new Date('2026-01-01T00:00:00+08:00').getTime();
const MS_PER_DAY = 86400000;

export interface DailySeedInfo {
  dayIndex: number;
  dayNumber: number;
  dateStr: string;
  formattedChineseDate: string;
}

/**
 * 计算东八区（北京时间）对应的统一天数索引与日期信息
 */
export function getDailySeed(customDate?: Date): DailySeedInfo {
  const now = customDate || new Date();

  // 转化为东八区标准时间
  const beijingTimeStr = now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' });
  const beijingDate = new Date(beijingTimeStr);

  // 统一至当日 00:00:00
  beijingDate.setHours(0, 0, 0, 0);

  const dayIndex = Math.max(0, Math.floor((beijingDate.getTime() - EPOCH_DATE) / MS_PER_DAY));
  const dayNumber = dayIndex + 1;

  const yyyy = beijingDate.getFullYear();
  const mm = String(beijingDate.getMonth() + 1).padStart(2, '0');
  const dd = String(beijingDate.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  // 中式农历/节令雅称风格时间
  const monthNames = ['孟春', '仲春', '季春', '孟夏', '仲夏', '季夏', '孟秋', '仲秋', '季秋', '孟冬', '仲冬', '季冬'];
  const monthChinese = monthNames[beijingDate.getMonth()] || `${beijingDate.getMonth() + 1}月`;
  const formattedChineseDate = `${yyyy}年 · ${monthChinese} · 初${dd}日`;

  return { dayIndex, dayNumber, dateStr, formattedChineseDate };
}

/**
 * 获取指定日期的《诗藏》谜题
 */
export function getDailyShizang(customDate?: Date): { puzzle: ShizangPuzzle; info: DailySeedInfo } {
  const info = getDailySeed(customDate);

  // 优先匹配节日/节气专属谜题
  const festival = SHIZANG_PUZZLES.find(p => p.festivalDate === info.dateStr || p.festivalDate === info.dateStr.slice(5));
  if (festival) {
    return { puzzle: festival, info };
  }

  // 确定性伪随机映射
  const index = info.dayIndex % SHIZANG_PUZZLES.length;
  return { puzzle: SHIZANG_PUZZLES[index], info };
}

/**
 * 获取指定日期的《文脉》谜题
 */
export function getDailyWenmai(customDate?: Date): { puzzle: WenmaiPuzzle; info: DailySeedInfo } {
  const info = getDailySeed(customDate);

  // 优先匹配日期
  const matched = WENMAI_PUZZLES.find(p => p.dateStr === info.dateStr);
  if (matched) {
    return { puzzle: matched, info };
  }

  const index = info.dayIndex % WENMAI_PUZZLES.length;
  return { puzzle: WENMAI_PUZZLES[index], info };
}

/**
 * 计算距离明日 00:00 的倒计时（秒）
 */
export function getSecondsUntilNextDay(): number {
  const now = new Date();
  const beijingTimeStr = now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' });
  const beijingDate = new Date(beijingTimeStr);
  
  const tomorrow = new Date(beijingDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return Math.max(0, Math.floor((tomorrow.getTime() - beijingDate.getTime()) / 1000));
}
