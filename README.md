# MoneyKeeper Frontend / 钱管家前端

[![CI](https://img.shields.io/github/actions/workflow/status/loqiu/moneykeeper-vue/node.js.yml?branch=main&label=CI)](https://github.com/loqiu/moneykeeper-vue/actions/workflows/node.js.yml)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Pinia](https://img.shields.io/badge/Pinia-2-f7c942?logo=pinia&logoColor=black)](https://pinia.vuejs.org/)
[![Vue Router](https://img.shields.io/badge/Vue_Router-4-334155)](https://router.vuejs.org/)
[![Element Plus](https://img.shields.io/badge/Element_Plus-2-409eff)](https://element-plus.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-f38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![License](https://img.shields.io/github/license/loqiu/moneykeeper-vue)](./LICENSE)

MoneyKeeper Frontend is a Vue 3 single-page application for ledger-based personal finance workflows, including record keeping, budgets, search, notifications, export jobs, statistics, collaboration, and billing.

钱管家前端是一个基于 Vue 3 的账本型个人财务单页应用，当前已经覆盖记账、预算、搜索、通知、导出任务、统计分析、协作成员与订阅页面。

## What's New / 最新功能

- Added a ledger-scoped platform workspace instead of keeping every feature inside one accounting page.  
  新增了账本维度的平台工作台，不再把所有功能都塞进单一记账页。
- Added real pages for budgets, notifications, export jobs, statistics, search, and ledger members.  
  新增了预算、通知中心、导出任务、统计分析、记录搜索和账本成员等真实页面。
- Introduced ledger context state and platform navigation so pages work around the current ledger.  
  引入账本上下文状态和平台导航，让页面都围绕当前账本运行。
- Connected SSE notifications into a visible notification center instead of toast-only feedback.  
  将 SSE 实时通知接入通知中心，不再只靠 toast 提示。
- Updated budget API handling to support the backend's raw ledger budget responses.  
  修正了预算接口解析，兼容后端账本预算接口返回的裸数组 / 裸 DTO。

## Product Scope / 产品范围

### Current user-facing areas / 当前用户侧功能

- Record accounting dashboard and quick entry / 记账主页与快速录入
- Ledger center and current-ledger context / 账本中心与当前账本上下文
- Category management / 分类管理
- Budget workspace with rules / 预算中心与阈值规则
- Search and filtering / 搜索与高级筛选
- Notification center with SSE updates / SSE 驱动的通知中心
- Export jobs and download flow / 导出任务与下载流程
- Statistics and chart views / 统计与图表分析
- Ledger members and invites / 账本成员与邀请协作
- Login, Google sign-in, billing, and subscription flow / 登录、Google 登录、支付与订阅流程

## Route Map / 页面地图

| Route | Page | Purpose |
| --- | --- | --- |
| `/accounting` | Accounting Dashboard / 记账主页 | Quick record entry, record list, charts, dashboard summary |
| `/ledgers` | Ledger Center / 账本中心 | Ledger list, context switching, ledger overview |
| `/ledgers/:ledgerId/members` | Ledger Members / 账本成员 | Members, invites, invite acceptance |
| `/categories` | Categories / 分类管理 | Ledger category list and maintenance |
| `/budgets` | Budgets / 预算中心 | Monthly budgets, thresholds, alerts |
| `/statistics` | Statistics / 统计分析 | Period summary, trend buckets, category mix |
| `/search` | Search / 记录搜索 | Keyword search and advanced filters |
| `/exports` | Export Jobs / 导出任务 | Create export jobs, poll status, download |
| `/notifications` | Notification Center / 通知中心 | Read, filter, and manage notification history |
| `/billing` | Billing / 订阅与支付 | Subscription status and Stripe flow |

## Tech Stack / 技术栈

- Vue 3
- Pinia
- Vue Router 4
- Element Plus
- Axios
- ECharts + `vue-echarts`
- Tailwind CSS + Sass
- Vue CLI
- Cloudflare Workers static assets
- GitHub Actions + Docker build pipeline

## Repository Layout / 仓库结构

```text
moneykeeper-vue/
|-- public/                  # Static public assets / 静态资源
|-- src/
|   |-- api/                # API modules, response parsing, mappers / API 模块、响应解析、字段映射
|   |-- assets/             # Images and styles / 图片与样式
|   |-- components/         # Reusable UI components / 可复用组件
|   |-- composables/        # Composition API feature logic / 组合式逻辑
|   |-- constants/          # Shared constants and copy / 常量与共享文案
|   |-- router/             # Route definitions and guards / 路由定义与守卫
|   |-- stores/             # Pinia stores / Pinia 状态层
|   |-- utils/              # Shared runtime helpers / 工具与运行时配置
|   |-- views/              # Page-level components / 页面组件
|   |-- App.vue             # Root component / 根组件
|   `-- main.js             # App bootstrap / 应用入口
|-- .github/workflows/      # CI workflows / CI 工作流
|-- Dockerfile              # Docker image build / Docker 镜像构建
|-- nginx.conf              # Container nginx config / 容器 nginx 配置
|-- wrangler.jsonc          # Cloudflare Workers config / Cloudflare Workers 配置
|-- PROJECT_DETAILS.md      # Frontend/backend coordination notes / 前后端联调说明
`-- FRONTEND_EXPANSION_PLAN.md # Platform expansion notes / 平台扩展方案
```

## Getting Started / 快速开始

### Prerequisites / 环境要求

- Node.js 18+
- npm 9+

### Install dependencies / 安装依赖

```bash
npm ci
```

### Start local development / 启动本地开发

```bash
npm run serve
```

### Lint / 代码检查

```bash
npm run lint
```

### Build / 生产构建

```bash
npm run build
```

## Scripts / 常用脚本

- `npm run serve`: start the local Vue CLI dev server / 启动本地开发服务
- `npm run lint`: run ESLint / 运行 ESLint
- `npm run build`: build the production bundle / 构建生产包
- `npm run test`: currently maps to lint / 当前等同于 lint
- `npm run preview`: build and run local Wrangler preview / 构建并运行 Wrangler 本地预览
- `npm run deploy`: build and run Wrangler deploy / 构建并执行 Wrangler 部署

## Runtime Configuration / 运行时配置

### Development / 开发环境

- `VUE_APP_API_URL=/api`
- `VUE_APP_SSE_BASE_URL=/api`

### Production / 生产环境

- REST API base: `https://api.money-keeper.com/api`
- SSE base: `https://api.money-keeper.com/api`
- Web origin: `https://money-keeper.com`

The current runtime helpers are implemented in `src/utils/runtimeConfig.js`.  
当前运行时地址逻辑集中在 `src/utils/runtimeConfig.js`。

## Deployment / 部署说明

### Cloudflare Workers / Cloudflare Workers

This project is currently hosted as Cloudflare Workers static assets with SPA fallback defined in `wrangler.jsonc`.

当前项目使用 Cloudflare Workers 静态资源托管，SPA 路由回退配置定义在 `wrangler.jsonc`。

Important notes / 重要说明：

- Git-based Cloudflare builds do not require manual local deployment for normal releases.  
  如果 Cloudflare 直接从 Git 构建，日常发布不需要本地手工部署。
- Manual `wrangler deploy` requires `CLOUDFLARE_API_TOKEN`.  
  手动执行 `wrangler deploy` 需要 `CLOUDFLARE_API_TOKEN`。

### Docker image pipeline / Docker 镜像链路

GitHub Actions also builds and pushes a Docker image based on:

GitHub Actions 同时会基于以下文件构建并推送 Docker 镜像：

- `Dockerfile`
- `nginx.conf`
- `.dockerignore`

This Docker pipeline publishes an image to Docker Hub; it does not directly deploy to the physical server.  
这条 Docker 流水线会把镜像发布到 Docker Hub，不会直接部署到物理机。

## Backend Contract Notes / 后端接口联调说明

Before changing frontend API integration, review the backend contract first:

修改前端接口逻辑前，请先阅读后端接口文档：

- `C:\WorkSpace\Java\moneykeeper-back\FRONTEND_API.md`

Additional local coordination notes:

补充本地联调说明：

- [PROJECT_DETAILS.md](./PROJECT_DETAILS.md)

## Development Workflow / 开发流程建议

- Use `codex/test` or another working branch for feature work.  
  日常功能开发优先使用 `codex/test` 或其它工作分支。
- Merge into `main` only after verification.  
  验证通过后再合并到 `main`。
- Let Cloudflare build from `main` for production releases.  
  生产环境由 Cloudflare 从 `main` 自动构建发布。

## Current Platform Delivery Status / 当前平台化交付状态

Completed pages and modules in the latest platform handoff:

本轮平台化交付已经完成的页面与模块：

- Ledger center / 账本中心
- Categories page / 分类管理
- Budgets page / 预算中心
- Notifications page / 通知中心
- Export jobs page / 导出任务
- Statistics page / 统计分析
- Search page / 记录搜索
- Ledger members page / 账本成员与邀请
- Shared platform state cards / 统一平台状态卡
- Ledger-scoped navigation and stores / 账本上下文导航与状态层

## Future Work / 后续方向

- i18n infrastructure / 国际化 i18n
- Better frontend error-code mapping / 更统一的前端错误码映射
- Bundle size optimization / 包体积优化
- Deeper permission and empty-state polish / 更细的权限态和空态打磨

## License / 许可证

This project is distributed under the MIT License.  
本项目采用 MIT 许可证。
