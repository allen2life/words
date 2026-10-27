# 《诗藏》&《文脉》发布计划 (RELEASE PLAN)

**项目**：words.loongclan.xyz
**文档版本**：v1.0.0
**更新日期**：2026-10-27
**当前状态**：**已上线（v1.0.0 生产可用）**

---

## 一、 发布架构

```
开发者 git push origin main
        │
        ▼
GitHub Actions (.github/workflows/deploy.yml)
        │
        ├─ Job 1: build-and-test
        │    npm ci → oxlint → tsc -b → vite build
        │    → vite preview → Playwright 冒烟
        │    → 上传 dist 产物
        │
        ├─ Job 2: deploy-pages
        │    校验 secrets 存在（缺失则硬失败，不静默跳过）
        │    → wrangler pages deploy dist --project-name=shizangwenmai
        │
        └─ Job 3: verify-production
             轮询 https://words.loongclan.xyz 直到 200
             → Playwright 对生产环境冒烟
```

**任一环节失败，流水线红，不产生"部署了但没生效"的静默状态。**

---

## 二、 环境清单

| 项 | 值 |
|----|-----|
| 生产域名 | `https://words.loongclan.xyz` |
| Pages 项目 | `shizangwenmai` |
| Pages 预览域 | `https://shizangwenmai.pages.dev` |
| Cloudflare Account | `1450d0db88e9c0f59a0138095f9704ff` |
| DNS | CNAME `words` → `shizangwenmai.pages.dev`（proxied） |
| GitHub 仓库 | `https://github.com/allen2life/words` |
| API 后端 | `https://api.loongclan.xyz`（共用平台，appId=`words`） |

> ⚠️ 注意：Pages 项目名是 `shizangwenmai` 而非 `words`，因为 `words.pages.dev` 已被第三方项目占用。
> 所有部署命令与 CI 必须使用 `shizangwenmai`。

---

## 三、 发布前检查清单（每版必过）

### 3.1 质量门禁

- [ ] `npm run lint` 零 error
- [ ] `npm run build` 成功（含 `tsc -b` 类型检查）
- [ ] 本地 `node scripts/smoke.mjs` 通过（0 console error / 0 page error / harness ready）
- [ ] CI 全绿（三个 job 全 success）

### 3.2 平台铁律合规

- [ ] 默认语言为英语，可切换中文
- [ ] 界面常驻区只显示昵称，无明文口令
- [ ] 口令输入为三个独立输入框 + `type="password"`
- [ ] 凭据弹窗默认脱敏（`LoongIdentity.mask`）
- [ ] 断网状态下核心玩法可玩（DevTools → Offline 验证）

### 3.3 内容校验（文化类产品特有）

- [ ] 新增诗词原文无错字
- [ ] `targetIndex` 与 `targetChar` 对应正确
- [ ] 三重线索（音韵/部首/意象）与目标字自洽
- [ ] 赏析、作者小传无史实错误
- [ ] 《文脉》每组 4 词确属同一维度，无跨组歧义

### 3.4 题库健康度

- [ ] 《诗藏》剩余可出题天数 ≥ 30
- [ ] 《文脉》剩余可出题天数 ≥ 30

---

## 四、 发布流程

### 4.1 标准发布（常规迭代）

```bash
cd /data/sites/words
# 1. 本地验证
npm ci --include=dev
npm run lint && npm run build
node scripts/smoke.mjs --url http://127.0.0.1:4173   # 需先起 vite preview

# 2. 提交推送（触发 CI 自动部署）
git add -A
git commit -m "feat: ..."
git push origin main

# 3. 观察流水线
gh run watch --repo allen2life/words
```

### 4.2 手动应急发布

CI 故障时的兜底路径：

```bash
set -a && . ~/.profile && set +a
export WRANGLER_HOME=/data/sites/words/.wrangler-config
export XDG_CONFIG_HOME=/data/sites/words/.wrangler-config
./node_modules/.bin/wrangler pages deploy dist \
  --project-name=shizangwenmai --branch=main --commit-dirty=true
```

> 注意：本机 npm 需 `--cache ./.npm-cache`（HOME 下缓存目录只读）；wrangler 需重定向 `WRANGLER_HOME`。

### 4.3 回滚

Cloudflare Pages 保留全部历史部署：

1. 控制台 → Pages → `shizangwenmai` → Deployments
2. 选择上一个正常版本 → **Rollback to this deployment**
3. 或命令行：`wrangler pages deployment list --project-name=shizangwenmai`

**回滚目标时效：5 分钟内恢复。**

---

## 五、 版本策略

采用语义化版本 `MAJOR.MINOR.PATCH`：

| 类型 | 触发条件 | 示例 |
|------|----------|------|
| MAJOR | 架构级变更（如题库迁服务端） | 2.0.0 |
| MINOR | 新功能（新玩法、新成就体系） | 1.1.0 |
| PATCH | 内容补充、文案修正、bug 修复 | 1.0.1 |

> 纯题库内容更新可走 PATCH，不必单独发版说明。

---

## 六、 上线里程碑记录

| 阶段 | 时间 | 结果 |
|------|------|------|
| 构建修复 | 2026-10-27 | 移除 win32-only rolldown 依赖，Linux 构建可复现 ✅ |
| Pages 项目创建 | 2026-10-27 | `shizangwenmai` ✅ |
| 首次部署 | 2026-10-27 | `https://faf51b06.shizangwenmai.pages.dev` ✅ |
| 域名绑定 | 2026-10-27 | `words.loongclan.xyz` CNAME + TLS ✅ |
| 生产验证 | 2026-10-27 | HTTP 200，无 console error ✅ |
| GitHub 仓库 | 2026-10-27 | `allen2life/words`，main 分支 ✅ |
| CI 密钥配置 | 2026-10-27 | `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` ✅ |
| **CI/CD 全绿** | 2026-10-27 | 构建→部署→生产验证三段全通过 ✅ |

---

## 七、 已知遗留与后续版本

| 项 | 影响 | 计划版本 |
|----|------|----------|
| 部分组件硬编码中文，未完全 i18n | 违反平台英语默认铁律 | v1.1.0 |
| 题库库存 18/40，不足 30 天韧性 | 内容运营风险 | 持续补充 |
| 答案内置于前端 bundle | 可被技术用户查看 | 评估中，见 API 文档第六节 |
| `qa-runner.mjs` 仍为 Windows 路径 | 仅本地可用，CI 已用 `smoke.mjs` 替代 | v1.1.0 清理 |

---

## 八、 监控与告警

| 监控项 | 手段 | 阈值 |
|--------|------|------|
| 站点可用性 | CI `verify-production` job（每次发布） | HTTP ≠ 200 即红 |
| 运行时错误 | Playwright 冒烟（console/page error） | 任意 error 即红 |
| API 可用性 | 平台 `/health` 端点 | 人工周检 |
| 题库库存 | 人工周检 | < 30 天预警 |

> 当前为 $0 成本架构，未接入付费 APM。若 DAU 超过 5000，建议增加
> Cloudflare Web Analytics（免费）+ 每日定时可用性探测。
