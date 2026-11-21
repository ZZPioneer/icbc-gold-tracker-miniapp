import type { GoldQuote, PriceDirection, QuoteSnapshot } from '@/types'

interface GoldBase {
  code: string
  name: string
  /** 基准主动积存价（元/克） */
  active: number
  /** 基准涨跌幅（百分比数值） */
  changePct: number
}

/** Mock 金种定义：真实环境由后端 /api/quote 返回同结构数据 */
export const GOLD_BASE: GoldBase[] = [
  { code: '080020000101', name: '积存金（人民币）', active: 886.86, changePct: 0.42 },
  { code: '080020000201', name: '积存金（白银）', active: 8.92, changePct: -0.63 },
  { code: '080020000301', name: '积存金（铂金）', active: 312.4, changePct: 0.18 },
  { code: '080020000401', name: '积存金（美元）', active: 128.45, changePct: 0.25 }
]

function directionOf(value: number): PriceDirection {
  if (value > 0.0001) return 'up'
  if (value < -0.0001) return 'down'
  return 'flat'
}

/** 稳定伪随机扰动：同一刷新序号下结果一致 */
function seededNoise(seed: number, index: number): number {
  const x = Math.sin(seed * 0.017 + index * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function pad(value: number): string {
  return value < 10 ? `0${value}` : `${value}`
}

function stamp(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

/**
 * 生成一次行情快照。
 * @param seed 刷新序号，变化时价格产生微抖动，模拟真实轮询
 */
export function makeSnapshot(seed = 1): QuoteSnapshot {
  const now = new Date()
  const rows: GoldQuote[] = GOLD_BASE.map((item, index) => {
    const noise = seededNoise(seed, index) - 0.5
    const drift = noise * 0.0016
    const digits = item.active >= 100 ? 2 : 4
    const active = Number((item.active * (1 + drift)).toFixed(digits))
    const changePct = Number((item.changePct + noise * 0.06).toFixed(2))
    const regular = Number((active * 1.0036).toFixed(digits))
    const redeem = Number((active * 0.9959).toFixed(digits))
    const low = Number((active * 0.9962).toFixed(digits))
    const high = Number((active * 1.0031).toFixed(digits))

    return {
      code: item.code,
      name: item.name,
      active,
      regular,
      redeem,
      low,
      high,
      activeDir: directionOf(changePct),
      regularDir: directionOf(regular - active),
      redeemDir: directionOf(redeem - active),
      changePct
    }
  })

  return {
    updatedAt: stamp(now),
    sourceTime: stamp(now),
    unit: '元/克',
    source: 'Mock 数据（接入后端后替换为工行官网公开行情）',
    rows
  }
}
