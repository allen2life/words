import { PLAN } from './plan.mjs';

const a = await import('../src/data/wenmai/shard-001.ts');
const b = await import('../src/data/wenmai/shard-002.ts');
const exist = new Set();
for (const p of [...a.WENMAI_001, ...b.WENMAI_002]) {
  for (const g of p.groups) for (const w of g.words) exist.add(w);
}

const seen = new Map();
let bad = 0;
let n = 0;
PLAN.forEach(([title, groups], i) => {
  const local = new Set();
  groups.forEach((ws, j) => {
    if (ws.length !== 4) {
      console.log(`issue${i + 1} g${j + 1} len ${ws.length}`);
      bad++;
    }
    for (const w of ws) {
      n++;
      if (exist.has(w)) {
        console.log(`EXIST: ${w} (issue${i + 1} g${j + 1})`);
        bad++;
      }
      if (local.has(w)) {
        console.log(`LOCAL DUP: ${w} (issue${i + 1} g${j + 1})`);
        bad++;
      }
      local.add(w);
      if (seen.has(w)) {
        console.log(`GLOBAL DUP: ${w} ${seen.get(w)} vs issue${i + 1}`);
        bad++;
      } else seen.set(w, `issue${i + 1}`);
    }
  });
  if (local.size !== 16) {
    console.log(`issue${i + 1} uniq ${local.size}`);
    bad++;
  }
});
console.log(`issues=${PLAN.length} words=${n} uniqueGlobally=${seen.size} problems=${bad}`);
