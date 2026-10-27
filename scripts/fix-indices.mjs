// fix-indices.mjs — 自动校正分片内所有 targetIndex
// 用法: node scripts/fix-indices.mjs <shard-file>
//
// 背景：手写下标极易出错（本轮 30 条里错了 17 条）。该脚本以 targetChar 在
// targetLine 中的实际位置为准重写 targetIndex，避免人工数格子。
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const file = process.argv[2];
if (!file) {
  console.error('usage: node scripts/fix-indices.mjs <shard-file>');
  process.exit(2);
}

const abs = resolve(file);
const mod = await import(pathToFileURL(abs).href);
const exportName = Object.keys(mod).find((k) => Array.isArray(mod[k]));
const items = mod[exportName];

let src = readFileSync(abs, 'utf8');
let patched = 0;
const problems = [];

for (const p of items) {
  if (typeof p.targetLine !== 'string' || typeof p.targetChar !== 'string') continue;

  const correct = p.targetLine.indexOf(p.targetChar);
  if (correct === -1) {
    problems.push(`${p.id}: targetChar "${p.targetChar}" not found in targetLine "${p.targetLine}"`);
    continue;
  }
  if (correct === p.targetIndex) continue;

  // 用 id 锚定条目区块，避免跨条目误改
  const idPos = src.indexOf(`id: '${p.id}'`);
  if (idPos === -1) {
    problems.push(`${p.id}: could not locate id in source`);
    continue;
  }
  const nextIdPos = src.indexOf("id: '", idPos + 5);
  const end = nextIdPos === -1 ? src.length : nextIdPos;
  const block = src.slice(idPos, end);
  const replaced = block.replace(/targetIndex:\s*\d+,/, `targetIndex: ${correct},`);

  if (replaced === block) {
    problems.push(`${p.id}: targetIndex line not matched`);
    continue;
  }

  src = src.slice(0, idPos) + replaced + src.slice(end);
  patched++;
  console.log(`  ${p.id}: ${p.targetIndex} -> ${correct} ("${p.targetChar}")`);
}

writeFileSync(abs, src);
console.log(`\npatched ${patched} entr${patched === 1 ? 'y' : 'ies'} in ${file}`);
if (problems.length) {
  console.log(`\n⚠️  ${problems.length} problem(s):`);
  for (const x of problems) console.log(`   - ${x}`);
  process.exit(1);
}
