# 项目状态总览 (STATUS)

**项目**：words.loongclan.xyz — 《诗藏》&《文脉》
**最后更新**：2026-10-27
**状态**：**已上线，自动运行中**

---

## 一、 一句话结论

《诗藏》&《文脉》已作为 loongclan.xyz 生态的正式产品上线，具备完整的
**研发 → 测试 → 自动部署 → 线上校验** 闭环，运营所需的题库、排行榜、云同步、
离线可玩、多语言均已就绪。**当前处于可无人值守自动运行状态。**

---

## 二、 线上事实（可验证）

| 项 | 值 | 验证方式 |
|----|-----|----------|
| 生产地址 | <https://words.loongclan.xyz> | `curl -I` → 200 |
| 托管 | Cloudflare Pages 项目 `shizangwenmai` | `wrangler pages project list` |
| DNS | CNAME `words` → `shizangwenmai.pages.dev`（proxied） | Cloudflare API |
| 代码仓库 | <https://github.com/allen2life/words> | `gh repo view` |
| CI/CD | GitHub Actions，4 个 job | 最近 4 次连续 success |
| 后端 | `https://api.loongclan.xyz`，`appId=words` | E2E 11/11 |

---

## 三、 质量门禁（全绿）

每次推送到 `main` 自动执行：

```
Job 1  build-and-test
       ├─ Oxlint          → 0 warnings / 0 errors
       ├─ 内容校验         → 题库不变量全过
       ├─ tsc -b + build  → 类型零错误，产物正常
       ├─ 冒烟 smoke      → 0 console/page error, harness ready
       ├─ 通关 e2e-ui     → 10/10（真实操作一局）
       └─ 离线 offline    → 7/7（断网仍可启动并推敲）

Job 2  deploy-pages          → wrangler pages deploy（先校验 secrets）

Job 3  verify-production     → HTTP 200 + 线上 bundle 与本次构建一致

Job 4  browser-smoke-prod    → Playwright 对生产环境实跑
```

**关键设计**：Job 3 会比对「线上引用的哈希 bundle」与「本次构建产物」，
可捕获「部署成功但 CDN 仍旧版」这类静默失败。

---

## 四、 能力清单

| 能力 | 状态 | 说明 |
|------|------|------|
| 《诗藏》玩法 | ✅ | Wordle 式炼字，6 次机会，三重渐进提示 + 赏析 |
| 《文脉》玩法 | ✅ | Connections 式 16 词归四脉，4 次容错 |
| 每日出题 | ✅ | 东八区 00:00 切换，确定性种子，全网同题 |
| 题库库存 | ✅ | 诗藏 30 天 / 文脉 22 天 |
| 离线可玩 | ✅ | SW 预缓存哈希产物，断网可启动并完成推敲 |
| 英语优先 | ✅ | 默认 `en`，一键切 `zh-Hans`，双语 186+ 键对齐 |
| 三维口令身份 | ✅ | SHA-256 双哈希，口令从不出机 |
| 云同步 | ✅ | 上传/下载/元信息/导出/注销，E2E 验证 |
| 排行榜 | ✅ | 日榜/总榜提交与查询 |
| 成就体系 | ✅ | 9 阶科举功名 |
| PWA 安装 | ✅ | manifest + SW，可加桌面 |
| 双语界面 | ✅ | 诗藏/文脉/导航/弹窗全覆盖 |

---

## 五、 本轮修复的真实缺陷

以下是本轮工作中**实际发现并修复**的问题，均非推测：

| # | 缺陷 | 影响 | 发现方式 |
|---|------|------|----------|
| 1 | `package.json` 硬编码 win32 rolldown binding | Linux/CI 无法构建 | 本地构建失败 |
| 2 | CI `if: env.CLOUDFLARE_API_TOKEN != ''` 恒为 false | 部署被静默跳过 | 读 workflow |
| 3 | CI `project-name=loongclan-words` 与实际项目不符 | 部署到不存在的项目 | 读 workflow |
| 4 | `/sync/meta` 只在 body 传 token，平台只认 query | 同步流程 401 断链 | E2E 实测 |
| 5 | 平台排行榜无负分下限 | 可刷负分上榜 | E2E 实测 |
| 6 | sz-008 `targetIndex` 指向「拍」而非「岸」 | 题目无解 | 内容校验器 |
| 7 | 分享卡用 `replace()` 挖空首个匹配位 | 目标字重复时遮错位置 | 内容校验器 |
| 8 | SW 未缓存哈希 bundle | **断网后应用白屏，违反铁律 1** | 离线验证 |
| 9 | `verify-production` 未下载产物 | 校验恒失败 | CI 报警 |
| 10 | 硬编码 Windows Chrome 路径 + 中文选择器 | QA 脚本在 CI/英文环境失效 | 代码审查 |
| 11 | 大量 UI 文案硬编码中文 | 违反英语默认铁律 | 截图审查 |

---

## 六、 遗留与建议（非阻塞）

| 项 | 说明 | 建议 |
|----|------|------|
| 平台 `/sync/meta` 只认 query token | 已在客户端兼容并注释 | 建议平台侧改为同时接受 body |
| 平台排行榜无负分下限 | 已在客户端拦截 | 建议平台补 `score >= 0` 校验 |
| 4 个词条跨期重复 | 念奴娇/沁园春/水调歌头/王安石，属固定篇目 | 可接受，校验器已告警 |
| 答案内置于 bundle | 技术用户可查看 | 权衡说明见 `api_requirements.md` 第六节 |
| 题库库存 30/22 天 | 低于运营计划 120 天目标 | 按月补题，见运营计划 |

---

## 七、 文档索引

| 文档 | 用途 |
|------|------|
| [README.md](../README.md) | 项目总览与快速上手 |
| [RND_PLAN.md](RND_PLAN.md) | 研发计划与架构 |
| [OPERATIONS_PLAN.md](OPERATIONS_PLAN.md) | 运营计划与内容节奏 |
| [RELEASE_PLAN.md](RELEASE_PLAN.md) | 发布流程与回滚 |
| [api_requirements.md](api_requirements.md) | 服务端真实契约 |
