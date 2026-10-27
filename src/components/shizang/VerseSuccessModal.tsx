import React from 'react';
import { X, Sparkles, Share2, Compass, CheckCircle } from 'lucide-react';
import type { ShizangPuzzle } from '../../types/game';

interface VerseSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  puzzle: ShizangPuzzle;
  isWon: boolean;
  guessesCount: number;
  onOpenShare: () => void;
  onTriggerCouplet: () => void;
}

export const VerseSuccessModal: React.FC<VerseSuccessModalProps> = ({
  isOpen,
  onClose,
  puzzle,
  isWon,
  guessesCount,
  onOpenShare,
  onTriggerCouplet,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto paper-texture rounded-xl border-2 border-[#8C8377]/40 p-6 md:p-8 text-[#1C1A17] shadow-2xl">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#6B655D] hover:text-[#1A1917] hover:bg-black/5 transition"
        >
          <X size={20} />
        </button>

        {/* 顶部通关标识 */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#B93A32] text-white mb-2 shadow-md">
            {isWon ? <CheckCircle size={32} /> : <Compass size={32} />}
          </div>
          <h3 className="text-2xl font-bold font-serif tracking-widest text-[#1C1A17]">
            {isWon ? '诗眼既破 · 文心通达' : '卷掩沉思 · 诗意长存'}
          </h3>
          <p className="text-xs text-[#7A7165] mt-1 tracking-wider">
            {isWon
              ? `在第 ${guessesCount} 次推敲中洞开诗意，妙笔生花！`
              : `本局诗眼为“${puzzle.targetChar}”，且看前贤如何运笔造境。`}
          </p>
        </div>

        {/* 全诗木刻排版呈现 */}
        <div className="my-4 p-5 bg-[#FAF6EE] rounded-lg border border-[#DACFBC] text-center shadow-inner">
          <div className="text-xs text-[#8A7D6D] tracking-widest mb-2 font-semibold">
            〔{puzzle.dynasty}〕{puzzle.author} · 《{puzzle.title}》
          </div>

          <div className="space-y-1.5 font-serif text-lg md:text-xl font-medium tracking-widest text-[#24211D]">
            {puzzle.fullPoem.map((line, idx) => {
              const isTargetLine = line.includes(puzzle.targetChar) && idx === puzzle.fullPoem.findIndex(l => l.includes(puzzle.targetLine));
              return (
                <p
                  key={idx}
                  className={
                    isTargetLine
                      ? 'text-[#B93A32] font-bold py-0.5'
                      : 'text-[#3E3A35]'
                  }
                >
                  {line}
                </p>
              );
            })}
          </div>
        </div>

        {/* 诗眼深度赏析 */}
        <div className="space-y-3 my-4 text-xs text-[#423C35] leading-relaxed">
          <div className="bg-[#FAF3E4] p-3.5 rounded border border-[#E0D0B5]">
            <h4 className="font-bold text-sm tracking-wider text-[#8C6036] mb-1.5 flex items-center gap-1.5">
              <Sparkles size={15} />
              诗眼造境解析
            </h4>
            <p className="text-[#52483C]">{puzzle.appreciation}</p>
          </div>

          <div className="p-3 bg-[#F2EDE1]/60 rounded border border-[#DDD4C3]">
            <h4 className="font-bold text-xs tracking-wider text-[#635A4F] mb-1">
              诗人小传
            </h4>
            <p className="text-[#696156]">{puzzle.authorBio}</p>
          </div>
        </div>

        {/* 按钮操作栏 */}
        <div className="mt-6 pt-4 border-t border-[#DCD3C1] flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={onTriggerCouplet}
            className="flex-1 py-2.5 px-3 bg-[#2E4B6E] hover:bg-[#233A56] text-white rounded font-serif font-semibold text-xs tracking-wider flex items-center justify-center gap-1.5 transition shadow"
          >
            <Sparkles size={15} />
            <span>解密骈文对仗彩蛋</span>
          </button>

          <button
            onClick={onOpenShare}
            className="flex-1 py-2.5 px-3 bg-[#B93A32] hover:bg-[#9E2E27] text-white rounded font-serif font-semibold text-xs tracking-wider flex items-center justify-center gap-1.5 transition shadow"
          >
            <Share2 size={15} />
            <span>生成水墨打卡图</span>
          </button>
        </div>
      </div>
    </div>
  );
};
