import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'
import { formatMonthDay, formatPrice } from '@/utils/format'
import type { CandleBar } from '@/types'

interface CandleChartProps {
  candles: CandleBar[]
}

/**
 * 日 K 线（用 View 绘制，避免 canvas 在多端的兼容问题）
 * 每根蜡烛由影线（wick）+ 实体（body）组成，按区间高低点做百分比定位。
 */
const CandleChart: React.FC<CandleChartProps> = ({ candles }) => {
  if (!candles.length) {
    return <View className={styles.empty}>暂无 K 线数据</View>
  }

  const highest = Math.max(...candles.map((item) => item.high))
  const lowest = Math.min(...candles.map((item) => item.low))
  const span = highest - lowest || 1

  const ratio = (value: number): number => ((highest - value) / span) * 100

  return (
    <View className={styles.wrap}>
      <View className={styles.chart}>
        {candles.map((item) => {
          const rising = item.close >= item.open
          const bodyTop = ratio(Math.max(item.open, item.close))
          const bodyHeight = Math.max(((Math.abs(item.close - item.open) / span) * 100), 1.4)
          return (
            <View className={styles.column} key={item.date}>
              <View
                className={styles.wick}
                style={{
                  top: `${ratio(item.high)}%`,
                  height: `${((item.high - item.low) / span) * 100}%`,
                  background: rising ? '#e0483e' : '#17a673'
                }}
              />
              <View
                className={styles.body}
                style={{
                  top: `${bodyTop}%`,
                  height: `${bodyHeight}%`,
                  background: rising ? '#e0483e' : '#17a673'
                }}
              />
            </View>
          )
        })}
      </View>
      <View className={styles.axis}>
        <Text className={styles.axisText}>{formatMonthDay(candles[0].date)}</Text>
        <Text className={styles.axisText}>{formatMonthDay(candles[candles.length - 1].date)}</Text>
      </View>
      <View className={styles.legend}>
        <Text className={styles.legendText}>最高 {formatPrice(highest)}</Text>
        <Text className={styles.legendText}>最低 {formatPrice(lowest)}</Text>
      </View>
    </View>
  )
}

export default CandleChart
