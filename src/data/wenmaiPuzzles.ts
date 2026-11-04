import type { WenmaiPuzzle } from '../types/game';
import { WENMAI_001 } from './wenmai/shard-001.ts';
import { WENMAI_002 } from './wenmai/shard-002.ts';
import { WENMAI_003 } from './wenmai/shard-003.ts';
import { WENMAI_004 } from './wenmai/shard-004.ts';
import { WENMAI_005 } from './wenmai/shard-005.ts';
import { WENMAI_006 } from './wenmai/shard-006.ts';
import { WENMAI_007 } from './wenmai/shard-007.ts';
import { WENMAI_008 } from './wenmai/shard-008.ts';
import { WENMAI_011 } from './wenmai/shard-011.ts';

/**
 * 《文脉》题库总索引。
 *
 * 数据按片（shard）拆分，每片约 12–22 期，便于人工审校与按批次补题。
 * 新增内容时：新建 `wenmai/shard-XXX.ts` 导出 `WENMAI_XXX`，在此处 import 并加入数组。
 *
 * 约束：同一期内 16 词必须互不重复，跨期亦应趋近零重复
 * （用 `node scripts/wenmai-conflicts.mjs` 校验）。
 *
 * 题库容量目标：365 天不重复。
 */
export const WENMAI_PUZZLES: WenmaiPuzzle[] = [
  ...WENMAI_001,
  ...WENMAI_002,
  ...WENMAI_003,
  ...WENMAI_004,
  ...WENMAI_005,
  ...WENMAI_006,
  ...WENMAI_007,
  ...WENMAI_008,
  ...WENMAI_011,
];
