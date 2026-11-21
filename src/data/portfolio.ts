import type { PortfolioData } from '@/types'

/** Mock 持仓与交易记录：接入后端后由 /api/portfolio 返回同结构数据 */
export const MOCK_PORTFOLIO: PortfolioData = {
  position: {
    code: '080020000101',
    name: '积存金（人民币）',
    grams: 10,
    cost: 886.86
  },
  trades: [
    {
      id: 'T20261118001',
      type: 'buy',
      code: '080020000101',
      name: '积存金（人民币）',
      grams: 5,
      price: 879.4,
      time: '2026-11-18 10:24'
    },
    {
      id: 'T20261120002',
      type: 'buy',
      code: '080020000101',
      name: '积存金（人民币）',
      grams: 5,
      price: 894.32,
      time: '2026-11-20 14:06'
    },
    {
      id: 'T20261121003',
      type: 'sell',
      code: '080020000101',
      name: '积存金（人民币）',
      grams: 1,
      price: 885.1,
      time: '2026-11-21 09:48'
    }
  ]
}
