import React, { useEffect, useState } from 'react'
import { View, Text } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import styles from './index.module.scss'
import StateTip from '@/components/StateTip'
import { fetchReport } from '@/services/api'
import type { ReportDetail } from '@/types'

const ReportPage: React.FC = () => {
  const router = useRouter()
  const date = router.params.date ?? ''

  const [detail, setDetail] = useState<ReportDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchReport(date)
        if (cancelled) {
          return
        }
        if (!data) {
          setError('未找到该日期的复盘报告')
        } else {
          setDetail(data)
        }
      } catch (err) {
        console.error('[Report] 报告加载失败', date, err)
        if (!cancelled) {
          setError('报告加载失败，请稍后重试')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    if (date) {
      load()
    } else {
      setLoading(false)
      setError('缺少报告日期参数')
    }
    return () => {
      cancelled = true
    }
  }, [date])

  if (loading) {
    return (
      <View className={styles.page}>
        <StateTip type="loading" text="报告加载中…" />
      </View>
    )
  }

  if (error || !detail) {
    return (
      <View className={styles.page}>
        <StateTip type="error" text={error || '报告不存在'} />
      </View>
    )
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.date}>{detail.date}</Text>
        <Text className={styles.title}>{detail.title}</Text>
        <Text className={styles.summary}>{detail.summary}</Text>
        <Text className={styles.created}>生成时间 {detail.createdAt}</Text>
      </View>

      {detail.sections.map((section) => (
        <View className={styles.section} key={section.heading}>
          <View className={styles.sectionHead}>
            <View className={styles.accent} />
            <Text className={styles.sectionTitle}>{section.heading}</Text>
          </View>
          <Text className={styles.sectionBody}>{section.body}</Text>
        </View>
      ))}

      <View className={styles.aiCard}>
        <Text className={styles.aiTitle}>AI 复盘点评</Text>
        <Text className={styles.aiBody}>{detail.aiComment}</Text>
      </View>

      <Text className={styles.disclaimer}>
        报告由本地采集数据自动生成，AI 点评仅供参考，不构成投资建议。
      </Text>
    </View>
  )
}

export default ReportPage
