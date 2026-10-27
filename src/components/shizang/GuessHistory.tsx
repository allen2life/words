import React from 'react';
import type { GuessRecord } from '../../types/game';
import { useI18n } from '../../i18n';

interface GuessHistoryProps {
  guesses: GuessRecord[];
  maxGuesses: number;
}

export const GuessHistory: React.FC<GuessHistoryProps> = ({ guesses, maxGuesses }) => {
  const { t } = useI18n();
  const emptyRows = Array(Math.max(0, maxGuesses - guesses.length)).fill(null);

  return (
    <div className="w-full max-w-xl my-3">
      <div className="text-xs font-semibold text-[#736B61] mb-2 flex items-center justify-between">
        <span>{t('shizang.history_title', { count: guesses.length, max: maxGuesses })}</span>
        <span className="text-[10px] text-[#9C9387]">{t('shizang.history_legend')}</span>
      </div>

      <div className="space-y-2">
        {guesses.map((g, idx) => {
          let badgeColor = 'bg-[#6D6964] text-white'; // 墨灰
          let borderColor = 'border-[#6D6964]/40';
          let textColor = 'text-[#4A4744]';

          if (g.status === 'exact') {
            badgeColor = 'bg-[#B93A32] text-white shadow-sm'; // 朱砂红
            borderColor = 'border-[#B93A32]';
            textColor = 'text-[#B93A32]';
          } else if (g.status === 'near') {
            badgeColor = 'bg-[#C99427] text-white shadow-sm'; // 松花黄
            borderColor = 'border-[#C99427]';
            textColor = 'text-[#8C6415]';
          }

          return (
            <div
              key={idx}
              className={`flex items-center justify-between p-2.5 bg-[#FAF6EE] rounded-lg border ${borderColor} transition-all shadow-xs`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-md flex items-center justify-center font-serif font-bold text-lg ${badgeColor}`}
                >
                  {g.char}
                </div>
                <div className="text-xs">
                  <span className={`font-bold mr-2 ${textColor}`}>
                    {t('shizang.attempt_label', { count: idx + 1 })}
                  </span>
                  <span className="text-[#59524A]">{g.feedback}</span>
                </div>
              </div>

              <div className="text-xs font-serif font-semibold text-[#8C8377]">
                {g.status === 'exact' && t('shizang.badge_exact')}
                {g.status === 'near' && t('shizang.badge_near')}
                {g.status === 'none' && t('shizang.badge_none')}
              </div>
            </div>
          );
        })}

        {/* 尚未使用的槽位 */}
        {emptyRows.map((_, idx) => (
          <div
            key={`empty-${idx}`}
            className="flex items-center justify-between p-2.5 bg-[#F2EDE1]/40 rounded-lg border border-dashed border-[#D5CAA8] text-xs text-[#A89F90]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md border border-dashed border-[#C7BBA5] flex items-center justify-center font-serif text-[#B5AA96]">
                {guesses.length + idx + 1}
              </div>
              <span>{t('shizang.empty_slot')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
