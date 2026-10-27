import { useState, useMemo } from 'react';
import { Navbar } from './components/common/Navbar';
import { ShizangGame } from './components/shizang/ShizangGame';
import { WenmaiGame } from './components/wenmai/WenmaiGame';
import { RuleModal } from './components/common/RuleModal';
import { ShareModal } from './components/common/ShareModal';
import { CoupletModal } from './components/couplet/CoupletModal';
import { TujianModal } from './components/gallery/TujianModal';
import { SyncModal } from './components/sync/SyncModal';
import { RankModal } from './components/rank/RankModal';
import type { GameMode, PlayerStats } from './types/game';
import { loadPlayerStats, savePlayerStats } from './utils/storage';
import { getDailyShizang, getDailyWenmai } from './utils/dailySeeder';
import type { ShareCardData } from './utils/shareCard';
import { getOrCreateLocalProfile } from './lib/loongclan';
import { Sparkles, Scroll, Feather } from 'lucide-react';
import { I18nProvider, useI18n } from './i18n';
import { AmbientCanvas } from './components/common/AmbientCanvas';

function AppContent() {
  const { t } = useI18n();
  const [currentMode, setCurrentMode] = useState<GameMode>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const m = params.get('mode');
      if (m === 'wenmai' || m === 'shizang') {
        return m;
      }
    } catch {
      // ignore
    }
    return 'shizang';
  });
  const [stats, setStats] = useState<PlayerStats>(() => loadPlayerStats());

  // 日期偏移动态计算（默认今日，可浏览往期）
  const [dayOffset, setDayOffset] = useState<number>(0);
  const [baseDate] = useState(() => new Date());

  // 计算当前选定日期的谜题
  const currentDate = useMemo(() => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + dayOffset);
    return d;
  }, [baseDate, dayOffset]);

  const { puzzle: shizangPuzzle, info: shizangInfo } = useMemo(
    () => getDailyShizang(currentDate),
    [currentDate]
  );

  const { puzzle: wenmaiPuzzle, info: wenmaiInfo } = useMemo(
    () => getDailyWenmai(currentDate),
    [currentDate]
  );

  // 模态框状态
  const [showRules, setShowRules] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareData, setShareData] = useState<ShareCardData | null>(null);
  const [showCouplet, setShowCouplet] = useState(false);
  const [showTujian, setShowTujian] = useState(false);
  const [showSync, setShowSync] = useState(false);
  const [showRank, setShowRank] = useState(false);
  const [userProfile, setUserProfile] = useState(() => getOrCreateLocalProfile());

  const handleUpdateStats = (newStats: PlayerStats) => {
    setStats(newStats);
    savePlayerStats(newStats);
  };

  const handleOpenShare = (data: ShareCardData) => {
    setShareData(data);
    setShowShare(true);
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-[#F6F2E9] text-[#1A1917] selection:bg-[#B93A32] selection:text-white">
      <AmbientCanvas />
      {/* 顶部导航 */}
      <Navbar
        currentMode={currentMode}
        onSelectMode={(mode) => {
          if (mode === 'tujian') {
            setShowTujian(true);
          } else {
            setCurrentMode(mode);
            try {
              const url = new URL(window.location.href);
              url.searchParams.set('mode', mode);
              window.history.replaceState({}, '', url.toString());
            } catch {
              // ignore
            }
          }
        }}
        stats={stats}
        dailyInfo={currentMode === 'shizang' ? shizangInfo : wenmaiInfo}
        onOpenRules={() => setShowRules(true)}
        onOpenAchievements={() => setShowTujian(true)}
        onOpenSync={() => setShowSync(true)}
        onOpenRank={() => setShowRank(true)}
        onPrevDay={() => setDayOffset((prev) => prev - 1)}
        onNextDay={() => setDayOffset((prev) => Math.min(0, prev + 1))}
        isToday={dayOffset === 0}
        onResetToToday={() => setDayOffset(0)}
        nickname={userProfile.nickname}
      />

      {/* 主体游戏内容容器 */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 md:py-6 flex flex-col items-center justify-start">
        {/* 顶部东方意象横幅 */}
        <div className="w-full max-w-xl text-center mb-4 flex items-center justify-between border-b border-[#D8CFBF]/60 pb-2">
          <div className="flex items-center gap-1.5 text-xs text-[#8C8377] font-serif">
            <Scroll size={14} className="text-[#B93A32]" />
            <span>{t('app.daily_banner', { dayNumber: shizangInfo.dayNumber })}</span>
          </div>

          <button
            onClick={() => setShowCouplet(true)}
            className="text-[11px] font-serif text-[#8C6036] hover:text-[#B93A32] flex items-center gap-1 bg-[#ECE4D0]/70 px-2 py-0.5 rounded border border-[#DACDB6] transition cursor-pointer"
          >
            <Sparkles size={12} />
            <span>{t('app.couplet_btn')}</span>
          </button>
        </div>

        {/* 游戏视图切换 */}
        {currentMode === 'shizang' ? (
          <ShizangGame
            key={shizangPuzzle.id}
            puzzle={shizangPuzzle}
            dayNumber={shizangInfo.dayNumber}
            dateStr={shizangInfo.dateStr}
            formattedDate={shizangInfo.formattedChineseDate}
            stats={stats}
            onUpdateStats={handleUpdateStats}
            onOpenShareModal={handleOpenShare}
            onTriggerCouplet={() => setShowCouplet(true)}
          />
        ) : (
          <WenmaiGame
            key={wenmaiPuzzle.id}
            puzzle={wenmaiPuzzle}
            dayNumber={wenmaiInfo.dayNumber}
            dateStr={wenmaiInfo.dateStr}
            formattedDate={wenmaiInfo.formattedChineseDate}
            stats={stats}
            onUpdateStats={handleUpdateStats}
            onOpenShareModal={handleOpenShare}
          />
        )}
      </main>

      {/* 底部文人闲章与声明 */}
      <footer className="w-full py-6 mt-8 border-t border-[#DCD2BC] bg-[#F0EAD9]/60 text-center text-xs text-[#7A7165]">
        <div className="max-w-xl mx-auto px-4 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 font-serif text-sm font-semibold text-[#4A433A]">
            <Feather size={14} className="text-[#B93A32]" />
            <span>{t('app.motto')}</span>
          </div>
          <p className="text-[11px] text-[#8C8377] font-serif">
            {t('app.title')} —— {t('app.subtitle')}
          </p>
          <p className="text-[10px] text-[#A69C8E]">
            {t('app.footer.desc')}
          </p>
        </div>
      </footer>

      {/* 弹窗集合 */}
      <RuleModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        defaultTab={currentMode === 'wenmai' ? 'wenmai' : 'shizang'}
      />

      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        cardData={shareData}
      />

      <CoupletModal
        isOpen={showCouplet}
        onClose={() => setShowCouplet(false)}
      />

      <TujianModal
        isOpen={showTujian}
        onClose={() => setShowTujian(false)}
        stats={stats}
      />

      {/* 龙族平台规范：三维口令云端同步弹窗 */}
      <SyncModal
        isOpen={showSync}
        onClose={() => {
          setShowSync(false);
          setUserProfile(getOrCreateLocalProfile());
        }}
        stats={stats}
        onStatsUpdated={handleUpdateStats}
      />

      {/* 龙族平台规范：每日全网排行榜弹窗 */}
      <RankModal
        isOpen={showRank}
        onClose={() => setShowRank(false)}
        stats={stats}
        dateStr={currentMode === 'shizang' ? shizangInfo.dateStr : wenmaiInfo.dateStr}
      />
    </div>
  );
}

export function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}

export default App;
