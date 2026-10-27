import { useState, useEffect, useCallback } from 'react';
import { X, Trophy, Award, RefreshCw, Star, User, Check } from 'lucide-react';
import { useI18n } from '../../i18n';
import {
  LoongRankClient,
  getOrCreateLocalProfile,
  updateLocalProfile,
  type RankItem
} from '../../lib/loongclan';
import type { PlayerStats } from '../../types/game';

interface RankModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  dateStr: string; // e.g. "2026-09-09"
}

const rankClient = new LoongRankClient();

export const RankModal: React.FC<RankModalProps> = ({
  isOpen,
  onClose,
  stats,
  dateStr,
}) => {
  const { t, formatErrorCode } = useI18n();
  const [activeTab, setActiveTab] = useState<'daily' | 'total'>('daily');
  const [profile, setProfile] = useState(() => getOrCreateLocalProfile());
  const [isEditingNick, setIsEditingNick] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(profile.nickname);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rankList, setRankList] = useState<RankItem[]>([]);
  const [userRankData, setUserRankData] = useState<{ rank: number; score: number; stars?: number } | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const cleanDailyBoardId = `daily_${dateStr.replace(/-/g, '')}`;

  const currentBoardId = activeTab === 'daily' ? cleanDailyBoardId : 'total';
  const currentPeriod = activeTab === 'daily' ? 'daily' : 'all';

  // 计算玩家今日战力得分
  const isShizangSolvedToday = stats.solvedShizangIds.length > 0;
  const isWenmaiSolvedToday = stats.solvedWenmaiIds.length > 0;

  // 基础打分逻辑
  const calculateDailyScore = () => {
    let score = 0;
    let stars = 0;

    if (isShizangSolvedToday) {
      score += 500;
      score += Math.min(stats.shizangStreak, 10) * 20;
      stars += 2;
    }
    if (isWenmaiSolvedToday) {
      score += 500;
      score += Math.min(stats.wenmaiStreak, 10) * 20;
      stars += 2;
    }
    if (isShizangSolvedToday && isWenmaiSolvedToday) {
      score += 200; // 双璧合璧加分
      stars = 5;
    }
    if (score === 0) {
      score = Math.max(stats.shizangStreak, stats.wenmaiStreak) * 10;
      stars = score > 0 ? 1 : 0;
    }

    return { score, stars };
  };

  const { score: currentLocalScore, stars: currentLocalStars } = calculateDailyScore();

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  // 查询榜单数据
  const fetchRankList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await rankClient.queryRank({
        appId: 'words',
        boardId: currentBoardId,
        period: currentPeriod,
        limit: 50,
        userHash: profile.userHash
      });

      if (res.code === 0 && res.data) {
        setRankList(res.data.list || []);
        setUserRankData(res.data.userRank || null);
        setTotalCount(res.data.totalCount || 0);
      } else {
        showToast(formatErrorCode(res.err_code, res.message), 'error');
      }
    } catch {
      showToast(t('err.network'), 'error');
    } finally {
      setLoading(false);
    }
  }, [currentBoardId, currentPeriod, profile.userHash, formatErrorCode, showToast, t]);

  useEffect(() => {
    if (isOpen) {
      Promise.resolve().then(() => {
        const p = getOrCreateLocalProfile();
        setProfile(p);
        setNicknameInput(p.nickname);
        fetchRankList();
      });
    }
  }, [isOpen, activeTab, fetchRankList]);

  if (!isOpen) return null;

  // 提交今日成绩
  const handleSubmitScore = async () => {
    setSubmitting(true);
    try {
      const extra = {
        shizangSolved: isShizangSolvedToday,
        wenmaiSolved: isWenmaiSolvedToday,
        dateStr
      };

      const res = await rankClient.submitScore({
        appId: 'words',
        boardId: currentBoardId,
        period: currentPeriod,
        userHash: profile.userHash,
        syncToken: profile.syncToken,
        nickname: profile.nickname,
        score: currentLocalScore,
        stars: currentLocalStars,
        sortOrder: 'desc',
        extraData: JSON.stringify(extra)
      });

      if (res.code === 0 && res.data) {
        showToast(t('rank.submit_success', { rank: res.data.rank }), 'success');
        // 刷新榜单
        await fetchRankList();
      } else {
        showToast(formatErrorCode(res.err_code, res.message), 'error');
      }
    } catch {
      showToast(t('err.network'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveNickname = () => {
    try {
      const updated = updateLocalProfile(profile.kouling, nicknameInput);
      setProfile(updated);
      setIsEditingNick(false);
      showToast(t('btn.save') + ' ' + t('btn.copied'), 'success');
    } catch {
      showToast(t('err.bad_request'), 'error');
    }
  };

  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-white font-bold text-xs shadow-xs" title={t('rank.top_1')}>
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-slate-300 to-slate-400 text-slate-800 font-bold text-xs shadow-xs" title={t('rank.top_2')}>
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-amber-700 to-amber-800 text-white font-bold text-xs shadow-xs" title={t('rank.top_3')}>
          3
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 text-[#7A7165] font-semibold text-xs">
        {rank}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col paper-texture rounded-lg border-2 border-[#8C8377]/40 text-[#1C1A17] shadow-2xl">
        {/* 顶部 Header */}
        <div className="p-5 pb-3 border-b border-[#D8CFBF] relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#6B655D] hover:text-[#1A1917] hover:bg-black/5 transition"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-2 text-xs text-[#8C6036] font-semibold tracking-widest uppercase font-serif">
            <Trophy size={15} className="text-[#B93A32]" />
            <span>LOONGCLAN · SPEC_RANK</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <h2 className="text-2xl font-bold tracking-wider text-[#1C1A17] font-serif">
              {t('rank.modal_title')}
            </h2>
            <button
              onClick={fetchRankList}
              disabled={loading}
              className="p-1.5 text-[#7A7165] hover:text-[#B93A32] rounded transition flex items-center gap-1 text-xs"
              title={t('btn.refresh')}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{t('btn.refresh')}</span>
            </button>
          </div>

          <p className="text-xs text-[#7A7165] mt-1">
            {activeTab === 'daily' ? t('rank.board_desc_daily') : t('rank.board_desc_total')}
          </p>

          {/* Tab 切换 */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
                activeTab === 'daily'
                  ? 'bg-[#B93A32] text-white shadow-xs'
                  : 'bg-[#ECE4D0] text-[#5C564E] hover:text-[#1A1917]'
              }`}
            >
              {t('rank.tab_daily')}
            </button>
            <button
              onClick={() => setActiveTab('total')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
                activeTab === 'total'
                  ? 'bg-[#2E4B6E] text-white shadow-xs'
                  : 'bg-[#ECE4D0] text-[#5C564E] hover:text-[#1A1917]'
              }`}
            >
              {t('rank.tab_total')}
            </button>
          </div>
        </div>

        {/* 提示条 */}
        {toastMsg && (
          <div
            className={`mx-5 mt-3 p-2.5 rounded text-xs font-medium border flex items-center gap-2 ${
              toastMsg.type === 'success'
                ? 'bg-[#EBF5EE] text-[#2E6F40] border-[#BCE1C7]'
                : 'bg-[#FDF2F2] text-[#B93A32] border-[#F4C7C7]'
            }`}
          >
            <span>{toastMsg.text}</span>
          </div>
        )}

        {/* 当前玩家战绩与上榜状态卡片 */}
        <div className="px-5 pt-3">
          <div className="p-3 bg-[#FAF5EC] rounded-lg border border-[#DACDB6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#4A433A]">{t('rank.my_rank_card')}:</span>
                {userRankData?.rank ? (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#B93A32] text-white">
                    #{userRankData.rank}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-xs bg-[#ECE4D0] text-[#7A7165]">
                    {t('rank.not_ranked')}
                  </span>
                )}

                {/* 昵称显示与修改 */}
                {isEditingNick ? (
                  <div className="flex items-center gap-1 ml-2">
                    <input
                      type="text"
                      value={nicknameInput}
                      maxLength={30}
                      onChange={(e) => setNicknameInput(e.target.value)}
                      className="px-2 py-0.5 bg-white border border-[#CFC3A5] rounded text-xs text-[#1C1A17] w-28 focus:outline-none"
                    />
                    <button
                      onClick={handleSaveNickname}
                      className="p-1 bg-[#B93A32] text-white rounded text-xs hover:bg-[#9C2E27]"
                    >
                      <Check size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-[#5C564E] ml-2">
                    <User size={12} />
                    <span className="font-semibold text-[#1C1A17]">{profile.nickname}</span>
                    <button
                      onClick={() => setIsEditingNick(true)}
                      className="text-[10px] text-[#8C6036] hover:underline"
                    >
                      {t('btn.edit')}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-[#7A7165]">
                <span>{t('rank.my_current_score', { score: userRankData?.score ?? currentLocalScore })}</span>
                <span className="flex items-center text-amber-500">
                  {Array.from({ length: userRankData?.stars ?? currentLocalStars }).map((_, i) => (
                    <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                  ))}
                </span>
              </div>
            </div>

            <button
              onClick={handleSubmitScore}
              disabled={submitting || loading}
              className="w-full sm:w-auto px-4 py-2 bg-[#B93A32] hover:bg-[#9C2E27] disabled:opacity-50 text-white rounded-md text-xs font-bold tracking-wider shadow-xs transition flex items-center justify-center gap-1.5"
            >
              {submitting ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Award size={14} />
              )}
              <span>{userRankData?.rank ? t('rank.btn_update_score') : t('rank.btn_submit_score')}</span>
            </button>
          </div>
        </div>

        {/* 榜单列表区 */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {loading && rankList.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8C8377] flex flex-col items-center gap-2">
              <RefreshCw size={24} className="animate-spin text-[#B93A32]" />
              <span>Loading leaderboard records...</span>
            </div>
          ) : rankList.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8C8377] space-y-2">
              <Trophy size={32} className="mx-auto text-[#DACDB6]" />
              <p>{t('rank.empty')}</p>
            </div>
          ) : (
            <div className="divide-y divide-[#EAE0CE] border border-[#E0D7C6] rounded-lg overflow-hidden bg-white/70">
              {/* 表头 */}
              <div className="grid grid-cols-12 px-3 py-2 bg-[#F5EEDF] text-[11px] font-bold text-[#6B655D] tracking-wider uppercase">
                <span className="col-span-2 text-center">{t('rank.col_rank')}</span>
                <span className="col-span-5">{t('rank.col_scholar')}</span>
                <span className="col-span-3 text-right">{t('rank.col_score')}</span>
                <span className="col-span-2 text-right hidden sm:block">{t('rank.col_time')}</span>
              </div>

              {/* 榜单行 */}
              {rankList.map((item) => {
                const isMe = item.userHash === profile.userHash;
                return (
                  <div
                    key={`${item.rank}-${item.userHash}`}
                    className={`grid grid-cols-12 px-3 py-2.5 text-xs items-center transition ${
                      isMe
                        ? 'bg-[#FDF0EC]/90 font-semibold text-[#B93A32]'
                        : 'hover:bg-[#FAF5EC]/60 text-[#2D2A26]'
                    }`}
                  >
                    <div className="col-span-2 flex justify-center">
                      {renderRankBadge(item.rank)}
                    </div>
                    <div className="col-span-5 flex items-center gap-1.5 truncate">
                      <span className="truncate">{item.nickname || 'Unknown'}</span>
                      {isMe && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-[#B93A32] text-white rounded font-normal">
                          Me
                        </span>
                      )}
                    </div>
                    <div className="col-span-3 text-right font-mono font-bold flex flex-col items-end">
                      <span className={item.rank <= 3 ? 'text-[#B93A32] text-sm' : 'text-[#3A352F]'}>
                        {item.score.toLocaleString()}
                      </span>
                      {item.stars ? (
                        <span className="flex items-center text-amber-500 text-[10px]">
                          {Array.from({ length: item.stars }).map((_, i) => (
                            <Star key={i} size={9} className="fill-amber-400 text-amber-400" />
                          ))}
                        </span>
                      ) : null}
                    </div>
                    <div className="col-span-2 text-right text-[10px] text-[#8C8377] font-mono hidden sm:block">
                      {new Date(item.publishTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 底部信息 */}
        <div className="p-3 border-t border-[#D8CFBF] bg-[#F7F2E7]/80 text-[11px] text-[#7A7165] flex items-center justify-between px-5">
          <span>{totalCount > 0 ? `${totalCount} scholars ranked` : ''}</span>
          <span>API: https://api.loongclan.xyz</span>
        </div>
      </div>
    </div>
  );
};
