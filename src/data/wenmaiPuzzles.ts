import type { WenmaiPuzzle } from '../types/game';
import { WENMAI_001 } from './wenmai/shard-001.ts';
import { WENMAI_002 } from './wenmai/shard-002.ts';
import { WENMAI_003 } from './wenmai/shard-003.ts';
import { WENMAI_004 } from './wenmai/shard-004.ts';
import { WENMAI_005 } from './wenmai/shard-005.ts';
import { WENMAI_006 } from './wenmai/shard-006.ts';
import { WENMAI_007 } from './wenmai/shard-007.ts';
import { WENMAI_008 } from './wenmai/shard-008.ts';
import { WENMAI_009 } from './wenmai/shard-009.ts';
import { WENMAI_010 } from './wenmai/shard-010.ts';
import { WENMAI_011 } from './wenmai/shard-011.ts';
import { WENMAI_012 } from './wenmai/shard-012.ts';
import { WENMAI_014 } from './wenmai/shard-014.ts';
import { WENMAI_017 } from './wenmai/shard-017.ts';
import { WENMAI_018 } from './wenmai/shard-018.ts';

/**
 * 《文脉》题库总索引。数据按片拆分（每片 12–22 期），便于审校与分批补题。
 * 约束：同期 16 词互不重复；跨期趋近零重复（`node scripts/wenmai-conflicts.mjs`）。
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
  ...WENMAI_009,
  ...WENMAI_010,
  ...WENMAI_011,
  ...WENMAI_012,
  ...WENMAI_014,
  ...WENMAI_017,
  ...WENMAI_018,
];
