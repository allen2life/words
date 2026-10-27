# 《诗藏》&《文脉》服务端集成说明 (API INTEGRATION)

**文档版本**：v2.0.0
**更新日期**：2026-10-27
**状态**：已对齐线上实现

> ⚠️ **本文档已全面重写。** 旧版（v1.x）描述的是 Ed25519 设备密钥 + `PUT /api/v1/sync/snapshot` 的设
> 想方案，**从未实现、也永远不会实现**。实际线上跑的是 loongclan 平台的三维口令 + 双哈希派生方案。
> 本文档以线上实测结果与 `loongclan/docs/SPEC_*.md` 为准。

---

## 一、 核心设计哲学（Obsidian 范式）

服务器只是"可信的中继同步层"，不拥有、不解释用户数据。

- **本地优先**：`localStorage` 是唯一真相源，断网 100% 可玩
- **中继存储**：服务器只存快照（Snapshot）与版本号，不解析 `payload` 业务字段
- **数据主权**：用户可随时全量导出、彻底注销
- **零明文**：三维口令原文永不离开客户端

---

## 二、 身份体系：三维口令 + 双哈希派生

### 2.1 口令格式

```
part1.part2.part3      例：lg.8x7a.m2k4
```

- 三段，以半角点号 `.` 分隔
- 每段 1~8 字符，**允许任意符号**（汉字、字母、数字、Emoji）
- 段内不得包含半角点号

### 2.2 双哈希派生（客户端本地计算）

```ts
UserHash  = hex(SHA-256(UTF-8(kouling + ":id")))    // 64 位，公开身份标识
SyncToken = hex(SHA-256(UTF-8(kouling + ":auth")))  // 64 位，私密鉴权密文
```

**铁律**：
1. 必须使用标准 UTF-8 字节流（`new TextEncoder().encode()`），保证跨平台一致
2. 口令原文**绝不**进入任何网络请求体
3. `UserHash` 可用于排行榜等公开场景；`SyncToken` 任何公开接口绝不暴露

实现：[`src/lib/loongclan/LoongIdentity.ts`](../src/lib/loongclan/LoongIdentity.ts)

### 2.3 与旧文档的差异说明

| 项目 | 旧文档（v1.x，作废） | 实际实现（v2.0） |
|------|---------------------|-----------------|
| 身份 | Ed25519 密钥对 | 三维口令 + SHA-256 双哈希 |
| 私钥 | 客户端生成并保管 | 无密钥对；口令即凭据 |
| 令牌刷新 | challenge 签名换 syncToken | 无令牌概念；每次请求现算哈希 |
| 注册 | `POST /auth/device/register` | 无注册；首次使用自动生成口令 |

---

## 三、 同步 API

**Base URL**：`https://api.loongclan.xyz`　**appId**：`words`

| 能力 | 方法与路径 | 说明 |
|------|-----------|------|
| 上传快照 | `POST /api/v1/sync/upload` | 携带 `userHash` + `syncToken` + `payload` |
| 下载快照 | `POST /api/v1/sync/download` | 返回最新快照；无快照时返回 404 |
| 元信息 | `POST /api/v1/sync/meta` | 仅版本号与大小，用于启动时快速比对 |
| 全量导出 | `POST /api/v1/sync/export` | 返回用户全部数据 JSON |
| 彻底注销 | `POST /api/v1/sync/purge` | `confirm: "DELETE_ALL_MY_DATA"` |

### 3.1 上传

```json
POST /api/v1/sync/upload
{
  "appId": "words",
  "userHash": "…64 位…",
  "syncToken": "…64 位…",
  "nickname": "文脉探求者",
  "clientVersion": "1.0.0",
  "snapshotAt": "2026-09-09T09:00:00Z",
  "localVersion": 12,
  "force": false,
  "payload": { }
}
```

响应：
```json
{ "code": 0, "data": { "serverVersion": 13, "savedAt": "…" } }
```

### 3.2 下载

```json
POST /api/v1/sync/download
{ "appId": "words", "userHash": "…", "syncToken": "…" }
```

响应：
```json
{ "code": 0, "data": { "serverVersion": 13, "snapshotAt": "…", "payload": { } } }
```

### 3.3 元信息

```json
POST /api/v1/sync/meta
{ "appId": "words", "userHash": "…" }
```

> 注意：该接口**不需要** `syncToken`（只读元信息）。无快照时返回 `code: 404` / `err_code: "not_found"`。

### 3.4 快照 payload 结构（本产品自定义）

服务器不关心，但客户端需自洽：

```jsonc
{
  "profile": { "nickname": "诗眼破壁人", "avatarSeed": "abc123" },
  "stats": {
    "shizangPlayed": 12, "shizangWon": 10, "shizangStreak": 5,
    "wenmaiPlayed": 8,  "wenmaiWon": 7,  "wenmaiStreak": 3
  },
  "history": [
    { "puzzleId": "sz-009", "date": "2026-09-09",
      "guesses": ["青","到","绿"], "won": true,
      "guessCount": 3, "completedAt": "2026-09-09T08:15:00+08:00" }
  ],
  "achievements": ["ach-1","ach-2"],
  "preferences": { "soundEnabled": true, "hapticEnabled": true }
}
```

---

## 四、 排行榜 API

| 能力 | 方法与路径 |
|------|-----------|
| 提交成绩 | `POST /api/v1/rank/submit` |
| 查询榜单 | `GET /api/v1/rank/query?appId=words&boardId=…&period=…&limit=…` |

### 4.1 提交

```json
POST /api/v1/rank/submit
{
  "appId": "words",
  "boardId": "daily_20261027",
  "period": "daily",
  "userHash": "…",
  "syncToken": "…",
  "nickname": "文脉探求者",
  "score": 980,
  "stars": 3
}
```

`period` 取值：`all` | `daily` | `weekly`
`sortOrder`：`desc`（默认，分高者前）| `asc`

### 4.2 查询（公开，免鉴权）

```
GET /api/v1/rank/query?appId=words&boardId=daily_20261027&period=daily&limit=50
```

响应：
```json
{
  "code": 0,
  "data": {
    "list": [{ "rank": 1, "userHash": "…", "nickname": "…", "score": 980, "stars": 3, "publishTime": 1790000000000 }],
    "totalCount": 1
  }
}
```

---

## 五、 冲突处理（客户端职责）

```
启动 → POST /sync/meta
  ├─ serverVersion > localVersion → POST /sync/download → 字段级合并
  ├─ localVersion > serverVersion → POST /sync/upload
  └─ 相等 → 无需同步
```

**合并规则**：

| 字段 | 策略 |
|------|------|
| `history[]` | 以 `puzzleId` 为键取 union，冲突取 `completedAt` 较晚者 |
| `stats.*` | 取两侧最大值 |
| `achievements[]` | 取 union（只增不减） |
| `profile` / `preferences` | 取 `snapshotAt` 较新的一侧 |

实现：[`src/lib/loongclan/profile.ts`](../src/lib/loongclan/profile.ts) 的 `mergePlayerStats()`

---

## 六、 题库 API：**未采用**

旧文档设想了独立的题库 API（`GET /api/v1/puzzle/daily` 等），用于防止 bundle 暴露答案。

**当前决策：不使用。** 理由：

1. **违反平台铁律 1（纯单机可玩 / 离线优先）**。每日谜题依赖网络意味着断网不可玩，与生态强制规范冲突。
2. **攻击面并未真正消除**。答案即便走 API，仍会下发到客户端内存，抓包即可获得；反作弊收益有限。
3. **成本与复杂度不成比例**。题库是静态内容，内置可省去一整套后端与缓存层。

**代价与缓解**：
- 代价：懂技术的玩家可查看 bundle 得到 `targetChar`
- 缓解：① 谜题价值在"炼字赏析"而非"猜中"，剧透本身不破坏文化体验；② 后续可将答案做轻度混淆；③ 排行榜作弊通过服务端合理性校验与人工封禁兜底

> 若未来确需服务端发题，应在 `appId=words` 下新增 `puzzle` 路由，而非另起炉灶。

---

## 七、 隐私合规

- ✅ 不收集手机号、邮箱、IP（可配置不记录日志）
- ✅ 用户可随时全量导出、彻底删除
- ✅ 口令原文永不上传，服务端零明文存储
- ✅ 界面常驻区（顶栏/排行榜/状态区）**只显示昵称**，严禁展示明文口令
- ✅ 凭据查看界面默认脱敏（如 `loong.***.***`），配显隐切换与一键复制
- ✅ 口令输入框默认 `type="password"`，支持智能粘贴分段
