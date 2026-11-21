import React, { useEffect } from 'react'
import { View, Canvas } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import { toRpx } from '@/utils/format'
import type { PricePoint } from '@/types'

interface TrendChartProps {
  points: PricePoint[]
  /** 折线颜色 */
  color?: string
}

const CANVAS_ID = 'goldTrendCanvas'
const WIDTH_RPX = 622
const HEIGHT_RPX = 380

function hexToRgba(hex: string, alpha: number): string {
  const value = hex.replace('#', '')
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

const TrendChart: React.FC<TrendChartProps> = ({ points, color = '#c99a2e' }) => {
  useEffect(() => {
    if (points.length < 2) {
      return
    }
    try {
      const width = toRpx(WIDTH_RPX)
      const height = toRpx(HEIGHT_RPX)
      const padLeft = toRpx(8)
      const padRight = toRpx(8)
      const padTop = toRpx(20)
      const padBottom = toRpx(34)
      const chartW = width - padLeft - padRight
      const chartH = height - padTop - padBottom

      const prices = points.map((item) => item.price)
      const max = Math.max(...prices)
      const min = Math.min(...prices)
      const span = max - min || 1
      const xOf = (index: number): number =>
        padLeft + (chartW * index) / Math.max(points.length - 1, 1)
      const yOf = (value: number): number => padTop + chartH - ((value - min) / span) * chartH

      const ctx = Taro.createCanvasContext(CANVAS_ID)

      // 横向网格线
      ctx.setLineWidth(1)
      ctx.setStrokeStyle('rgba(31,29,26,0.06)')
      for (let i = 0; i <= 3; i += 1) {
        const y = padTop + (chartH * i) / 3
        ctx.beginPath()
        ctx.moveTo(padLeft, y)
        ctx.lineTo(padLeft + chartW, y)
        ctx.stroke()
      }

      // 面积填充
      ctx.beginPath()
      ctx.moveTo(xOf(0), yOf(prices[0]))
      for (let i = 1; i < points.length; i += 1) {
        ctx.lineTo(xOf(i), yOf(prices[i]))
      }
      ctx.lineTo(xOf(points.length - 1), padTop + chartH)
      ctx.lineTo(xOf(0), padTop + chartH)
      ctx.closePath()
      ctx.setFillStyle(hexToRgba(color, 0.12))
      ctx.fill()

      // 折线
      ctx.beginPath()
      ctx.setStrokeStyle(color)
      ctx.setLineWidth(2)
      for (let i = 0; i < points.length; i += 1) {
        const x = xOf(i)
        const y = yOf(prices[i])
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()

      // 末点高亮
      const lastX = xOf(points.length - 1)
      const lastY = yOf(prices[prices.length - 1])
      ctx.beginPath()
      ctx.setFillStyle('#ffffff')
      ctx.arc(lastX, lastY, toRpx(7), 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.setFillStyle(color)
      ctx.arc(lastX, lastY, toRpx(4.5), 0, Math.PI * 2)
      ctx.fill()

      // 刻度文字
      ctx.setFillStyle('#8f887c')
      ctx.setFontSize(toRpx(20))
      ctx.setTextAlign('left')
      ctx.fillText(max.toFixed(2), padLeft, padTop - toRpx(4))
      ctx.fillText(min.toFixed(2), padLeft, padTop + chartH + toRpx(22))

      const first = points[0].label
      const middle = points[Math.floor(points.length / 2)].label
      const last = points[points.length - 1].label
      ctx.fillText(first, padLeft, height - toRpx(6))
      ctx.setTextAlign('center')
      ctx.fillText(middle, width / 2, height - toRpx(6))
      ctx.setTextAlign('right')
      ctx.fillText(last, width - padRight, height - toRpx(6))

      ctx.draw()
    } catch (error) {
      console.error('[TrendChart] 绘制失败', error)
    }
  }, [points, color])

  return (
    <View className={styles.wrap}>
      <Canvas canvasId={CANVAS_ID} className={styles.canvas} />
    </View>
  )
}

export default TrendChart
