import { create } from 'zustand'
import type { GoldQuote, QuoteSnapshot } from '@/types'
import { fetchQuote } from '@/services/api'

interface GoldState {
  /** 最近一次行情快照 */
  snapshot: QuoteSnapshot | null
  /** 当前选中的金种代码 */
  selectedCode: string
  loading: boolean
  error: string
  /** 拉取一次最新行情 */
  refresh: () => Promise<void>
  /** 切换选中金种 */
  select: (code: string) => void
}

export const useGoldStore = create<GoldState>((set, get) => ({
  snapshot: null,
  selectedCode: '',
  loading: false,
  error: '',

  refresh: async () => {
    if (get().loading) {
      return
    }
    set({ loading: true, error: '' })
    try {
      const snapshot = await fetchQuote()
      console.info('[Quote] 行情已更新', snapshot.updatedAt, snapshot.rows.length)
      const current = get().selectedCode
      const exist = snapshot.rows.some((row) => row.code === current)
      set({
        snapshot,
        loading: false,
        selectedCode: exist ? current : snapshot.rows[0]?.code ?? ''
      })
    } catch (error) {
      console.error('[Quote] 行情获取失败', error)
      set({ loading: false, error: '行情获取失败，请下拉重试' })
    }
  },

  select: (code: string) => {
    set({ selectedCode: code })
  }
}))

/** 取当前选中金种的行情 */
export function pickSelected(state: GoldState): GoldQuote | null {
  if (!state.snapshot) {
    return null
  }
  return state.snapshot.rows.find((row) => row.code === state.selectedCode) ?? null
}
