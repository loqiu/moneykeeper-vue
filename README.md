# 猪猪记账本 (MoneyKeeper)

## 项目概览

猪猪记账本是一个基于 Vue 3 + Element Plus 开发的个人记账应用。它提供了直观的界面和丰富的功能，帮助用户轻松管理日常收支。

### 主要特性

- 📝 支持收入和支出记录管理
- 🏷️ 自定义分类管理（支持添加、删除分类）
- 📊 数据可视化（饼图、折线图、柱状图）
- 📱 响应式设计，支持移动端
- 🔐 用户认证和授权
- 💾 数据持久化存储

### 项目状态

- 当前版本：0.1.0
- 开发状态：积极维护中
- 稳定性：Beta

## 快速上手

### 环境要求

- Node.js >= 14.0.0
- npm >= 6.14.0
- Vue.js 3.x
- Element Plus 2.x

### 安装步骤

1. 克隆项目
bash
git clone https://github.com/yourusername/moneykeeper-vue.git
cd moneykeeper-vue

2. 安装依赖

```bash
npm install
```

3. 开发环境运行

```bash
npm run serve
```

4. 生产环境构建

```bash
npm run build
```

## 项目架构

### 技术栈

- 前端框架：Vue 3
- UI 组件库：Element Plus
- 状态管理：Pinia + 持久化存储
- 路由管理：Vue Router
- 图表库：ECharts + Vue-ECharts
- HTTP 客户端：Axios
- 构建工具：Vue CLI
- CSS 预处理器：SCSS

### 项目结构
```
moneykeeper-vue/
├── public/                 # 静态资源
├── src/
│   ├── assets/            # 资源文件
│   │   └── styles/        # 样式文件
│   │       ├── accounting.css  # 记账页面样式
│   │       └── login.css      # 登录页面样式
│   ├── composables/       # 组合式函数
│   │   ├── useLogin.js    # 登录相关逻辑
│   │   ├── useCategory.js # 分类管理逻辑
│   │   └── useRecord.js   # 记账记录逻辑
│   ├── router/            # 路由配置
│   ├── stores/            # Pinia 状态管理
│   │   └── user.js        # 用户状态管理
│   ├── views/             # 页面组件
│   │   ├── LoginPage.vue  # 登录页面
│   │   └── AccountingPage.vue # 记账主页面
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── .env.development       # 开发环境配置
├── .env.production        # 生产环境配置
└── vue.config.js          # Vue CLI 配置
```

### 核心功能模块

#### 用户认证模块
- 登录功能
- 状态持久化
- 路由守卫

#### 分类管理模块
- 支出/收入分类管理
- 自定义图标和颜色
- 分类的增删改查

#### 记账记录模块
- 收支记录的增删改查
- 分页显示
- 按类型筛选

#### 数据可视化模块
- 收支统计
- 分类占比分析
- 趋势图表展示

## 配置说明

### 环境变量

开发环境 (.env.development):

```properties
NODE_ENV=development
VUE_APP_API_URL=/api
```

生产环境 (.env.production):

```properties
NODE_ENV=production
VUE_APP_API_URL=/api
```

### 代理配置

vue.config.js 中配置了开发环境和生产环境的 API 代理：

```javascript
devServer: {
  proxy: {
    '/api': {
      target: process.env.NODE_ENV === 'development'
        ? 'http://localhost:8081'
        : 'http://<your-server-ip>:8080/moneykeeper-back-0.0.1-SNAPSHOT',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api'
      }
    }
  }
}
```

## 部署说明

1. 构建生产版本

```bash
npm run build
```

2. Nginx 配置示例

```nginx
location /api {
    proxy_pass http://<your-server-ip>:8080/moneykeeper-back-0.0.1-SNAPSHOT/api;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

location / {
    root /path/to/dist;
    index index.html;
    try_files $uri $uri/ /index.html;
}
```

## 开发指南

### 代码规范
- 使用 ESLint 进行代码检查
- 遵循 Vue 3 组合式 API 风格
- 使用 Prettier 进行代码格式化

### 组件开发规范
- 使用 SFC (Single File Component) 格式
- 组件名使用 PascalCase
- Props 定义要包含类型和默认值
- 使用 composition API 组织代码逻辑

### Git 提交规范
- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 代码格式修改
- refactor: 代码重构
- test: 测试用例
- chore: 构建过程或辅助工具的变动

## 维护与支持

### 问题反馈
- GitHub Issues
- Email: your.email@example.com

### 更新日志
查看 [CHANGELOG.md](./CHANGELOG.md)

### 常见问题 (FAQ)
1. Q: 如何修改后端 API 地址？
   A: 修改对应环境的 .env 文件中的 VUE_APP_API_URL 值

2. Q: 如何添加新的图标？
   A: 在 useCategory.js 中的 availableIcons 数组添加新的图标配置

## 许可证

本项目采用 MIT 许可证，详见 [LICENSE](./LICENSE) 文件。

## 致谢

- [Vue.js](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [ECharts](https://echarts.apache.org/)
- [Pinia](https://pinia.vuejs.org/)
