# 交接 Prompt（可直接复制给平台维护 Agent）

> 使用方式：把下面 **`---` 分隔线之间的全文**复制给负责 `loongclan/server`
> 的 agent / 开发者。它自带复现步骤、根因定位与回归用例，无需额外上下文。

---

你负责维护 loongclan 平台服务端（`/data/sites/loongclan/server`，线上 `https://api.loongclan.xyz`，Hono + Cloudflare Workers + D1）。

接入方 `words.loongclan.xyz`（appId=`words`）在对接过程中报告了两个服务端缺陷。两者都已在**线上复现确认**，请修复并补测试。

## 缺陷 D1：`/sync/meta` 只从 query 读 `syncToken`，忽略请求体

**位置**：`server/src/routes/sync.ts`，`syncRoutes.all('/meta', ...)` 约第 220–250 行。

**现状代码**：
```ts
let appId = c.req.query('appId');
let userHash = c.req.query('userHash');
const syncTokenQuery = c.req.query('syncToken');   // 只从 query 取

if (!appId || !userHash) {
  const body = await c.req.json().catch(() => ({}));
  appId = appId || body.appId;          // appId/userHash 有 body 回退
  userHash = userHash || body.userHash;
}
// ...
const auth = resolveToken(c.env, { syncToken: syncTokenQuery });  // 永远拿不到 body 的 token
```

**问题**：`appId` / `userHash` 都写了 body 回退，唯独 `syncToken` 没有。而平台自己的 SDK
（`sdk/ts/LoongSyncClient.ts` 的 `getSnapshotMeta`）是把参数放进 body 发送的，照 SDK 写必然 401。
同组接口 `/upload`、`/download`、`/export`、`/purge` 全部走 `resolveToken(c.env, body)`，只有 `/meta` 例外。

**线上复现**（同一账号、同一正确 token）：
```bash
# body → 401
curl -X POST https://api.loongclan.xyz/api/v1/sync/meta \
  -H 'Content-Type: application/json' \
  -d '{"appId":"words","userHash":"<U>","syncToken":"<T>"}'
# → {"code":401,"err_code":"token_mismatch"}

# query → 200
curl -X POST "https://api.loongclan.xyz/api/v1/sync/meta?appId=words&userHash=<U>&syncToken=<T>" \
  -H 'Content-Type: application/json' -d '{}'
# → {"code":0,"message":"ok","data":{...}}
```

**修复**：补一行 body 回退即可。
```ts
let syncToken = c.req.query('syncToken');
if (!appId || !userHash || !syncToken) {
  const body = await c.req.json().catch(() => ({}));
  appId = appId || body.appId;
  userHash = userHash || body.userHash;
  syncToken = syncToken || body.syncToken;   // ← 补这行
}
// ...
const auth = resolveToken(c.env, { syncToken });
```

**回归用例**：
| 场景 | 期望 |
|---|---|
| 正确 token 在 body | 200 `code:0` |
| 正确 token 在 query | 200 `code:0` |
| 错误 token 在 body | 401 `token_mismatch` |
| 无 token | 401 `token_mismatch` |
| 快照不存在 | 404 `no_snapshot`（保持先于鉴权） |

---

## 缺陷 D2：`/rank/submit` 缺少分数下界校验

**位置**：`server/src/routes/rank.ts` 约第 104–108 行。

**现状代码**：
```ts
const maxAbs = num(c.env.RANK_MAX_ABS_SCORE, 1_000_000_000);
if (!Number.isFinite(score) || Math.abs(score) > maxAbs) {
  return c.json({ code: 400, err_code: 'score_out_of_bounds', ... }, 400);
}
```

**问题**：`Math.abs()` 让 `-999` 与 `999` 等价通过，缺少"分数不应为负"这个更基本的前提。

**线上复现**：
```bash
curl -X POST https://api.loongclan.xyz/api/v1/rank/submit \
  -H 'Content-Type: application/json' \
  -d '{"appId":"words","boardId":"handover","period":"daily",
       "userHash":"<U>","syncToken":"<T>","nickname":"probe","score":-999}'
# → {"code":0,"message":"ok","data":{"rank":1,"score":-999,"improved":true}}
```

**影响**：负分会正常上榜，污染 `totalCount` / 平均分等统计；若某接入方用升序榜
（`sortOrder:'asc'`，如"用时越短越好"），负分会直接登顶；也可被恶意脚本用于占位与探测。

**修复**：
```ts
if (!Number.isFinite(score) || score < 0) {
  return c.json({ code: 400, err_code: 'invalid_score', message: '成绩必须为非负数值' }, 400);
}
if (score > maxAbs) {
  return c.json({ code: 400, err_code: 'score_out_of_bounds', message: '成绩超出合理阈值范围' }, 400);
}
```

若需支持负数场景，改为显式开关 `RANK_ALLOW_NEGATIVE_SCORE`（默认 `false`）。

**回归用例**：
| score | 期望 |
|---|---|
| `-1` / `-999` | 400 `invalid_score` |
| `0` | 200（0 合法） |
| `980` | 200 |
| `1e10` | 400 `score_out_of_bounds` |
| `"abc"` / `NaN` / `null` | 400 `invalid_score` |

---

## 附加观察（非缺陷，请确认）

`/sync/meta` 是"先查快照 → 再鉴权"，因此对**不存在的 userHash** 返回 `404 no_snapshot`
而非 `401`。这使任何人都能枚举判断某 `userHash` 是否已有云端数据，与代码注释里
"避免第三方探测某口令是否在用云端"的目标相冲突。

若该目标是硬性要求 → 改为**先鉴权后查库**；
若可接受 → 更新注释以免误导。

---

## 要求

1. 修复 D1、D2，各为 3 行以内改动。
2. 在 `server/test/` 补充上述回归用例。
3. 跑通现有测试套件（`server/test/api.test.ts`）。
4. 部署后回报，我会用线上复现脚本验证。

**注意**：接入方 `words` 已做客户端兼容（D1 拼 query、D2 前置拒绝负分），
平台修复后这些代码**依然正确、无需回滚**，不存在时序冲突。

---

## 复现脚本（可直接保存运行）

```bash
#!/usr/bin/env bash
set -uo pipefail
BASE="${BASE:-https://api.loongclan.xyz}"
APP="repro"
K="lg.$(openssl rand -hex 2).$(openssl rand -hex 2)"
U=$(printf '%s:id' "$K" | sha256sum | cut -d' ' -f1)
T=$(printf '%s:auth' "$K" | sha256sum | cut -d' ' -f1)

curl -s -X POST "$BASE/api/v1/sync/upload" -H 'Content-Type: application/json' \
  -d "{\"appId\":\"$APP\",\"userHash\":\"$U\",\"syncToken\":\"$T\",\"nickname\":\"repro\",\"localVersion\":1,\"payload\":{\"a\":1}}" >/dev/null

R1=$(curl -s -X POST "$BASE/api/v1/sync/meta" -H 'Content-Type: application/json' \
  -d "{\"appId\":\"$APP\",\"userHash\":\"$U\",\"syncToken\":\"$T\"}")
echo "D1 body-token : $R1"

R1b=$(curl -s -X POST "$BASE/api/v1/sync/meta?appId=$APP&userHash=$U&syncToken=$T" \
  -H 'Content-Type: application/json' -d '{}')
echo "D1 query-token: $R1b"

R2=$(curl -s -X POST "$BASE/api/v1/rank/submit" -H 'Content-Type: application/json' \
  -d "{\"appId\":\"$APP\",\"boardId\":\"repro\",\"period\":\"daily\",\"userHash\":\"$U\",\"syncToken\":\"$T\",\"nickname\":\"repro\",\"score\":-999}")
echo "D2 neg-score  : $R2"

curl -s -X POST "$BASE/api/v1/sync/purge" -H 'Content-Type: application/json' \
  -d "{\"appId\":\"$APP\",\"userHash\":\"$U\",\"syncToken\":\"$T\",\"confirm\":\"DELETE_ALL_MY_DATA\"}" >/dev/null

echo "---"
grep -q '"code":401' <<<"$R1"   && echo "D1: DEFECT PRESENT" || echo "D1: FIXED"
grep -q '"score":-999' <<<"$R2" && echo "D2: DEFECT PRESENT" || echo "D2: FIXED"
```

修复前预期输出：`D1: DEFECT PRESENT` / `D2: DEFECT PRESENT`
修复后预期输出：`D1: FIXED` / `D2: FIXED`

---

（详细版见 `docs/PLATFORM_HANDOVER.md`）
