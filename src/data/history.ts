import type { CandleBar, ChartRange, HistorySeries, PricePoint } from '@/types'

/** 线性同余伪随机，保证同一周期每次渲染曲线一致 */
function createRandom(seed: number): () => number {
  let state = seed % 2147483647
  if (state <= 0) state += 2147483646
  return () => {
    state = (state * 16807) % 2147483647
    return state / 2147483647
  }
}

function pad(value: number): string {
  return value < 10 ? `0${value}` : `${value}`
}

interface RangeConfig {
  points: number
  stepMinutes: number
  candleDays: number
  volatility: number
  base: number
}

const RANGE_CONFIG: Record<ChartRange, RangeConfig> = {
  day: { points: 72, stepMinutes: 5, candleDays: 7, volatility: 0.0009, base: 886.86 },
  week: { points: 70, stepMinutes: 60, candleDays: 14, volatility: 0.0018, base: 883.4 },
  month: { points: 60, stepMinutes: 360, candleDays: 30, volatility: 0.0032, base: 874.2 }
}

const RANGE_SEED: Record<ChartRange, number> = {
  day: 20261121,
  week: 20261114,
  month: 20261021
}

function buildPoints(range: ChartRange): PricePoint[] {
  const config = RANGE_CONFIG[range]
  const random = createRandom(RANGE_SEED[range])
  const now = new Date()
  const points: PricePoint[] = []
  let price = config.base

  for (let index = 0; index < config.points; index += 1) {
    const drift = (random() - 0.48) * config.volatility
    price = Number((price * (1 + drift)).toFixed(2))
    const time = new Date(now.getTime() - (config.points - index) * config.stepMinutes * 60 * 1000)
    const label =
      range === 'day'
        ? `${pad(time.getHours())}:${pad(time.getMinutes())}`
        : `${pad(time.getMonth() + 1)}/${pad(time.getDate())}`
    points.push({ label, price })
  }
  return points
}

function buildCandles(range: ChartRange): CandleBar[] {
  const config = RANGE_CONFIG[range]
  const random = createRandom(RANGE_SEED[range] + 7)
  const now = new Date()
  const candles: CandleBar[] = []
  let close = config.base

  for (let index = config.candleDays - 1; index >= 0; index -= 1) {
    const day = new Date(now.getTime() - index * 24 * 3600 * 1000)
    const open = Number((close * (1 + (random() - 0.5) * 0.002)).toFixed(2))
    const change = (random() - 0.46) * 0.012
    close = Number((open * (1 + change)).toFixed(2))
    const high = Number((Math.max(open, close) * (1 + random() * 0.004)).toFixed(2))
    const low = Number((Math.min(open, close) * (1 - random() * 0.004)).toFixed(2))
    candles.push({
      date: `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`,
      open,
      high,
      low,
      close
    })
  }
  return candles
}

/** 生成指定周期的走势数据（Mock） */
export function makeHistory(range: ChartRange): HistorySeries {
  const points = buildPoints(range)
  const candles = buildCandles(range)
  const prices = points.map((item) => item.price)
  const open = prices[0] ?? 0
  const close = prices[prices.length - 1] ?? 0
  const high = Math.max(...prices)
  const low = Math.min(...prices)

  return {
    range,
    points,
    candles,
    open,
    high,
    low,
    close,
    amplitudePct: open > 0 ? Number((((high - low) / open) * 100).toFixed(2)) : 0
  }
}
