**中文** | [English](./README.md)

# MoneyKeeper Vue

![Vue](https://img.shields.io/badge/Vue-3.x-42b883?style=flat-square)
![Element Plus](https://img.shields.io/badge/UI-Element%20Plus-409eff?style=flat-square)
![Pinia](https://img.shields.io/badge/State-Pinia-f7c948?style=flat-square)
![Cloudflare Workers](https://img.shields.io/badge/Deploy-Cloudflare%20Workers-f38020?style=flat-square)
![Docker](https://img.shields.io/badge/Docker-enabled-2496ed?style=flat-square)
![状态](https://img.shields.io/badge/状态-持续开发中-2ea44f?style=flat-square)

MoneyKeeper Vue 是 MoneyKeeper 平台的前端 Web 项目。它最初是个人记账应用，现在已经扩展为一个以账本为上下文的平台工作台，覆盖记录、分类、预算、通知、导出、搜索、协作和订阅能力。

## 最新功能

- 基于 ledger 的平台工作台与导航
- 预算、通知、导出任务、统计、搜索、成员协作等独立页面
- 支持 Cloudflare Workers 的 SPA 路由部署
- `main` 分支自动构建并推送 Docker 镜像
- Stripe 支付链路已经切到后端驱动的 checkout session

## 功能概览

### 记账核心

- 收入 / 支出记录
- 分类筛选与汇总
- 记账首页总览
- 记录与分类管理

### 账本工作台

- 账本列表与当前账本上下文
- 账本维度分类管理
- 账本预算与预算规则
- 账本统计与记录搜索
- 成员与邀请协作

### 平台能力

- 通知中心与未读状态
- 导出任务跟踪与下载
- Stripe 订阅与账单页面
- SSE 实时状态更新

## 技术栈

- Vue 3
- Vue Router
- Pinia
- Element Plus
- Axios
- ECharts / Vue-ECharts
- Tailwind CSS
- Vue CLI

## 页面路由

- `/accounting` — 记账主页面
- `/ledgers` — 账本中心
- `/ledgers/:ledgerId/members` — 成员与邀请
- `/categories` — 分类管理
- `/budgets` — 预算管理
- `/statistics` — 统计分析
- `/search` — 记录搜索
- `/exports` — 导出任务
- `/notifications` — 通知中心
- `/billing` — 订阅与支付
- `/login` — 登录页

## 本地开发

### 环境要求

- Node.js 18+
- npm 9+

### 安装依赖

```bash
npm install
```

### 本地启动

```bash
npm run serve
```

### 代码检查

```bash
npm run lint
```

### 生产构建

```bash
npm run build
```

## 运行时配置

生产环境下，REST API 和 SSE 使用独立的运行时地址配置。

### 开发环境

- REST API：`/api`
- SSE：`/api`

### 生产环境

- REST API：通过运行时 / 环境变量配置
- SSE：通过运行时 / 环境变量配置
- Cloudflare Workers 负责 SPA 路由回退

相关文件：

- [`PROJECT_DETAILS.md`](./PROJECT_DETAILS.md)
- [`wrangler.jsonc`](./wrangler.jsonc)

## API 协议说明

- 前端内部统一使用 `income` / `expense`
- 记录和分类发给后端时也应该使用 `income` / `expense`
- 后端文档更新后，先查看 `C:\WorkSpace\Java\moneykeeper-back\FRONTEND_API.md`，再修改前端的请求与响应映射

## CI/CD

GitHub Actions 会在 `main` 分支上：

- 安装依赖
- 执行 lint
- 执行生产构建
- 构建并推送 Docker 镜像

相关文件：

- [`.github/workflows/node.js.yml`](./.github/workflows/node.js.yml)
- [`Dockerfile`](./Dockerfile)
- [`nginx.conf`](./nginx.conf)

## 目录结构

```text
src/
  api/
    mappers/
    modules/
  components/
  composables/
  constants/
  router/
  stores/
  utils/
  views/
```

## 当前重点

- 继续打磨 ledger 工作台体验
- 保持前端映射与后端 handoff 文档一致
- 持续清理旧文案与编码问题
- 为后续 i18n 做准备

