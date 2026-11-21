import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import SectionCard from '@/components/SectionCard'
import StateTip from '@/components/StateTip'
import { useGoldStore } from '@/store/useGoldStore'
import { fetchPortfolio } from '@/services/api'
import { calcPnl, formatAmount, formatPrice, formatSigned, trendOf } from '@/utils/format'
import type { Trade } from '@/types'

const PortfolioPage: React.FC = () => {
  const snapshot = useGoldStore((state) => state.snapshot)
  const refreshQuote = useGoldStore((state) => state.refresh)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [position, setPosition] = useState<{ code: string; name: string; grams: number; cost: number } | null>(
    null
  )
  const [trades, setTrades] = useState<Trade[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const [gramsInput, setGramsInput] = useState('')
  const [priceInput, setPriceInput] = useState('')

  useEffect(() => {
    if (!snapshot) {
      refreshQuote()
    }
  }, [snapshot, refreshQuote])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchPortfolio()
        if (!cancelled) {
          setPosition(data.position)
          setTrades(data.trades)
        }
      } catch (err) {
        console.error('[Portfolio] 持仓数据加载失败', err)
        if (!cancelled) {
          setError('持仓数据加载失败')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  /** 当前金种现价（优先取持仓对应金种） */
  const currentPrice = useMemo(() => {
    if (!snapshot) {
      return 0
    }
    const matched = snapshot.rows.find((row) => row.code === position?.code)
    return matched?.active ?? snapshot.rows[0]?.active ?? 0
  }, [snapshot, position])

  const pnl = position ? calcPnl(position.grams, position.cost, currentPrice) : null
  const trend = pnl ? trendOf(pnl.pnl) : 'flat'

  /** 收益区间条宽度：-10% ~ +10% 映射到 0 ~ 100% */
  const barWidth = pnl ? Math.min(100, Math.max(0, ((pnl.pnlPct + 10) / 20) * 100)) : 50

  const handleAddTrade = () => {
    const grams = Number(gramsInput)
    const price = Number(priceInput)
    if (!(grams > 0) || !(price > 0)) {
      Taro.showToast({ title: '请输入正确的克数与成交价', icon: 'none' })
      return
    }
    const record: Trade = {
      id: `T${Date.now()}`,
      type: tradeType,
      code: position?.code ?? snapshot?.rows[0]?.code ?? '',
      name: position?.name ?? snapshot?.rows[0]?.name ?? '积存金',
      grams,
      price,
      time: formatNow()
    }
    setTrades((prev) => [record, ...prev])
    setGramsInput('')
    setPriceInput('')
    setFormOpen(false)
    console.info('[Portfolio] 已添加交易记录（本地演示）', record)
    Taro.showToast({ title: '已添加（本地演示）', icon: 'success' })
  }

  if (loading) {
    return (
      <View className={styles.page}>
        <StateTip type="loading" text="正在加载持仓数据…" />
      </View>
    )
  }

  if (error) {
    return (
      <View className={styles.page}>
        <StateTip type="error" text={error} />
      </View>
    )
  }

  return (
    <View className={styles.page}>
      <View className={styles.hero}>
        <View className={styles.heroTop}>
          <Text className={styles.heroLabel}>浮动盈亏（元）</Text>
          <Text className={styles.heroBadge}>按主动积存价</Text>
        </View>
        <Text
          className={classnames(
            styles.heroValue,
            trend === 'up' && styles.heroUp,
            trend === 'down' && styles.heroDown
          )}
        >
          {pnl ? formatSigned(pnl.pnl, 2) : '--'}
        </Text>
        <View className={styles.heroSub}>
          <Text className={styles.heroPct}>{pnl ? formatSigned(pnl.pnlPct, 2, '%') : '--'}</Text>
          <Text className={styles.heroCost}>
            成本 {formatPrice(position?.cost)} / 现价 {formatPrice(currentPrice)}
          </Text>
        </View>
        <View className={styles.bar}>
          <View className={styles.barTrack}>
            <View className={styles.barCenter} />
            <View
              className={classnames(
                styles.barFill,
                trend === 'up' && styles.barFillUp,
                trend === 'down' && styles.barFillDown
              )}
              style={{ width: `${barWidth}%` }}
            />
          </View>
          <View className={styles.barLabels}>
            <Text className={styles.barLabel}>-10%</Text>
            <Text className={styles.barLabel}>0</Text>
            <Text className={styles.barLabel}>+10%</Text>
          </View>
        </View>
      </View>

      <View className={styles.grid}>
        <View className={styles.gridCell}>
          <Text className={styles.gridLabel}>持有克数</Text>
          <Text className={styles.gridValue}>{position ? position.grams.toFixed(4) : '--'}</Text>
        </View>
        <View className={styles.gridCell}>
          <Text className={styles.gridLabel}>持仓成本</Text>
          <Text className={styles.gridValue}>{formatPrice(position?.cost)}</Text>
        </View>
        <View className={styles.gridCell}>
          <Text className={styles.gridLabel}>当前市值</Text>
          <Text className={styles.gridValue}>{pnl ? formatAmount(pnl.marketValue) : '--'}</Text>
        </View>
        <View className={styles.gridCell}>
          <Text className={styles.gridLabel}>投入成本</Text>
          <Text className={styles.gridValue}>{pnl ? formatAmount(pnl.costTotal) : '--'}</Text>
        </View>
      </View>

      <View className={styles.sectionGap}>
        <SectionCard title="买入 / 赎回记录" extra={`${trades.length} 笔`}>
          <View
            className={styles.addBtn}
            onClick={() => setFormOpen((prev) => !prev)}
          >
            <Text className={styles.addBtnText}>{formOpen ? '收起' : '+ 添加记录'}</Text>
          </View>

          {formOpen ? (
            <View className={styles.form}>
              <View className={styles.typeSwitch}>
                <View
                  className={classnames(
                    styles.typeItem,
                    tradeType === 'buy' && styles.typeItemActive
                  )}
                  onClick={() => setTradeType('buy')}
                >
                  <Text
                    className={classnames(
                      styles.typeText,
                      tradeType === 'buy' && styles.typeTextActive
                    )}
                  >
                    买入
                  </Text>
                </View>
                <View
                  className={classnames(
                    styles.typeItem,
                    tradeType === 'sell' && styles.typeItemActive
                  )}
                  onClick={() => setTradeType('sell')}
                >
                  <Text
                    className={classnames(
                      styles.typeText,
                      tradeType === 'sell' && styles.typeTextActive
                    )}
                  >
                    赎回
                  </Text>
                </View>
              </View>
              <View className={styles.field}>
                <Text className={styles.fieldLabel}>克数</Text>
                <Input
                  className={styles.fieldInput}
                  type="digit"
                  placeholder="如 5"
                  value={gramsInput}
                  onInput={(event) => setGramsInput(event.detail.value)}
                />
              </View>
              <View className={styles.field}>
                <Text className={styles.fieldLabel}>成交价（元/克）</Text>
                <Input
                  className={styles.fieldInput}
                  type="digit"
                  placeholder="如 886.86"
                  value={priceInput}
                  onInput={(event) => setPriceInput(event.detail.value)}
                />
              </View>
              <View className={styles.submit} onClick={handleAddTrade}>
                <Text className={styles.submitText}>保存记录</Text>
              </View>
            </View>
          ) : null}

          {trades.length ? (
            <View className={styles.tradeList}>
              {trades.map((trade) => {
                const tradePnl =
                  position && currentPrice > 0
                    ? trade.type === 'buy'
                      ? (currentPrice - trade.price) * trade.grams
                      : (trade.price - position.cost) * trade.grams
                    : 0
                const tradeTrend = trendOf(tradePnl)
                return (
                  <View className={styles.tradeItem} key={trade.id}>
                    <View className={styles.tradeLeft}>
                      <View
                        className={classnames(
                          styles.tradeTag,
                          trade.type === 'buy' ? styles.tagBuy : styles.tagSell
                        )}
                      >
                        <Text className={styles.tradeTagText}>
                          {trade.type === 'buy' ? '买入' : '赎回'}
                        </Text>
                      </View>
                      <View className={styles.tradeInfo}>
                        <Text className={styles.tradeName}>{trade.name}</Text>
                        <Text className={styles.tradeMeta}>
                          {trade.grams} 克 · {formatPrice(trade.price)} 元/克 · {trade.time}
                        </Text>
                      </View>
                    </View>
                    <Text
                      className={classnames(
                        styles.tradePnl,
                        tradeTrend === 'up' && styles.tradeUp,
                        tradeTrend === 'down' && styles.tradeDown
                      )}
                    >
                      {formatSigned(tradePnl, 2)}
                    </Text>
                  </View>
                )
              })}
            </View>
          ) : (
            <StateTip type="empty" text="暂无交易记录" />
          )}
        </SectionCard>
      </View>

      <Text className={styles.note}>
        买入盈亏 =（当前主动积存价 − 买入价）× 克数，随行情实时变化；
        赎回盈亏 =（赎回成交价 − 持仓成本）× 克数，属于已实现盈亏。
        当前新增记录仅保存在页面内存中，接入后端后写入个人数据表。
      </Text>
    </View>
  )
}

function formatNow(): string {
  const now = new Date()
  const pad = (value: number): string => (value < 10 ? `0${value}` : `${value}`)
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}`
}

export default PortfolioPage
