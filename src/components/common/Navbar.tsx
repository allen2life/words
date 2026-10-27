import React, { useState } from 'react';
import { BookOpen, Layers, Award, Calendar, HelpCircle, Flame, ChevronLeft, ChevronRight, Cloud, Trophy, Globe } from 'lucide-react';
import type { GameMode, PlayerStats } from '../../types/game';
import type { DailySeedInfo } from '../../utils/dailySeeder';
import { useI18n } from '../../i18n';

interface NavbarProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  stats: PlayerStats;
  dailyInfo: DailySeedInfo;
  onOpenRules: () => void;
  onOpenAchievements: () => void;
  onOpenSync: () => void;
  onOpenRank: () => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  isToday: boolean;
  onResetToToday: () => void;
  nickname?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  stats,
  dailyInfo,
  onOpenRules,
  onOpenAchievements,
  onOpenSync,
  onOpenRank,
  onPrevDay,
  onNextDay,
  isToday,
  onResetToToday,
  nickname,
}) => {
  const { t, locale, toggleLocale } = useI18n();
  const [showCalendar, setShowCalendar] = useState(false);
  const totalStreak = Math.max(stats.shizangStreak, stats.wenmaiStreak);

  return (
    <header className="sticky top-0 z-40 bg-[#F6F2E9]/95 backdrop-blur-md border-b border-[#DCD2BC] shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between">
        
        {/* 左侧：雅致国风 LOGO 与品牌 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => onSelectMode('shizang')}>
            <div className="w-8 h-8 rounded border-2 border-[#B93A32] flex items-center justify-center font-bold text-[#B93A32] text-lg bg-[#FAF5EC] shadow-xs font-serif">
              诗
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold tracking-widest text-[#1C1A17] font-serif">
                {t('nav.brand')}
              </h1>
              <p className="text-[10px] text-[#7C7469] tracking-wider">
                {t('app.subtitle')}
              </p>
            </div>
          </div>

          {/* 模式切换器 */}
          <nav className="flex items-center bg-[#EBE3D3] p-0.5 rounded-md border border-[#D5CAA8]">
            <button
              onClick={() => onSelectMode('shizang')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 text-xs font-semibold rounded tracking-wider transition ${
                currentMode === 'shizang'
                  ? 'bg-[#B93A32] text-white shadow-xs'
                  : 'text-[#5C564E] hover:text-[#1A1917]'
              }`}
            >
              <BookOpen size={13} />
              <span>{t('nav.shizang')}</span>
            </button>
            <button
              onClick={() => onSelectMode('wenmai')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 text-xs font-semibold rounded tracking-wider transition ${
                currentMode === 'wenmai'
                  ? 'bg-[#2E4B6E] text-white shadow-xs'
                  : 'text-[#5C564E] hover:text-[#1A1917]'
              }`}
            >
              <Layers size={13} />
              <span>{t('nav.wenmai')}</span>
            </button>
            <button
              onClick={() => onSelectMode('tujian')}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded tracking-wider transition ${
                currentMode === 'tujian'
                  ? 'bg-[#5C3C67] text-white shadow-xs'
                  : 'text-[#5C564E] hover:text-[#1A1917]'
              }`}
            >
              <Award size={13} />
              <span>{t('nav.tujian')}</span>
            </button>
          </nav>
        </div>

        {/* 右侧：功能控制区 */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* 日历/期数切换 */}
          <div className="relative">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-[#ECE4D0] hover:bg-[#E0D5BE] border border-[#CFC3A5] rounded text-xs text-[#453F37] font-medium tracking-wider transition"
            >
              <Calendar size={13} className="text-[#8C6036]" />
              <span className="hidden md:inline">
                {locale === 'en'
                  ? t('nav.volume_badge', { dayNumber: dailyInfo.dayNumber })
                  : dailyInfo.formattedChineseDate}
              </span>
              <span className="md:hidden">#{dailyInfo.dayNumber}</span>
            </button>

            {/* 历代题卷日历切换浮层 */}
            {showCalendar && (
              <div className="absolute right-0 mt-2 w-64 p-3 bg-[#FAF6EE] paper-texture rounded-lg border border-[#D1C5AD] shadow-xl z-50 text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E3D9C4]">
                  <span className="font-bold text-[#3B362F]">{t('nav.calendar_title')}</span>
                  <span className="text-[10px] text-[#8C8377]">{t('nav.daily_one')}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 px-1 bg-[#ECE4D0]/60 rounded mb-2">
                  <button
                    onClick={onPrevDay}
                    className="p-1 hover:bg-[#DFD3BA] rounded text-[#524B43]"
                    title={t('nav.prev_day')}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="text-center">
                    <div className="font-bold text-[#1C1A17]">
                      {t('nav.volume_badge', { dayNumber: dailyInfo.dayNumber })}
                    </div>
                    <div className="text-[10px] text-[#7A7165]">{dailyInfo.dateStr}</div>
                  </div>
                  <button
                    onClick={onNextDay}
                    disabled={isToday}
                    className="p-1 hover:bg-[#DFD3BA] disabled:opacity-30 rounded text-[#524B43]"
                    title={t('nav.next_day')}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                {!isToday && (
                  <button
                    onClick={() => {
                      onResetToToday();
                      setShowCalendar(false);
                    }}
                    className="w-full py-1 text-center bg-[#B93A32] text-white rounded text-[11px] font-medium hover:bg-[#9C2E27] transition"
                  >
                    {t('nav.back_today')}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 连续打卡 Badge */}
          <div
            onClick={onOpenAchievements}
            className="flex items-center gap-1 px-2 py-1 bg-[#FDF0EC] border border-[#EAC2B9] rounded text-xs text-[#B93A32] font-semibold cursor-pointer hover:bg-[#FBE4DD] transition"
            title={t('nav.streak_title')}
          >
            <Flame size={14} className="fill-[#B93A32]" />
            <span>{totalStreak}</span>
          </div>

          {/* 每日排行榜按钮 */}
          <button
            onClick={onOpenRank}
            className="p-1.5 text-[#6E675D] hover:text-[#B93A32] hover:bg-[#EAE1CD] rounded transition"
            title={t('nav.rank_title')}
          >
            <Trophy size={16} />
          </button>

          {/* 用户昵称与云端同步入口（规范：界面常驻区统一展示用户昵称，严禁展示口令） */}
          <button
            onClick={onOpenSync}
            className="flex items-center gap-1 px-2 py-1 bg-[#ECE4D0] hover:bg-[#E0D5BE] border border-[#CFC3A5] rounded text-xs text-[#453F37] font-medium transition"
            title={t('nav.sync_title')}
          >
            <Cloud size={13} className="text-[#2E4B6E]" />
            <span className="hidden sm:inline max-w-[80px] truncate">{nickname || t('nav.sync_title')}</span>
          </button>

          {/* 规则说明按钮 */}
          <button
            onClick={onOpenRules}
            className="p-1.5 text-[#6E675D] hover:text-[#1C1A17] hover:bg-[#EAE1CD] rounded transition"
            title={t('nav.rules_title')}
          >
            <HelpCircle size={16} />
          </button>

          {/* 多语言切换按钮 (SPEC_I18N: 默认英文，支持一键切换中文) */}
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1 px-2 py-1 bg-[#ECE4D0] hover:bg-[#E0D5BE] border border-[#CFC3A5] rounded text-xs font-semibold text-[#453F37] transition ml-0.5"
            title={t('nav.lang_switch_title')}
          >
            <Globe size={13} className="text-[#8C6036]" />
            <span>{locale === 'en' ? '中' : 'EN'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
