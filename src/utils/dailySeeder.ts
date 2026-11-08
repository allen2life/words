// 确定性每日种子引擎（东八区统一基准日 + 离线高可用）
import { SHIZANG_PUZZLES } from '../data/shizangPuzzles';
import { WENMAI_PUZZLES } from '../data/wenmaiPuzzles';
import type { ShizangPuzzle, WenmaiPuzzle } from '../types/game';

// 基准日：2026-01-01 00:00:00 东八区时间
const EPOCH_DATE = new Date('2026-01-01T00:00:00+08:00').getTime();
const MS_PER_DAY = 86400000;

/** 《文脉》按 dateStr 升序的稳定副本，供空洞日回退使用（模块加载时构建一次） */
const WENMAI_SORTED = [...WENMAI_PUZZLES].sort((a, b) => a.dateStr.localeCompare(b.dateStr));

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

  // ── 路线甲：日历空洞日的确定性回退 ──
  // 旧实现 dayIndex % length 会在 dateStr 不连续时重放已发过的旧题，且导致
  // 「导航 Vol.N」与「题面第 M 期」号差巨大。
  //
  // 新实现（无状态、纯函数、同一日期恒返回同一题）：
  //   k = 今天之前（dateStr < 今天）已有题库条目数，即「已被日历消费掉的期数」；
  //   空洞日按顺序取 sorted[k]、sorted[k+1]…… 连续空洞日自然各取一期，不重复。
  //   若 k 已达库存末尾，则从 0 重新循环（库存耗尽兜底）。
  const sorted = WENMAI_SORTED;
  const consumed = sorted.filter(p => p.dateStr < info.dateStr).length;

  // 连续空洞日必须各取一期：以「上一个有 dateStr 的日子」为锚，算出今天是空洞内第几天。
  // idx = 已消费期数 + (今天 - 锚日 - 1)，锚日当天已有题，故减 1。
  let idx = consumed;
  if (consumed > 0) {
    const anchor = sorted[consumed - 1].dateStr;
    const anchorDayIndex = Math.floor((new Date(anchor + 'T00:00:00+08:00').getTime() - EPOCH_DATE) / MS_PER_DAY);
    idx = consumed + (info.dayIndex - anchorDayIndex) - 1;
  } else {
    idx = info.dayIndex;
  }
  const fallback = sorted[((idx % sorted.length) + sorted.length) % sorted.length];
  return { puzzle: fallback, info };
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
