import React, { useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import SectionCard from '@/components/SectionCard'
import GoldRow from '@/components/GoldRow'
import StateTip from '@/components/StateTip'
import { pickSelected, useGoldStore } from '@/store/useGoldStore'
import { formatClock, formatPrice, formatSigned, trendOf } from '@/utils/format'

const HomePage: React.FC = () => {
  const snapshot = useGoldStore((state) => state.snapshot)
  const loading = useGoldStore((state) => state.loading)
  const error = useGoldStore((state) => state.error)
  const selectedCode = useGoldStore((state) => state.selectedCode)
  const quote = useGoldStore(pickSelected)
  const refresh = useGoldStore((state) => state.refresh)
  const select = useGoldStore((state) => state.select)

  useEffect(() => {
    if (!snapshot) {
      refresh()
    }
    // 仅在首次挂载时拉取，后续由下拉刷新与按钮触发
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  usePullDownRefresh(async () => {
    await refresh()
    Taro.stopPullDownRefresh()
  })

  const handleManualRefresh = async () => {
    await refresh()
    if (!useGoldStore.getState().error) {
      Taro.showToast({ title: '行情已更新', icon: 'success', duration: 1200 })
    }
  }

  const handleSelect = (code: string) => {
    select(code)
    Taro.switchTab({ url: '/pages/chart/index' })
  }

  const trend = quote ? trendOf(quote.changePct) : 'flat'
  const amplitude = quote && quote.low > 0 ? ((quote.high - quote.low) / quote.low) * 100 : 0
  const pillClass =
    trend === 'up' ? styles.pillUp : trend === 'down' ? styles.pillDown : styles.pillFlat

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.brand}>
          <View className={styles.logo}>
            <Text className={styles.logoText}>金</Text>
          </View>
          <View className={styles.brandText}>
            <Text className={styles.brandTitle}>积存金跟踪</Text>
            <Text className={styles.brandSub}>
              {snapshot ? `采集于 ${formatClock(snapshot.updatedAt)}` : '本地行情快照'}
            </Text>
          </View>
        </View>
        <View className={styles.refreshBtn} onClick={handleManualRefresh}>
          <Text className={styles.refreshText}>{loading ? '刷新中' : '刷新'}</Text>
        </View>
      </View>

      {!snapshot && loading ? (
        <StateTip type="loading" text="正在获取积存金行情…" />
      ) : null}

      {!snapshot && !loading && error ? (
        <StateTip type="error" text={error} onRetry={refresh} />
      ) : null}

      {quote ? (
        <View className={styles.hero}>
          <View className={styles.heroTop}>
            <Text className={styles.heroName}>{quote.name}</Text>
            <Text className={styles.heroTime}>工行更新 {formatClock(snapshot?.sourceTime ?? '')}</Text>
          </View>
          <View className={styles.heroPrice}>
            <Text className={styles.heroValue}>{formatPrice(quote.active)}</Text>
            <Text className={styles.heroUnit}>元/克</Text>
            <View className={classnames(styles.heroPill, pillClass)}>
              <Text className={styles.heroPillText}>{formatSigned(quote.changePct, 2, '%')}</Text>
            </View>
          </View>
          <View className={styles.heroGrid}>
            <View className={styles.heroCell}>
              <Text className={styles.heroCellLabel}>定期积存</Text>
              <Text className={styles.heroCellValue}>{formatPrice(quote.regular)}</Text>
            </View>
            <View className={styles.heroCell}>
              <Text className={styles.heroCellLabel}>赎回价</Text>
              <Text className={styles.heroCellValue}>{formatPrice(quote.redeem)}</Text>
            </View>
            <View className={styles.heroCell}>
              <Text className={styles.heroCellLabel}>今日区间</Text>
              <Text className={styles.heroCellValue}>
                {formatPrice(quote.low)} - {formatPrice(quote.high)}
              </Text>
            </View>
            <View className={styles.heroCell}>
              <Text className={styles.heroCellLabel}>振幅</Text>
              <Text className={styles.heroCellValue}>{formatSigned(amplitude, 2, '%')}</Text>
            </View>
          </View>
        </View>
      ) : null}

      <View className={styles.sectionGap}>
        <SectionCard title="实时行情" extra={snapshot ? `${snapshot.rows.length} 个金种` : ''}>
          {snapshot ? (
            <View className={styles.list}>
              {snapshot.rows.map((item) => (
                <View className={styles.rowItem} key={item.code}>
                  <GoldRow quote={item} active={item.code === selectedCode} onSelect={handleSelect} />
                </View>
              ))}
            </View>
          ) : (
            <StateTip type="loading" text="行情加载中…" />
          )}
        </SectionCard>
      </View>

      <View className={styles.tips}>
        <Text className={styles.tipTitle}>当前版本说明</Text>
        <Text className={styles.tipText}>
          页面展示的是本地 Mock 数据，用于验证小程序交互与信息结构。接入已备案的 HTTPS 后端后，
          同一套接口定义可直接切换为工行官网公开行情。
        </Text>
      </View>

      <Text className={styles.disclaimer}>
        数据来源：工商银行公开行情页面 · 可能存在延迟，不构成投资建议
      </Text>
    </View>
  )
}

export default HomePage
