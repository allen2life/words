# 诗藏与文脉 (Words · words.loongclan.xyz)

> **龙族 (LoongClan · loongclan.xyz) 旗下核心国风日课解谜矩阵**  
> *Classical Chinese Wordle & Connections · 传承华夏文脉，东方轻解谜*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![PWA Ready](https://img.shields.io/badge/PWA-Offline%20First-orange.svg)]()
[![LoongClan Ecosystem](https://img.shields.io/badge/Ecosystem-loongclan.xyz-red.svg)](https://loongclan.xyz)

---

## 📖 项目简介 (Introduction)

《诗藏与文脉》是龙族文化矩阵下的核心轻解谜 Web 应用，由两大沉浸式玩法组成：

1. **《诗藏》(Poetic Eye · 诗眼推敲)**：
   - 东方诗词版 Wordle。玩家面对千古名句（涵盖唐、宋、先秦、汉魏），在六次机会内推敲出被隐去的千古“诗眼”关键字。
   - 包含平水韵声调、部首偏旁、意境修辞三重渐进式“墨韵提示”，通关后呈现深度全诗赏析与诗人小传。
2. **《文脉》(Literary Pulse · 典故文脉)**：
   - 华夏文化版 Connections。玩家从 16 个打乱的文化词条方块中，探寻四类内在文脉关联（四字一组），层层归纳论证。
   - 分为四重难度色阶：
     - 🟨 **蒙学入门 (Yellow)**：基础文学常识与传统四艺
     - 🟩 **诗文通识 (Green)**：名篇名句与边塞山川
     - 🟦 **古文学高阶 (Blue)**：考据典籍与音律技法
     - 🟪 **文脉宗师 (Purple)**：诸子百家、上古图腾与深邃哲理

---

## 🏛️ 龙族平台核心铁律遵循 (LoongClan Standards)

本项目 100% 恪守龙族生态（loongclan.xyz）六大开发运营铁律：

1. ⚡ **纯单机可玩 / 离线优先 (Local-First)**：
   - 无网络也能流畅运行，核心题库与确定性日历种子（`dailySeeder.ts`）完全内置。
   - 借助 Service Worker 与 Web App Manifest，支持 iOS/Android 添加至手机桌面全屏离线体验。
2. 🔑 **三维口令与隐私保密 (LoongPass · SPEC_IDENTITY)**：
   - `part1.part2.part3` 无感识别，**零注册、免邮箱、免手机号、免密码**。
   - 客户端采用标准 UTF-8 字节流双哈希派生（`UserHash` 公开标识 + `SyncToken` 私密令牌），口令明文绝对不上传。
   - 常驻界面严格只显示“用户昵称”，凭据查看界面提供防窥遮罩（如 `loong.***.***`）。
3. 🛡️ **数据主权归用户 (Obsidian 范式 · SPEC_SYNC)**：
   - 本地 `localStorage` 为唯一真实真相源，支持手动备份到云端、多设备拉取、一键全量导出与彻底注销。
4. 🏆 **通用全网排行榜 (SPEC_RANK)**：
   - 每日零点自动更新全网战报，支持防刷与匿名排行榜。
5. 🌍 **全球化英语优先交互 (Global English-First UI · SPEC_I18N)**：
   - 默认交互语言统一为英语（English Default），并提供一键无缝切换至简体中文（zh-Hans）。

---

## 🛠️ 技术选型 (Tech Stack)

- **前端框架**：React 19 + TypeScript (Strict)
- **工程构建**：Vite 8 + `@tailwindcss/vite` (Tailwind CSS v4)
- **代码质检**：Oxlint (Rust 级极速代码规约检查，0 错误 0 告警)
- **动效与视觉**：HTML5 Canvas 水墨微波粒子系统 (`AmbientCanvas.tsx`) + `canvas-confetti`
- **图标系统**：Lucide React
- **自动化测试**：Playwright Headless QA Runner (`qa-runner.mjs`)，自带 60FPS 帧率检测与自动化实机录屏证明
- **边缘托管**：Cloudflare Pages / GitHub Pages，支持自动化 CI/CD

---

## 🚀 本地开发与验证 (Local Development)

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```
访问 `http://localhost:5173/` 即可开始体验。

### 3. 代码规约与质量检查
```bash
npm run lint
```

### 4. 生产环境编译构建
```bash
npm run build
```
构件将输出至 `dist/` 目录。

### 5. 自动化无头自测与实机录屏 (Autonomous QA)
```bash
npx vite preview --port 5173 &
node scripts/qa-runner.mjs --url http://localhost:5173 --duration 12
```
测试完成后将自动在 `proof-records/` 下输出自动化录屏 MP4 与 `qa-report.json`。

---

## 🌐 线上发布与部署 (Deployment)

### 生产域名
- **应用主域**：`https://words.loongclan.xyz/`
- **《诗藏》直达**：`https://words.loongclan.xyz/?mode=shizang`
- **《文脉》直达**：`https://words.loongclan.xyz/?mode=wenmai`
- **龙族官网总站**：`https://loongclan.xyz/`

### 自动化发布流程 (GitHub Actions)
项目在 `.github/workflows/deploy.yml` 预置了自动化发布流水线：
1. 推送代码至 `main` 分支；
2. 自动运行 `npm run lint` 和 `npm run build`；
3. 自动启动 Playwright 无头浏览器进行端到端自动化测试与控制台报错检测；
4. 自动部署至 Cloudflare Pages 与 GitHub Pages。

---

## 📜 许可证 (License)

本项目基于 [MIT 许可证](LICENSE) 开源。
