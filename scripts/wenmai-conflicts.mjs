// wenmai-conflicts.mjs — 列出《文脉》各分片之间的重复词条
// 用法: node scripts/wenmai-conflicts.mjs [--json]
//
// 《文脉》的核心约束：同一期内 16 个词互不重复（否则谜题无解）；
// 跨期重复虽不致命，但会削弱新鲜感，且同一词出现在两期不同分组里
// 会造成"这词到底属哪一脉"的歧义，因此目标应趋近于零。
import { readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const dir = resolve('src/data/wenmai');
const files = readdirSync(dir).filter((f) => f.endsWith('.ts')).sort();

const shards = [];
for (const f of files) {
  const mod = await import(pathToFileURL(resolve(dir, f)).href);
  const name = Object.keys(mod).find((k) => Array.isArray(mod[k]));
  shards.push({ file: f, name, issues: mod[name] });
}

/** word -> [{shard, issueId, groupId}] */
const index = new Map();
for (const s of shards) {
  for (const p of s.issues) {
    for (const g of p.groups) {
      for (const w of g.words) {
        if (!index.has(w)) index.set(w, []);
        index.get(w).push({ shard: s.file, issue: p.id, group: g.id });
      }
    }
  }
}

const conflicts = [...index.entries()].filter(([, v]) => v.length > 1);

// 同期内重复（真正会让谜题无解的错误）
const intraIssue = [];
for (const s of shards) {
  for (const p of s.issues) {
    const seen = new Map();
    for (const g of p.groups) {
      for (const w of g.words) {
        if (seen.has(w)) intraIssue.push({ issue: p.id, word: w, groups: [seen.get(w), g.id] });
        else seen.set(w, g.id);
      }
    }
  }
}

const total = shards.reduce((a, s) => a + s.issues.length, 0);
const totalWords = shards.reduce(
  (a, s) => a + s.issues.reduce((b, p) => b + p.groups.reduce((c, g) => c + g.words.length, 0), 0),
  0
);

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ total, totalWords, conflicts, intraIssue }, null, 2));
} else {
  console.log('=== 文脉 shard 概览 ===');
  for (const s of shards) console.log(`  ${s.file}: ${s.issues.length} issues`);
  console.log(`\ntotal issues: ${total}   total word slots: ${totalWords}`);
  console.log(`distinct words: ${index.size}`);
  console.log(`cross-shard duplicate words: ${conflicts.length}`);
  console.log(`intra-issue duplicate words: ${intraIssue.length}  ${intraIssue.length ? '❌ 严重（谜题无解）' : '✅'}`);

  if (conflicts.length) {
    console.log('\n--- 重复词明细（词 → 出处）---');
    for (const [w, list] of conflicts) {
      console.log(`  ${w}: ${list.map((x) => `${x.issue}/${x.group}`).join(' , ')}`);
    }
  }
}

process.exit(intraIssue.length ? 1 : 0);
