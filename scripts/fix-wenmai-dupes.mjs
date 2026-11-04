// fix-wenmai-dupes.mjs — 按映射替换《文脉》指定分片中与其他分片冲突的词
// 用法: node scripts/fix-wenmai-dupes.mjs <shard-file>
//
// 只做精确字符串替换：把 words 数组里的旧词换成新词，并同步更新该组的 exegesis
// 中对应的字面提及，避免出现"释义还讲旧词"的不一致。
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const target = process.argv[2];
if (!target) {
  console.error('usage: node scripts/fix-wenmai-dupes.mjs <shard-file>');
  process.exit(2);
}

// 显式映射：旧词 -> 新词。仅对确实冲突者生效。
const REPLACEMENTS = {
  // 与既有分片冲突 -> 换成同类别中未被使用的词
  兰: '芷',
  寒蝉: '秋蝉',
  博物志: '神异经',
  述异记: '玄中记',
  酉阳杂俎: '宣室志',
  朱明: '东君',
  大衍历: '乾象历',
  授时历: '统天历',
  风: '燥',
  焚香: '佩香',
  三字经: '弟子规',
  百家姓: '千家诗',
  千字文: '神童诗',
  亭: '堠',
  塘: '汛',
  错金银: '金银平脱',
  鎏金: '烫金',
  錾刻: '镂雕',
  考工记: '梓人遗制',
  髹饰录: '漆经',
  天工开物: '便民图纂',
  陶说: '景德镇陶录',
  行: '操',
  中书省: '秘书省',
  门下省: '殿中省',
  尚书省: '内侍省',
  御史台: '谏院',
  点茶: '煮茶',
  茶经: '煎茶水记',
  茶录: '宣和北苑贡茶录',
  香乘: '香谱略',
};

const dir = resolve('src/data/wenmai');
const abs = resolve(dir, target);

const mod = await import(pathToFileURL(abs).href);
const name = Object.keys(mod).find((k) => Array.isArray(mod[k]));
const issues = mod[name];

let src = readFileSync(abs, 'utf8');
let changed = 0;

for (const p of issues) {
  for (const g of p.groups) {
    const next = g.words.map((w) => (REPLACEMENTS[w] ? REPLACEMENTS[w] : w));
    const didChange = next.some((w, i) => w !== g.words[i]);
    if (!didChange) continue;

    // 1) 替换 words 数组（按原顺序精确匹配该组这一行）
    const isNew = !src.includes(`words: [${g.words.map((w) => `'${w}'`).join(', ')}],`);
    const base = `words: [${g.words.map((w) => `'${w}'`).join(', ')}],`;
    if (!isNew) {
      src = src.replace(base, `words: [${next.map((w) => `'${w}'`).join(', ')}],`);
    } else {
      // 词序或格式不同，逐个词替换
      for (let i = 0; i < g.words.length; i++) {
        if (next[i] !== g.words[i]) {
          src = src.replace(`'${g.words[i]}'`, `'${next[i]}'`);
        }
      }
    }

    // 2) 同步更新 exegesis 中对旧词的提及
    let ex = g.exegesis;
    for (let i = 0; i < g.words.length; i++) {
      if (next[i] !== g.words[i]) {
        ex = ex.split(g.words[i]).join(next[i]);
      }
    }
    if (ex !== g.exegesis) {
      src = src.replace(`exegesis: '${g.exegesis}'`, `exegesis: '${ex}'`);
    }
    changed++;
  }
}

writeFileSync(abs, src);
console.log(`patched ${changed} group(s) in ${target}`);
