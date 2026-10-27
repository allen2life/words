import React from 'react';
import { useI18n } from '../../i18n';

interface MistakeDotsProps {
  mistakesRemaining: number;
  maxMistakes: number;
}

export const MistakeDots: React.FC<MistakeDotsProps> = ({ mistakesRemaining, maxMistakes }) => {
  const { t } = useI18n();
  const dots = Array.from({ length: maxMistakes });

  return (
    <div className="flex items-center justify-center gap-2 my-2 text-xs text-[#7A7165]">
      <span className="font-serif">{t('wenmai.mistakes_label')}</span>
      <div className="flex items-center gap-1.5">
        {dots.map((_, idx) => {
          const isActive = idx < mistakesRemaining;
          return (
            <div
              key={idx}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                isActive
                  ? 'bg-[#B93A32] shadow-xs scale-100'
                  : 'bg-[#D6CBB7] scale-75 opacity-40'
              }`}
              title={isActive ? t('wenmai.dot_active_title') : t('wenmai.dot_spent_title')}
            />
          );
        })}
      </div>
      <span className="text-[11px] text-[#9C9387]">({mistakesRemaining}/{maxMistakes})</span>
    </div>
  );
};
