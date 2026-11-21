/** 价格涨跌方向 */
export type PriceDirection = 'up' | 'down' | 'flat'

/** 单个金种的实时行情 */
export interface GoldQuote {
  /** 金种代码 */
  code: string
  /** 金种名称 */
  name: string
  /** 实时主动积存价（元/克） */
  active: number
  /** 定期积存价 */
  regular: number
  /** 赎回价 */
  redeem: number
  /** 当日最低价 */
  low: number
  /** 当日最高价 */
  high: number
  /** 主动积存价涨跌方向 */
  activeDir: PriceDirection
  /** 定期积存价涨跌方向 */
  regularDir: PriceDirection
  /** 赎回价涨跌方向 */
  redeemDir: PriceDirection
  /** 较上一帧涨跌幅（百分比数值） */
  changePct: number
  /** 是否已停用（如如意金积存） */
  disabled?: boolean
}

/** 一次采集的整体快照 */
export interface QuoteSnapshot {
  /** 本地采集时间 */
  updatedAt: string
  /** 工行页面更新时间 */
  sourceTime: string
  /** 计价单位 */
  unit: string
  /** 数据来源说明 */
  source: string
  /** 各金种行情 */
  rows: GoldQuote[]
}

/** 走势图周期 */
export type ChartRange = 'day' | 'week' | 'month'

/** 折线图上的一个点 */
export interface PricePoint {
  /** HH:mm 或 MM/DD */
  label: string
  /** 价格 */
  price: number
}

/** 日 K 线 */
export interface CandleBar {
  date: string
  open: number
  high: number
  low: number
  close: number
}

/** 某周期下的走势数据 */
export interface HistorySeries {
  range: ChartRange
  points: PricePoint[]
  candles: CandleBar[]
  open: number
  high: number
  low: number
  close: number
  amplitudePct: number
}

/** 持仓 */
export interface Position {
  code: string
  name: string
  /** 持有克数 */
  grams: number
  /** 成本价（元/克） */
  cost: number
}

/** 一笔买入 / 赎回记录 */
export interface Trade {
  id: string
  type: 'buy' | 'sell'
  code: string
  name: string
  grams: number
  /** 成交价（元/克） */
  price: number
  /** 成交时间 YYYY-MM-DD HH:mm */
  time: string
}

/** 个人数据整包 */
export interface PortfolioData {
  position: Position | null
  trades: Trade[]
}

/** AI 复盘报告列表项 */
export interface ReportItem {
  date: string
  title: string
  summary: string
  createdAt: string
}

/** AI 复盘报告详情 */
export interface ReportDetail extends ReportItem {
  sections: { heading: string; body: string }[]
  aiComment: string
}
