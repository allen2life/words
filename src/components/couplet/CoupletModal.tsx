import React, { useState } from 'react';
import { X, Sparkles, Feather, CheckCircle2, Award } from 'lucide-react';
import { COUPLET_ITEMS } from '../../data/coupletEaster';

interface CoupletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoupletModal: React.FC<CoupletModalProps> = ({ isOpen, onClose }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [unlockedSkin, setUnlockedSkin] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentItem = COUPLET_ITEMS[selectedIdx];

  const handleChoose = (cand: string) => {
    setSelectedAnswer(cand);
    const correct = cand === currentItem.secondLine;
    setIsCorrect(correct);
    if (correct) {
      setUnlockedSkin(currentItem.unlockSkin);
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setUnlockedSkin(null);
    setSelectedIdx((prev) => (prev + 1) % COUPLET_ITEMS.length);
  };

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
          <div className="inline-flex items-center gap-1.5 text-xs text-[#B93A32] font-semibold tracking-widest mb-1">
            <Sparkles size={14} />
            <span>东方独家彩蛋 · 骈俪对仗</span>
          </div>
          <h3 className="text-2xl font-bold font-serif tracking-wider text-[#1C1A17]">
            妙联天成 · 平仄相和
          </h3>
          <p className="text-xs text-[#7A7165] mt-1 tracking-wider">
            考辨词性、声律与意境，选出最工稳妥帖之绝妙下联
          </p>
        </div>

        {/* 题目展示区 */}
        <div className="p-5 bg-[#FAF6EE] rounded-xl border border-[#D5C9B3] text-center shadow-inner my-4">
          <span className="text-xs text-[#8C8377] font-semibold">
            {currentItem.poet}
          </span>

          <div className="my-3 space-y-2 font-serif">
            <div className="text-lg md:text-xl font-bold text-[#1F1D1A] tracking-widest">
              上联：{currentItem.firstLine}
            </div>
            <div className="text-lg md:text-xl font-bold text-[#B93A32] tracking-widest min-h-[32px]">
              下联：{selectedAnswer || '————？————'}
            </div>
          </div>
        </div>

        {/* 候选选项 */}
        <div className="space-y-2 my-4">
          {currentItem.candidates.map((cand) => {
            const isChosen = selectedAnswer === cand;
            let btnStyle = 'bg-[#FCFAF5] hover:bg-[#F3ECE0] border-[#D6CBB7] text-[#2C2925]';
            if (isChosen) {
              if (isCorrect) {
                btnStyle = 'bg-[#EEF5F0] border-[#386641] text-[#25522F] shadow-sm';
              } else {
                btnStyle = 'bg-[#F9ECEB] border-[#B93A32] text-[#8E221B] shadow-sm';
              }
            }

            return (
              <button
                key={cand}
                onClick={() => handleChoose(cand)}
                disabled={isCorrect === true}
                className={`w-full p-3 rounded-lg border-2 text-left font-serif font-bold text-sm tracking-wider flex items-center justify-between transition ${btnStyle}`}
              >
                <span>{cand}</span>
                {isChosen && isCorrect && <CheckCircle2 size={18} className="text-[#386641]" />}
              </button>
            );
          })}
        </div>

        {/* 判定与对仗解析 */}
        {selectedAnswer && (
          <div className="my-3 p-3.5 rounded-lg border text-xs leading-relaxed bg-[#FAF3E4] border-[#E0D0B5]">
            <div className="font-bold text-[#8C6036] mb-1 flex items-center gap-1.5">
              <Feather size={14} />
              <span>声律对仗解析</span>
            </div>
            <p className="text-[#594E41]">{currentItem.rhymeExplanation}</p>
          </div>
        )}

        {/* 解锁皮肤特效奖励 */}
        {unlockedSkin && (
          <div className="p-3 bg-[#FCF0EC] border-2 border-[#B93A32]/40 rounded-lg flex items-center gap-3 my-3">
            <div className="w-10 h-10 rounded-full bg-[#B93A32] text-white flex items-center justify-center shrink-0">
              <Award size={20} />
            </div>
            <div className="text-xs">
              <span className="font-bold text-[#B93A32]">解锁诗人专属风雅名帖：</span>
              <p className="font-serif font-bold text-sm text-[#1C1A17]">{unlockedSkin}</p>
            </div>
          </div>
        )}

        {/* 下一联按钮 */}
        <div className="mt-5 pt-3 border-t border-[#DCD3C1] flex justify-end gap-2">
          {isCorrect && (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-[#2E4B6E] text-white rounded font-serif text-xs font-bold tracking-wider hover:bg-[#233A56] transition"
            >
              赏下一联 ❯
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#B93A32] text-white rounded font-serif text-xs font-bold tracking-wider hover:bg-[#9E2E27] transition"
          >
            完成对仗
          </button>
        </div>
      </div>
    </div>
  );
};
