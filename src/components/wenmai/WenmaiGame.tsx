import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Shuffle, RotateCcw, Check, Sparkles } from 'lucide-react';
import type { WenmaiPuzzle, WenmaiGroup, PlayerStats } from '../../types/game';
import { SolvedBanners } from './SolvedBanners';
import { MatrixGrid } from './MatrixGrid';
import { MistakeDots } from './MistakeDots';
import { ExegesisModal } from './ExegesisModal';
import { recordWenmaiResult } from '../../utils/storage';
import type { ShareCardData } from '../../utils/shareCard';
import { ACHIEVEMENTS } from '../../data/achievements';

interface WenmaiGameProps {
  puzzle: WenmaiPuzzle;
  dayNumber: number;
  dateStr: string;
  formattedDate: string;
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  onOpenShareModal: (data: ShareCardData) => void;
}

const MAX_MISTAKES = 4;

// 数组随机洗牌函数
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const WenmaiGame: React.FC<WenmaiGameProps> = ({
  puzzle,
  dayNumber,
  dateStr,
  formattedDate,
  stats,
  onUpdateStats,
  onOpenShareModal,
}) => {
  const isAlreadySolved = stats.solvedWenmaiIds.includes(puzzle.id);
  const [remainingWords, setRemainingWords] = useState<string[]>(() =>
    isAlreadySolved ? [] : shuffleArray(puzzle.groups.flatMap((g) => g.words))
  );
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [solvedGroups, setSolvedGroups] = useState<WenmaiGroup[]>(() =>
    isAlreadySolved ? puzzle.groups : []
  );
  const [mistakesRemaining, setMistakesRemaining] = useState<number>(MAX_MISTAKES);
  const [shakeGrid, setShakeGrid] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isGameOver, setIsGameOver] = useState(isAlreadySolved);
  const [modalGroup, setModalGroup] = useState<WenmaiGroup | null>(null);
  const [showAllExegesis, setShowAllExegesis] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleToggleWord = (word: string) => {
    if (isGameOver) return;
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter((w) => w !== word));
    } else {
      if (selectedWords.length >= 4) {
        showToast('每次归类仅可选取 4 个词条');
        return;
      }
      setSelectedWords([...selectedWords, word]);
    }
  };

  const handleShuffle = () => {
    if (isGameOver) return;
    setRemainingWords(shuffleArray(remainingWords));
  };

  const handleDeselectAll = () => {
    setSelectedWords([]);
  };

  const handleSubmit = () => {
    if (selectedWords.length !== 4 || isGameOver) {
      showToast('请恰好选取 4 个同属一脉的词条');
      return;
    }

    // 检查是否完美匹配某一个未解出的分类
    const matchedGroup = puzzle.groups.find((g) => {
      if (solvedGroups.some((sg) => sg.id === g.id)) return false;
      return g.words.every((w) => selectedWords.includes(w));
    });

    if (matchedGroup) {
      // 匹配成功
      const nextSolved = [...solvedGroups, matchedGroup];
      setSolvedGroups(nextSolved);
      setRemainingWords(remainingWords.filter((w) => !selectedWords.includes(w)));
      setSelectedWords([]);
      showToast(`✨ 契合！【${matchedGroup.theme}】文脉贯通！`);

      if (nextSolved.length === 4) {
        setIsGameOver(true);
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#D99B26', '#386641', '#2E4B6E', '#5C3C67']
        });

        const mistakesUsed = MAX_MISTAKES - mistakesRemaining;
        const updated = recordWenmaiResult(puzzle.id, true, mistakesUsed);
        onUpdateStats(updated);
        setTimeout(() => setShowAllExegesis(true), 1000);
      }
    } else {
      // 匹配失败：检查是否“差之毫厘”（包含 3 个正确词）
      const isOneAway = puzzle.groups.some((g) => {
        if (solvedGroups.some((sg) => sg.id === g.id)) return false;
        const count = g.words.filter((w) => selectedWords.includes(w)).length;
        return count === 3;
      });

      const nextMistakes = mistakesRemaining - 1;
      setMistakesRemaining(nextMistakes);

      setShakeGrid(true);
      setTimeout(() => setShakeGrid(false), 500);

      if (isOneAway) {
        showToast('💡 差之毫厘！所选词中有 3 个属于同一文脉，请再辨析！');
      } else {
        showToast('四词脉络不合，沉香渐消');
      }

      if (nextMistakes <= 0) {
        // 机会耗尽，自动展开所有分类
        setIsGameOver(true);
        setSolvedGroups(puzzle.groups);
        setRemainingWords([]);
        setSelectedWords([]);
        const updated = recordWenmaiResult(puzzle.id, false, MAX_MISTAKES);
        onUpdateStats(updated);
        setTimeout(() => setShowAllExegesis(true), 1200);
      }
    }
  };

  const handleOpenShare = () => {
    const currentAchRank = ACHIEVEMENTS.find(
      (a) => stats.collectedAchievements.includes(a.id)
    )?.title || '蒙童';

    // 颜色块：按解决的顺序
    const tierColors: Record<string, string> = {
      yellow: '#D99B26',
      green: '#386641',
      blue: '#2E4B6E',
      purple: '#5C3C67'
    };

    const blocks = solvedGroups.map((g) => {
      const col = tierColors[g.tier] || '#6D6964';
      return [col, col, col, col];
    });

    const mistakesUsed = MAX_MISTAKES - mistakesRemaining;
    const summary =
      mistakesRemaining > 0
        ? `四脉通达 · ${mistakesUsed === 0 ? '零失误大圆满' : `耗香${mistakesUsed}柱`}`
        : '四脉既毕 · 掩卷通悟';

    const shareData: ShareCardData = {
      gameTitle: `《文脉》第 ${dayNumber} 期`,
      dateStr,
      formattedDate,
      highlightPoem: `【${puzzle.title}】16词分类归宗`,
      author: '华夏典故 · 诸子思想 · 传世名篇',
      resultSummary: summary,
      blocks,
      streak: stats.wenmaiStreak,
      rankTitle: currentAchRank
    };

    onOpenShareModal(shareData);
  };

  return (
    <div className="w-full flex flex-col items-center py-4 px-2">
      {/* 题头与期数 */}
      <div className="text-center mb-3">
        <h2 className="text-xl md:text-2xl font-bold font-serif tracking-wider text-[#1C1A17]">
          {puzzle.title}
        </h2>
        <p className="text-xs text-[#7A7165] mt-1 tracking-wider">
          找寻 16 个华夏词条间的文化渊源，4 个一组，归并四脉
        </p>
      </div>

      {/* 飘窗提示 */}
      {toastMsg && (
        <div className="fixed top-16 z-50 px-4 py-2 bg-[#1C1A17] text-[#FAF6EE] text-xs font-serif font-bold tracking-wider rounded-md shadow-lg animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* 已解出的分类卷轴横幅 */}
      <SolvedBanners
        groups={solvedGroups}
        onOpenExegesis={(g) => setModalGroup(g)}
      />

      {/* 16 宫格词条矩阵 */}
      {remainingWords.length > 0 && (
        <MatrixGrid
          words={remainingWords}
          selectedWords={selectedWords}
          onToggleWord={handleToggleWord}
          shakeWord={shakeGrid}
          disabled={isGameOver}
        />
      )}

      {/* 沉香容错指示 */}
      {!isGameOver && (
        <MistakeDots
          mistakesRemaining={mistakesRemaining}
          maxMistakes={MAX_MISTAKES}
        />
      )}

      {/* 底部控制按钮组 */}
      <div className="flex items-center gap-2.5 my-3">
        <button
          onClick={handleShuffle}
          disabled={isGameOver || remainingWords.length === 0}
          className="px-3 py-2 bg-[#FAF6EE] hover:bg-[#EDE5D6] disabled:opacity-40 border border-[#D5CAA8] rounded-lg text-xs font-medium text-[#4D463E] flex items-center gap-1.5 transition shadow-xs"
        >
          <Shuffle size={14} />
          <span>洗牌理叙</span>
        </button>

        <button
          onClick={handleDeselectAll}
          disabled={isGameOver || selectedWords.length === 0}
          className="px-3 py-2 bg-[#FAF6EE] hover:bg-[#EDE5D6] disabled:opacity-40 border border-[#D5CAA8] rounded-lg text-xs font-medium text-[#4D463E] flex items-center gap-1.5 transition shadow-xs"
        >
          <RotateCcw size={14} />
          <span>重置所选</span>
        </button>

        <button
          onClick={handleSubmit}
          disabled={isGameOver || selectedWords.length !== 4}
          className="px-5 py-2 bg-[#2E4B6E] hover:bg-[#233A56] disabled:opacity-40 disabled:hover:bg-[#2E4B6E] text-white rounded-lg text-xs font-serif font-bold tracking-widest flex items-center gap-1.5 transition shadow-sm"
        >
          <Check size={15} />
          <span>定夺脉络 ({selectedWords.length}/4)</span>
        </button>
      </div>

      {/* 通关后全卷解悟入口 */}
      {isGameOver && (
        <div className="mt-3 flex gap-3">
          <button
            onClick={() => setShowAllExegesis(true)}
            className="px-4 py-2 bg-[#2E4B6E] text-white rounded-lg text-xs font-serif font-bold tracking-wider flex items-center gap-1.5 shadow"
          >
            <Sparkles size={14} />
            <span>研读文心雕龙全卷解悟</span>
          </button>
          <button
            onClick={handleOpenShare}
            className="px-4 py-2 bg-[#B93A32] text-white rounded-lg text-xs font-serif font-bold tracking-wider flex items-center gap-1.5 shadow"
          >
            <span>生成通关文卷</span>
          </button>
        </div>
      )}

      {/* 单组或全组解悟弹窗 */}
      <ExegesisModal
        isOpen={!!modalGroup || showAllExegesis}
        onClose={() => {
          setModalGroup(null);
          setShowAllExegesis(false);
        }}
        selectedGroup={modalGroup}
        allGroups={puzzle.groups}
        isCompleted={isGameOver}
        onOpenShare={handleOpenShare}
      />
    </div>
  );
};
