import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface SectionCardProps {
  title: string
  /** 右侧附加信息，如更新时间 */
  extra?: string
  /** 标题前的金色竖条 */
  accent?: boolean
  children: React.ReactNode
}

const SectionCard: React.FC<SectionCardProps> = ({ title, extra, accent = true, children }) => (
  <View className={styles.card}>
    <View className={styles.head}>
      <View className={styles.titleWrap}>
        {accent && <View className={styles.accent} />}
        <Text className={styles.title}>{title}</Text>
      </View>
      {extra ? <Text className={styles.extra}>{extra}</Text> : null}
    </View>
    <View className={styles.body}>{children}</View>
  </View>
)

export default SectionCard
