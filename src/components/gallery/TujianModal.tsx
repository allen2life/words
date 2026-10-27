import React from 'react';
import { X, Award, Lock, BookOpen, Layers } from 'lucide-react';
import type { PlayerStats } from '../../types/game';
import { ACHIEVEMENTS } from '../../data/achievements';
import { SHIZANG_PUZZLES } from '../../data/shizangPuzzles';
import { WENMAI_PUZZLES } from '../../data/wenmaiPuzzles';
import { useI18n } from '../../i18n';

interface TujianModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
}

export const TujianModal: React.FC<TujianModalProps> = ({ isOpen, onClose, stats }) => {
  const { t } = useI18n();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto paper-texture rounded-xl border-2 border-[#8C8377]/40 p-6 md:p-8 text-[#1C1A17] shadow-2xl">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#6B655D] hover:text-[#1A1917] hover:bg-black/5 transition"
        >
          <X size={20} />
        </button>

        {/* 标题 */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 text-xs text-[#5C3C67] font-semibold tracking-widest mb-1">
            <Award size={15} />
            <span>{t('tujian.eyebrow')}</span>
          </div>
          <h3 className="text-2xl font-bold font-serif tracking-widest text-[#1C1A17]">
            {t('tujian.title')}
          </h3>
          <p className="text-xs text-[#7A7165] mt-1 tracking-wider">
            {t('tujian.subtitle', { count: stats.collectedAchievements.length })}
          </p>
        </div>

        {/* 统计概览数据牌 */}
        <div className="grid grid-cols-3 gap-2.5 mb-6 text-center">
          <div className="p-3 bg-[#FAF5EC] rounded-lg border border-[#DACDB6]">
            <div className="text-xl font-bold font-serif text-[#B93A32]">
              {stats.solvedShizangIds.length}/{SHIZANG_PUZZLES.length}
            </div>
            <div className="text-[11px] text-[#786E61] mt-0.5 flex items-center justify-center gap-1">
              <BookOpen size={12} />
              <span>{t('tujian.stat_shizang')}</span>
            </div>
          </div>

          <div className="p-3 bg-[#F2F6F3] rounded-lg border border-[#CADBCF]">
            <div className="text-xl font-bold font-serif text-[#386641]">
              {stats.solvedWenmaiIds.length}/{WENMAI_PUZZLES.length}
            </div>
            <div className="text-[11px] text-[#556E5A] mt-0.5 flex items-center justify-center gap-1">
              <Layers size={12} />
              <span>{t('tujian.stat_wenmai')}</span>
            </div>
          </div>

          <div className="p-3 bg-[#F3EDF5] rounded-lg border border-[#D5C2D9]">
            <div className="text-xl font-bold font-serif text-[#5C3C67]">
              {t('tujian.stat_streak_unit', {
                count: Math.max(stats.shizangStreak, stats.wenmaiStreak),
              })}
            </div>
            <div className="text-[11px] text-[#695270] mt-0.5">
              <span>{t('tujian.stat_streak')}</span>
            </div>
          </div>
        </div>

        {/* 九阶功名进阶图谱 */}
        <div className="space-y-2.5 mb-6">
          <h4 className="text-xs font-bold tracking-wider text-[#635A4F] mb-1">
            {t('tujian.rank_roster')}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {ACHIEVEMENTS.map((ach) => {
              const isUnlocked = stats.collectedAchievements.includes(ach.id);

              return (
                <div
                  key={ach.id}
                  className={`relative p-3 rounded-lg border flex flex-col justify-between transition ${
                    isUnlocked
                      ? 'bg-[#FAF6EE] border-[#B93A32]/40 shadow-xs'
                      : 'bg-[#EFEAE0]/40 border-dashed border-[#D2C8B7] opacity-65'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg">{ach.icon}</span>
                    {isUnlocked ? (
                      <span className="seal-box text-[10px] px-1 py-0.5 leading-none">
                        {ach.sealText}
                      </span>
                    ) : (
                      <Lock size={12} className="text-[#9E9385]" />
                    )}
                  </div>

                  <div>
                    <div className="font-serif font-bold text-sm text-[#1C1A17]">
                      {ach.title}
                    </div>
                    <p className="text-[11px] text-[#6E665A] mt-0.5 leading-tight font-serif">
                      {ach.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-[#DCD3C1] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#5C3C67] hover:bg-[#4A2E55] text-white rounded font-serif text-xs font-bold tracking-wider transition shadow"
          >
            {t('tujian.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
