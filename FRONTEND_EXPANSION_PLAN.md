# MoneyKeeper Platform Frontend Plan

## 1. 文档目标

这份文档用于把平台侧后端交接文档转成当前前端项目的页面改造方案与落地顺序。

本次参考的后端文档：

- `C:\Personal Files\Docs\Markdown\moneykeeper\PLATFORM_FRONTEND_HANDOFF.md`
- `C:\WorkSpace\Java\moneykeeper-back\FRONTEND_API.md`

目标不是一次性把所有平台功能都塞进现有首页，而是基于当前项目，逐步从“单页记账工具”升级成“以 ledger 为上下文的多页面前端”。

## 2. 当前前端现状

### 2.1 已有页面与组件

当前主页面：

- `src/views/AccountingPage.vue`
- `src/views/LoginPage.vue`
- `src/views/StripeCheckoutPage.vue`
- `src/views/PaymentSuccessPage.vue`
- `src/views/PaymentCancelPage.vue`

当前核心组件：

- `src/components/TopNavBar.vue`
- `src/components/AddRecordForm.vue`
- `src/components/EditRecordDialog.vue`
- `src/components/AddCategoryDialog.vue`
- `src/components/RecordsList.vue`
- `src/components/AccountingCharts.vue`
- `src/components/CategoryFilter.vue`

当前 API 模块：

- `src/api/modules/auth.js`
- `src/api/modules/categories.js`
- `src/api/modules/records.js`
- `src/api/modules/payments.js`
- `src/api/modules/users.js`
- `src/api/modules/excel.js`

### 2.2 当前限制

当前项目已经有不错的记账首页和支付链路，但整体仍然是“单用户、单记账页中心”的结构，主要限制包括：

- 路由结构仍然围绕 `/accounting`
- 状态模型以“当前用户”为中心，没有“当前 ledger”上下文
- 通知、预算、导出、搜索、成员管理都没有独立页面
- 现有导出仍然是同步点击下载思路，不是任务化思路
- SSE 只承担顶部状态和 toast，尚未形成通知中心
- 统计能力主要体现在首页图表，还不是独立分析页

## 3. 本次页面改造总思路

### 3.1 页面结构

前端需要从“一个首页承载一切”升级成“Dashboard + 平台功能页”的组合：

- `/accounting` 继续作为当前账本首页
- 新增账本、预算、统计、通知、导出、搜索、成员等页面
- 顶部导航从账户区升级成全局导航和账本切换入口

### 3.2 状态结构

前端默认上下文需要从：

- 当前用户

升级成：

- 当前用户
- 当前 ledger
- 当前 ledger 下的角色与权限

### 3.3 接口层思路

这批平台接口会混用两种返回风格：

- `MkApiResponse<T>`
- `ResponseEntity<T>`

前端应继续把拆包、错误映射、字段转换收口到 `src/api`，不要让页面层自己处理不同响应格式。

## 4. 页面与路由改造方案

### 4.1 保留并升级的页面

#### A. `AccountingPage`

保留为“当前账本 Dashboard”，但职责要收口为：

- 快速记一笔
- 最近记录
- 当前账本收支摘要
- 小范围统计预览
- 跳转预算、统计、导出、通知等能力页

不再继续把所有新功能都塞进这个页面。

#### B. `TopNavBar`

升级成平台入口层，新增能力：

- 当前 ledger 展示
- ledger 切换器
- 主导航入口
- 通知入口
- 当前角色展示

### 4.2 建议新增页面

#### 1. `LedgersPage`

路径建议：`/ledgers`

作用：

- 查看我可访问的 ledger 列表
- 创建 ledger
- 查看默认 ledger
- 切换当前 ledger

#### 2. `LedgerMembersPage`

路径建议：`/ledgers/:ledgerId/members`

作用：

- 成员列表
- 角色标签
- 邀请入口
- 待处理邀请列表

#### 3. `CategoriesPage`

路径建议：`/categories`

作用：

- 独立管理 ledger 下的分类
- 支持 owner/admin 管理
- member 只读

#### 4. `BudgetsPage`

路径建议：`/budgets`

作用：

- 月预算列表
- 预算进度
- 阈值规则编辑
- 超支/预警高亮

#### 5. `StatisticsPage`

路径建议：`/statistics`

作用：

- 周 / 月 / 年统计
- 收支趋势
- 分类占比
- 成员筛选

#### 6. `SearchPage`

路径建议：`/search`

作用：

- 关键词检索记录
- 日期、类型、分类筛选
- 搜索结果分页或限量展示

#### 7. `ExportJobsPage`

路径建议：`/exports`

作用：

- 导出任务列表
- 轮询状态
- 下载文件
- 错误原因查看

#### 8. `NotificationsPage`

路径建议：`/notifications`

作用：

- 未读/全部
- 类型筛选
- 标记已读
- 全部已读
- 查看历史通知

## 5. 当前项目的组件复用方案

### 5.1 可直接复用

- `AddRecordForm.vue`
- `EditRecordDialog.vue`
- `RecordsList.vue`
- `AccountingCharts.vue`
- `CategoryFilter.vue`

这些组件可以继续服务于当前账本页面，也可以逐步抽到统计页、搜索页和记录页使用。

### 5.2 需要升级后再复用

- `TopNavBar.vue`
  需要先支持导航和 ledger 上下文
- `AddCategoryDialog.vue`
  需要从“首页内临时添加分类”升级成“分类页可复用弹窗”

## 6. API 与状态层建议

### 6.1 建议新增 API 模块

- `src/api/modules/ledgers.js`
- `src/api/modules/budgets.js`
- `src/api/modules/statistics.js`
- `src/api/modules/search.js`
- `src/api/modules/exportJobs.js`
- `src/api/modules/notifications.js`
- `src/api/modules/members.js`

### 6.2 建议新增 store

- `src/stores/ledger.js`

建议状态：

- `ledgerList`
- `currentLedger`
- `currentLedgerId`
- `currentLedgerRole`
- `defaultLedgerId`
- `isLedgerLoading`

### 6.3 页面层规则

以后记录、分类、预算、导出、统计、通知都默认依附于“当前 ledger”，而不是继续只依附于当前用户。

## 7. 视觉与交互建议

为了和现有设计语言保持一致，新增页面建议延续当前风格：

- 大圆角卡片
- 浅色渐变背景
- 顶部摘要区
- 中央工作区 + 次级侧栏

但信息架构要更清晰：

- Dashboard 展示“今天 / 本期 / 趋势”
- 列表页展示“筛选 + 表格/卡片”
- 任务页展示“状态 + 动作”
- 管理页展示“配置 + 权限”

## 8. 推荐实施顺序

### Phase 1：骨架和上下文

- 新增 `ledger` store
- 新增 `ledgers` API 模块
- 扩展路由
- 顶部导航增加 ledger 切换与平台入口
- 首页显示当前 ledger 信息

### Phase 2：最小平台闭环

- `BudgetsPage`
- `NotificationsPage`
- `ExportJobsPage`
- `StatisticsPage`

这四个页面最能直接承接后端新能力，也最容易让前端产品形态发生变化。

### Phase 3：协作与搜索

- `LedgersPage`
- `LedgerMembersPage`
- `SearchPage`
- 邀请流与权限态细化

## 9. 最值得先开始的前端任务

如果只选一个起点，建议先做：

### “当前 ledger 上下文 + 平台导航”

原因：

- 它决定后面所有页面如何挂载
- 它对现有首页侵入相对可控
- 它最适合先在当前项目里开始升级，而不是推倒重做

## 10. 本轮升级的起点

本轮建议先完成：

1. 写入本方案文档
2. 新增 `ledger` store 与 `ledgers` API 模块
3. 扩展平台页面骨架
4. 升级 `TopNavBar` 支持 ledger 和平台导航

这会是从现有项目走向平台化前端的第一步。
