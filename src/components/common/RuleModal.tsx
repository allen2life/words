import React from 'react';
import { X, BookOpen, Sparkles, Layers } from 'lucide-react';
import { useI18n } from '../../i18n';

interface RuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'shizang' | 'wenmai';
}

export const RuleModal: React.FC<RuleModalProps> = ({ isOpen, onClose, defaultTab = 'shizang' }) => {
  const { locale, t } = useI18n();
  const [activeTab, setActiveTab] = React.useState<'shizang' | 'wenmai'>(defaultTab);

  if (!isOpen) return null;

  const isEn = locale === 'en';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto paper-texture rounded-lg border-2 border-[#8C8377]/40 p-6 md:p-8 text-[#1C1A17] shadow-2xl">
        {/* 顶部关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#6B655D] hover:text-[#1A1917] hover:bg-black/5 transition"
        >
          <X size={22} />
        </button>

        {/* 标题 */}
        <div className="text-center mb-6">
          <span className="text-xs tracking-[0.3em] text-[#8C8377] font-semibold">
            {isEn ? 'ORIENTAL LITERARY RIDDLES' : '国风日课 · 研读法则'}
          </span>
          <h2 className="text-2xl font-bold tracking-wider mt-1 text-[#1C1A17] font-serif">
            {isEn ? 'Rules & How to Play' : '通关指引与中式解谜规则'}
          </h2>
        </div>

        {/* Tab 切换 */}
        <div className="flex border-b border-[#D8CFBF] mb-6">
          <button
            onClick={() => setActiveTab('shizang')}
            className={`flex-1 pb-3 text-sm font-semibold tracking-wider transition border-b-2 ${
              activeTab === 'shizang'
                ? 'border-[#B93A32] text-[#B93A32]'
                : 'border-transparent text-[#6B655D] hover:text-[#1A1917]'
            }`}
          >
            {t('game.shizang_tab')}
          </button>
          <button
            onClick={() => setActiveTab('wenmai')}
            className={`flex-1 pb-3 text-sm font-semibold tracking-wider transition border-b-2 ${
              activeTab === 'wenmai'
                ? 'border-[#2E4B6E] text-[#2E4B6E]'
                : 'border-transparent text-[#6B655D] hover:text-[#1A1917]'
            }`}
          >
            {t('game.wenmai_tab')}
          </button>
        </div>

        {/* 诗藏说明 */}
        {activeTab === 'shizang' ? (
          <div className="space-y-5 text-sm leading-relaxed text-[#3C3833]">
            <div className="bg-[#FAF6EE] p-4 rounded border border-[#E0D7C6]">
              <p className="font-semibold text-base mb-1 flex items-center gap-2">
                <BookOpen size={18} className="text-[#B93A32]" />
                {isEn ? 'Core Goal: Deduce the Poetic Eye Character' : '核心目标：猜出千古名句中的“诗眼”'}
              </p>
              <p className="text-xs text-[#6B655D]">
                {isEn
                  ? 'A classic Chinese verse is shown with a pivotal character missing. You have 6 attempts to deduce it.'
                  : '系统给出一句经典诗句，空出一个关键汉字，您有 6 次尝试机会。'}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-sm tracking-wider mb-2 text-[#1C1A17]">
                {isEn ? 'Oriental Color Feedback Tiers:' : '独创中式判定色阶：'}
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2.5 bg-[#F9ECEB] rounded border border-[#B93A32]/30">
                  <div className="w-8 h-8 rounded bg-[#B93A32] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    绿
                  </div>
                  <div>
                    <span className="font-bold text-[#B93A32]">
                      {isEn ? 'Cinnabar Red · Exact Match' : '朱砂红 · 字正腔圆'}
                    </span>
                    <p className="text-xs text-[#6E221D]">
                      {isEn ? 'Character is 100% correct in position and form!' : '汉字完全正确，位置无误（一发命准！）'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 bg-[#FAF3E3] rounded border border-[#C99427]/40">
                  <div className="w-8 h-8 rounded bg-[#C99427] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    到
                  </div>
                  <div>
                    <span className="font-bold text-[#8C6415]">
                      {isEn ? 'Pine-Pollen Yellow · Near Meaning' : '松花黄 · 意对字错'}
                    </span>
                    <p className="text-xs text-[#735212]">
                      {isEn
                        ? 'Appears in another line of the poem or shares tone/radical, but not the exact keyword.'
                        : '此字在全诗其他句中出现，或声调平仄与诗眼相近但非原字。'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 bg-[#EFECE7] rounded border border-[#6D6964]/30">
                  <div className="w-8 h-8 rounded bg-[#6D6964] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    海
                  </div>
                  <div>
                    <span className="font-bold text-[#423F3C]">
                      {isEn ? 'Ink Gray · Unrelated' : '墨灰 · 风马牛不及'}
                    </span>
                    <p className="text-xs text-[#524E4A]">
                      {isEn ? 'Character does not appear in the poem at all.' : '全诗中无此字，属于离题猜测。'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#F3EFE6] p-3.5 rounded border border-[#DDD3C2]">
              <h4 className="font-bold text-xs tracking-wider text-[#735212] mb-1 flex items-center gap-1.5">
                <Sparkles size={14} />
                {isEn ? 'Triple Ink Clues' : '墨韵三重提示'}
              </h4>
              <p className="text-xs text-[#5C564E]">
                {isEn
                  ? 'Clues unlock with attempts: ① Tone & Rhyme (Ping/Ze) → ② Radical & Structure → ③ Poetic Imagery & Rhetoric.'
                  : '每次尝试后，系统将依次解锁墨韵线索：① 音韵提示（平声/仄声）→ ② 部首提示（偏旁部首）→ ③ 意象提示（修辞与文化用意）。'}
              </p>
            </div>
          </div>
        ) : (
          /* 文脉说明 */
          <div className="space-y-5 text-sm leading-relaxed text-[#3C3833]">
            <div className="bg-[#FAF6EE] p-4 rounded border border-[#E0D7C6]">
              <p className="font-semibold text-base mb-1 flex items-center gap-2">
                <Layers size={18} className="text-[#2E4B6E]" />
                {isEn ? 'Core Goal: Group 16 Terms into 4 Cultural Themes' : '核心目标：将 16 个华夏词条分为 4 组文化主题'}
              </p>
              <p className="text-xs text-[#6B655D]">
                {isEn
                  ? 'Identify the 4 connecting threads with up to 4 mistake chances.'
                  : '每组 4 个词，找出背后的文化脉络。共 4 次容错沉香机会。'}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-sm tracking-wider mb-2 text-[#1C1A17]">
                {isEn ? 'Four Cultural Difficulty Tiers:' : '国风四重色阶与难度：'}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-[#FCF6E9] border border-[#D99B26]/40 rounded">
                  <span className="font-bold text-[#9C680E] flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D99B26] inline-block"></span>
                    {isEn ? 'Yellow · Elementary' : '浅黄 · 蒙学入门'}
                  </span>
                  <p className="mt-1 text-[#6B501B]">
                    {isEn ? 'Basic seasonal motifs & common imagery' : '基础诗词意象、四季名物'}
                  </p>
                </div>

                <div className="p-3 bg-[#EEF5F0] border border-[#386641]/40 rounded">
                  <span className="font-bold text-[#234A2C] flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#386641] inline-block"></span>
                    {isEn ? 'Green · General Knowledge' : '青绿 · 诗文通识'}
                  </span>
                  <p className="mt-1 text-[#1D3D24]">
                    {isEn ? 'Literary allusions & philosophical concepts' : '常见文学典故、诸子百家常识'}
                  </p>
                </div>

                <div className="p-3 bg-[#EDF2F7] border border-[#2E4B6E]/40 rounded">
                  <span className="font-bold text-[#1E344F] flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2E4B6E] inline-block"></span>
                    {isEn ? 'Indigo · Advanced Classical' : '黛蓝 · 古文学高阶'}
                  </span>
                  <p className="mt-1 text-[#182C42]">
                    {isEn ? 'Tune titles, prose metrics & poetic schools' : '名篇词牌曲格、流派文群'}
                  </p>
                </div>

                <div className="p-3 bg-[#F5EDF7] border border-[#5C3C67]/40 rounded">
                  <span className="font-bold text-[#45284E] flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#5C3C67] inline-block"></span>
                    {isEn ? 'Purple · Master Scholar' : '玄紫 · 文脉宗师'}
                  </span>
                  <p className="mt-1 text-[#331C3B]">
                    {isEn ? 'Pre-Qin ceremonial rites & esoteric myths' : '先秦礼乐典章、神话冷门器物'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#F3EFE6] p-3 rounded border border-[#DDD3C2] text-xs text-[#5C564E]">
              💡 <strong>{isEn ? 'Hint' : '温和回馈'}</strong>：
              {isEn
                ? 'If 3 of 4 selected words belong to the same group, the system gently hints "One Away!"'
                : '若选中的 4 个词中有 3 个同组，系统会贴心提示“差之毫厘”，请凝神再辨！'}
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[#D8CFBF] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#B93A32] text-white rounded font-medium text-xs tracking-widest hover:bg-[#A02D26] transition shadow"
          >
            {isEn ? 'Understood · Start Game' : '领悟 · 开始解谜'}
          </button>
        </div>
      </div>
    </div>
  );
};
