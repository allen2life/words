import fs from 'node:fs';
const files = ['shard-001','shard-002','shard-003','shard-004'];
const wordsOf = (f) => {
  const s = fs.readFileSync(`src/data/wenmai/${f}.ts`,'utf8');
  const out=[];
  for (const m of s.matchAll(/words: \[([^\]]*)\]/g)) {
    m[1].split(',').map(x=>x.trim().replace(/^'|'$/g,'')).filter(Boolean).forEach(w=>out.push(w));
  }
  return out;
};
const old = new Set();
for (const f of files.slice(0,3)) for (const w of wordsOf(f)) old.add(w);
const nw = wordsOf('shard-004');
const seen = new Set(); const intra=[];
for (const w of nw) { if (seen.has(w)) intra.push(w); seen.add(w); }
const cross = nw.filter(w=>old.has(w));
console.log('shard-004 words:', nw.length, '| unique:', seen.size);
console.log('intra-shard duplicates:', [...new Set(intra)]);
console.log('overlap with shard-001/002/003:', [...new Set(cross)]);
console.log('result:', (intra.length===0 && cross.length===0 && nw.length===320 && seen.size===320) ? 'PASS' : 'FAIL');
