// dedupe-wenmai.mjs — 交互式/映射式清理《文脉》跨片重复词
// 用法:
//   node scripts/dedupe-wenmai.mjs --report            # 只报告
//   node scripts/dedupe-wenmai.mjs --apply             # 按内置映射应用
//
// 设计：替换前先校验"新词确实未被任何分片使用"，避免修一个撞一个。
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
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

/** word -> Set of "issueId/groupId" */
const owners = new Map();
for (const s of shards) {
  for (const p of s.issues) {
    for (const g of p.groups) {
      for (const w of g.words) {
        if (!owners.has(w)) owners.set(w, []);
        owners.get(w).push({ shard: s.file, issue: p.id, group: g.id });
      }
    }
  }
}

const conflicts = [...owners.entries()].filter(([, v]) => v.length > 1);

if (!process.argv.includes('--apply')) {
  console.log(`cross-shard duplicate words: ${conflicts.length}`);
  for (const [w, list] of conflicts) {
    console.log(`  ${w}: ${list.map((x) => `${x.shard}:${x.issue}/${x.group}`).join(' , ')}`);
  }
  process.exit(0);
}

// ── 内置替换映射：旧词 -> 新词（新词必须全局未用）──
const MAP = {
  // shard-005 与既有分片冲突（新词均已确认为全局未用）
  君臣佐使: '君臣佐使制',
  玄奘: '义净',
  葡萄: '胡桃',
  苜蓿: '胡麻',
  大唐西域记: '西域行记',
  释名: '匡谬正俗',
  方言: '绝代语释',
  武备志: '兵垣四编',
  纪效新书: '阵法图说',
  // shard-001 历史遗留（同一词牌/人物被两期重复收录）
  念奴娇: '六州歌头',
  沁园春: '青玉案',
  水调歌头: '满庭芳',
  王安石: '晁补之',
};

/** 校验新词是否安全 */
function safe(word) {
  return !owners.has(word);
}

let problems = 0;
for (const [oldW, newW] of Object.entries(MAP)) {
  if (!safe(newW)) {
    console.error(`❌ replacement "${newW}" is already used — pick another`);
    problems++;
  }
}
if (problems) process.exit(1);

/** 在指定分片文件中把 oldW 换成 newW（含 exegesis 内的提及） */
function applyTo(file, oldW, newW) {
  const abs = resolve(dir, file);
  let src = readFileSync(abs, 'utf8');
  const before = src;

  // words 数组中的精确项
  src = src.replace(new RegExp(`'${oldW}'`, 'g'), `'${newW}'`);
  // exegesis 内的提及（仅当该组确实包含该词时才有意义，这里做保守全局替换）
  src = src.split(oldW).join(newW);

  if (src !== before) {
    writeFileSync(abs, src);
    return true;
  }
  return false;
}

let applied = 0;
for (const [oldW, newW] of Object.entries(MAP)) {
  // 只改除 001 之外引入冲突的分片 + 001 的指定词
  const targets = new Set();
  for (const o of owners.get(oldW) ?? []) targets.add(o.shard);

  // 对 001 的历史重复，改 001 里的那份
  for (const f of targets) {
    // 只改最后一个引入者，保留最早出现的那份不动
    const list = (owners.get(oldW) ?? []).filter((o) => o.shard === f);
    if (list.length === 0) continue;
  }

  // 策略：改「除最早出现分片之外」的所有出现
  const list = owners.get(oldW) ?? [];
  const firstShard = list[0]?.shard;
  const toFix = [...new Set(list.map((o) => o.shard).filter((f) => f !== firstShard))];

  for (const f of toFix) {
    if (applyTo(f, oldW, newW)) applied++;
  }
}

console.log(`applied ${applied} replacement(s)`);
