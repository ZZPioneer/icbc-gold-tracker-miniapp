import React, { useEffect, useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import SectionCard from '@/components/SectionCard'
import StateTip from '@/components/StateTip'
import { fetchReports } from '@/services/api'
import { formatMonthDay } from '@/utils/format'
import type { ReportItem } from '@/types'

const MinePage: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const items = await fetchReports()
        if (!cancelled) {
          setReports(items)
        }
      } catch (err) {
        console.error('[Mine] 复盘报告列表加载失败', err)
        if (!cancelled) {
          setError('复盘报告加载失败')
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

  const openReport = (date: string) => {
    Taro.navigateTo({ url: `/pages/report/index?date=${date}` })
  }

  const showInfo = (title: string, content: string) => {
    Taro.showModal({ title, content, showCancel: false, confirmText: '知道了' })
  }

  return (
    <View className={styles.page}>
      <View className={styles.profile}>
        <View className={styles.avatar}>
          <Text className={styles.avatarText}>金</Text>
        </View>
        <View className={styles.profileInfo}>
          <Text className={styles.profileName}>本地访客</Text>
          <Text className={styles.profileDesc}>Taro 跨端小程序 · v0.1.0</Text>
        </View>
        <View className={styles.modeTag}>
          <Text className={styles.modeTagText}>Mock</Text>
        </View>
      </View>

      <View className={styles.sectionGap}>
        <SectionCard title="AI 每日复盘" extra={reports.length ? `${reports.length} 篇` : ''}>
          {loading ? <StateTip type="loading" text="加载中…" /> : null}
          {error ? <StateTip type="error" text={error} /> : null}
          {!loading && !error && !reports.length ? (
            <StateTip type="empty" text="暂无复盘报告" />
          ) : null}
          {reports.map((item) => (
            <View className={styles.reportItem} key={item.date} onClick={() => openReport(item.date)}>
              <View className={styles.reportDate}>
                <Text className={styles.reportDateText}>{formatMonthDay(item.date)}</Text>
              </View>
              <View className={styles.reportMain}>
                <Text className={styles.reportTitle}>{item.title}</Text>
                <Text className={styles.reportSummary}>{item.summary}</Text>
              </View>
              <Text className={styles.arrow}>›</Text>
            </View>
          ))}
        </SectionCard>
      </View>

      <View className={styles.sectionGap}>
        <SectionCard title="数据与设置">
          <View
            className={styles.settingItem}
            onClick={() =>
              showInfo(
                '数据来源',
                '工商银行官网公开的积存金行情查询页面。小程序仅做展示与记录，不登录银行账户、不涉及任何交易操作。'
              )
            }
          >
            <Text className={styles.settingLabel}>数据来源</Text>
            <Text className={styles.settingValue}>工行公开行情</Text>
          </View>
          <View
            className={styles.settingItem}
            onClick={() =>
              showInfo(
                '存储方式',
                '桌面端把行情与个人数据保存在本机 MySQL；当前小程序使用本地 Mock 数据。接入后端后可改为加密存储。'
              )
            }
          >
            <Text className={styles.settingLabel}>存储方式</Text>
            <Text className={styles.settingValue}>本地 Mock</Text>
          </View>
          <View
            className={styles.settingItem}
            onClick={() =>
              showInfo('更新频率', '桌面端每 4 秒采集一次，对工行站点最短间隔 2 秒；小程序按接口返回频率刷新。')
            }
          >
            <Text className={styles.settingLabel}>更新频率</Text>
            <Text className={styles.settingValue}>4 秒 / 次</Text>
          </View>
          <View
            className={styles.settingItem}
            onClick={() =>
              showInfo('技术支持', 'Taro 4.1.9 + React 18 + TypeScript + SCSS Modules，可编译到微信 / 支付宝 / 抖音 / H5。')
            }
          >
            <Text className={styles.settingLabel}>技术栈</Text>
            <Text className={styles.settingValue}>Taro 4</Text>
          </View>
        </SectionCard>
      </View>

      <View className={styles.sectionGap}>
        <SectionCard title="免责声明">
          <Text className={styles.disclaimer}>
            本小程序为个人学习与技术实践项目，行情数据来自第三方公开页面，可能存在延迟、缺漏或解析偏差，
            不构成任何投资建议。据此进行交易或投资决策的风险由使用者自行承担。
          </Text>
        </SectionCard>
      </View>

      <Text className={styles.footer}>工行积存金实盘跟踪小程序</Text>
    </View>
  )
}

export default MinePage
