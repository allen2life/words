// 游戏核心数据类型定义

export type GameMode = 'shizang' | 'wenmai' | 'tujian';

// ==================== 《诗藏》数据结构 ====================

export type ToneType = 'ping' | 'ze'; // 平水韵 / 现代声调：平声 (阴平/阳平) vs 仄声 (上声/去声/入声)

export type DifficultyTier = 'yellow' | 'green' | 'blue' | 'purple';
// yellow: 蒙学入门 (小学必背)
// green:  诗文通识 (中学古诗文)
// blue:   古文学高阶 (高中及大学拓展)
// purple: 文脉宗师 (楚辞/汉赋/冷门千古句)

export interface ShizangPuzzle {
  id: string;
  title: string;          // 诗题，如《泊船瓜洲》
  dynasty: string;        // 朝代，如“宋”
  author: string;         // 作者，如“王安石”
  fullPoem: string[];     // 全诗各句，如 ["京口瓜洲一水间", "钟山只隔数重山", "春风又绿江南岸", "明月何时照我还"]
  targetLine: string;     // 出题句，如 "春风又绿江南岸"
  targetIndex: number;    // 诗眼关键字在句中的位置 (0-indexed)，如 3 ("绿")
  targetChar: string;     // 目标字 "绿"
  tier: DifficultyTier;   // 难度等级
  festivalDate?: string;  // 节气/节日限定，格式 "YYYY-MM-DD" 或 "MM-DD"
  
  // 墨韵三重提示
  clues: {
    tone: string;         // 音韵提示，如 "仄声 (去声入声，语势顿挫)"
    radical: string;      // 部首偏旁，如 "纟 (绞丝旁)"
    imagery: string;      // 意象/修辞，如 "动词化形容词，写生机染就山川"
  };
  
  // 赏析与文化背景
  appreciation: string;   // 诗眼解析：“王安石数易其稿，初云‘到’，又改‘过’，又改‘入’，凡十余字，始定为‘绿’...”
  authorBio: string;      // 诗人小传
}

export type GuessStatus = 'exact' | 'near' | 'none'; 
// exact: 🟥 朱砂红 (字正腔圆，完全命中)
// near:  🟨 松花黄 (意对字错：在全诗中出现 / 韵母声调相合)
// none:  ⬛ 墨灰 (风马牛不及)

export interface GuessRecord {
  char: string;
  status: GuessStatus;
  feedback: string;
}

// ==================== 《文脉》数据结构 ====================

export interface WenmaiGroup {
  id: string;
  theme: string;          // 主题，如 "思乡羁旅意象"
  dimension: string;      // 分类维度：同意象 / 同用典 / 同文体 / 同韵部 / 同作者 / 同哲学思想
  tier: DifficultyTier;   // 难度色阶
  tierName: string;       // "蒙学入门" | "诗文通识" | "古文学高阶" | "文脉宗师"
  words: string[];        // 4 个词条，如 ["明月", "杨柳", "孤舟", "鸿雁"]
  exegesis: string;       // 文化深度解悟说明
}

export interface WenmaiPuzzle {
  id: string;
  dateStr: string;        // "2026-09-06"
  title: string;          // 篇名/期数，如 "第 249 期 · 秋水篇"
  groups: WenmaiGroup[];  // 4 个分类组，共 16 个词条
}

// ==================== 骈文对仗彩蛋 ====================

export interface CoupletItem {
  id: string;
  poet: string;
  firstLine: string;      // 上联
  secondLine: string;     // 下联
  candidates: string[];   // 候选下联（含混淆项）
  rhymeExplanation: string; // 平仄对仗说明
  unlockSkin: string;     // 解锁诗人特效称号
}

// ==================== 成就与统计 ====================

export interface PlayerStats {
  shizangPlayed: number;
  shizangWon: number;
  shizangStreak: number;
  shizangMaxStreak: number;
  shizangGuessDist: number[]; // [0, 0, 0, 0, 0, 0] 1-6次猜中的分布
  
  wenmaiPlayed: number;
  wenmaiWon: number;
  wenmaiStreak: number;
  wenmaiMaxStreak: number;
  
  solvedShizangIds: string[];
  solvedWenmaiIds: string[];
  collectedAchievements: string[];
}
