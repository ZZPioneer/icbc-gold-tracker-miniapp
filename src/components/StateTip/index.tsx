import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface StateTipProps {
  /** loading=加载中 / error=加载失败 / empty=无数据 */
  type: 'loading' | 'error' | 'empty'
  text: string
  onRetry?: () => void
}

const StateTip: React.FC<StateTipProps> = ({ type, text, onRetry }) => (
  <View className={styles.wrap}>
    {type === 'loading' ? <View className={styles.spinner} /> : null}
    <Text className={styles.text}>{text}</Text>
    {type === 'error' && onRetry ? (
      <View className={styles.retry} onClick={onRetry}>
        <Text className={styles.retryText}>重试</Text>
      </View>
    ) : null}
  </View>
)

export default StateTip
