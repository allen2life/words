import type { CoupletItem } from '../types/game';

export const COUPLET_ITEMS: CoupletItem[] = [
  {
    id: 'cpl-001',
    poet: '苏舜钦 · 沧浪亭',
    firstLine: '清风明月本无价',
    secondLine: '近水远山皆有情',
    candidates: [
      '近水远山皆有情',
      '绿柳红桃自作花',
      '古寺幽钟度夕阳',
      '落花流水不相干'
    ],
    rhymeExplanation: '上联“清风明月”对下联“近水远山”（并列名胜景物），“本无价”平仄为“仄平仄”，对“皆有情”之“平仄平”，词性、意境、平仄天然工对。',
    unlockSkin: '沧浪隐士 · 墨韵流风'
  },
  {
    id: 'cpl-002',
    poet: '李白 · 诗仙彩蛋',
    firstLine: '唯见长江天际流',
    secondLine: '长风破浪会有时',
    candidates: [
      '长风破浪会有时',
      '一片冰心在玉壶',
      '孤帆远影碧空尽',
      '白发三千丈有余'
    ],
    rhymeExplanation: '李白诗意浩荡，天际江流与长风破浪相辉映，声韵昂扬，尽显太白盛唐豪迈飘逸之逸仙气魄。',
    unlockSkin: '谪仙醉剑 · 剑气霜华'
  },
  {
    id: 'cpl-003',
    poet: '李商隐 · 锦瑟华年',
    firstLine: '庄生晓梦迷蝴蝶',
    secondLine: '望帝春心托杜鹃',
    candidates: [
      '望帝春心托杜鹃',
      '沧海月明珠有泪',
      '蓝田日暖玉生烟',
      '此情可待成追忆'
    ],
    rhymeExplanation: '典故工对：“庄生晓梦”用庄周梦蝶典，“望帝春心”用蜀王望帝化鹃典；“迷蝴蝶”动宾结构对“托杜鹃”动宾结构，声律凄婉，严丝合缝。',
    unlockSkin: '义山幽思 · 锦瑟七宝'
  }
];
