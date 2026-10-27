# 《诗藏》&《文脉》服务器端 API 需求文档

**核心设计哲学（Obsidian 范式）**：服务器只是"可信的中继同步层"，不拥有、不解释用户数据。玩家的昵称、进度、答题记录永远以**本地优先**存储，服务器仅做备份与跨设备同步；用户可随时全量导出/删除自己的云端数据，零锁定。

---

## 一、 架构总览

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端（浏览器）                       │
│                                                             │
│   localStorage / IndexedDB  ←→  同步引擎  ←→  Server API    │
│          （本地真相源）              ↑               ↑        │
│                                用户控制      仅同步层         │
└─────────────────────────────────────────────────────────────┘
```

**两类 API 严格分离**：

| 类型 | 说明 | 需要认证 |
|------|------|----------|
| **题库 API** | 每日谜题下发，全公开，防止 bundle 暴露答案 | ❌ 无需 |
| **同步 API** | 用户数据上传 / 下载 / 删除，用户自持密钥 | ✅ 设备密钥 |

---

## 二、 认证方案：设备密钥（无密码、无邮箱）

> 遵循 Obsidian 哲学：用户不需要向服务器证明"你是谁"，只需证明"你持有这个密钥"。

### 2.1 注册 / 激活设备

```
POST /api/v1/auth/device/register
```

**说明**：客户端本地生成一对 `Ed25519` 非对称密钥对（公钥 + 私钥）。公钥上传服务器作为身份标识；私钥永远留在本地，服务器不知道私钥，也无法伪造用户数据。

**Request Body**：
```json
{
  "publicKey": "ed25519:base64(pubKey)",        // 客户端生成
  "deviceName": "iPhone 16 Safari",            // 可选，方便用户管理多设备
  "nickname": "诗眼破壁人",                     // 昵称（可空，可随时改）
  "clientVersion": "1.0.0"
}
```

**Response 200**：
```json
{
  "userId": "usr_xxxxxxxxxxxx",   // 服务器分配的不透明 ID
  "deviceId": "dev_yyyyyyyyyyyy",
  "syncToken": "stk_zzzzzzz",    // 短期访问令牌（24h 有效）
  "issuedAt": "2026-09-09T00:00:00Z"
}
```

---

### 2.2 签名刷新 Token（无需密码）

```
POST /api/v1/auth/device/challenge
```

**说明**：服务器下发随机 `challenge`，客户端用本地私钥签名后返回，验证通过则换新 `syncToken`，无密码传输。

**Request Body**：
```json
{
  "userId": "usr_xxxxxxxxxxxx",
  "deviceId": "dev_yyyyyyyyyyyy",
  "signature": "base64(sign(challenge, privateKey))",
  "challenge": "srv_challenge_abc123"
}
```

**Response 200**：
```json
{
  "syncToken": "stk_new_token",
  "expiresAt": "2026-09-10T00:00:00Z"
}
```

---

### 2.3 导出设备恢复码（跨设备迁移）

```
POST /api/v1/auth/device/recovery-code
```

**说明**：客户端将私钥用用户自设的口令加密后生成恢复码（类似 Obsidian 的加密本地库），服务器只存密文，口令不上传。换手机时输入口令恢复私钥。

**Request Body**：
```json
{
  "encryptedPrivateKey": "base64(AES-GCM(privateKey, PBKDF2(passphrase)))",
  "hint": "诗眼那个词" // 口令提示，可选
}
```

---

## 三、 题库 API（公开，无需认证）

### 3.1 获取今日谜题

```
GET /api/v1/puzzle/daily
GET /api/v1/puzzle/daily?date=2026-09-09&tz=Asia/Shanghai
```

**说明**：服务器以**北京时间 00:00**为换题边界，统一全网题号。客户端不再自行计算题目（彻底防止 bundle 暴露答案）。

**Response 200**：
```json
{
  "date": "2026-09-09",
  "dayNumber": 252,
  "nextResetAt": "2026-09-10T00:00:00+08:00",  // 倒计时用

  "shizang": {
    "id": "sz-009",
    "title": "泊船瓜洲",
    "dynasty": "宋",
    "author": "王安石",
    "targetLine": "春风又_江南岸",      // 已挖空，绝不返回 targetChar
    "targetIndex": 3,
    "lineLength": 7,
    "tier": "green",
    "festivalLabel": null               // 若为节气则为 "秋分"
  },

  "wenmai": {
    "id": "wm-009",
    "title": "第 252 期 · 金秋篇",
    "groups": [
      {
        "id": "wm-009-g1",
        "tier": "yellow",
        "tierName": "蒙学入门",
        "words": ["明月", "杨柳", "孤舟", "鸿雁"]
        // ⚠️ 不在此处返回 theme / dimension（防作弊）
      },
      { "id": "wm-009-g2", "tier": "green",  "tierName": "诗文通识",  "words": ["无为","逍遥","兼爱","中庸"] },
      { "id": "wm-009-g3", "tier": "blue",   "tierName": "古文学高阶", "words": ["菩萨蛮","念奴娇","沁园春","水调歌头"] },
      { "id": "wm-009-g4", "tier": "purple", "tierName": "文脉宗师",  "words": ["绿绮","焦尾","湛卢","莫邪"] }
    ]
  }
}
```

---

### 3.2 获取题目答案与赏析（提交答案后校验）

```
POST /api/v1/puzzle/verify/shizang
```

**说明**：玩家每次推敲提交一个汉字，服务器返回判定结果（朱砂红/松花黄/墨灰），答案不提前下发。

**Request Body**：
```json
{
  "puzzleId": "sz-009",
  "guessChar": "绿"
}
```

**Response 200**：
```json
{
  "status": "exact",    // "exact" | "near" | "none"
  "feedback": "正中诗眼！字正腔圆，神韵尽显！",
  "clueUnlocked": {
    // 服务器根据当前是第几次尝试决定解锁哪重提示
    "tone": "仄声 (去声 · 语势顿挫有力)",
    "radical": null,   // 未到解锁条件时为 null
    "imagery": null
  },
  // 仅在 status === "exact" 或客户端请求赏析时返回
  "appreciation": null
}
```

```
POST /api/v1/puzzle/appreciation/shizang
```

**说明**：通关或超过最大尝试次数后，获取完整赏析内容（含答案、全诗、文化解析）。

**Request Body**：
```json
{
  "puzzleId": "sz-009",
  "proof": "sha256(userId + puzzleId + guessSequence)"  // 防刷，证明玩过
}
```

**Response 200**：
```json
{
  "targetChar": "绿",
  "fullPoem": ["京口瓜洲一水间", "钟山只隔数重山", "春风又绿江南岸", "明月何时照我还"],
  "appreciation": "此句为千古名炼字...",
  "authorBio": "王安石（1021—1086）...",
  "clues": {
    "tone": "仄声 (去声 · 语势顿挫有力)",
    "radical": "纟 (绞丝旁 · 表织练染就之意)",
    "imagery": "形容词用作动词，生动描摹春风吹拂下草木萌发、遍地尽染的生机"
  }
}
```

---

### 3.3 文脉分类校验

```
POST /api/v1/puzzle/verify/wenmai
```

**Request Body**：
```json
{
  "puzzleId": "wm-009",
  "selectedWords": ["明月", "杨柳", "孤舟", "鸿雁"]
}
```

**Response 200**：
```json
{
  "matched": true,
  "groupId": "wm-009-g1",
  "theme": "华夏传统羁旅思乡意象",
  "dimension": "同意象寄托",
  "exegesis": "古人关山阻隔，举头望明月以念故土...",
  "oneAway": false   // 若 matched=false 且有3个命中同组，则为 true
}
```

---

### 3.4 获取历史题卷列表（日历检索）

```
GET /api/v1/puzzle/calendar?from=2026-01-01&to=2026-09-09
```

**Response 200**：
```json
{
  "puzzles": [
    { "date": "2026-09-09", "dayNumber": 252, "shizangTier": "green", "festivalLabel": null },
    { "date": "2026-09-08", "dayNumber": 251, "shizangTier": "blue",  "festivalLabel": null },
    ...
  ]
}
```

---

## 四、 用户数据同步 API（Obsidian 哲学核心）

> 服务器存储的是**用户自己打包的数据快照（Snapshot）**，不解析语义，不做字段级操作。服务器完全不关心快照里有什么，它只负责：存、取、比较版本号。

### 4.1 上传数据快照

```
PUT /api/v1/sync/snapshot
Authorization: Bearer {syncToken}
```

**Request Body**：
```json
{
  "schemaVersion": "1.0",
  "clientVersion": "1.0.0",
  "snapshotAt": "2026-09-09T08:00:00+08:00",
  "localVersion": 42,           // 本地乐观锁版本号，每次本地修改 +1

  "payload": {
    // 以下由客户端自行组织，服务器不解析，原样存储
    "profile": {
      "nickname": "诗眼破壁人",
      "avatarSeed": "abc123"     // 用于生成头像的随机种子
    },
    "stats": {
      "shizangPlayed": 12,
      "shizangWon": 10,
      "shizangStreak": 5,
      "wenmaiPlayed": 8,
      "wenmaiWon": 7,
      "wenmaiStreak": 3
    },
    "history": [
      {
        "puzzleId": "sz-009",
        "date": "2026-09-09",
        "guesses": ["青", "到", "绿"],
        "won": true,
        "guessCount": 3,
        "completedAt": "2026-09-09T08:15:00+08:00"
      }
    ],
    "achievements": ["ach-1", "ach-2", "ach-3"],
    "preferences": {
      "soundEnabled": true,
      "hapticEnabled": true
    }
  }
}
```

**Response 200**：
```json
{
  "serverVersion": 43,          // 服务器确认后的版本号
  "savedAt": "2026-09-09T08:00:01Z",
  "conflict": false             // 若本地版本落后于服务器，返回 true（见冲突处理）
}
```

**Response 409 Conflict**：
```json
{
  "conflict": true,
  "serverVersion": 50,
  "serverSnapshotAt": "2026-09-09T07:55:00+08:00",
  "message": "服务器版本更新，请先下载后合并"
}
```

---

### 4.2 下载数据快照

```
GET /api/v1/sync/snapshot
Authorization: Bearer {syncToken}
```

**Response 200**：
```json
{
  "serverVersion": 43,
  "snapshotAt": "2026-09-09T08:00:01Z",
  "payload": { ...同上payload结构... }
}
```

**Response 404**：首次同步，服务器无快照，客户端以本地数据为准。

---

### 4.3 查询快照元信息（判断是否需要同步）

```
HEAD /api/v1/sync/snapshot
Authorization: Bearer {syncToken}
```

**Response Headers**：
```
X-Snapshot-Version: 43
X-Snapshot-At: 2026-09-09T08:00:01Z
X-Snapshot-Size: 4096
```

客户端在启动时调用此接口，与 `localStorage` 的本地版本号对比，决定是否触发同步，而不是每次都全量下载。

---

### 4.4 全量导出（数据主权）

```
GET /api/v1/sync/export
Authorization: Bearer {syncToken}
```

**Response**：返回一个 `.json` 文件下载，包含账户创建时间、全部快照历史（可选最近 N 个版本）、设备列表等，用户可以完整备份后删除账户。

---

### 4.5 删除账户（数据主权）

```
DELETE /api/v1/user/account
Authorization: Bearer {syncToken}
```

**Request Body**：
```json
{
  "confirm": "DELETE_MY_DATA",
  "signature": "base64(sign('DELETE_MY_DATA', privateKey))"
}
```

**Response 200**：服务器永久删除用户的所有数据（快照、设备记录、日志），72 小时内不可恢复。

---

## 五、 社区统计 API（可选，完全匿名，用户 Opt-in）

### 5.1 提交今日匿名战报

```
POST /api/v1/community/stats/submit
Authorization: Bearer {syncToken}
```

**说明**：用户明确选择"参与全网战报统计"后才调用，**不含任何个人标识**，服务器只聚合数字。

**Request Body**：
```json
{
  "date": "2026-09-09",
  "shizang": {
    "participated": true,
    "won": true,
    "guessCount": 3          // 服务器只记录 1-6，不记录具体猜了哪些字
  },
  "wenmai": {
    "participated": true,
    "won": true,
    "mistakesUsed": 1
  }
}
```

---

### 5.2 查看今日全网战报

```
GET /api/v1/community/stats/daily?date=2026-09-09
```

**Response 200**：
```json
{
  "date": "2026-09-09",
  "dayNumber": 252,
  "shizang": {
    "totalParticipants": 3821,
    "winRate": 0.847,
    "guessDist": [0.05, 0.18, 0.31, 0.24, 0.12, 0.06],  // 1-6次猜中分布
    "averageGuesses": 3.2
  },
  "wenmai": {
    "totalParticipants": 2904,
    "winRate": 0.791,
    "mistakeDist": [0.38, 0.28, 0.19, 0.09, 0.06]       // 0-4次失误分布
  }
}
```

---

## 六、 客户端同步策略（冲突处理）

```
┌──────────────┐
│  App 启动     │
└──────┬───────┘
       │ HEAD /sync/snapshot
       ▼
  服务器版本 > 本地版本？
  ┌─── YES ────────────────────────────────────┐
  │    GET /sync/snapshot                      │
  │    以"最后写入时间"为准做字段级合并             │
  │    （history 按 puzzleId 去重合并，          │
  │      stats 取两侧最大值，achievements 取并集）│
  └─────────────────────────────────────────────┘
       │ NO
       ▼
  本地版本 > 服务器版本？
  ┌─── YES ──────────────┐
  │    PUT /sync/snapshot │
  │    上传本地快照        │
  └───────────────────────┘
       │ 版本一致，无需同步
       ▼
      Done
```

**合并规则（CRDT 思路）**：

| 字段 | 合并策略 |
|------|----------|
| `history[]` | 以 `puzzleId` 为键，取两侧 union，有冲突时取 `completedAt` 最晚的 |
| `stats.streak` | 取较大值 |
| `stats.played/won` | 取较大值 |
| `achievements[]` | 取 union（成就只增不减） |
| `profile` | 取 `snapshotAt` 最新的一侧 |
| `preferences` | 取 `snapshotAt` 最新的一侧 |

---

## 七、 服务器技术选型建议

| 层次 | 推荐方案 | 理由 |
|------|----------|------|
| **Serverless 函数** | Cloudflare Workers | 全球边缘节点、延迟极低、每日 10 万次免费调用 |
| **题库存储** | Cloudflare KV | 按日期存 Puzzle JSON，读取 O(1) |
| **用户快照存储** | Cloudflare R2 或 D1 | R2 存 JSON blob 极便宜；D1 (SQLite) 适合查询版本号 |
| **认证** | Ed25519 签名自实现 | 零第三方依赖，配合设备密钥 |
| **CDN** | Cloudflare Pages | 静态前端 + Workers 函数一体部署 |

**估算成本（万 DAU 规模）**：Cloudflare Workers + KV + R2 月费约 **\$5 - \$20 USD**，几乎零运维。

---

## 八、 隐私合规与 UI 呈现规范（LoongClan 全生态铁律）

- ✅ 服务器**不收集**手机号、邮箱、IP（可配置不记录日志）
- ✅ 用户可随时 **全量导出**、**彻底删除** 所有数据
- ✅ 设备密钥/口令私密凭据**永不直接明文暴露**，仅用于客户端本地 Hash 与认证
- ✅ **界面常驻区统一展示“用户昵称”**：顶栏、主菜单、排行榜、状态区严禁展示明文口令，一律展示用户昵称（`nickname`）
- ✅ **口令默认脱敏遮罩**：在账号凭据查看界面中，三维口令必须类似手机号脱敏显示（如 `loong.***.***` 或 `poet.***.dragon`），配有显隐切换（👁️）与一键安全复制
- ✅ **智能防窥输入**：导入或切换口令时，输入框默认采用密码遮罩（`type="password"`）并支持智能粘贴识别
- ✅ 社区战报与排行榜**完全匿名/昵称化**，不关联或暴露任何原始口令
- ✅ 数据快照结构对服务器**语义透明**（服务器不解析 payload），支持未来做端对端加密
