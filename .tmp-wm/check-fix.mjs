const candidates = {
  'wm-042-g4': ['四六', '藻饰', '隶事', '铺陈'],
  'wm-044-g1': ['李杜', '王孟', '高岑', '元白'],
  'wm-044-g2': ['三曹', '三苏', '三袁', '三谢'],
  'wm-044-g3': ['苏门四学士', '中兴四大家', '永嘉四灵', '吴中四才子'],
  'wm-044-g4': ['周柳', '苏辛', '姜张', '温韦'],
  'wm-049-g4': ['朱淑真', '魏夫人', '严蕊', '唐琬'],
  'wm-051-g3': ['志怪', '志人', '话本', '拟话本'],
  'wm-057-g1': ['平仄', '炼字', '起承转合', '用典'],
};

const a = await import('../src/data/wenmai/shard-001.ts');
const b = await import('../src/data/wenmai/shard-002.ts');
const exist = new Set();
for (const p of [...a.WENMAI_001, ...b.WENMAI_002]) {
  for (const g of p.groups) for (const w of g.words) exist.add(w);
}

// words already used elsewhere in my own shard (outside the groups being replaced)
const mine = await import('../src/data/wenmai/shard-003.ts?x=' + Date.now());
const replacedGroups = new Set(Object.keys(candidates));
const mineWords = new Map();
for (const p of mine.WENMAI_003) {
  for (const g of p.groups) {
    if (replacedGroups.has(g.id)) continue;
    for (const w of g.words) mineWords.set(w, g.id);
  }
}

let bad = 0;
const localSeen = new Set();
for (const [gid, ws] of Object.entries(candidates)) {
  if (ws.length !== 4) {
    console.log(`${gid} len ${ws.length}`);
    bad++;
  }
  for (const w of ws) {
    if (exist.has(w)) {
      console.log(`EXIST: ${w} (${gid})`);
      bad++;
    }
    if (mineWords.has(w)) {
      console.log(`IN-SHARD DUP: ${w} (${gid}) vs ${mineWords.get(w)}`);
      bad++;
    }
    if (localSeen.has(w)) {
      console.log(`CANDIDATE DUP: ${w}`);
      bad++;
    }
    localSeen.add(w);
  }
}
console.log(`candidate groups=${Object.keys(candidates).length} words=${localSeen.size} problems=${bad}`);
