import type { PlayerStats } from '../types/game';

const STORAGE_KEY = 'guofeng_words_player_stats_v1';

const DEFAULT_STATS: PlayerStats = {
  shizangPlayed: 0,
  shizangWon: 0,
  shizangStreak: 0,
  shizangMaxStreak: 0,
  shizangGuessDist: [0, 0, 0, 0, 0, 0],
  
  wenmaiPlayed: 0,
  wenmaiWon: 0,
  wenmaiStreak: 0,
  wenmaiMaxStreak: 0,
  
  solvedShizangIds: [],
  solvedWenmaiIds: [],
  collectedAchievements: ['ach-1']
};

export function loadPlayerStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

export function savePlayerStats(stats: PlayerStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats to localStorage', e);
  }
}

export function recordShizangResult(puzzleId: string, won: boolean, guessCount: number): PlayerStats {
  const stats = loadPlayerStats();
  stats.shizangPlayed += 1;
  
  if (won) {
    stats.shizangWon += 1;
    stats.shizangStreak += 1;
    stats.shizangMaxStreak = Math.max(stats.shizangStreak, stats.shizangMaxStreak);
    
    if (guessCount >= 1 && guessCount <= 6) {
      stats.shizangGuessDist[guessCount - 1] = (stats.shizangGuessDist[guessCount - 1] || 0) + 1;
    }
    
    if (!stats.solvedShizangIds.includes(puzzleId)) {
      stats.solvedShizangIds.push(puzzleId);
    }

    // 检查并解锁成就
    checkAchievements(stats, { type: 'shizang', guessCount });
  } else {
    stats.shizangStreak = 0;
  }
  
  savePlayerStats(stats);
  return stats;
}

export function recordWenmaiResult(puzzleId: string, won: boolean, mistakesUsed: number): PlayerStats {
  const stats = loadPlayerStats();
  stats.wenmaiPlayed += 1;
  
  if (won) {
    stats.wenmaiWon += 1;
    stats.wenmaiStreak += 1;
    stats.wenmaiMaxStreak = Math.max(stats.wenmaiStreak, stats.wenmaiMaxStreak);
    
    if (!stats.solvedWenmaiIds.includes(puzzleId)) {
      stats.solvedWenmaiIds.push(puzzleId);
    }

    checkAchievements(stats, { type: 'wenmai', mistakesUsed });
  } else {
    stats.wenmaiStreak = 0;
  }
  
  savePlayerStats(stats);
  return stats;
}

function checkAchievements(stats: PlayerStats, event: { type: 'shizang' | 'wenmai'; guessCount?: number; mistakesUsed?: number }) {
  const achs = new Set(stats.collectedAchievements);

  // 1阶: 开卷蒙童
  achs.add('ach-1');

  // 2阶: 庠序童生 (3首诗藏)
  if (stats.solvedShizangIds.length >= 3) achs.add('ach-2');

  // 3阶: 茂才秀士 (打卡3天)
  if (stats.shizangStreak >= 3 || stats.wenmaiStreak >= 3) achs.add('ach-3');

  // 4阶: 乡试举人 (5局文脉)
  if (stats.solvedWenmaiIds.length >= 5) achs.add('ach-4');

  // 5阶: 会试贡士 (通关文脉或高难)
  if (stats.solvedWenmaiIds.length >= 1) achs.add('ach-5');

  // 6阶: 殿试进士 (连击7天)
  if (stats.shizangStreak >= 7 || stats.wenmaiStreak >= 7) achs.add('ach-6');

  // 7阶: 一甲探花 (<=2次猜中诗藏)
  if (event.type === 'shizang' && event.guessCount && event.guessCount <= 2) achs.add('ach-7');

  // 8阶: 一甲榜眼 (文脉0失误)
  if (event.type === 'wenmai' && event.mistakesUsed === 0) achs.add('ach-8');

  // 9阶: 文曲星君
  if (achs.size >= 8) achs.add('ach-9');

  stats.collectedAchievements = Array.from(achs);
}
