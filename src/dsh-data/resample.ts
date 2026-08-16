/**
 * 数据转换（纯函数、零依赖）：周期聚合（resample）与研究报告生成。
 */

export interface SourceCandle {
  openTime: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface AggregatedCandle {
  /** 周期首根的开盘时间 */
  openTime: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  /** 该周期包含的原始根数 */
  bars: number
}

export type ResamplePeriod = 'week' | 'month'

const PERIOD_BARS: Record<ResamplePeriod, number> = { week: 7, month: 30 }

/**
 * K 线周期聚合：按固定根数分桶（week=7、month=30），适用于 7×24 市场
 * （crypto）；A 股交易日历需外部传入桶边界（数据适配原则）。
 * 尾部不足一桶按实际根数聚合。
 */
export function resampleCandles(candles: readonly SourceCandle[], period: ResamplePeriod): AggregatedCandle[] {
  const bars = PERIOD_BARS[period]
  const out: AggregatedCandle[] = []
  for (let start = 0; start < candles.length; start += bars) {
    const bucket = candles.slice(start, start + bars)
    if (bucket.length === 0) continue
    let high = -Infinity
    let low = Infinity
    let volume = 0
    for (const c of bucket) {
      if (c.high > high) high = c.high
      if (c.low < low) low = c.low
      volume += c.volume
    }
    out.push({
      openTime: bucket[0]!.openTime,
      open: bucket[0]!.open,
      high,
      low,
      close: bucket[bucket.length - 1]!.close,
      volume,
      bars: bucket.length,
    })
  }
  return out
}

