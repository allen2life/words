import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import type { ShizangPuzzle, GuessRecord, PlayerStats } from '../../types/game';
import { VerseBoard } from './VerseBoard';
import { TripleClueRibbon } from './TripleClueRibbon';
import { GuessHistory } from './GuessHistory';
import { ChineseKeypad } from './ChineseKeypad';
import { VerseSuccessModal } from './VerseSuccessModal';
import { recordShizangResult } from '../../utils/storage';
import type { ShareCardData } from '../../utils/shareCard';
import { ACHIEVEMENTS } from '../../data/achievements';

interface ShizangGameProps {
  puzzle: ShizangPuzzle;
  dayNumber: number;
  dateStr: string;
  formattedDate: string;
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  onOpenShareModal: (data: ShareCardData) => void;
  onTriggerCouplet: () => void;
}

const MAX_GUESSES = 6;

export const ShizangGame: React.FC<ShizangGameProps> = ({
  puzzle,
  dayNumber,
  dateStr,
  formattedDate,
  stats,
  onUpdateStats,
  onOpenShareModal,
  onTriggerCouplet,
}) => {
  const isAlreadySolved = stats.solvedShizangIds.includes(puzzle.id);
  const [currentChar, setCurrentChar] = useState('');
  const [guesses, setGuesses] = useState<GuessRecord[]>(() =>
    isAlreadySolved
      ? [{ char: puzzle.targetChar, status: 'exact', feedback: '原题已在往期修习中洞穿！' }]
      : []
  );
  const [isSolved, setIsSolved] = useState(isAlreadySolved);
  const [isGameOver, setIsGameOver] = useState(isAlreadySolved);
  const [showModal, setShowModal] = useState(false);

  const handleSubmitGuess = () => {
    if (!currentChar || isGameOver) return;

    const target = puzzle.targetChar;
    const isExact = currentChar === target;

    // 判定逻辑
    let status: 'exact' | 'near' | 'none' = 'none';
    let feedback = '此字不在诗中，风马牛不及';

    if (isExact) {
      status = 'exact';
      feedback = '正中诗眼！字正腔圆，神韵尽显！';
    } else {
      const fullPoemText = puzzle.fullPoem.join('');
      if (fullPoemText.includes(currentChar)) {
        status = 'near';
        feedback = '此字在全诗其他句中出现，意境相近但非此处诗眼';
      } else {
        // 同偏旁部首检测
        const radicalChar = puzzle.clues.radical[0];
        if (currentChar.includes(radicalChar)) {
          status = 'near';
          feedback = '部首声律暗合，但非原字';
        }
      }
    }

    const newRecord: GuessRecord = {
      char: currentChar,
      status,
      feedback
    };

    const nextGuesses = [...guesses, newRecord];
    setGuesses(nextGuesses);
    setCurrentChar('');

    if (isExact) {
      setIsSolved(true);
      setIsGameOver(true);
      // 欢庆水墨纸屑动效
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#B93A32', '#C99427', '#2E4B6E', '#1A1918']
      });

      const updated = recordShizangResult(puzzle.id, true, nextGuesses.length);
      onUpdateStats(updated);
      setTimeout(() => setShowModal(true), 900);
    } else if (nextGuesses.length >= MAX_GUESSES) {
      setIsGameOver(true);
      const updated = recordShizangResult(puzzle.id, false, nextGuesses.length);
      onUpdateStats(updated);
      setTimeout(() => setShowModal(true), 900);
    }
  };

  const handleOpenShare = () => {
    const currentAchRank = ACHIEVEMENTS.find(
      a => stats.collectedAchievements.includes(a.id)
    )?.title || '蒙童';

    // 格式化色块
    const blocks = guesses.map(g => {
      let color = '#6D6964';
      if (g.status === 'exact') color = '#B93A32';
      else if (g.status === 'near') color = '#C99427';
      return [color];
    });

    const shareData: ShareCardData = {
      gameTitle: `《诗藏》第 ${dayNumber} 期`,
      dateStr,
      formattedDate,
      highlightPoem: puzzle.targetLine.replace(puzzle.targetChar, isSolved ? puzzle.targetChar : '○'),
      author: `${puzzle.dynasty} · ${puzzle.author}`,
      resultSummary: isSolved ? `${guesses.length}次定局 · 意境顿开` : '掩卷沉思 · 诗意长存',
      blocks,
      streak: stats.shizangStreak,
      rankTitle: currentAchRank
    };

    onOpenShareModal(shareData);
  };

  return (
    <div className="w-full flex flex-col items-center py-4 px-2">
      {/* 诗句核心展示棋盘 */}
      <VerseBoard
        puzzle={puzzle}
        isSolved={isSolved}
        currentAttemptChar={currentChar}
      />

      {/* 墨韵三重提示 */}
      <TripleClueRibbon
        puzzle={puzzle}
        attemptsCount={guesses.length}
      />

      {/* 中式键盘与智能字盘 */}
      <ChineseKeypad
        puzzle={puzzle}
        currentChar={currentChar}
        onSelectChar={setCurrentChar}
        onSubmit={handleSubmitGuess}
        disabled={isGameOver}
      />

      {/* 历史推敲色阶记录（置底） */}
      <GuessHistory
        guesses={guesses}
        maxGuesses={MAX_GUESSES}
      />

      {/* 通关与赏析弹窗 */}
      <VerseSuccessModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        puzzle={puzzle}
        isWon={isSolved}
        guessesCount={guesses.length}
        onOpenShare={handleOpenShare}
        onTriggerCouplet={onTriggerCouplet}
      />
    </div>
  );
};
