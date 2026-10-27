// check-shard.mjs — 独立校验单个题库分片（不依赖索引聚合）
// 用法: node scripts/check-shard.mjs <shard-file> [--type shizang|wenmai] [--against-existing]
//
// 目的：内容生成 Agent 产出新分片后，先做分片级体检，
// 避免把错误条目并入索引后才发现，导致定位困难。
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

const args = process.argv.slice(2);
const file = args[0];
if (!file) {
  console.error('usage: node scripts/check-shard.mjs <shard-file> [--type shizang|wenmai]');
  process.exit(2);
}

const abs = resolve(file);
if (!existsSync(abs)) {
  console.error(`file not found: ${abs}`);
  process.exit(2);
}

const typeIdx = args.indexOf('--type');
const type = typeIdx !== -1 ? args[typeIdx + 1] : (file.includes('wenmai') ? 'wenmai' : 'shizang');

const mod = await import(pathToFileURL(abs).href);
const exportName = Object.keys(mod).find((k) => Array.isArray(mod[k]));
if (!exportName) {
  console.error(`no array export found in ${file}`);
  process.exit(2);
}
const items = mod[exportName];

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const VALID_TIERS = new Set(['yellow', 'green', 'blue', 'purple']);
const CJK = /^[\u4e00-\u9fff]+$/;

if (type === 'shizang') {
  const ids = new Set();
  const lines = new Set();

  for (const p of items) {
    const tag = `[${p.id}]`;

    if (!p.id) err(`${tag} missing id`);
    if (ids.has(p.id)) err(`${tag} duplicate id`);
    ids.add(p.id);

    if (lines.has(p.targetLine)) err(`${tag} duplicate targetLine "${p.targetLine}"`);
    lines.add(p.targetLine);

    if (!VALID_TIERS.has(p.tier)) err(`${tag} invalid tier "${p.tier}"`);

    if (typeof p.targetLine !== 'string' || typeof p.targetChar !== 'string') {
      err(`${tag} targetLine/targetChar must be strings`);
      continue;
    }

    const at = p.targetLine[p.targetIndex];
    if (at !== p.targetChar) {
      err(`${tag} INDEX MISMATCH: targetLine[${p.targetIndex}]="${at}" vs targetChar="${p.targetChar}" (line="${p.targetLine}")`);
    }

    if (!Array.isArray(p.fullPoem) || !p.fullPoem.length) {
      err(`${tag} fullPoem empty`);
    } else {
      if (!p.fullPoem.some((l) => l.includes(p.targetLine))) {
        err(`${tag} targetLine "${p.targetLine}" not contained in fullPoem`);
      }
      for (const l of p.fullPoem) {
        if (/\s/.test(l)) err(`${tag} whitespace in fullPoem line "${l}"`);
        // 词牌长句含中文标点属正常；只提示真正的异常字符（拉丁字母、数字等）
        if (!/^[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+$/.test(l)) {
          warn(`${tag} unexpected chars in fullPoem line "${l}"`);
        }
      }
    }

    for (const c of ['tone', 'radical', 'imagery']) {
      if (!p.clues?.[c]?.trim()) err(`${tag} missing clue "${c}"`);
    }
    if (!p.appreciation || p.appreciation.trim().length < 20) err(`${tag} appreciation too short`);
    if (!p.authorBio || p.authorBio.trim().length < 10) err(`${tag} authorBio too short`);
    if (!p.title?.trim()) err(`${tag} missing title`);
    if (!p.author?.trim()) err(`${tag} missing author`);
    if (!p.dynasty?.trim()) err(`${tag} missing dynasty`);
  }

  const tierCount = items.reduce((a, p) => ((a[p.tier] = (a[p.tier] || 0) + 1), a), {});
  console.log(`shizang shard: ${items.length} entries`);
  console.log(`tier distribution: ${JSON.stringify(tierCount)}`);
} else {
  const ids = new Set();

  for (const p of items) {
    const tag = `[${p.id}]`;

    if (!p.id) err(`${tag} missing id`);
    if (ids.has(p.id)) err(`${tag} duplicate id`);
    ids.add(p.id);

    if (!p.title?.trim()) err(`${tag} missing title`);

    if (!Array.isArray(p.groups) || p.groups.length !== 4) {
      err(`${tag} must have exactly 4 groups, got ${p.groups?.length}`);
      continue;
    }

    const allWords = new Set();
    const gids = new Set();
    const tiers = new Set();

    for (const g of p.groups) {
      const gtag = `${tag} ${g.id}`;

      if (gids.has(g.id)) err(`${gtag} duplicate group id`);
      gids.add(g.id);

      if (!VALID_TIERS.has(g.tier)) err(`${gtag} invalid tier "${g.tier}"`);
      tiers.add(g.tier);

      if (!g.theme?.trim()) err(`${gtag} missing theme`);
      if (!g.dimension?.trim()) err(`${gtag} missing dimension`);
      if (!g.tierName?.trim()) err(`${gtag} missing tierName`);
      if (!g.exegesis || g.exegesis.trim().length < 30) err(`${gtag} exegesis too short (<30)`);

      if (!Array.isArray(g.words) || g.words.length !== 4) {
        err(`${gtag} must have exactly 4 words, got ${g.words?.length}`);
        continue;
      }

      for (const w of g.words) {
        if (allWords.has(w)) err(`${tag} duplicate word across groups: "${w}"`);
        allWords.add(w);
      }
    }

    if (allWords.size !== 16) err(`${tag} expected 16 unique words, got ${allWords.size}`);
    if (tiers.size !== 4) warn(`${tag} tier coverage ${tiers.size}/4 (${[...tiers].join(',')})`);
  }

  console.log(`wenmai shard: ${items.length} issues`);
}

if (warnings.length) {
  console.log(`\n⚠️  ${warnings.length} warning(s):`);
  for (const w of warnings.slice(0, 20)) console.log(`   - ${w}`);
  if (warnings.length > 20) console.log(`   ... and ${warnings.length - 20} more`);
}

if (errors.length) {
  console.log(`\n❌ ${errors.length} error(s):`);
  for (const e of errors.slice(0, 40)) console.log(`   - ${e}`);
  if (errors.length > 40) console.log(`   ... and ${errors.length - 40} more`);
  process.exit(1);
}

console.log(`\n✅ Shard OK (${warnings.length} warning(s)).`);
process.exit(0);
