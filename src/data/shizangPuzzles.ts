import type { ShizangPuzzle } from '../types/game';
import { SHIZANG_001 } from './shizang/shard-001.ts';
import { SHIZANG_002 } from './shizang/shard-002.ts';
import { SHIZANG_003 } from './shizang/shard-003.ts';

/**
 * 《诗藏》题库总索引。
 *
 * 数据按片（shard）拆分，每片约 30–60 首，便于人工审校与按批次补题。
 * 新增内容时：新建 `shizang/shard-XXX.ts` 导出 `SHIZANG_XXX`，在此处 import 并加入数组。
 *
 * 题库容量目标：365 天不重复。
 * 出题逻辑见 `utils/dailySeeder.ts`（按东八区 dayIndex 取模）。
 */
export const SHIZANG_PUZZLES: ShizangPuzzle[] = [
  ...SHIZANG_001,
  ...SHIZANG_002,
  ...SHIZANG_003,
];
