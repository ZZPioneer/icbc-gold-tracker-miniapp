import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import SectionCard from '@/components/SectionCard'
import TrendChart from '@/components/TrendChart'
import CandleChart from '@/components/CandleChart'
import StateTip from '@/components/StateTip'
import { useGoldStore } from '@/store/useGoldStore'
import { fetchHistory } from '@/services/api'
import { formatPrice, formatSigned, trendOf } from '@/utils/format'
import type { ChartRange, HistorySeries } from '@/types'

const RANGES: { key: ChartRange; label: string }[] = [
  { key: 'day', label: '日内' },
  { key: 'week', label: '近7日' },
  { key: 'month', label: '近30日' }
]

const ChartPage: React.FC = () => {
  const snapshot = useGoldStore((state) => state.snapshot)
  const selectedCode = useGoldStore((state) => state.selectedCode)
  const select = useGoldStore((state) => state.select)
  const refreshQuote = useGoldStore((state) => state.refresh)

  const [range, setRange] = useState<ChartRange>('day')
  const [series, setSeries] = useState<HistorySeries | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
        const data = await fetchHistory(range)
        if (!cancelled) {
          setSeries(data)
        }
      } catch (err) {
        console.error('[Chart] 走势数据加载失败', err)
        if (!cancelled) {
          setError('走势数据加载失败，请稍后重试')
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
  }, [range, selectedCode])

  const selected = snapshot?.rows.find((row) => row.code === selectedCode) ?? null
  const quoteTrend = selected ? trendOf(selected.changePct) : 'flat'
  const seriesTrend = series ? trendOf(series.close - series.open) : 'flat'

  return (
    <View className={styles.page}>
      <ScrollView className={styles.chips} scrollX enableFlex>
        {snapshot?.rows.map((item) => (
          <View
            key={item.code}
            className={classnames(styles.chip, item.code === selectedCode && styles.chipActive)}
            onClick={() => select(item.code)}
          >
            <Text
              className={classnames(
                styles.chipText,
                item.code === selectedCode && styles.chipTextActive
              )}
            >
              {item.name}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View className={styles.quoteBar}>
        <View className={styles.quoteLeft}>
          <Text className={styles.quoteName}>{selected?.name ?? '行情加载中'}</Text>
          <Text className={styles.quoteTime}>
            {snapshot ? `工行更新时间 ${snapshot.sourceTime}` : '--'}
          </Text>
        </View>
        <View className={styles.quoteRight}>
          <Text
            className={classnames(
              styles.quotePrice,
              quoteTrend === 'up' && styles.up,
              quoteTrend === 'down' && styles.down
            )}
          >
            {formatPrice(selected?.active)}
          </Text>
          <Text className={styles.quoteUnit}>元/克</Text>
        </View>
      </View>

      <View className={styles.segment}>
        {RANGES.map((item) => (
          <View
            key={item.key}
            className={classnames(styles.segmentItem, range === item.key && styles.segmentActive)}
            onClick={() => setRange(item.key)}
          >
            <Text
              className={classnames(
                styles.segmentText,
                range === item.key && styles.segmentTextActive
              )}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      <View className={styles.sectionGap}>
        <SectionCard title="价格走势" extra={loading ? '加载中…' : '按采集快照绘制'}>
          {loading && !series ? <StateTip type="loading" text="走势加载中…" /> : null}
          {error ? <StateTip type="error" text={error} /> : null}
          {!error && series ? <TrendChart points={series.points} /> : null}
        </SectionCard>
      </View>

      {series ? (
        <View className={styles.statGrid}>
          <View className={styles.statCell}>
            <Text className={styles.statLabel}>开盘</Text>
            <Text className={styles.statValue}>{formatPrice(series.open)}</Text>
          </View>
          <View className={styles.statCell}>
            <Text className={styles.statLabel}>最新</Text>
            <Text
              className={classnames(
                styles.statValue,
                seriesTrend === 'up' && styles.up,
                seriesTrend === 'down' && styles.down
              )}
            >
              {formatPrice(series.close)}
            </Text>
          </View>
          <View className={styles.statCell}>
            <Text className={styles.statLabel}>最高</Text>
            <Text className={styles.statValue}>{formatPrice(series.high)}</Text>
          </View>
          <View className={styles.statCell}>
            <Text className={styles.statLabel}>最低</Text>
            <Text className={styles.statValue}>{formatPrice(series.low)}</Text>
          </View>
        </View>
      ) : null}

      <View className={styles.sectionGap}>
        <SectionCard
          title="K 线走势"
          extra={series ? `振幅 ${formatSigned(series.amplitudePct, 2, '%')}` : ''}
        >
          {series ? <CandleChart candles={series.candles} /> : <StateTip type="loading" text="K 线加载中…" />}
        </SectionCard>
      </View>

      <Text className={styles.note}>
        红色为上涨、绿色为下跌。日内走势按采集快照绘制，K 线由每日开高低收聚合，
        历史明细被压缩后仅保留日 K 级别数据。
      </Text>
    </View>
  )
}

export default ChartPage
