// wenmai-free.mjs — 查询候选词是否已被《文脉》题库占用
// 用法: node scripts/wenmai-free.mjs 词1 词2 词3 ...
//       node scripts/wenmai-free.mjs --shard 014   # 列出该分片内的冲突词
import { readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const dir = resolve('src/data/wenmai');
const files = readdirSync(dir).filter((f) => f.endsWith('.ts')).sort();

const owners = new Map();
for (const f of files) {
  const mod = await import(pathToFileURL(resolve(dir, f)).href);
  const name = Object.keys(mod).find((k) => Array.isArray(mod[k]));
  for (const p of mod[name]) {
    for (const g of p.groups) {
      for (const w of g.words) {
        if (!owners.has(w)) owners.set(w, []);
        owners.get(w).push(`${f.replace('.ts', '')}:${p.id}`);
      }
    }
  }
}

const args = process.argv.slice(2);

if (args[0] === '--shard') {
  const target = args[1];
  const file = `shard-${target}.ts`;
  const mod = await import(pathToFileURL(resolve(dir, file)).href);
  const name = Object.keys(mod).find((k) => Array.isArray(mod[k]));
  const clashes = [];
  for (const p of mod[name]) {
    for (const g of p.groups) {
      for (const w of g.words) {
        const list = owners.get(w) ?? [];
        const others = list.filter((x) => !x.startsWith(`shard-${target}:`));
        if (others.length) clashes.push(`${p.id}/${g.id}  ${w}  <- 也见于 ${others.join(', ')}`);
      }
    }
  }
  console.log(clashes.length ? clashes.join('\n') : 'no clashes');
  process.exit(0);
}

for (const w of args) {
  const list = owners.get(w);
  console.log(`${w}: ${list ? 'USED by ' + [...new Set(list)].join(', ') : 'FREE'}`);
}
