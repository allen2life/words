import type { ShizangPuzzle } from '../../types/game';

export const SHIZANG_015: ShizangPuzzle[] = [
  {
    id: 'sz-366',
    title: '采薇',
    dynasty: '先秦',
    author: '无名氏',
    fullPoem: ['昔我往矣', '杨柳依依', '今我来思', '雨雪霏霏', '行道迟迟', '载渴载饥'],
    targetLine: '雨雪霏霏',
    targetIndex: 2,
    targetChar: '霏',
    tier: 'purple',
    clues: {
      tone: '平声 (微韵 · 纷飞)',
      radical: '雨 (雨部 · 雨雪)',
      imagery: '“霏霏”写雪盛而纷飞，与上章“依依”对举，一往一来，情景尽变'
    },
    appreciation: '“昔我往矣，杨柳依依；今我来思，雨雪霏霏”，以“依依”与“霏霏”一对叠字，写去时春、归时冬。王夫之《姜斋诗话》称其“以乐景写哀，以哀景写乐，一倍增其哀乐”。',
    authorBio: '《诗经·小雅》篇名，戍卒归途所作，作者不可考。'
  },
  {
    id: 'sz-367',
    title: '黍离',
    dynasty: '先秦',
    author: '无名氏',
    fullPoem: ['彼黍离离', '彼稷之苗', '行迈靡靡', '中心摇摇', '知我者谓我心忧', '不知我者谓我何求'],
    targetLine: '彼黍离离',
    targetIndex: 2,
    targetChar: '离',
    tier: 'purple',
    clues: {
      tone: '平声 (支韵 · 分披)',
      radical: '隹 (隹部 · 离披分散)',
      imagery: '“离离”写黍苗繁茂行列整齐，而昔日宫室已成田亩，故国之感由此生'
    },
    appreciation: '“彼黍离离，彼稷之苗”，一“离”字写黍苗成行。周室东迁后，大夫行役过故都，见宗庙宫室尽为禾黍，遂作此诗。“黍离之悲”由此成为亡国之痛的代称。',
    authorBio: '《诗经·王风》篇名，作者不可考，旧说为周大夫过故都所作。'
  }
];
