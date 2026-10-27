import React, { useState, useMemo } from 'react';
import { CornerDownLeft, Delete } from 'lucide-react';
import type { ShizangPuzzle } from '../../types/game';

interface ChineseKeypadProps {
  puzzle: ShizangPuzzle;
  currentChar: string;
  onSelectChar: (char: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

export const ChineseKeypad: React.FC<ChineseKeypadProps> = ({
  puzzle,
  currentChar,
  onSelectChar,
  onSubmit,
  disabled,
}) => {
  const [typedInput, setTypedInput] = useState('');

  // 灵感字盘：生成包含目标字、同部首字、同韵字以及经典诗词常用字的候选池（16-20个字）
  const candidatePool = useMemo(() => {
    const target = puzzle.targetChar;
    // 经典诗词动词/形容词/副词高频炼字库
    const commonPoeticWords = [
      '到', '过', '入', '满', '照', '生', '尽', '去', '直', '圆',
      '落', '飞', '空', '深', '浅', '寒', '冷', '暖', '青', '碧',
      '千', '万', '一', '重', '下', '来', '归', '依', '流', '长',
      '开', '岸', '自', '何', '向', '倚', '吹', '拂', '染', '啼'
    ];

    // 组合候选集，确保包含正确答案
    const set = new Set<string>();
    set.add(target);

    // 从诗中其他字提取一些作为干扰
    puzzle.fullPoem.join('').split('').forEach(c => {
      if (c !== target && !'，。、《》？！'.includes(c)) {
        set.add(c);
      }
    });

    // 补充常用炼字至 16 个
    for (const w of commonPoeticWords) {
      if (set.size >= 16) break;
      set.add(w);
    }

    // 伪确定性打乱
    const arr = Array.from(set);
    return arr.sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0));
  }, [puzzle]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    if (!val) {
      setTypedInput('');
      onSelectChar('');
      return;
    }
    // 取最后一个汉字
    const lastChar = val.slice(-1);
    setTypedInput(lastChar);
    onSelectChar(lastChar);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="w-full max-w-xl my-4 p-4 bg-[#F8F4EC] rounded-xl border border-[#D8CFBF] shadow-sm">
      {/* 自由输入框与操作栏 */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={currentChar || typedInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="输入或点击下方候选字推敲..."
            maxLength={1}
            className="w-full px-3.5 py-2 text-center text-lg font-serif font-bold bg-[#FFFFFF] border-2 border-[#CFC3A5] focus:border-[#B93A32] rounded-lg outline-none text-[#1C1A17] placeholder:text-xs placeholder:font-sans placeholder:text-[#9C9387] shadow-inner transition"
          />
          {currentChar && (
            <button
              onClick={() => {
                onSelectChar('');
                setTypedInput('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8377] hover:text-[#B93A32]"
              title="清除"
            >
              <Delete size={18} />
            </button>
          )}
        </div>

        {/* 提交推敲按钮 */}
        <button
          onClick={onSubmit}
          disabled={disabled || !currentChar}
          className="px-5 py-2.5 bg-[#B93A32] hover:bg-[#A02D26] disabled:opacity-40 disabled:hover:bg-[#B93A32] text-white font-serif font-bold text-sm tracking-widest rounded-lg flex items-center gap-1.5 transition shadow-sm"
        >
          <span>定稿推敲</span>
          <CornerDownLeft size={16} />
        </button>
      </div>

      {/* 灵感字盘（智能候选字阵） */}
      <div>
        <div className="text-[11px] font-semibold text-[#82786B] mb-2 flex items-center justify-between">
          <span>灵感候选字盘</span>
          <span className="text-[10px] text-[#A19788]">点击即选，亦可自由键盘敲入</span>
        </div>

        <div className="grid grid-cols-8 gap-1.5 md:gap-2">
          {candidatePool.map((char) => {
            const isSelected = currentChar === char;
            return (
              <button
                key={char}
                onClick={() => {
                  if (disabled) return;
                  onSelectChar(char);
                  setTypedInput(char);
                }}
                disabled={disabled}
                className={`h-10 rounded-md font-serif font-bold text-base md:text-lg flex items-center justify-center transition ${
                  isSelected
                    ? 'bg-[#B93A32] text-white scale-105 shadow-md'
                    : 'bg-[#FFFDF9] hover:bg-[#F0E8D7] border border-[#D5CAA8] text-[#2D2A26] active:scale-95'
                }`}
              >
                {char}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
