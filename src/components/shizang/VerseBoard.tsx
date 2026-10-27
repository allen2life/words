import React from 'react';
import type { ShizangPuzzle } from '../../types/game';
import { useI18n } from '../../i18n';

interface VerseBoardProps {
  puzzle: ShizangPuzzle;
  isSolved: boolean;
  currentAttemptChar: string;
}

export const VerseBoard: React.FC<VerseBoardProps> = ({
  puzzle,
  isSolved,
  currentAttemptChar,
}) => {
  const { t } = useI18n();
  const chars = puzzle.targetLine.split('');

  return (
    <div className="w-full flex flex-col items-center">
      {/* 诗题与作者信息印牌 */}
      <div className="flex items-center gap-2 mb-4 text-[#786F63]">
        <span className="text-xs px-2 py-0.5 bg-[#EAE2D0] border border-[#D5C9B3] rounded font-semibold">
          {puzzle.dynasty} · {puzzle.author}
        </span>
        <span className="text-sm font-serif font-bold text-[#3D3831] tracking-widest">
          《{puzzle.title}》
        </span>
      </div>

      {/* 诗句大字展示格（仿木刻印本） */}
      <div className="flex items-center justify-center gap-2 md:gap-3 p-4 md:p-6 bg-[#FCFAF5] rounded-xl border-2 border-[#D8CFBC] shadow-md max-w-full overflow-x-auto">
        {chars.map((char, index) => {
          const isTarget = index === puzzle.targetIndex;

          if (isTarget) {
            return (
              <div
                key={index}
                className={`relative w-12 h-14 md:w-16 md:h-20 rounded-lg flex items-center justify-center text-2xl md:text-3xl font-bold font-serif transition-all duration-300 ${
                  isSolved
                    ? 'bg-[#B93A32] text-white shadow-lg border-2 border-[#8E221B] animate-bounce'
                    : currentAttemptChar
                    ? 'bg-[#FAF1E3] text-[#B93A32] border-2 border-dashed border-[#B93A32] shadow-sm'
                    : 'bg-[#F2ECE1] text-[#9E9385] border-2 border-dashed border-[#B8AA94] animate-pulse'
                }`}
              >
                {isSolved ? (
                  <span>{puzzle.targetChar}</span>
                ) : currentAttemptChar ? (
                  <span className="ink-reveal">{currentAttemptChar}</span>
                ) : (
                  <span className="text-base text-[#9C8F7C] tracking-widest">{t('shizang.eye_label')}</span>
                )}
                {/* 诗眼标记角标 */}
                <div className="absolute -top-2.5 -right-2 bg-[#B93A32] text-white text-[9px] px-1 py-0.2 rounded-full font-sans tracking-tighter">
                  {t('shizang.eye_label')}
                </div>
              </div>
            );
          }

          return (
            <div
              key={index}
              className="w-12 h-14 md:w-16 md:h-20 rounded-lg bg-[#FAF7F0] border border-[#DCD3C1] flex items-center justify-center text-2xl md:text-3xl font-bold font-serif text-[#2B2723] shadow-xs"
            >
              {char}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[#8A8072] mt-2.5 tracking-wider font-serif">
        {isSolved ? t('shizang.board_solved') : t('shizang.board_instruction')}
      </p>
    </div>
  );
};
