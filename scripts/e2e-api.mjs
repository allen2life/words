// e2e-api.mjs — 对线上 loongclan 平台做同步与排行榜端到端验证
// 用法: node scripts/e2e-api.mjs
import { createHash, randomBytes } from 'node:crypto';

const BASE = process.env.API_BASE || 'https://api.loongclan.xyz';
const APP_ID = 'words';

const sha256 = (s) => createHash('sha256').update(s, 'utf8').digest('hex');

const part = () => randomBytes(2).toString('hex');
const kouling = `lg.${part()}.${part()}`;
const userHash = sha256(`${kouling}:id`);
const syncToken = sha256(`${kouling}:auth`);

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
}

async function post(path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: r.status, json: await r.json().catch(() => null) };
}

console.log(`\n=== E2E against ${BASE} ===`);
console.log(`kouling=${kouling}\nuserHash=${userHash}\n`);

// 1. 首次 meta —— 应 404 no_snapshot
let r = await post('/api/v1/sync/meta', { appId: APP_ID, userHash });
check('meta before any snapshot → 404 no_snapshot', r.json?.err_code === 'no_snapshot', JSON.stringify(r.json));

// 2. 上传快照
r = await post('/api/v1/sync/upload', {
  appId: APP_ID,
  userHash,
  syncToken,
  nickname: 'E2E Probe',
  clientVersion: '1.0.0',
  localVersion: 1,
  payload: { stats: { shizangWon: 3 }, achievements: ['ach-1'] },
});
check('upload snapshot', r.json?.code === 0, `serverVersion=${r.json?.data?.serverVersion}`);

// 3. 口令原文绝不上送（负向：缺 token 应被拒）
r = await post('/api/v1/sync/download', { appId: APP_ID, userHash });
check('download without syncToken → rejected', r.status === 400 || r.json?.code === 400, JSON.stringify(r.json));

// 4. 下载快照并校验 payload 往返一致
r = await post('/api/v1/sync/download', { appId: APP_ID, userHash, syncToken });
const payload = r.json?.data?.payload;
check(
  'download snapshot round-trip',
  payload?.stats?.shizangWon === 3 && payload?.achievements?.[0] === 'ach-1',
  `serverVersion=${r.json?.data?.serverVersion}`
);

// 5. meta 带 token —— 必须走 query 传参（平台该路由忽略 body 中的 syncToken）
const metaQs = new URLSearchParams({ appId: APP_ID, userHash, syncToken }).toString();
r = await post(`/api/v1/sync/meta?${metaQs}`, {});
check(
  'meta with syncToken in query → 200 (body-only returns 401)',
  r.json?.code === 0,
  JSON.stringify(r.json?.data ?? r.json)
);

// 5b. 回归断言：仅放 body 时应被拒，锁定平台行为
r = await post('/api/v1/sync/meta', { appId: APP_ID, userHash, syncToken });
check(
  'meta with syncToken in body only → 401 (documents platform quirk)',
  r.json?.err_code === 'token_mismatch'
);

// 6. meta 带错误 token —— 应 401
const badQs = new URLSearchParams({ appId: APP_ID, userHash, syncToken: sha256('wrong:auth') }).toString();
r = await post(`/api/v1/sync/meta?${badQs}`, {});
check('meta with wrong syncToken → 401 token_mismatch', r.json?.err_code === 'token_mismatch');

// 7. 排行榜提交
const boardId = `e2e_${Date.now()}`;
r = await post('/api/v1/rank/submit', {
  appId: APP_ID,
  boardId,
  period: 'daily',
  userHash,
  syncToken,
  nickname: 'E2E Probe',
  score: 980,
  stars: 3,
});
check('rank submit', r.json?.code === 0, `rank=${r.json?.data?.rank} score=${r.json?.data?.score}`);

// 8. 排行榜查询（公开）
const q = await fetch(`${BASE}/api/v1/rank/query?appId=${APP_ID}&boardId=${boardId}&period=daily&limit=10`);
const qj = await q.json();
check(
  'rank query returns submitted entry',
  qj?.data?.list?.some((x) => x.userHash === userHash && x.score === 980),
  `totalCount=${qj?.data?.totalCount}`
);

// 9. 负分：平台未设非负下限（仅校验绝对值上限），因此这里断言的是
//    "平台当前会接受负分" 这一已知缺口，以便该行为变化时立刻被发现。
await new Promise((r) => setTimeout(r, 5200)); // 规避同账号 5s 提交间隔
r = await post('/api/v1/rank/submit', {
  appId: APP_ID,
  boardId,
  period: 'daily',
  userHash,
  syncToken,
  nickname: 'E2E Probe',
  score: -999,
});
check(
  '[known platform gap] server accepts negative score',
  r.json?.code === 0,
  '客户端 LoongRankClient 已前置拦截负分；建议平台补充非负下限校验'
);

// 10. 清理：注销测试数据
r = await post('/api/v1/sync/purge', {
  appId: APP_ID,
  userHash,
  syncToken,
  confirm: 'DELETE_ALL_MY_DATA',
});
check('purge test data', r.json?.code === 0, JSON.stringify(r.json?.message));

const failed = results.filter((x) => !x.pass);
console.log(`\n=== ${results.length - failed.length}/${results.length} passed ===`);
process.exit(failed.length ? 1 : 0);
