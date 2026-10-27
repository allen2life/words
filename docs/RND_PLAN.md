# 《诗藏》&《文脉》研发计划 (R&D PLAN)

**项目**：words.loongclan.xyz · 国风日课解谜矩阵
**文档版本**：v1.0.0
**更新日期**：2026-10-27
**状态**：发布中 (Release in progress)

---

## 一、 项目定位

国风版 NYT Games 文创矩阵，含两个每日解谜产品：

| 产品 | 原型 | 玩法 | 容错 |
|------|------|------|------|
| 《诗藏》Poetic Eye | Wordle | 千古名句挖空一字，猜"诗眼" | 6 次推敲 |
| 《文脉》Literary Pulse | Connections | 16 词条，4 个一组归并四脉 | 4 次耗香 |

产品哲学：**以古文化为骨，以解谜为形，由谜入旨**。

---

## 二、 平台铁律遵循清单

本产品隶属 loongclan.xyz 生态，**强制遵循**平台六条铁律：

| # | 铁律 | 落实位置 | 状态 |
|---|------|----------|------|
| 1 | 纯单机可玩 / 离线优先 | 全静态前端，题库打包内置，断网可玩 | ✅ |
| 2 | 三维口令零明文交互 | `LoongIdentity.ts` 双哈希派生，口令不出机 | ✅ |
| 3 | 用户数据主权 (Obsidian 范式) | 快照上传/下载由用户主动触发，支持导出与注销 | ✅ |
| 4 | 通用同步 API | 接入 `api.loongclan.xyz`，appId=`words` | ✅ |
| 5 | 通用排行榜 API | 日榜 / 总榜接入 | ✅ |
| 6 | UI 英语默认 (English-First) | 默认 `en`，两游戏+导航+全部弹窗已 i18n（186 键/语言） | ✅ |

---

## 三、 技术架构

```
┌──────────────────────────────────────────────────────┐
│  Cloudflare Pages · shizangwenmai                    │
│  words.loongclan.xyz                                 │
│  ┌────────────────────────────────────────────────┐  │
│  │ React 19 + TypeScript + Vite 8 + Tailwind 4    │  │
│  │  localStorage（本地真相源）                      │  │
│  └───────────────────┬────────────────────────────┘  │
└──────────────────────┼───────────────────────────────┘
                       │ 用户主动触发
                       ▼
┌──────────────────────────────────────────────────────┐
│  Cloudflare Workers · api.loongclan.xyz              │
│  Hono + D1 (loongclan_db)                            │
│   /api/v1/sync/*   /api/v1/rank/*                    │
└──────────────────────────────────────────────────────┘
```

**关键决策：不实现独立后端**。复用 loongclan 通用平台，仅通过 `appId=words` 做多租户隔离。理由：
- 平台已承载 xiangqi、recite 等产品，运行稳定
- 万级 DAU 成本 $0/月，符合生态目标
- 避免重复造轮子，维护面最小

---

## 四、 当前技术债与风险

| # | 问题 | 影响 | 优先级 | 处理 |
|---|------|------|--------|------|
| 1 | `package.json` 把 win32 rolldown binding 写进 dependencies，Linux/CI 构建失败 | 阻断发布 | P0 | ✅ 已移除 |
| 2 | `docs/api_requirements.md` 描述的 API 契约（Ed25519 / PUT snapshot）与实际平台（三维口令 / POST upload）不一致 | 误导后续开发 | P1 | 待修订 |
| 3 | 组件硬编码中文（已抽取 75 键，双语 186 键对齐） | 违反平台规范 | P1 | ✅ 已解决 |
| 4 | 题库库存 18 首 / 8 期，撑不住每日轮换 | 留存受损 | P1 | 🚧 诗藏已扩至 30 首，文脉待补 |
| 5 | `qa-runner.mjs` 硬编码 Windows 路径与中文选择器 | 本机与 CI 不可用 | P2 | ✅ 已由 smoke+e2e-ui 取代 |
| 6 | 平台 `/sync/meta` 只认 query 中的 syncToken | 同步流程 401 断链 | P1 | ✅ 客户端已兼容 |
| 7 | 平台排行榜无负分下限 | 可刷负分 | P2 | ✅ 客户端已拦截，建议平台补 |

---

## 五、 研发里程碑

### M0 · 构建可复现（已完成）
- [x] 修复 rolldown 平台绑定依赖
- [x] Linux 全新安装 + `npm run build` 通过
- [x] 冒烟测试：0 console error / 0 page error / 0 failed request

### M1 · 契约对齐（已完成）
- [x] 修订 `docs/api_requirements.md` 匹配真实平台 API（v2.0.0）
- [x] QA runner 跨平台化，替换为 `smoke.mjs` + `e2e-ui.mjs` + `lib/chrome.mjs`

### M2 · 平台规范合规（已完成）
- [x] 全量 i18n 抽取，英语默认（诗藏 39 键 + 文脉/导航/弹窗 36 键）
- [x] 口令输入三独立框 + 脱敏 + 掩码复核
- [x] 顶栏统一展示昵称而非口令

### M3 · 内容扩充（进行中）
- [x] 《诗藏》18 → 30 首（新增 12 首含登鹳雀楼/春望/江雪等）
- [x] 内容校验器 `validate-content.mjs` 接入 CI
- [ ] 《诗藏》继续扩充至 60+
- [ ] 《文脉》8 → 30+ 期

### M4 · 端到端联调（已完成）
- [x] 同步上传/下载/元信息/注销实测（`e2e-api.mjs` 11 项全过）
- [x] 排行榜提交/查询实测
- [x] 发现并修复 `/sync/meta` 鉴权传参缺陷、排行榜负分缺口

### M5 · 发布（已完成）
- [x] Cloudflare Pages 部署（项目 `shizangwenmai`）
- [x] `words.loongclan.xyz` 域名绑定与 TLS
- [x] GitHub `allen2life/words` + Actions 三段流水线全绿
- [x] 线上冒烟 + UI 回归 10/10 通过

---

## 六、 测试策略

| 层级 | 手段 | 门禁 |
|------|------|------|
| 类型 | `tsc -b` | 零错误 |
| 静态 | `oxlint` | 零 error |
| 构建 | `vite build` | 成功产物 |
| 内容 | `validate-content.mjs` | 零不变量违规 |
| 冒烟 | Playwright 首页加载 | 0 console/page error |
| 回归 | Playwright 全流程自玩 (`e2e-ui.mjs`) | 10/10 |
| 接口 | `e2e-api.mjs` 对线上 API | 11/11 |
| 线上 | 部署后域名访问 | 200 + 无错误 |

---

## 七、 质量红线

1. 任何提交不得引入 console error / page error
2. 口令明文**永不**出现在网络请求体中
3. 断网状态下核心玩法必须可用
4. 界面常驻区**永不**展示明文口令，只展示昵称
