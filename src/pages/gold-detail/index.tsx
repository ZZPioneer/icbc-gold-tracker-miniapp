import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

const GoldDetailPage: React.FC = () => (
  <View className={styles.page}>
    <View className={styles.card}>
      <Text className={styles.icon}>金</Text>
      <Text className={styles.title}>金种详情</Text>
      <Text className={styles.desc}>功能正在开发中…</Text>
    </View>
  </View>
)

export default GoldDetailPage
