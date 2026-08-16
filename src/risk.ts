/**
 * 风险指标库（纯函数、零依赖）。
 *
 * 输入：逐期收益序列（+ 可选基准收益）。
 * 指标：历史 VaR / CVaR（Expected Shortfall）/ 下行偏差 / 最大回撤 /
 * Beta / Alpha（Jensen）/ 信息比率 / 跟踪误差。
 * 语义：收益序列按"资产收益"输入（如日收益率，小数形式 0.01 = 1%）。
 */

export interface RiskMetrics {
  /** 历史 VaR（正值表示损失），置信度默认 95% */
  var95: number
  /** CVaR / Expected Shortfall（95%） */
  cvar95: number
  /** 下行偏差（只统计负收益的波动） */
  downsideDeviation: number
  /** 最大回撤 %（从累计净值计算） */
  maxDrawdownPct: number
  /** Beta（对基准回归；无基准时 0） */
  beta: number
  /** Jensen Alpha（每期超额，小数） */
  alpha: number
  /** 信息比率（年化：超额收益 / 跟踪误差 × √365） */
  informationRatio: number
  /** 跟踪误差（年化 %） */
  trackingError: number
  /** 样本期数 */
  periods: number
}

/** 从收益序列计算风险指标。 */
export function riskMetrics(
  returns: readonly number[],
  options: { benchmarkReturns?: readonly number[]; confidence?: number } = {},
): RiskMetrics {
  const n = returns.length
  if (n < 2) throw new RangeError(`returns needs >= 2 periods, got ${n}`)
  const confidence = options.confidence ?? 0.95
  if (!Number.isFinite(confidence) || confidence <= 0 || confidence >= 1) {
    throw new RangeError(`confidence must be in (0, 1), got ${confidence}`)
  }
  // VaR / CVaR（历史法）
  const sorted = [...returns].sort((a, b) => a - b)
  const tailIdx = Math.max(0, Math.floor((1 - confidence) * n) - 1)
  const varCut = -sorted[tailIdx]!
  const tail = sorted.filter(r => r <= -varCut)
  const cvar95 = tail.length === 0 ? varCut : -(tail.reduce((a, b) => a + b, 0) / tail.length)
  // 下行偏差
  const downs = returns.filter(r => r < 0)
  const downMean = downs.length === 0 ? 0 : downs.reduce((a, b) => a + b, 0) / n
  const downVar = downs.length === 0 ? 0 : downs.reduce((a, x) => a + (x - downMean) ** 2, 0) / n
  const downsideDeviation = Math.sqrt(downVar)
  // 最大回撤（从累计净值）
  let nav = 1
  let peak = 1
  let maxDd = 0
  for (const r of returns) {
    nav *= 1 + r
    if (nav > peak) peak = nav
    const dd = (peak - nav) / peak
    if (dd > maxDd) maxDd = dd
  }
  const maxDrawdownPct = maxDd * 100
  // Beta / Alpha / IR / TE
  const bench = options.benchmarkReturns
  let beta = 0
  let alpha = 0
  let informationRatio = 0
  let trackingError = 0
  if (bench && bench.length === n) {
    const rMean = returns.reduce((a, b) => a + b, 0) / n
    const bMean = bench.reduce((a, b) => a + b, 0) / n
    let cov = 0
    let bVar = 0
    for (let i = 0; i < n; i++) {
      cov += (returns[i]! - rMean) * (bench[i]! - bMean)
      bVar += (bench[i]! - bMean) ** 2
    }
    cov /= n
    bVar /= n
    beta = bVar === 0 ? 0 : cov / bVar
    alpha = rMean - beta * bMean
    const excess = returns.map((r, i) => r - bench[i]!)
    const exMean = excess.reduce((a, b) => a + b, 0) / n
    const exVar = excess.reduce((a, x) => a + (x - exMean) ** 2, 0) / n
    const te = Math.sqrt(exVar)
    trackingError = te * Math.sqrt(365) * 100
    informationRatio = te === 0 ? 0 : (exMean / te) * Math.sqrt(365)
  }
  return { var95: varCut, cvar95, downsideDeviation, maxDrawdownPct, beta, alpha, informationRatio, trackingError, periods: n }
}

export interface VarBacktestResult {
  /** 实际失败次数（损失超过 VaR 的期数） */
  failures: number
  /** 期望失败次数 */
  expected: number
  /** Kupiec POF 似然比统计量 */
  lrStat: number
  /** 近似 p 值（卡方 1 自由度） */
  pValue: number
  /** 95% 置信水平下是否通过（LR <= 3.841） */
  passed: boolean
  periods: number
}

/** 误差函数近似（Abramowitz–Stegun 7.1.26，精度 ~1e-7）。 */
function erfApprox(x: number): number {
  const sign = x < 0 ? -1 : 1
  const ax = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * ax)
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-ax * ax)
  return sign * y
}

/** 卡方 CDF（1 自由度）= erf(sqrt(x/2))。 */
function chi2Cdf1(x: number): number {
  if (x <= 0) return 0
  return erfApprox(Math.sqrt(x / 2))
}

/**
 * Kupiec POF 检验：VaR 序列的失败率回测。
 * returns 与 varSeries 等长；varSeries[i] 为第 i 期预期的 VaR（正值损失）。
 * p = 1 - confidence。
 */
export function kupiecTest(
  returns: readonly number[],
  varSeries: readonly number[],
  confidence = 0.95,
): VarBacktestResult {
  const n = returns.length
  if (n < 2) throw new RangeError(`returns needs >= 2 periods, got ${n}`)
  if (varSeries.length !== n) throw new RangeError(`varSeries length ${varSeries.length} != ${n}`)
  const p = 1 - confidence
  let failures = 0
  for (let i = 0; i < n; i++) {
    if (returns[i]! < -varSeries[i]!) failures++
  }
  const expected = p * n
  const x = failures
  if (x === 0 || x === n) {
    // 极端情形：LR → 无穷（0 失败）或有限；用哨兵值
    const lrStat = x === 0 ? Number.POSITIVE_INFINITY : -2 * (n * Math.log(p))
    return { failures: x, expected, lrStat, pValue: 0, passed: x === 0 ? false : false, periods: n }
  }
  const pHat = x / n
  const lrStat = -2 * ((n - x) * Math.log((1 - p) / (1 - pHat)) + x * Math.log(p / pHat))
  const pValue = 1 - chi2Cdf1(lrStat)
  return { failures: x, expected, lrStat, pValue, passed: lrStat <= 3.841, periods: n }
}
