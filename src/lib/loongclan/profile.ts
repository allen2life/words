import { LoongIdentity } from './LoongIdentity';
import type { PlayerStats } from '../../types/game';

export interface LocalUserProfile {
  kouling: string;
  userHash: string;
  syncToken: string;
  nickname: string;
  localVersion: number;
  lastSyncAt: string | null;
}

const STORAGE_KEYS = {
  KOULING: 'loong_kouling',
  NICKNAME: 'loong_nickname',
  VERSION: 'loong_local_version',
  LAST_SYNC: 'loong_last_sync_at'
};

const DEFAULT_NICKNAME = '文脉探求者';

/**
 * 获取或自动创建本地龙族身份凭证 (SPEC_IDENTITY v1.1.0)
 */
export function getOrCreateLocalProfile(): LocalUserProfile {
  let kouling = localStorage.getItem(STORAGE_KEYS.KOULING);
  const nickname = localStorage.getItem(STORAGE_KEYS.NICKNAME) || DEFAULT_NICKNAME;
  const versionRaw = localStorage.getItem(STORAGE_KEYS.VERSION);
  const localVersion = versionRaw ? parseInt(versionRaw, 10) || 1 : 1;
  const lastSyncAt = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);

  // 若无口令或格式不合法，自动生成一个随机口令
  if (!kouling || !LoongIdentity.isValid(kouling)) {
    kouling = LoongIdentity.generateRandom('lg');
    localStorage.setItem(STORAGE_KEYS.KOULING, kouling);
    localStorage.setItem(STORAGE_KEYS.NICKNAME, nickname);
    localStorage.setItem(STORAGE_KEYS.VERSION, '1');
  }

  const userHash = LoongIdentity.deriveUserHash(kouling);
  const syncToken = LoongIdentity.deriveSyncToken(kouling);

  return {
    kouling,
    userHash,
    syncToken,
    nickname,
    localVersion,
    lastSyncAt
  };
}

/**
 * 更新用户凭证（修改昵称或切换为已有口令）
 */
export function updateLocalProfile(kouling: string, nickname?: string): LocalUserProfile {
  if (!LoongIdentity.isValid(kouling)) {
    throw new Error('err.kouling_format');
  }

  const cleanKouling = kouling.trim();
  const cleanNickname = (nickname?.trim() || DEFAULT_NICKNAME).slice(0, 30);
  const userHash = LoongIdentity.deriveUserHash(cleanKouling);
  const syncToken = LoongIdentity.deriveSyncToken(cleanKouling);

  localStorage.setItem(STORAGE_KEYS.KOULING, cleanKouling);
  localStorage.setItem(STORAGE_KEYS.NICKNAME, cleanNickname);

  const versionRaw = localStorage.getItem(STORAGE_KEYS.VERSION);
  const localVersion = versionRaw ? parseInt(versionRaw, 10) || 1 : 1;
  const lastSyncAt = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);

  return {
    kouling: cleanKouling,
    userHash,
    syncToken,
    nickname: cleanNickname,
    localVersion,
    lastSyncAt
  };
}

/**
 * 更新本地乐观锁版本号
 */
export function bumpLocalVersion(newVersion?: number): number {
  const current = getOrCreateLocalProfile().localVersion;
  const next = newVersion !== undefined ? newVersion : current + 1;
  localStorage.setItem(STORAGE_KEYS.VERSION, String(next));
  return next;
}

/**
 * 记录云端同步成功
 */
export function recordSyncSuccess(serverVersion: number, timestamp = new Date().toISOString()): void {
  localStorage.setItem(STORAGE_KEYS.VERSION, String(serverVersion));
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
}

/**
 * 根据 SPEC_SYNC 规范合并云端快照与本地数据 (CRDT 推荐原则)
 */
export function mergePlayerStats(local: PlayerStats, remote: Partial<PlayerStats>): PlayerStats {
  const unionArray = (a: string[] = [], b: string[] = []) => Array.from(new Set([...a, ...b]));

  const mergedShizangDist = [...(local.shizangGuessDist || [0, 0, 0, 0, 0, 0])];
  if (Array.isArray(remote.shizangGuessDist)) {
    for (let i = 0; i < 6; i++) {
      mergedShizangDist[i] = Math.max(mergedShizangDist[i] || 0, remote.shizangGuessDist[i] || 0);
    }
  }

  return {
    shizangPlayed: Math.max(local.shizangPlayed || 0, remote.shizangPlayed || 0),
    shizangWon: Math.max(local.shizangWon || 0, remote.shizangWon || 0),
    shizangStreak: Math.max(local.shizangStreak || 0, remote.shizangStreak || 0),
    shizangMaxStreak: Math.max(local.shizangMaxStreak || 0, remote.shizangMaxStreak || 0),
    shizangGuessDist: mergedShizangDist,

    wenmaiPlayed: Math.max(local.wenmaiPlayed || 0, remote.wenmaiPlayed || 0),
    wenmaiWon: Math.max(local.wenmaiWon || 0, remote.wenmaiWon || 0),
    wenmaiStreak: Math.max(local.wenmaiStreak || 0, remote.wenmaiStreak || 0),
    wenmaiMaxStreak: Math.max(local.wenmaiMaxStreak || 0, remote.wenmaiMaxStreak || 0),

    solvedShizangIds: unionArray(local.solvedShizangIds, remote.solvedShizangIds),
    solvedWenmaiIds: unionArray(local.solvedWenmaiIds, remote.solvedWenmaiIds),
    collectedAchievements: unionArray(local.collectedAchievements, remote.collectedAchievements)
  };
}
