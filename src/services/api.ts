import Taro from '@tarojs/taro'
import type {
  ChartRange,
  HistorySeries,
  PortfolioData,
  QuoteSnapshot,
  ReportDetail,
  ReportItem
} from '@/types'
import { makeSnapshot } from '@/data/quotes'
import { makeHistory } from '@/data/history'
import { MOCK_PORTFOLIO } from '@/data/portfolio'
import { getReport, listReports } from '@/data/reports'

/**
 * 数据网关：页面只依赖本文件，不直接接触 mock 数据或 HTTP 细节。
 *
 * 当前 USE_MOCK = true，全部返回本地 mock 数据，保证在无后端时也能完整演示。
 *
 * 接入真实后端时：
 * 1. 把 USE_MOCK 改为 false；
 * 2. 把 API_BASE 改为已备案的 HTTPS 域名（微信小程序不允许请求 127.0.0.1）；
 * 3. 在微信公众平台「开发管理 - 服务器域名」把该域名加入 request 合法域名；
 * 4. 若后端开启了登录会话，需要在请求头补充 Cookie / Token（见 request 注释）。
 */
export const USE_MOCK = true
export const API_BASE = ''

/** 模拟网络延迟，便于观察加载态 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function request<T>(path: string): Promise<T> {
  const response = await Taro.request<T>({
    url: `${API_BASE}${path}`,
    method: 'GET',
    header: {
      'Content-Type': 'application/json'
      // 真实后端若启用会话鉴权，在这里补充：Cookie / Authorization
    }
  })
  if (response.statusCode < 200 || response.statusCode >= 300) {
    console.error('[API] 请求失败', path, response.statusCode)
    throw new Error(`请求失败（${response.statusCode}）`)
  }
  return response.data
}

let quoteSeed = 1

/** 最新行情快照 */
export async function fetchQuote(): Promise<QuoteSnapshot> {
  if (USE_MOCK) {
    await delay(180)
    quoteSeed += 1
    return makeSnapshot(quoteSeed)
  }
  return request<QuoteSnapshot>('/api/quote')
}

/** 指定周期的走势数据 */
export async function fetchHistory(range: ChartRange): Promise<HistorySeries> {
  if (USE_MOCK) {
    await delay(220)
    return makeHistory(range)
  }
  return request<HistorySeries>(`/api/history?gran=${range === 'day' ? 0 : 1}`)
}

/** 个人持仓与交易记录 */
export async function fetchPortfolio(): Promise<PortfolioData> {
  if (USE_MOCK) {
    await delay(120)
    return MOCK_PORTFOLIO
  }
  return request<PortfolioData>('/api/portfolio')
}

/** AI 复盘报告列表 */
export async function fetchReports(): Promise<ReportItem[]> {
  if (USE_MOCK) {
    await delay(120)
    return listReports()
  }
  return request<ReportItem[]>('/api/analysis/reports')
}

/** 单日 AI 复盘报告详情 */
export async function fetchReport(date: string): Promise<ReportDetail | null> {
  if (USE_MOCK) {
    await delay(150)
    return getReport(date)
  }
  return request<ReportDetail>(`/api/analysis/report?date=${date}`)
}
