// validate-content.mjs — 题库内容完整性校验（文化类产品的质量红线）
// 用法: node scripts/validate-content.mjs
//
// 校验目标：所有“机器可判定”的正确性不变量。人工考据（典故准确性）无法自动验证，
// 但结构性错误——诗眼错位、诗句与全诗不符、分组重复、字段缺失——必须为零。
import { SHIZANG_PUZZLES } from '../src/data/shizangPuzzles.ts';
import { WENMAI_PUZZLES } from '../src/data/wenmaiPuzzles.ts';

const errors = [];
const warnings = [];
const infos = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const info = (m) => infos.push(m);

const VALID_TIERS = new Set(['yellow', 'green', 'blue', 'purple']);

// ─────────────────────────── 《诗藏》───────────────────────────
const seenIds = new Set();

for (const p of SHIZANG_PUZZLES) {
  const tag = `[shizang ${p.id}]`;

  if (seenIds.has(p.id)) err(`${tag} duplicate id`);
  seenIds.add(p.id);

  for (const f of ['id', 'title', 'dynasty', 'author', 'targetLine', 'targetChar', 'tier']) {
    if (!p[f] || typeof p[f] !== 'string') err(`${tag} missing/empty field "${f}"`);
  }

  if (!Array.isArray(p.fullPoem) || p.fullPoem.length === 0) {
    err(`${tag} fullPoem must be a non-empty array`);
  }

  // 核心不变量：诗眼必须真的落在出题句的指定位置上
  if (typeof p.targetLine === 'string' && typeof p.targetChar === 'string') {
    const atIdx = p.targetLine[p.targetIndex];
    if (atIdx !== p.targetChar) {
      err(
        `${tag} targetIndex mismatch: targetLine[${p.targetIndex}]="${atIdx}" but targetChar="${p.targetChar}" (line="${p.targetLine}")`
      );
    }
    const occurrences = [...p.targetLine].filter((c) => c === p.targetChar).length;
    if (occurrences === 0) err(`${tag} targetChar "${p.targetChar}" does not appear in targetLine`);
    if (occurrences > 1) {
      info(
        `${tag} targetChar "${p.targetChar}" appears ${occurrences}× in targetLine — board uses targetIndex (safe); share card fixed to blank by index too`
      );
    }
  }

  // 出题句必须来自全诗：或为某一句，或为某一句的连续子串
  // （长调词牌常截取句子前半作为出题句，如“乱石穿空，惊涛拍岸”截自“……卷起千堆雪”）
  if (Array.isArray(p.fullPoem) && !p.fullPoem.some((line) => line.includes(p.targetLine))) {
    err(`${tag} targetLine "${p.targetLine}" is not contained in fullPoem`);
  }

  if (!VALID_TIERS.has(p.tier)) err(`${tag} invalid tier "${p.tier}"`);

  // 墨韵三重提示必须齐全
  for (const c of ['tone', 'radical', 'imagery']) {
    if (!p.clues || !p.clues[c] || !String(p.clues[c]).trim()) {
      err(`${tag} missing clue "${c}"`);
    }
  }

  if (!p.appreciation || p.appreciation.trim().length < 20) {
    err(`${tag} appreciation missing or too short (<20 chars)`);
  }
  if (!p.authorBio || p.authorBio.trim().length < 10) {
    err(`${tag} authorBio missing or too short (<10 chars)`);
  }

  // 全诗不应含空白字符（会导致布局错位）
  if (Array.isArray(p.fullPoem)) {
    for (const line of p.fullPoem) {
      if (/\s/.test(line)) err(`${tag} fullPoem line contains whitespace: "${line}"`);
      if (!/^[\u4e00-\u9fff]+$/.test(line) && !/[，。？！]/.test(line)) {
        warn(`${tag} fullPoem line has unusual characters: "${line}"`);
      }
    }
  }
}

// ─────────────────────────── 《文脉》───────────────────────────
const seenWm = new Set();

for (const p of WENMAI_PUZZLES) {
  const tag = `[wenmai ${p.id}]`;

  if (seenWm.has(p.id)) err(`${tag} duplicate id`);
  seenWm.add(p.id);

  if (!Array.isArray(p.groups) || p.groups.length !== 4) {
    err(`${tag} must have exactly 4 groups, got ${p.groups?.length}`);
    continue;
  }

  const allWords = new Set();
  const groupIds = new Set();

  for (const g of p.groups) {
    const gtag = `${tag} group ${g.id}`;

    if (groupIds.has(g.id)) err(`${gtag} duplicate group id`);
    groupIds.add(g.id);

    for (const f of ['theme', 'dimension', 'tierName', 'exegesis']) {
      if (!g[f] || !String(g[f]).trim()) err(`${gtag} missing field "${f}"`);
    }
    if (!VALID_TIERS.has(g.tier)) err(`${gtag} invalid tier "${g.tier}"`);

    if (!Array.isArray(g.words) || g.words.length !== 4) {
      err(`${gtag} must have exactly 4 words, got ${g.words?.length}`);
      continue;
    }

    for (const w of g.words) {
      // 跨组重复词会让谜题无解（同一个词属于两条脉络）
      if (allWords.has(w)) err(`${tag} duplicate word across groups: "${w}"`);
      allWords.add(w);
    }

    if (!g.exegesis || g.exegesis.trim().length < 30) {
      err(`${gtag} exegesis too short (<30 chars)`);
    }
  }

  // 标准《文脉》为 4×4=16 个词条
  if (allWords.size !== 16) err(`${tag} expected 16 unique words, got ${allWords.size}`);

  // 难度应覆盖四阶
  const tiers = new Set(p.groups.map((g) => g.tier));
  if (tiers.size !== 4) warn(`${tag} tier coverage is ${tiers.size}/4 (${[...tiers].join(',')})`);
}

// 跨期重复：同一个词条在多期里反复出现会削弱题目的新鲜感（提示而非失败）
const wordOwners = new Map();
for (const p of WENMAI_PUZZLES) {
  for (const g of p.groups) {
    for (const w of g.words) {
      if (!wordOwners.has(w)) wordOwners.set(w, []);
      wordOwners.get(w).push(p.id);
    }
  }
}
const repeated = [...wordOwners.entries()].filter(([, ids]) => ids.length > 1);
if (repeated.length) {
  warn(
    `${repeated.length} word(s) reused across wenmai issues: ` +
      repeated.map(([w, ids]) => `"${w}"(${ids.join(',')})`).join(' ')
  );
}

// ─────────────────────────── 汇总 ───────────────────────────
console.log(`\n=== Content validation ===`);
console.log(`shizang puzzles: ${SHIZANG_PUZZLES.length}`);
console.log(`wenmai puzzles : ${WENMAI_PUZZLES.length}`);

const tierCount = SHIZANG_PUZZLES.reduce((acc, p) => ((acc[p.tier] = (acc[p.tier] || 0) + 1), acc), {});
console.log(`tier distribution: ${JSON.stringify(tierCount)}`);

if (infos.length) {
  console.log(`\nℹ️  ${infos.length} note(s):`);
  for (const i of infos) console.log(`   - ${i}`);
}

if (warnings.length) {
  console.log(`\n⚠️  ${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`   - ${w}`);
}

if (errors.length) {
  console.log(`\n❌ ${errors.length} error(s):`);
  for (const e of errors) console.log(`   - ${e}`);
  process.exit(1);
}

console.log(`\n✅ All content invariants hold (${warnings.length} warning(s)).`);
process.exit(0);
