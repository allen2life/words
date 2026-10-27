# 诗藏与文脉 (Words · words.loongclan.xyz)

> **龙族 (LoongClan · loongclan.xyz) 旗下核心国风日课解谜矩阵**
> *Classical Chinese Wordle & Connections · 传承华夏文脉，东方轻解谜*

[![Build](https://img.shields.io/badge/CI-passing-brightgreen.svg)](https://github.com/allen2life/words/actions)
[![PWA](https://img.shields.io/badge/PWA-Offline%20First-orange.svg)]()
[![Ecosystem](https://img.shields.io/badge/Ecosystem-loongclan.xyz-red.svg)](https://loongclan.xyz)

**线上地址**：<https://words.loongclan.xyz>

---

## 📖 项目简介

两大沉浸式每日玩法：

| 产品 | 原型 | 玩法 | 容错 |
|------|------|------|------|
| **《诗藏》** Poetic Eye | Wordle | 千古名句挖空一字，六次内推敲出"诗眼" | 6 次 |
| **《文脉》** Literary Pulse | Connections | 16 个文化词条，4 个一组归并四脉 | 4 次 |

产品哲学：**以古文化为骨，以解谜为形，由谜入悟**。

### 《诗藏》特色

三重渐进式"墨韵提示"（随尝试次数逐重解锁）：

1. **音韵** — 平仄归属
2. **部首** — 偏旁与字义关联
3. **意象** — 修辞手法与画面感

通关后呈现全诗赏析与诗人小传。**这是相对 Wordle 的核心差异化价值：猜中只是开始，读懂才是目的。**

难度四阶：🟨 蒙学入门 / 🟩 诗文通识 / 🟦 古文学高阶 / 🟪 文脉宗师

---

## 🏛️ 平台铁律遵循

| # | 铁律 | 落实 |
|---|------|------|
| 1 | 纯单机可玩 / 离线优先 | 题库内置 + `dailySeeder.ts` 确定性种子；SW + Manifest 支持安装离线 |
| 2 | 三维口令 / 零明文 | `LoongIdentity.ts` 双哈希派生，口令不出机 |
| 3 | 数据主权（Obsidian 范式） | 本地为唯一真相源，手动上传/下载/导出/注销 |
| 4 | 通用同步 API | `api.loongclan.xyz`，`appId=words` |
| 5 | 通用排行榜 API | 日榜 / 总榜 |
| 6 | 英语优先 UI | 默认 `en`，一键切 `zh-Hans` |

---

## 🛠️ 技术栈

- **框架**：React 19 + TypeScript (Strict)
- **构建**：Vite 8 + Tailwind CSS v4 (`@tailwindcss/vite`)
- **质检**：Oxlint
- **动效**：Canvas 水墨粒子 (`AmbientCanvas`) + `canvas-confetti`
- **测试**：Playwright（`smoke.mjs` / `e2e-ui.mjs`）+ 内容校验 (`validate-content.mjs`)
- **托管**：Cloudflare Pages（`shizangwenmai` 项目）

---

## 🚀 本地开发

```bash
npm install --include=dev     # 本机 NODE_ENV=production 时必须带 --include=dev
npm run dev                   # http://localhost:5173
```

> 若 `npm` 报 `EROFS` 缓存错误（HOME 下缓存目录只读），加 `--cache ./.npm-cache`。

### 质量门禁

```bash
npm run lint       # Oxlint，零 error
npm run validate   # 题库内容不变量校验
npm run build      # tsc -b + vite build
npm test           # lint + validate + build + smoke 一条龙
```

### 测试脚本

| 脚本 | 作用 |
|------|------|
| `npm run smoke` | 首页加载 + `__GAME__` 探针，验证 0 console/page error |
| `npm run e2e:ui` | 模拟真实玩家通关一局，验证英语默认、字盘、提交、提示解锁、模式切换 |
| `npm run e2e:api` | 对线上 `api.loongclan.xyz` 做 11 项同步/排行榜断言 |

需先起预览服务：`npx vite preview --port 4173 --host 127.0.0.1`

```bash
npm run smoke -- --url http://127.0.0.1:4173
npm run e2e:ui -- --url https://words.loongclan.xyz --lang en
npm run e2e:api
```

---

## 🌐 部署

**自动化**：推送到 `main` → GitHub Actions 三阶段流水线

1. `build-and-test`：lint → 内容校验 → 构建 → 无头冒烟
2. `deploy-pages`：`wrangler pages deploy dist --project-name=shizangwenmai`
3. `verify-production`：轮询线上 200 + 对生产环境跑冒烟

**手动应急**：

```bash
set -a && . ~/.profile && set +a
export WRANGLER_HOME=/data/sites/words/.wrangler-config
export XDG_CONFIG_HOME=/data/sites/words/.wrangler-config
npx wrangler pages deploy dist --project-name=shizangwenmai --branch=main
```

> ⚠️ Pages 项目名为 `shizangwenmai`（`words.pages.dev` 已被第三方占用），
> 自定义域 `words.loongclan.xyz` 通过 CNAME → `shizangwenmai.pages.dev` 绑定。

---

## 📚 文档索引

| 文档 | 内容 |
|------|------|
| [docs/RND_PLAN.md](docs/RND_PLAN.md) | 研发计划：架构、技术债、里程碑 |
| [docs/OPERATIONS_PLAN.md](docs/OPERATIONS_PLAN.md) | 运营计划：内容节奏、增长、指标、风险 |
| [docs/RELEASE_PLAN.md](docs/RELEASE_PLAN.md) | 发布计划：发布检查单、流程、回滚、监控 |
| [docs/api_requirements.md](docs/api_requirements.md) | 服务端集成：三维口令、同步、排行榜真实契约 |

---

## 📜 许可证

MIT
