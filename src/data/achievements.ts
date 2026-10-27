export interface Achievement {
  id: string;
  rank: number;       // 1-9阶
  title: string;      // 称号，如“蒙童”、“秀才”
  sealText: string;   // 印章文字，如“童生及第”
  description: string;// 解锁条件说明
  icon: string;       // 图标/象征
  unlockedByDefault?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    rank: 1,
    title: '开卷蒙童',
    sealText: '蒙童初解',
    description: '完成首次《诗藏》或《文脉》解谜',
    icon: '🌱'
  },
  {
    id: 'ach-2',
    rank: 2,
    title: '庠序童生',
    sealText: '童生入庠',
    description: '累计成功猜出 3 个千古诗眼',
    icon: '📜'
  },
  {
    id: 'ach-3',
    rank: 3,
    title: '茂才秀士',
    sealText: '秀才文名',
    description: '连续完成日课打卡 3 天',
    icon: '🎋'
  },
  {
    id: 'ach-4',
    rank: 4,
    title: '乡试举人',
    sealText: '秋闱得中',
    description: '累计完成 5 局《文脉》文化归类',
    icon: '🏮'
  },
  {
    id: 'ach-5',
    rank: 5,
    title: '会试贡士',
    sealText: '春闱折桂',
    description: '成功破解一次“玄紫·文脉宗师”高难度分类',
    icon: '🦅'
  },
  {
    id: 'ach-6',
    rank: 6,
    title: '殿试进士',
    sealText: '金榜题名',
    description: '连续打卡达到 7 天',
    icon: '🏛️'
  },
  {
    id: 'ach-7',
    rank: 7,
    title: '一甲探花',
    sealText: '探花折柳',
    description: '在《诗藏》中仅用 ≤ 2 次尝试猜中诗眼',
    icon: '🌸'
  },
  {
    id: 'ach-8',
    rank: 8,
    title: '一甲榜眼',
    sealText: '榜眼妙思',
    description: '在《文脉》中以 0 次容错失误完美通关',
    icon: '💎'
  },
  {
    id: 'ach-9',
    rank: 9,
    title: '文曲星君',
    sealText: '文运昌隆',
    description: '解锁全部前置功名，登顶华夏文脉极峰',
    icon: '⭐'
  }
];
