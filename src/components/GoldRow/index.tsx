import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import { formatPrice, formatSigned, trendOf } from '@/utils/format'
import type { GoldQuote } from '@/types'

interface GoldRowProps {
  quote: GoldQuote
  active?: boolean
  onSelect: (code: string) => void
}

const GoldRow: React.FC<GoldRowProps> = ({ quote, active = false, onSelect }) => {
  const trend = trendOf(quote.changePct)
  const pillClass =
    trend === 'up' ? styles.pillUp : trend === 'down' ? styles.pillDown : styles.pillFlat

  return (
    <View
      className={classnames(styles.row, active && styles.rowActive)}
      onClick={() => onSelect(quote.code)}
    >
      <View className={styles.main}>
        <View className={styles.nameWrap}>
          <Text className={styles.name}>{quote.name}</Text>
          <Text className={styles.code}>{quote.code}</Text>
        </View>
        <View className={styles.priceWrap}>
          <Text className={classnames(styles.price, styles[trend])}>{formatPrice(quote.active)}</Text>
          <View className={classnames(styles.pill, pillClass)}>
            <Text className={styles.pillText}>{formatSigned(quote.changePct, 2, '%')}</Text>
          </View>
        </View>
      </View>

      <View className={styles.meta}>
        <Text className={styles.metaItem}>定期 {formatPrice(quote.regular)}</Text>
        <Text className={styles.metaItem}>赎回 {formatPrice(quote.redeem)}</Text>
        <Text className={styles.metaItem}>
          区间 {formatPrice(quote.low)} - {formatPrice(quote.high)}
        </Text>
      </View>
    </View>
  )
}

export default GoldRow
