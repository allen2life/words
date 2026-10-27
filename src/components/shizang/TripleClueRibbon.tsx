import React from 'react';
import { Volume2, Sparkles, Feather, Lock } from 'lucide-react';
import type { ShizangPuzzle } from '../../types/game';

interface TripleClueRibbonProps {
  puzzle: ShizangPuzzle;
  attemptsCount: number;
}

export const TripleClueRibbon: React.FC<TripleClueRibbonProps> = ({ puzzle, attemptsCount }) => {
  return (
    <div className="w-full max-w-xl my-4 p-3.5 bg-[#FAF6EE] rounded-lg border border-[#DDD3C2] shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-[#635A4F] tracking-wider flex items-center gap-1.5">
          <Feather size={14} className="text-[#B93A32]" />
          墨韵三重提示
        </span>
        <span className="text-[11px] text-[#8C8377]">
          尝试推敲解锁更多线索 ({Math.min(attemptsCount, 3)}/3)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* 第1重：音韵/平仄 */}
        <div
          className={`p-2.5 rounded border text-xs transition-all ${
            attemptsCount >= 1
              ? 'bg-[#FCFAF5] border-[#D0C4AF] text-[#332E28]'
              : 'bg-[#EFEAE0]/50 border-dashed border-[#D2C8B7] text-[#9E9588]'
          }`}
        >
          <div className="flex items-center gap-1 font-semibold mb-1 text-[#8C6036]">
            <Volume2 size={13} />
            <span>一重 · 音韵</span>
          </div>
          {attemptsCount >= 1 ? (
            <p className="font-serif leading-relaxed text-[11px]">{puzzle.clues.tone}</p>
          ) : (
            <p className="flex items-center gap-1 text-[11px]">
              <Lock size={11} /> 首次推敲后揭示
            </p>
          )}
        </div>

        {/* 第2重：部首偏旁 */}
        <div
          className={`p-2.5 rounded border text-xs transition-all ${
            attemptsCount >= 2
              ? 'bg-[#FCFAF5] border-[#D0C4AF] text-[#332E28]'
              : 'bg-[#EFEAE0]/50 border-dashed border-[#D2C8B7] text-[#9E9588]'
          }`}
        >
          <div className="flex items-center gap-1 font-semibold mb-1 text-[#4F7359]">
            <Sparkles size={13} />
            <span>二重 · 部首</span>
          </div>
          {attemptsCount >= 2 ? (
            <p className="font-serif leading-relaxed text-[11px]">{puzzle.clues.radical}</p>
          ) : (
            <p className="flex items-center gap-1 text-[11px]">
              <Lock size={11} /> 两次推敲后揭示
            </p>
          )}
        </div>

        {/* 第3重：意象修辞 */}
        <div
          className={`p-2.5 rounded border text-xs transition-all ${
            attemptsCount >= 3
              ? 'bg-[#FCFAF5] border-[#D0C4AF] text-[#332E28]'
              : 'bg-[#EFEAE0]/50 border-dashed border-[#D2C8B7] text-[#9E9588]'
          }`}
        >
          <div className="flex items-center gap-1 font-semibold mb-1 text-[#2E4B6E]">
            <Feather size={13} />
            <span>三重 · 意象</span>
          </div>
          {attemptsCount >= 3 ? (
            <p className="font-serif leading-relaxed text-[11px]">{puzzle.clues.imagery}</p>
          ) : (
            <p className="flex items-center gap-1 text-[11px]">
              <Lock size={11} /> 三次推敲后揭示
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
