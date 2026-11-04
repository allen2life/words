const fs = await import('node:fs');
const dir = new URL('../src/data/wenmai/', import.meta.url);
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.ts')).sort();
const mine = await import('../src/data/wenmai/shard-003.ts?t=' + Date.now());
const myWords = new Set();
for (const p of mine.WENMAI_003) for (const g of p.groups) for (const w of g.words) myWords.add(w);
for (const f of files) {
  if (f === 'shard-003.ts') continue;
  const mod = await import(`../src/data/wenmai/${f}?t=${Date.now()}`);
  const name = Object.keys(mod).find((k) => Array.isArray(mod[k]));
  const other = new Set();
  for (const p of mod[name]) for (const g of p.groups) for (const w of g.words) other.add(w);
  const hits = [...myWords].filter((w) => other.has(w));
  console.log(`${f}: ${mod[name].length} issues, ${other.size} words, overlap with shard-003 = ${hits.length}${hits.length ? ' -> ' + hits.join(',') : ''}`);
}
