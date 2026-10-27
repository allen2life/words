import React from 'react';

interface MatrixGridProps {
  words: string[];
  selectedWords: string[];
  onToggleWord: (word: string) => void;
  shakeWord: boolean;
  disabled: boolean;
}

export const MatrixGrid: React.FC<MatrixGridProps> = ({
  words,
  selectedWords,
  onToggleWord,
  shakeWord,
  disabled,
}) => {
  return (
    <div
      className={`w-full max-w-xl grid grid-cols-4 gap-2 md:gap-2.5 my-3 ${
        shakeWord ? 'animate-shake' : ''
      }`}
    >
      {words.map((word) => {
        const isSelected = selectedWords.includes(word);

        return (
          <button
            key={word}
            onClick={() => onToggleWord(word)}
            disabled={disabled}
            className={`h-16 md:h-20 rounded-lg p-1.5 flex items-center justify-center text-center font-serif font-bold text-xs sm:text-sm md:text-base tracking-wider transition-all duration-200 border-2 select-none ${
              isSelected
                ? 'bg-[#2E4B6E] text-white border-[#1B3047] shadow-md scale-[1.02]'
                : 'bg-[#FCFAF5] hover:bg-[#F3ECE0] text-[#292622] border-[#D6CBB7] shadow-xs active:scale-95'
            }`}
          >
            <span className="leading-snug break-all">{word}</span>
          </button>
        );
      })}
    </div>
  );
};
