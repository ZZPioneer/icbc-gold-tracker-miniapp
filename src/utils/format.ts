import Taro from '@tarojs/taro'

/** 价格涨跌方向 */
export type Trend = 'up' | 'down' | 'flat'

/** 数值 → 趋势方向（0 视为持平） */
export function trendOf(value: number): Trend {
  if (value > 0) return 'up'
  if (value < 0) return 'down'
  return 'flat'
}

/** 设计稿 rpx 尺寸 → 设备 px（canvas 绘制使用） */
export function toRpx(value: number): number {
  const info = Taro.getSystemInfoSync()
  return (value / 750) * info.windowWidth
}

/** 价格格式化，缺失值统一显示 -- */
export function formatPrice(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '--'
  }
  return value.toFixed(digits)
}

/** 带正负号的数值 */
export function formatSigned(value: number, digits = 2, suffix = ''): string {
  if (!Number.isFinite(value)) {
    return '--'
  }
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(digits)}${suffix}`
}

/** '2026-11-21 14:32:05' → '14:32:05' */
export function formatClock(dateTime: string): string {
  const segments = dateTime.split(' ')
  return segments.length > 1 ? segments[1] : dateTime
}

/** '2026-11-21' → '11/21' */
export function formatMonthDay(date: string): string {
  const segments = date.split('-')
  return segments.length === 3 ? `${segments[1]}/${segments[2]}` : date
}

export interface PnlResult {
  /** 当前市值 */
  marketValue: number
  /** 持仓成本 */
  costTotal: number
  /** 浮动盈亏金额 */
  pnl: number
  /** 收益率（百分比数值） */
  pnlPct: number
}

/** 持仓盈亏：市值 - 成本，成本按 克数 × 成本价 计算 */
export function calcPnl(grams: number, cost: number, price: number): PnlResult | null {
  if (!(grams > 0) || !(cost > 0) || !(price > 0)) {
    return null
  }
  const marketValue = grams * price
  const costTotal = grams * cost
  const pnl = marketValue - costTotal
  return {
    marketValue,
    costTotal,
    pnl,
    pnlPct: (pnl / costTotal) * 100
  }
}

/** 金额千分位，用于持仓市值等大额数字 */
export function formatAmount(value: number, digits = 2): string {
  if (!Number.isFinite(value)) {
    return '--'
  }
  const fixed = Math.abs(value).toFixed(digits)
  const [integer, decimal] = fixed.split('.')
  const withSeparator = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${value < 0 ? '-' : ''}${withSeparator}${decimal ? `.${decimal}` : ''}`
}
