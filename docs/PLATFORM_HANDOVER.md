# 平台缺陷交接说明 · loongclan 通用 API

**提交方**：words.loongclan.xyz（《诗藏》&《文脉》）维护者
**接收方**：loongclan 平台服务端维护者
**日期**：2026-10-27
**平台版本**：`loongclan/server` @ 线上 `api.loongclan.xyz`
**严重程度**：D1 = 中（可绕过，客户端已临时兼容）　D2 = 中（可污染排行榜数据）

---

## 摘要

对接 `api.loongclan.xyz` 时发现两处服务端缺陷，均已在线上复现，并附最小复现脚本。

| 编号 | 缺陷 | 位置 | 影响 |
|------|------|------|------|
| D1 | `/sync/meta` 只从 **query** 读取 `syncToken`，忽略请求体 | `server/src/routes/sync.ts:242` | 按 SDK 文档使用会永久 401，同步流程断链 |
| D2 | `/rank/submit` 只校验 `\|score\|` 上限，**无下界** | `server/src/routes/rank.ts:105` | 负分可正常上榜，污染榜单 |

两者都不是"设计取舍"，而是与自身 SDK、与其他同类接口不一致的实现疏漏。

---

## D1：`/sync/meta` 忽略请求体中的 `syncToken`

### 现象

同一账号、同一正确 `syncToken`：

```bash
# 放在请求体（SDK 与 /upload、/download 的用法）→ 401
curl -X POST https://api.loongclan.xyz/api/v1/sync/meta \
  -H 'Content-Type: application/json' \
  -d '{"appId":"words","userHash":"<U>","syncToken":"<T>"}'
# → {"code":401,"err_code":"token_mismatch","message":"鉴权密文不匹配"}

# 放在 query → 200
curl -X POST "https://api.loongclan.xyz/api/v1/sync/meta?appId=words&userHash=<U>&syncToken=<T>" \
  -H 'Content-Type: application/json' -d '{}'
# → {"code":0,"message":"ok","data":{...}}
```

### 根因

`server/src/routes/sync.ts` 中 `/meta` 的处理：

```ts
syncRoutes.all('/meta', async (c) => {
  let appId = c.req.query('appId');
  let userHash = c.req.query('userHash');
  const syncTokenQuery = c.req.query('syncToken');   // ← 只从 query 取

  if (!appId || !userHash) {
    const body = await c.req.json().catch(() => ({}));
    appId = appId || body.appId;                      // ← 只有 appId/userHash 有 body 回退
    userHash = userHash || body.userHash;
  }
  // ...
  const auth = resolveToken(c.env, { syncToken: syncTokenQuery });  // ← 永远拿不到 body 的 token
```

`appId` 和 `userHash` 都写了 body 回退，唯独 `syncToken` 没有。

### 为什么这是缺陷而非设计

1. **与自身 SDK 矛盾**：`sdk/ts/LoongSyncClient.ts` 的 `getSnapshotMeta()` 把整个 req 塞进 body 发送，从未拼 query。照 SDK 写就必然 401。
2. **与同组接口不一致**：`/upload`、`/download`、`/export`、`/purge` 全部走 `resolveToken(c.env, body)`；只有 `/meta` 例外。
3. **鉴权语义未变**：改法不削弱"防止第三方探测某口令是否在用云端"这一目标，只是让 token 从哪读不再影响结果。

### 建议修复

```ts
syncRoutes.all('/meta', async (c) => {
  let appId = c.req.query('appId');
  let userHash = c.req.query('userHash');
  let syncToken = c.req.query('syncToken');

  if (!appId || !userHash || !syncToken) {
    const body = await c.req.json().catch(() => ({}));
    appId = appId || body.appId;
    userHash = userHash || body.userHash;
    syncToken = syncToken || body.syncToken;   // ← 补上这一行
  }
  // ...
  const auth = resolveToken(c.env, { syncToken });
```

同时建议 `sdk/ts/LoongSyncClient.ts` 的 `getSnapshotMeta` 保持发送 body（与其它方法一致），无需改动。

### 回归用例

```
POST /sync/meta  正确 token 在 body   → 200 code:0
POST /sync/meta  正确 token 在 query  → 200 code:0
POST /sync/meta  错误 token 在 body   → 401 token_mismatch
POST /sync/meta  无 token             → 401 token_mismatch
POST /sync/meta  快照不存在           → 404 no_snapshot（先于鉴权，保持不变）
```

> ⚠️ 注意第 5 条：当前实现是先查快照、再鉴权，因此"无快照"会先返回 404，
> 这会**泄露某 userHash 是否在用云端**——与注释里"避免第三方探测"的初衷相反。
> 建议一并调整为先鉴权后查库，或至少确认该行为是否可接受。

---

## D2：`/rank/submit` 缺少分数下界校验

### 现象

```bash
curl -X POST https://api.loongclan.xyz/api/v1/rank/submit \
  -H 'Content-Type: application/json' \
  -d '{"appId":"words","boardId":"handover","period":"daily",
       "userHash":"<U>","syncToken":"<T>","nickname":"probe","score":-999}'
# → {"code":0,"message":"ok","data":{"rank":1,"score":-999,"improved":true}}
```

`-999` 被正常接受并上榜（`improved: true`）。

### 根因

`server/src/routes/rank.ts:105`：

```ts
const maxAbs = num(c.env.RANK_MAX_ABS_SCORE, 1_000_000_000);
if (!Number.isFinite(score) || Math.abs(score) > maxAbs) {   // ← 只判绝对值
  return c.json({ code: 400, err_code: 'score_out_of_bounds', ... }, 400);
}
```

`Math.abs()` 让 `-999` 与 `999` 等价通过。变量名叫 `maxAbs`，注释写"极值上限阈值"，
说明本意是限制数量级，但遗漏了"分数不应为负"这一更基本的前提。

### 为什么这是缺陷

- 排行榜是**降序**排列（`sortOrder: 'desc'`）。负分虽排在末尾，但会：
  - 让 `totalCount`、参与人数、平均分等统计失真；
  - 若某应用用升序榜（`asc`，如"用时越短越好"），负分将直接登顶；
  - 被恶意脚本用来占位、制造异常数据、探测接口。
- 对绝大多数接入方而言，分数语义天然非负；平台作为通用层应提供安全默认值。

### 建议修复

```ts
// 通用默认：分数必须为非负有限数
if (!Number.isFinite(score) || score < 0) {
  return c.json({ code: 400, err_code: 'invalid_score', message: '成绩必须为非负数值' }, 400);
}
if (score > maxAbs) {
  return c.json({ code: 400, err_code: 'score_out_of_bounds', message: '成绩超出合理阈值范围' }, 400);
}
```

若确需支持负数（例如某些以"差值"计分的场景），建议改为**显式开关**：

```ts
const allowNegative = flag(c.env.RANK_ALLOW_NEGATIVE_SCORE, false);
if (!allowNegative && score < 0) { /* 拒绝 */ }
```

### 回归用例

```
score = -1          → 400 invalid_score
score = -999        → 400 invalid_score
score = 0           → 200（0 是合法分数）
score = 980         → 200
score = 1e10        → 400 score_out_of_bounds
score = "abc"       → 400 invalid_score
score = NaN / null  → 400 invalid_score
```

---

## 附：最小复现脚本

保存为 `repro.sh`，替换 `BASE` 后可直接运行，输出应为 `D1=FAILED`、`D2=FAILED`（即缺陷存在）。

```bash
#!/usr/bin/env bash
set -uo pipefail
BASE="${BASE:-https://api.loongclan.xyz}"
APP="repro"

K="lg.$(openssl rand -hex 2).$(openssl rand -hex 2)"
U=$(printf '%s:id'   "$K" | sha256sum | cut -d' ' -f1)
T=$(printf '%s:auth' "$K" | sha256sum | cut -d' ' -f1)

curl -s -X POST "$BASE/api/v1/sync/upload" -H 'Content-Type: application/json' \
  -d "{\"appId\":\"$APP\",\"userHash\":\"$U\",\"syncToken\":\"$T\",\"nickname\":\"repro\",\"localVersion\":1,\"payload\":{\"a\":1}}" >/dev/null

# --- D1: token 在 body ---
R1=$(curl -s -X POST "$BASE/api/v1/sync/meta" -H 'Content-Type: application/json' \
  -d "{\"appId\":\"$APP\",\"userHash\":\"$U\",\"syncToken\":\"$T\"}")
echo "D1 body-token  : $R1"

# --- D1b: token 在 query（对照组，应成功）---
R1b=$(curl -s -X POST "$BASE/api/v1/sync/meta?appId=$APP&userHash=$U&syncToken=$T" \
  -H 'Content-Type: application/json' -d '{}')
echo "D1 query-token : $R1b"

# --- D2: 负分 ---
R2=$(curl -s -X POST "$BASE/api/v1/rank/submit" -H 'Content-Type: application/json' \
  -d "{\"appId\":\"$APP\",\"boardId\":\"repro\",\"period\":\"daily\",\"userHash\":\"$U\",\"syncToken\":\"$T\",\"nickname\":\"repro\",\"score\":-999}")
echo "D2 neg-score   : $R2"

curl -s -X POST "$BASE/api/v1/sync/purge" -H 'Content-Type: application/json' \
  -d "{\"appId\":\"$APP\",\"userHash\":\"$U\",\"syncToken\":\"$T\",\"confirm\":\"DELETE_ALL_MY_DATA\"}" >/dev/null

echo "---"
grep -q '"code":401' <<<"$R1"  && echo "D1: DEFECT PRESENT (body token rejected)" || echo "D1: FIXED"
grep -q '"score":-999' <<<"$R2" && echo "D2: DEFECT PRESENT (negative score accepted)" || echo "D2: FIXED"
```

---

## 客户端侧临时措施（已在 words 项目落地）

在平台修复前，`words.loongclan.xyz` 已自行规避，**修复后这些兼容代码可保留，无副作用**：

| 缺陷 | 客户端规避 | 位置 |
|------|-----------|------|
| D1 | `getSnapshotMeta` 改为把 `syncToken` 拼进 query | `src/lib/loongclan/LoongSyncClient.ts` |
| D2 | `submitScore` 前置校验 `score < 0` 直接拒绝 | `src/lib/loongclan/LoongRankClient.ts` |

> 平台修复后，D1 的 query 写法与 D2 的前置校验依然正确，**无需回滚**，
> 因此不存在"修完平台又弄坏接入方"的时序问题。

---

## 建议的验证方式

`loongclan/server/test/` 已有测试套件。建议为上述两类用例补充断言，
并在 CI 中对**线上**跑一次复现脚本（或对 staging 环境跑），防止回归。

---

## 附：另一个观察（非缺陷，供参考）

`/sync/meta` 当前是"先查快照 → 再鉴权"，因此对**不存在的 userHash** 会返回
`404 no_snapshot` 而非 `401`。这使得任何人都能枚举判断某个 `userHash`
是否已有云端数据——与代码注释中"避免第三方探测某口令是否在用云端"的目标相冲突。

若该目标是硬性要求，建议调整为**先鉴权后查库**；若可接受，建议更新注释以免误导。

---

**联系**：words.loongclan.xyz 维护者
**附**：复现脚本可直接粘贴运行；两处修改均为 3 行以内。
