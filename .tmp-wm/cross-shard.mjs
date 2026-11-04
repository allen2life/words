// cross-shard duplicate check for wenmai shard-001 / shard-002 / shard-003
const files = ['shard-001', 'shard-002', 'shard-003'];
const shards = [];
for (const f of files) {
  const mod = await import(`../src/data/wenmai/${f}.ts`);
  const name = Object.keys(mod).find((k) => Array.isArray(mod[k]));
  shards.push([f, mod[name]]);
}

const owners = new Map();
let totalWords = 0;
let totalIssues = 0;
const problems = [];

for (const [f, issues] of shards) {
  totalIssues += issues.length;
  for (const p of issues) {
    const local = new Set();
    for (const g of p.groups) {
      for (const w of g.words) {
        totalWords++;
        if (local.has(w)) problems.push(`[${p.id}] duplicate inside issue: ${w}`);
        local.add(w);
        const prev = owners.get(w);
        if (prev) problems.push(`[${p.id}] cross-shard duplicate: "${w}" already in ${prev}`);
        else owners.set(w, p.id);
      }
    }
  }
}

console.log(`shards: ${files.join(', ')}`);
console.log(`issues: ${totalIssues}, word slots: ${totalWords}, unique words: ${owners.size}`);
console.log(`word overlap across shard-001/002/003: ${problems.length === 0 ? 0 : problems.length}`);
if (problems.length) {
  for (const p of problems) console.log('  - ' + p);
  process.exit(1);
}
console.log('assertion: zero overlap across all three shards — PASS');
