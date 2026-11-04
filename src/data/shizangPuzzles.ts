import type { ShizangPuzzle } from '../types/game';
import { SHIZANG_001 } from './shizang/shard-001.ts';
import { SHIZANG_002 } from './shizang/shard-002.ts';
import { SHIZANG_003 } from './shizang/shard-003.ts';
import { SHIZANG_004 } from './shizang/shard-004.ts';
import { SHIZANG_005 } from './shizang/shard-005.ts';
import { SHIZANG_006 } from './shizang/shard-006.ts';
import { SHIZANG_007 } from './shizang/shard-007.ts';
import { SHIZANG_009 } from './shizang/shard-009.ts';
import { SHIZANG_008 } from './shizang/shard-008.ts';
import { SHIZANG_010 } from './shizang/shard-010.ts';
import { SHIZANG_011 } from './shizang/shard-011.ts';
import { SHIZANG_012 } from './shizang/shard-012.ts';
import { SHIZANG_013 } from './shizang/shard-013.ts';
import { SHIZANG_014 } from './shizang/shard-014.ts';
import { SHIZANG_015 } from './shizang/shard-015.ts';

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
  ...SHIZANG_004,
  ...SHIZANG_005,
  ...SHIZANG_006,
  ...SHIZANG_007,
  ...SHIZANG_009,
  ...SHIZANG_008,
  ...SHIZANG_010,
  ...SHIZANG_011,
  ...SHIZANG_012,
  ...SHIZANG_013,
  ...SHIZANG_014,
  ...SHIZANG_015,
];
