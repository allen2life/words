import { GROUPS } from './groups.mjs';
import { EXEGESIS } from './exegesis.mjs';
import { writeFileSync } from 'node:fs';

const G = Object.fromEntries(GROUPS.map(([theme, dim, words]) => [theme, { theme, dim, words, ex: EXEGESIS[theme] }]));

const TIER_NAME = { yellow: '蒙学入门', green: '诗文通识', blue: '古文学高阶', purple: '文脉宗师' };
const TIERS = ['yellow', 'green', 'blue', 'purple'];

const PLAN = [
  ['书体篇', ['先秦古文字之名', '隶书流变之名', '草书诸体之名', '历代特起之应用书体']],
  ['简帛篇', ['出土简牍之名品', '学书之次第', '永字八法之四势', '初唐四家']],
  ['用笔篇', ['运笔之节次', '用笔之锋势', '执运之法', '笔法喻象']],
  ['墨法篇', ['墨色之目', '墨法之施', '笔之四德', '书评之语']],
  ['皴法篇', ['勾皴点染之法', '画树之枝叶法', '皴法四种', '画法画论之书']],
  ['设色篇', ['国画颜料之名', '山水之体', '设色之工序', '书画之底材']],
  ['画科篇', ['人物画之题材', '花鸟走兽之科', '画法之体格', '白描衣褶之描法']],
  ['画论篇', ['山水观照之远近', '六法之四目', '传神之论', '画品之四等']],
  ['宗派篇', ['明末画派之名', '清代画派之名', '画学分宗', '画史著录之书']],
  ['典故篇', ['书画成语', '画事典故', '文人雅集之事', '书画著录之书']],
  ['文房篇', ['贮水注墨之器', '搁藏笔墨之器', '护持之器', '印石之名']],
  ['砚谱篇', ['砚之部位', '古砚形制', '砚材之名', '砚谱之书']],
  ['笺墨篇', ['古纸之名', '古笺之名', '制墨名家', '钤印之具']],
  ['装裱篇', ['装裱之工序', '手卷之结构', '立轴之装池', '修复之工序']],
  ['幅式篇', ['幅式之名', '装裱之名目', '题款之式', '印章之用']],
  ['篆刻篇', ['印章之类别', '印纽之制', '篆刻之理念', '篆刻之迹']],
  ['碑帖篇', ['碑之部位', '拓本之目', '石刻书迹之属', '书学之书']],
  ['鉴藏篇', ['鉴藏印记', '鉴藏流传之术语', '印谱之书', '清代内府书画著录']],
  ['名迹篇', ['宋画名迹', '清初四王', '扬州八怪之四家', '书品书论之书']],
  ['书家篇', ['元季书家', '吴门书家', '清代篆隶之中兴', '大字书迹之名']],
];

// --- validation before emit ---
const used = new Set();
const errs = [];
for (const [pi, [title, keys]] of PLAN.entries()) {
  if (keys.length !== 4) errs.push(`issue ${pi + 1} bad group count`);
  const local = new Set();
  for (const k of keys) {
    const g = G[k];
    if (!g) { errs.push(`missing group ${k}`); continue; }
    if (!g.ex) errs.push(`missing exegesis ${k}`);
    for (const w of g.words) {
      if (local.has(w)) errs.push(`intra-issue dup ${w} in ${title}`);
      local.add(w);
      if (used.has(w)) errs.push(`cross-issue dup ${w} (${k})`);
      used.add(w);
    }
  }
  if (local.size !== 16) errs.push(`${title} has ${local.size} words`);
}
if (PLAN.length !== 20) errs.push('plan not 20 issues');
if (used.size !== 320) errs.push(`total distinct ${used.size}`);
if (errs.length) { console.error(errs.join('\n')); process.exit(1); }

// --- emit ---
const q = (s) => `'${s}'`;
const out = [];
out.push("import type { WenmaiPuzzle } from '../../types/game';");
out.push('');
out.push('/**');
out.push(' * shard-012：古代书画与文房 —— 书体、笔法墨法、画科画论、文房器物、');
out.push(' * 装裱幅式、碑帖印篆、历代书画家与书画著录。');
out.push(' */');
out.push('export const WENMAI_012: WenmaiPuzzle[] = [');

const startDate = new Date('2027-03-28T00:00:00Z');
for (let i = 0; i < PLAN.length; i++) {
  const [title, keys] = PLAN[i];
  const d = new Date(startDate.getTime() + i * 86400000);
  const dateStr = d.toISOString().slice(0, 10);
  const id = `wm-${193 + i}`;
  out.push('  {');
  out.push(`    id: ${q(id)},`);
  out.push(`    dateStr: ${q(dateStr)},`);
  out.push(`    title: ${q(`第 ${452 + i} 期 · ${title}`)},`);
  out.push('    groups: [');
  keys.forEach((k, j) => {
    const g = G[k];
    const tier = TIERS[j];
    out.push('      {');
    out.push(`        id: ${q(`${id}-g${j + 1}`)},`);
    out.push(`        theme: ${q(g.theme)},`);
    out.push(`        dimension: ${q(g.dim)},`);
    out.push(`        tier: ${q(tier)},`);
    out.push(`        tierName: ${q(TIER_NAME[tier])},`);
    out.push(`        words: [${g.words.map(q).join(', ')}],`);
    out.push(`        exegesis: ${q(g.ex)}`);
    out.push('      },');
  });
  out.push('    ]');
  out.push('  },');
}
out.push('];');
out.push('');

writeFileSync('src/data/wenmai/shard-012.ts', out.join('\n'), 'utf8');
console.log('written', used.size, 'words,', PLAN.length, 'issues');
