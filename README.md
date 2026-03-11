# MoneyKeeper Frontend / 钱管家前端

MoneyKeeper is a Vue 3 single-page application for personal finance tracking.
MoneyKeeper 是一个基于 Vue 3 的个人记账单页应用。

It currently supports record management, category management, charts, authentication, Google sign-in, billing pages, Excel export, and SSE-based realtime notifications.
当前项目已经支持记账记录管理、分类管理、图表分析、账号认证、Google 登录、订阅支付页面、Excel 导出，以及基于 SSE 的实时通知。

## Overview / 项目概览

### What This Project Does / 项目功能
- Track income and expense records / 记录收入与支出
- Manage custom categories, colors, and icons / 管理自定义分类、颜色与图标
- Visualize financial data with charts / 使用图表展示收支数据
- Authenticate users with username/password and Google sign-in / 支持用户名密码与 Google 登录
- Display billing and payment flows / 提供订阅与支付流程页面
- Export records to Excel / 导出记录为 Excel
- Receive realtime notifications through SSE / 通过 SSE 接收实时通知

### Current Runtime Architecture / 当前运行架构
- Frontend framework: Vue 3 / 前端框架：Vue 3
- State management: Pinia / 状态管理：Pinia
- Routing: Vue Router with history mode / 路由：Vue Router history 模式
- UI library: Element Plus / UI 组件库：Element Plus
- Charts: ECharts + vue-echarts / 图表：ECharts + vue-echarts
- HTTP client: Axios / HTTP 客户端：Axios
- Build tool: Vue CLI / 构建工具：Vue CLI
- Styling: Tailwind CSS + Sass / 样式：Tailwind CSS + Sass
- Production static hosting: Cloudflare Workers static assets / 生产静态托管：Cloudflare Workers 静态资源
- Secondary container path: Docker image built in GitHub Actions / 补充容器链路：GitHub Actions 构建 Docker 镜像

## Repository Layout / 仓库结构

```text
moneykeeper-vue/
|-- public/                  # Static public assets / 静态资源
|-- src/
|   |-- api/                # API modules, response parsing, mappers / API 模块、响应解析、字段映射
|   |-- assets/             # Images and styles / 图片与样式
|   |-- components/         # Reusable UI components / 可复用组件
|   |-- composables/        # Composition API feature logic / 组合式逻辑
|   |-- constants/          # Shared constants and legal texts / 常量与文案
|   |-- router/             # Route definitions and guards / 路由定义与守卫
|   |-- stores/             # Pinia stores / Pinia 状态
|   |-- utils/              # Shared utilities / 工具函数
|   |-- views/              # Page-level components / 页面组件
|   |-- App.vue             # Root component / 根组件
|   `-- main.js             # App bootstrap / 应用入口
|-- .github/workflows/      # CI workflows / CI 工作流
|-- Dockerfile              # Docker build for nginx image / Docker 镜像构建文件
|-- nginx.conf              # nginx config for container deployment / 容器 nginx 配置
|-- wrangler.jsonc          # Cloudflare Workers static asset config / Cloudflare Workers 配置
`-- PROJECT_DETAILS.md      # Frontend-to-backend coordination note / 前后端联调说明
```

## Getting Started / 快速开始

### Prerequisites / 环境要求
- Node.js 18 or newer / Node.js 18 或以上
- npm 9 or newer / npm 9 或以上

### Install / 安装依赖

```bash
npm ci
```

### Start Local Development / 本地开发

```bash
npm run serve
```

### Lint / 代码检查

```bash
npm run lint
```

### Build for Production / 生产构建

```bash
npm run build
```

## Useful Scripts / 常用脚本

- `npm run serve`: start the Vue CLI dev server / 启动本地开发服务
- `npm run build`: build the production bundle / 构建生产包
- `npm run lint`: run ESLint / 运行 ESLint
- `npm run test`: currently mapped to lint / 当前等同于 lint
- `npm run deploy`: build and run Wrangler deploy / 构建并执行 Wrangler 部署
- `npm run preview`: build and run Wrangler dev preview / 构建并执行 Wrangler 本地预览

## Environment Configuration / 环境变量说明

### Development / 开发环境
- `VUE_APP_API_URL=/api`
- `VUE_APP_SSE_BASE_URL=/api`

### Production / 生产环境
- REST API: `https://api.money-keeper.com/api`
- SSE base URL: `https://api.money-keeper.com/api`
- Cloudflare Worker config is defined in `wrangler.jsonc` / Cloudflare Worker 配置在 `wrangler.jsonc`

## Deployment Paths / 部署方式

### Cloudflare Workers (Current Static Hosting) / Cloudflare Workers（当前静态托管方式）
The project currently uses `wrangler.jsonc` for Worker asset routing and SPA fallback.
当前项目使用 `wrangler.jsonc` 管理 Worker 静态资源与 SPA 路由回退。

Important note:
重要说明：
- When Cloudflare builds directly from Git, local `wrangler deploy` is not required for normal Git-based production releases.
- 如果 Cloudflare 直接从 Git 构建发布，正常的 Git 触发生产发布不依赖本地 `wrangler deploy`。
- When deploying manually from a local or remote shell, Wrangler needs `CLOUDFLARE_API_TOKEN`.
- 如果从本地或远程 Shell 手动部署，Wrangler 需要 `CLOUDFLARE_API_TOKEN`。

### Docker Image Path / Docker 镜像链路
GitHub Actions also builds a Docker image and pushes it to Docker Hub.
GitHub Actions 同时还会构建 Docker 镜像并推送到 Docker Hub。

These files are still in use:
以下文件当前仍在使用：
- `Dockerfile`
- `nginx.conf`
- `.dockerignore`

The Docker workflow does not deploy directly to the physical machine; it publishes an image that a server can later pull and run.
Docker 工作流不会直接把程序部署到物理机，而是发布镜像，后续由服务器去拉取并运行。

## Backend Contract Rule / 后端接口联调规则

Before changing frontend API integration, always review:
修改前端接口相关逻辑前，请先检查：

- `C:\WorkSpace\Java\moneykeeper-back\FRONTEND_API.md`

See [PROJECT_DETAILS.md](./PROJECT_DETAILS.md) for the local coordination rule.
本地联调约定请查看 [PROJECT_DETAILS.md](./PROJECT_DETAILS.md)。

## Development Workflow / 开发流程建议

- Use `codex/test` or another working branch for ongoing development / 日常开发优先使用 `codex/test` 或其它工作分支
- Merge into `main` only after verification / 验证通过后再合并到 `main`
- Let Cloudflare build from `main` for production / 生产环境由 Cloudflare 从 `main` 自动构建

## Internationalization Plan / 国际化 i18n 计划

### Goal / 目标
Make the frontend support at least Simplified Chinese and English without duplicating page logic.
让前端至少支持简体中文与英文，并且不复制页面逻辑。

### Current Gaps / 当前缺口
- Many UI strings are hardcoded in components and composables / 许多界面文案直接硬编码在组件与 composable 中
- Error and validation messages are not centralized / 错误提示和校验文案没有集中管理
- Some files still contain text encoding issues / 部分文件仍有编码问题
- Currency, date, and number formatting are not locale-aware / 金额、日期、数字格式尚未国际化

### Recommended Roadmap / 推荐路线图

#### Phase 1: Prepare the foundation / 第一阶段：打基础
- Add `vue-i18n` / 引入 `vue-i18n`
- Create locale files such as `src/locales/zh-CN.json` and `src/locales/en-GB.json` / 创建语言包
- Add a single i18n bootstrap file and register it in `main.js` / 在 `main.js` 中注册统一的 i18n 入口
- Decide the default locale and fallback locale / 明确默认语言与回退语言

#### Phase 2: Centralize visible copy / 第二阶段：集中管理界面文案
- Replace hardcoded page titles, button labels, form labels, placeholders, empty states, and dialog text / 替换页面标题、按钮、表单、占位符、空态、弹窗文案
- Move validation messages into translation keys / 将表单校验文案转成翻译 key
- Move notification copy into shared translation usage / 将通知提示文案迁移到统一翻译调用

#### Phase 3: Locale-aware formatting / 第三阶段：格式国际化
- Use `Intl.DateTimeFormat` for dates / 使用 `Intl.DateTimeFormat` 处理日期
- Use `Intl.NumberFormat` for amount and chart labels / 使用 `Intl.NumberFormat` 处理金额与图表数值
- Support locale-aware currency display / 支持按语言环境显示货币格式

#### Phase 4: API and error mapping / 第四阶段：接口与错误映射
- Keep backend response codes stable and map them to frontend translation keys / 保持后端业务码稳定，并在前端映射到翻译 key
- Do not render raw backend messages directly in the UI unless used as fallback / 非必要不要直接把后端原始 message 直接显示给用户
- Introduce a shared error translation layer in `src/api/response.js` or a dedicated helper / 在统一响应层处理可翻译错误

#### Phase 5: Language switching and persistence / 第五阶段：语言切换与持久化
- Add a language switcher in the account area or top navigation / 在账户区或顶栏加入语言切换入口
- Store the selected locale in local storage or user settings / 将选择的语言保存到本地或用户设置
- Detect browser language on first visit / 首次访问时可根据浏览器语言自动选择

#### Phase 6: QA and rollout / 第六阶段：测试与发布
- Add smoke tests for both locales / 为中英文增加基本回归测试
- Add a missing-key check in CI / 在 CI 中增加缺失翻译 key 检查
- Review layout overflow in longer English strings / 检查英文较长文案导致的布局溢出
- Verify charts, billing pages, and auth flows under both locales / 验证图表、支付页、登录流程在双语下的表现

### Suggested First i18n Task / 建议的第一个 i18n 任务
Start by introducing `vue-i18n` and migrating the login page, top navigation, and accounting dashboard summary cards.
建议先引入 `vue-i18n`，然后优先迁移登录页、顶部导航、以及记账首页摘要卡片的文案。

This gives the project a reusable i18n foundation while touching the most visible user-facing surfaces first.
这样既能先建立可复用的 i18n 基础设施，也能优先覆盖用户最常见的核心界面。

## License / 许可证

This project is distributed under the MIT License.
本项目采用 MIT 许可证。