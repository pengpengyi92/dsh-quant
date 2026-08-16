/**
 * 序列描述统计与数据质量检查（纯函数、零依赖）。
 */

export interface SeriesStats {
  count: number
  mean: number
  std: number
  min: number
  max: number
  median: number
  /** 偏度（Fisher-Pearson 标准化矩） */
  skew: number
  /** 超额峰度 */
  kurtosis: number
  /** 一阶自相关（滞后 1） */
  autocorr1: number
  /** 年化波动率（sqrt(365) × 日收益标准差；仅当输入为价格序列时有意义） */
  annualizedVol: number
  /** 总收益率 %（首值 → 末值） */
  totalReturnPct: number
}

/** 序列描述统计。要求至少 2 个有限值；空序列抛错。 */
export function seriesStats(values: readonly number[]): SeriesStats {
  const v = values.filter(x => Number.isFinite(x))
  if (v.length === 0) throw new RangeError('values must contain at least one finite number')
  const n = v.length
  const mean = v.reduce((a, b) => a + b, 0) / n
  const variance = v.reduce((a, x) => a + (x - mean) ** 2, 0) / n
  const std = Math.sqrt(variance)
  const sorted = [...v].sort((a, b) => a - b)
  const median = n % 2 === 1 ? sorted[(n - 1) / 2]! : (sorted[n / 2 - 1]! + sorted[n / 2]!) / 2
  const m3 = v.reduce((a, x) => a + (x - mean) ** 3, 0) / n
  const m4 = v.reduce((a, x) => a + (x - mean) ** 4, 0) / n
  const skew = std === 0 ? 0 : m3 / std ** 3
  const kurtosis = std === 0 ? 0 : m4 / std ** 4 - 3
  // 一阶自相关
  let autocorr1 = 0
  if (n >= 2 && variance > 0) {
    let cov = 0
    for (let i = 1; i < n; i++) cov += (v[i]! - mean) * (v[i - 1]! - mean)
    autocorr1 = cov / ((n - 1) * variance)
  }
  // 年化波动（基于逐期收益）
  let annVol = 0
  if (n >= 2) {
    const rets: number[] = []
    for (let i = 1; i < n; i++) rets.push(v[i]! / v[i - 1]! - 1)
    const rMean = rets.reduce((a, b) => a + b, 0) / rets.length
    const rVar = rets.reduce((a, x) => a + (x - rMean) ** 2, 0) / rets.length
    annVol = Math.sqrt(rVar) * Math.sqrt(365)
  }
  const totalReturnPct = v[0]! === 0 ? 0 : ((v[n - 1]! - v[0]!) / v[0]!) * 100
  return {
    count: n,
    mean,
    std,
    min: sorted[0]!,
    max: sorted[n - 1]!,
    median,
    skew,
    kurtosis,
    autocorr1,
    annualizedVol: annVol * 100,
    totalReturnPct,
  }
}

export interface CandleQuality {
  /** 有效 K 线数 */
  count: number
  /** high < low 的非法 K 线数 */
  highBelowLow: number
  /** 非正值（open/high/low/close <= 0）数量 */
  nonPositive: number
  /** 时间戳未严格递增的位置数 */
  timeNotIncreasing: number
  /** 时间缺口数（相邻时间戳间隔不等的段数；需要 >= 3 根） */
  timeGaps: number
  /** close 相对前一根变动超过 50% 的位置数（可能的数据错误） */
  extremeMoves: number
  /** 各项是否全部健康 */
  healthy: boolean
}

export interface CandleInput {
  openTime: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

/** OHLCV K 线质量检查（供 agent 在分析前验证数据健康）。 */
export function candlesCheck(candles: readonly CandleInput[]): CandleQuality {
  let highBelowLow = 0
  let nonPositive = 0
  let timeNotIncreasing = 0
  let timeGaps = 0
  let extremeMoves = 0
  const n = candles.length
  if (n > 1) {
    const firstStep = candles[1]!.openTime - candles[0]!.openTime
    for (let i = 0; i < n; i++) {
      const c = candles[i]!
      if (c.high < c.low) highBelowLow++
      if (c.open <= 0 || c.high <= 0 || c.low <= 0 || c.close <= 0) nonPositive++
      if (i >= 1) {
        const p = candles[i - 1]!
        if (c.openTime <= p.openTime) timeNotIncreasing++
        if (i >= 2) {
          const step = c.openTime - p.openTime
          if (step !== firstStep && step > 0) timeGaps++
        }
        if (p.close !== 0 && Math.abs(c.close / p.close - 1) > 0.5) extremeMoves++
      }
    }
  }
  const healthy = highBelowLow === 0 && nonPositive === 0 && timeNotIncreasing === 0 && timeGaps === 0 && extremeMoves === 0
  return { count: n, highBelowLow, nonPositive, timeNotIncreasing, timeGaps, extremeMoves, healthy }
}

export interface SeriesQuality {
  count: number
  /** 非有限值（NaN/Infinity/null）数量 */
  missingCount: number
  /** |z-score| > 3 的异常值数量 */
  zOutliers: number
  /** 相邻变动超过 jumpThreshold 的位置数 */
  jumps: number
  /** 连续相同值的最长长度（>= 3 提示数据冻结） */
  longestConstantRun: number
  healthy: boolean
}

/** 序列质量检查：缺值、z 异常、跳变、冻结。 */
export function seriesQuality(values: readonly number[], jumpThreshold = 0.2): SeriesQuality {
  const finite: number[] = []
  let missingCount = 0
  for (const v of values) {
    if (Number.isFinite(v)) finite.push(v)
    else missingCount++
  }
  const n = values.length
  const mean = finite.length === 0 ? 0 : finite.reduce((a, b) => a + b, 0) / finite.length
  const variance = finite.length === 0 ? 0 : finite.reduce((a, x) => a + (x - mean) ** 2, 0) / finite.length
  const std = Math.sqrt(variance)
  let zOutliers = 0
  if (std > 0) {
    for (const x of finite) {
      if (Math.abs((x - mean) / std) > 3) zOutliers++
    }
  }
  let jumps = 0
  for (let i = 1; i < n; i++) {
    const a = values[i - 1]!
    const b = values[i]!
    if (Number.isFinite(a) && Number.isFinite(b) && a !== 0 && Math.abs(b / a - 1) > jumpThreshold) jumps++
  }
  let longest = 0
  let run = 1
  for (let i = 1; i < n; i++) {
    if (values[i] === values[i - 1]) {
      run++
      if (run > longest) longest = run
    } else run = 1
  }
  const healthy = missingCount === 0 && zOutliers === 0 && jumps === 0 && longest < 3
  return { count: n, missingCount, zOutliers, jumps, longestConstantRun: longest, healthy }
}

export interface DataAnnotation {
  index: number
  /** missing / z_outlier / jump_up / jump_down / frozen */
  label: 'missing' | 'z_outlier' | 'jump_up' | 'jump_down' | 'frozen'
  /** 1 = 提示，2 = 明显问题，3 = 严重（需人工复核） */
  severity: 1 | 2 | 3
  detail: string
}

export interface AnnotateResult {
  count: number
  annotations: DataAnnotation[]
  summary: { missing: number; zOutliers: number; jumps: number; frozen: number }
}

/**
 * 数据标注：把序列级质量问题定位到"点级标签"（致敬 Scale AI 的标注哲学——
 * 数据质量不是一句结论，而是每条问题都可定位、可复核、可治理的标注）。
 * z 阈值 3σ、跳变阈值 20%、冻结阈值连续 >= 3。
 */
export function annotateSeries(values: readonly number[], jumpThreshold = 0.2): AnnotateResult {
  const annotations: DataAnnotation[] = []
  const summary = { missing: 0, zOutliers: 0, jumps: 0, frozen: 0 }
  const n = values.length
  const finite: { index: number; value: number }[] = []
  values.forEach((v, i) => {
    if (!Number.isFinite(v)) {
      annotations.push({ index: i, label: 'missing', severity: 3, detail: `non-finite value at index ${i}` })
      summary.missing++
    } else {
      finite.push({ index: i, value: v })
    }
  })
  const mean = finite.length === 0 ? 0 : finite.reduce((a, x) => a + x.value, 0) / finite.length
  const variance = finite.length === 0 ? 0 : finite.reduce((a, x) => a + (x.value - mean) ** 2, 0) / finite.length
  const std = Math.sqrt(variance)
  if (std > 0) {
    for (const { index, value } of finite) {
      const z = (value - mean) / std
      if (Math.abs(z) > 3) {
        annotations.push({
          index,
          label: 'z_outlier',
          severity: z > 5 ? 3 : 2,
          detail: `z-score ${z.toFixed(2)} (> 3σ)`,
        })
        summary.zOutliers++
      }
    }
  }
  for (let i = 1; i < n; i++) {
    const a = values[i - 1]!
    const b = values[i]!
    if (Number.isFinite(a) && Number.isFinite(b) && a !== 0) {
      const change = b / a - 1
      if (change > jumpThreshold) {
        annotations.push({ index: i, label: 'jump_up', severity: change > 0.5 ? 2 : 1, detail: `+${(change * 100).toFixed(1)}% vs previous` })
        summary.jumps++
      } else if (change < -jumpThreshold) {
        annotations.push({ index: i, label: 'jump_down', severity: change < -0.5 ? 2 : 1, detail: `${(change * 100).toFixed(1)}% vs previous` })
        summary.jumps++
      }
    }
  }
  let runStart = 0
  let run = 1
  for (let i = 1; i <= n; i++) {
    if (i < n && values[i] === values[i - 1]) {
      run++
      continue
    }
    if (run >= 3) {
      annotations.push({
        index: runStart,
        label: 'frozen',
        severity: run >= 10 ? 3 : 2,
        detail: `value frozen for ${run} consecutive points`,
      })
      summary.frozen++
    }
    runStart = i
    run = 1
  }
  return { count: n, annotations, summary }
}
