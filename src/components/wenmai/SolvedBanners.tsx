import React from 'react';
import type { WenmaiGroup } from '../../types/game';
import { useI18n } from '../../i18n';

interface SolvedBannersProps {
  groups: WenmaiGroup[];
  onOpenExegesis: (group: WenmaiGroup) => void;
}

export const SolvedBanners: React.FC<SolvedBannersProps> = ({ groups, onOpenExegesis }) => {
  const { t } = useI18n();
  if (groups.length === 0) return null;

  return (
    <div className="w-full max-w-xl space-y-2.5 mb-3">
      {groups.map((group) => {
        let bgStyle = 'bg-[#FCF6E9] border-[#D99B26]/50 text-[#8C6010]';
        let badgeStyle = 'bg-[#D99B26] text-white';

        if (group.tier === 'green') {
          bgStyle = 'bg-[#EEF5F0] border-[#386641]/50 text-[#25522F]';
          badgeStyle = 'bg-[#386641] text-white';
        } else if (group.tier === 'blue') {
          bgStyle = 'bg-[#EDF2F7] border-[#2E4B6E]/50 text-[#1F3957]';
          badgeStyle = 'bg-[#2E4B6E] text-white';
        } else if (group.tier === 'purple') {
          bgStyle = 'bg-[#F5EDF7] border-[#5C3C67]/50 text-[#472852]';
          badgeStyle = 'bg-[#5C3C67] text-white';
        }

        return (
          <div
            key={group.id}
            onClick={() => onOpenExegesis(group)}
            className={`p-3.5 rounded-lg border-2 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-1.5 cursor-pointer hover:opacity-95 transition tile-flip ${bgStyle}`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${badgeStyle}`}>
                  {group.tierName}
                </span>
                <span className="font-bold font-serif text-sm tracking-wider">
                  {group.theme}
                </span>
                <span className="text-[10px] opacity-75">
                  ({group.dimension})
                </span>
              </div>
              <div className="text-xs font-serif font-semibold tracking-widest opacity-90">
                {group.words.join('  ·  ')}
              </div>
            </div>

            <div className="text-[10px] font-sans underline opacity-80 shrink-0 self-end md:self-center">
              {t('wenmai.tap_exegesis')}
            </div>
          </div>
        );
      })}
    </div>
  );
};
