import type { WenmaiPuzzle } from '../types/game';
import { WENMAI_001 } from './wenmai/shard-001.ts';
import { WENMAI_002 } from './wenmai/shard-002.ts';
import { WENMAI_005 } from './wenmai/shard-005.ts';
import { WENMAI_008 } from './wenmai/shard-008.ts';
import { WENMAI_003 } from './wenmai/shard-003.ts';

/**
 * 《文脉》题库总索引。
 *
 * 数据按片（shard）拆分，每片约 20–40 期，便于人工审校与按批次补题。
 * 新增内容时：新建 `wenmai/shard-XXX.ts` 导出 `WENMAI_XXX`，在此处 import 并加入数组。
 *
 * 题库容量目标：365 天不重复。
 * 出题逻辑见 `utils/dailySeeder.ts`（按东八区 dayIndex 取模）。
 */
export const WENMAI_PUZZLES: WenmaiPuzzle[] = [
  ...WENMAI_001,
  ...WENMAI_002,
  ...WENMAI_003,
  ...WENMAI_005,
  ...WENMAI_008,
];
