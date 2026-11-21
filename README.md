# 工行积存金实盘跟踪小程序

> 工行积存金行情跟踪的移动端小程序版本，基于 **Taro 4 + React 18 + TypeScript**，可编译到微信 / 支付宝 / 抖音 / H5。
>
> 当前版本使用本地 Mock 数据搭建可运行骨架，接口层已按桌面端 API 结构预留，接入后端后可直接切换。
>
> **仅做数据展示与记录，不接入任何交易接口，不构成投资建议。**

- 桌面端仓库：<https://github.com/ZZPioneer/icbc-gold-tracker-web>
- 设计稿基准：750rpx · 8px 网格 · 卡片式布局
- 主题：金色系（`#c99a2e`）+ 暖白背景（`#f6f3ec`），涨红跌绿

---

## 功能概览

| Tab | 页面 | 内容 |
|---|---|---|
| 行情 | `pages/home` | 主价格卡（主动积存价 / 涨跌幅 / 振幅）、定期与赎回价、今日区间、金种列表、下拉刷新 |
| 走势 | `pages/chart` | 金种切换、日内 / 近7日 / 近30日周期、Canvas 折线图、日 K 蜡烛图、区间统计 |
| 持仓 | `pages/portfolio` | 持仓卡片（克数 / 成本 / 市值 / 浮动盈亏）、收益区间条、买卖记录、新增记录表单 |
| 我的 | `pages/mine` | AI 每日复盘列表、数据源与存储说明、技术栈、免责声明 |

二级页面：

| 页面 | 说明 |
|---|---|
| `pages/report` | AI 复盘详情（按日期渲染分节内容 + AI 点评） |
| `pages/gold-detail` | 金种详情（占位，后续开发） |

---

## 技术栈

| 类别 | 选型 |
|---|---|
| 框架 | Taro 4.1.9（React 技术栈，Webpack5 编译） |
| 语言 | TypeScript 5.1（`noUnusedLocals` / `strictNullChecks` 开启） |
| 样式 | SCSS + CSS Modules（`*.module.scss`），设计稿 750rpx |
| 状态 | Zustand 4（仅行情快照与选中金种，页面内状态使用 `useState`） |
| 工具 | classnames（条件类名）、dayjs（模板预置） |
| 图表 | Canvas 2D 手绘折线图 + View 绘制的日 K 蜡烛图（无第三方图表库） |

---

## 目录结构

```
src/
├── app.config.ts           # 页面注册 + tabBar（4 个 tab）
├── app.tsx / app.scss      # 应用入口与全局样式
├── assets/tabbar/          # 8 个 SVG 图标（未选中 / 选中）
├── components/
│   ├── SectionCard/        # 通用卡片（标题 + 金色竖条 + 附加信息）
│   ├── GoldRow/            # 金种行情行
│   ├── TrendChart/         # Canvas 折线图
│   ├── CandleChart/        # View 绘制的日 K 蜡烛图
│   └── StateTip/           # 加载 / 失败 / 空态
├── data/                   # Mock 数据（与后端返回结构一致）
│   ├── quotes.ts           # 行情快照（带伪随机抖动）
│   ├── history.ts          # 走势与日 K（种子随机，保证曲线稳定）
│   ├── portfolio.ts        # 持仓与交易记录
│   └── reports.ts          # AI 复盘报告
├── pages/                  # 6 个页面（每个 3 个文件：tsx / module.scss / config.ts）
├── services/api.ts         # 数据网关（Mock ↔ 真实接口的唯一开关）
├── store/useGoldStore.ts   # 行情状态（Zustand）
├── styles/
│   ├── theme.scss          # 主题配色变量
│   ├── variables.scss      # 间距 / 圆角 / 阴影 / 字体 / Mixin
│   └── compat.scss         # 平台兼容样式
├── types/index.ts          # 全局类型定义
└── utils/format.ts         # 价格格式化、rpx 换算、盈亏计算
```

---

## 接入真实后端

页面**只依赖** `src/services/api.ts`，切换数据源不需要改动任何页面代码：

```ts
// src/services/api.ts
export const USE_MOCK = false                              // 1. 关闭 Mock
export const API_BASE = 'https://your-domain.com'          // 2. 已备案 HTTPS 域名
```

需要注意：

1. **不能使用 `127.0.0.1`**：小程序运行在手机端，无法访问你电脑上的本地服务，必须部署到公网。
2. **必须在平台后台配置 request 合法域名**（微信：开发管理 → 服务器域名），且域名需完成 ICP 备案、启用 HTTPS。
3. 若后端启用了会话鉴权，在 `request()` 的 `header` 中补充 Cookie / Token。
4. 接口字段需与 `src/types/index.ts` 对齐，可直接对照桌面端接口：

| 小程序调用 | 桌面端接口 | 返回结构 |
|---|---|---|
| `fetchQuote()` | `GET /api/quote` | `QuoteSnapshot` |
| `fetchHistory(range)` | `GET /api/history` | `HistorySeries` |
| `fetchPortfolio()` | `GET /api/portfolio` | `PortfolioData` |
| `fetchReports()` | `GET /api/analysis/reports` | `ReportItem[]` |
| `fetchReport(date)` | `GET /api/analysis/report?date=` | `ReportDetail` |

---

## 本地开发

```bash
npm install          # 安装依赖（首次）
npm run dev:h5       # H5 调试（浏览器）
npm run dev:weapp    # 微信小程序产物
npm run dev:alipay   # 支付宝小程序产物
npm run dev:tt       # 抖音小程序产物
```

构建产物输出到 `dist/`。预览与发布通过当前 IDE 内置的预览链路完成，无需额外安装开发者工具。

---

## 设计规范

- **间距**：8rpx 网格，页面左右留白 32rpx，卡片内边距 32rpx，卡片间距 24rpx
- **圆角**：卡片 16rpx、按钮 48rpx（胶囊）、标签 4rpx
- **阴影**：卡片 `0 2rpx 12rpx rgba(0,0,0,.08)`，浮层 `0 4rpx 16rpx rgba(0,0,0,.1)`
- **字号**：大标题 40rpx / 标题 34rpx / 正文 28rpx / 辅助 24rpx / 小字 22rpx（价格数字单独放大到 48–76rpx）
- **触控**：可点击元素高度 ≥ 64rpx，按钮统一 80rpx
- **涨跌配色**：涨 `#e0483e`、跌 `#17a673`、平 `#8f887c`
- **溢出保护**：长文本一律 `text-ellipsis` / `text-ellipsis-multi`，横向滚动子项使用 `inline-flex`

---

## 路线图

- [ ] 对接真实后端（行情 / 持仓 / 复盘）
- [ ] 微信登录与个人数据隔离
- [ ] 金种详情页（分时、五档、历史极值）
- [ ] 价格提醒与订阅消息
- [ ] 离线缓存（最近一次快照 + 走势）

---

## 许可

本项目为**专有软件**，保留所有权利（All Rights Reserved）。未经版权持有人书面许可，不得复制分发、修改演绎或商用。

行情数据权利归原权利人（中国工商银行及公开行情机构）所有；本项目与其无隶属关系。
