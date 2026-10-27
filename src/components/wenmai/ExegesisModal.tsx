import React from 'react';
import { X, BookMarked, Share2, Sparkles } from 'lucide-react';
import type { WenmaiGroup } from '../../types/game';
import { useI18n } from '../../i18n';

interface ExegesisModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGroup: WenmaiGroup | null;
  allGroups?: WenmaiGroup[];
  isCompleted?: boolean;
  onOpenShare?: () => void;
}

export const ExegesisModal: React.FC<ExegesisModalProps> = ({
  isOpen,
  onClose,
  selectedGroup,
  allGroups,
  isCompleted,
  onOpenShare,
}) => {
  const { t } = useI18n();

  if (!isOpen) return null;

  const displayGroups = selectedGroup ? [selectedGroup] : allGroups || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto paper-texture rounded-xl border-2 border-[#8C8377]/40 p-6 md:p-8 text-[#1C1A17] shadow-2xl">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#6B655D] hover:text-[#1A1917] hover:bg-black/5 transition"
        >
          <X size={20} />
        </button>

        {/* 标题 */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 text-xs text-[#2E4B6E] font-semibold tracking-widest mb-1">
            <BookMarked size={15} />
            <span>{t('wenmai.exegesis_eyebrow')}</span>
          </div>
          <h3 className="text-2xl font-bold font-serif tracking-widest text-[#1C1A17]">
            {isCompleted
              ? t('wenmai.exegesis_title_complete')
              : t('wenmai.exegesis_title_partial')}
          </h3>
          <p className="text-xs text-[#7A7165] mt-1 tracking-wider">
            {t('wenmai.exegesis_subtitle')}
          </p>
        </div>

        {/* 解读列表 */}
        <div className="space-y-4 my-4">
          {displayGroups.map((g) => {
            let borderCol = 'border-[#D99B26]/40 bg-[#FCF6E9]/60';
            let titleCol = 'text-[#8C6010]';
            if (g.tier === 'green') {
              borderCol = 'border-[#386641]/40 bg-[#EEF5F0]/60';
              titleCol = 'text-[#25522F]';
            } else if (g.tier === 'blue') {
              borderCol = 'border-[#2E4B6E]/40 bg-[#EDF2F7]/60';
              titleCol = 'text-[#1F3957]';
            } else if (g.tier === 'purple') {
              borderCol = 'border-[#5C3C67]/40 bg-[#F5EDF7]/60';
              titleCol = 'text-[#472852]';
            }

            return (
              <div key={g.id} className={`p-4 rounded-lg border ${borderCol}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`font-bold font-serif text-base tracking-wider ${titleCol}`}>
                    {g.theme}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-white/80 border border-black/10 font-medium">
                    {g.tierName} · {g.dimension}
                  </span>
                </div>

                <div className="text-xs font-serif font-bold text-[#453F36] tracking-widest mb-2">
                  {t('wenmai.words_inline', { words: g.words.join('  ·  ') })}
                </div>

                <p className="text-xs leading-relaxed text-[#4A443B] font-serif text-justify">
                  {g.exegesis}
                </p>
              </div>
            );
          })}
        </div>

        {/* 底部按钮 */}
        <div className="mt-6 pt-4 border-t border-[#DCD3C1] flex gap-3">
          {isCompleted && onOpenShare && (
            <button
              onClick={onOpenShare}
              className="flex-1 py-2.5 px-3 bg-[#B93A32] hover:bg-[#9E2E27] text-white rounded font-serif font-semibold text-xs tracking-wider flex items-center justify-center gap-1.5 transition shadow"
            >
              <Share2 size={15} />
              <span>{t('wenmai.share_card_btn')}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-3 bg-[#2E4B6E] hover:bg-[#233A56] text-white rounded font-serif font-semibold text-xs tracking-wider flex items-center justify-center gap-1.5 transition shadow"
          >
            <Sparkles size={15} />
            <span>{t('wenmai.close_scroll')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
