/**
 * 因子评估与合成（纯函数、零依赖；方法论对齐 alphalens）。
 *
 * 数据适配说明：dsh-quant 不提供数据，本模块接受"等长数组"输入：
 * - 单资产时间序列：factor[t] 配 forwardReturns[t+1]（factor[t] 预测的是未来收益）
 * - 多资产截面：把截面按时间摊平为序列后传入（文档见 README/plan）
 *
 * 指标语义（alphalens 金标准）：
 * - IC：因子值与未来收益的 Pearson 相关（方向 + 强度）
 * - ICIR：滚动 IC 的均值/标准差（稳定性）
 * - 分位数分层收益：按因子值分 5 组，各组未来收益均值 + 多空价差（Q5-Q1）
 * - 换手：相邻期分位数组变化的平均比例（策略成本代理）
 * - 自相关：因子自身的持续性
 */

/** 滚动窗口 Pearson 相关（两个等长数组）。 */
function pearson(a: readonly number[], b: readonly number[]): number {
  const n = Math.min(a.length, b.length)
  if (n < 2) return 0
  let sa = 0
  let sb = 0
  for (let i = 0; i < n; i++) {
    sa += a[i]!
    sb += b[i]!
  }
  const ma = sa / n
  const mb = sb / n
  let cov = 0
  let va = 0
  let vb = 0
  for (let i = 0; i < n; i++) {
    cov += (a[i]! - ma) * (b[i]! - mb)
    va += (a[i]! - ma) ** 2
    vb += (b[i]! - mb) ** 2
  }
  if (va === 0 || vb === 0) return 0
  return cov / Math.sqrt(va * vb)
}

/** 滞后配对：factor[i] 配 forwardReturns[i+1]（factor 预测未来一期收益）。 */
function lagPair(
  factor: readonly number[],
  forwardReturns: readonly number[],
): { f: number[]; r: number[] } {
  const n = Math.min(factor.length, forwardReturns.length) - 1
  const f: number[] = []
  const r: number[] = []
  for (let i = 0; i < n; i++) {
    f.push(factor[i]!)
    r.push(forwardReturns[i + 1]!)
  }
  return { f, r }
}

export interface QuantileBucket {
  quantile: number
  /** 组内未来收益均值 */
  meanReturn: number
  count: number
}

export interface FactorEval {
  /** 全样本 IC */
  ic: number
  /** ICIR = 滚动 IC 均值 / 滚动 IC 标准差 */
  icir: number
  /** 滚动 IC 序列（window 滑动） */
  icSeries: number[]
  /** 分位数分层收益（按因子值升序分 quantiles 组） */
  quantileReturns: QuantileBucket[]
  /** 多空价差 = 最高组均值 - 最低组均值 */
  longShort: number
  /** 换手：相邻期分位数组变化的平均比例 */
  turnover: number
  /** 因子一阶自相关 */
  autocorr1: number
  /** 有效配对样本数 */
  n: number
}

/** 因子评估（IC/ICIR/分层/换手/自相关）。 */
export function factorEvaluate(
  factorValues: readonly number[],
  forwardReturns: readonly number[],
  quantiles = 5,
  window = 20,
): FactorEval {
  if (quantiles < 2 || !Number.isInteger(quantiles)) throw new RangeError(`quantiles must be an integer >= 2, got ${quantiles}`)
  if (window < 5 || !Number.isInteger(window)) throw new RangeError(`window must be an integer >= 5, got ${window}`)
  const { f, r } = lagPair(factorValues, forwardReturns)
  const n = f.length
  if (n < 2) throw new RangeError(`need at least 2 paired observations, got ${n}`)
  const ic = pearson(f, r)
  // 滚动 IC
  const icSeries: number[] = []
  for (let i = 0; i + window <= n; i++) {
    icSeries.push(pearson(f.slice(i, i + window), r.slice(i, i + window)))
  }
  const icMean = icSeries.length === 0 ? 0 : icSeries.reduce((a, b) => a + b, 0) / icSeries.length
  const icStd = icSeries.length === 0 ? 0 : Math.sqrt(icSeries.reduce((a, x) => a + (x - icMean) ** 2, 0) / icSeries.length)
  const icir = icStd === 0 ? 0 : icMean / icStd
  // 分位数分组（按因子值升序）
  const sorted = f.map((v, i) => ({ v, r: r[i]! })).sort((a, b) => a.v - b.v)
  const bucketSize = Math.ceil(sorted.length / quantiles)
  const quantileReturns: QuantileBucket[] = []
  for (let q = 0; q < quantiles; q++) {
    const slice = sorted.slice(q * bucketSize, Math.min((q + 1) * bucketSize, sorted.length))
    if (slice.length === 0) continue
    const mean = slice.reduce((a, x) => a + x.r, 0) / slice.length
    quantileReturns.push({ quantile: q + 1, meanReturn: mean, count: slice.length })
  }
  const longShort = quantileReturns.length >= 2
    ? quantileReturns[quantileReturns.length - 1]!.meanReturn - quantileReturns[0]!.meanReturn
    : 0
  // 换手：按全样本分位数边界给每期分组，相邻期组号变化比例
  const boundaries: number[] = []
  for (let q = 1; q < quantiles; q++) {
    boundaries.push(sorted[Math.min(q * bucketSize, sorted.length - 1)]!.v)
  }
  const groupOf = (v: number): number => {
    let g = 1
    for (const b of boundaries) {
      if (v >= b) g++
      else break
    }
    return g
  }
  let changes = 0
  let validPairs = 0
  for (let i = 1; i < f.length; i++) {
    changes += groupOf(f[i]!) !== groupOf(f[i - 1]!) ? 1 : 0
    validPairs++
  }
  const turnover = validPairs === 0 ? 0 : changes / validPairs
  // 因子自相关（滞后 1）
  const autocorr1 = pearson(f.slice(0, n - 1), f.slice(1))
  return { ic, icir, icSeries, quantileReturns, longShort, turnover, autocorr1, n }
}

export interface CombineResult {
  /** 合成信号（截面 rank 归一化到 0..1，升序=分数越大越好） */
  signal: number[]
  /** 各因子的 z-score 标准化权重（归一化后） */
  effectiveWeights: number[]
  /** 输入因子数 */
  factorCount: number
}

/**
 * 多因子合成：各因子 z-score 标准化 → 按权重（默认等权）加权 → 截面 rank
 * 归一化到 0..1。各因子数组须等长。
 */
export function combineFactors(
  factors: readonly (readonly number[])[],
  weights?: readonly number[],
): CombineResult {
  if (factors.length === 0) throw new RangeError('factors must not be empty')
  const n = factors[0]!.length
  for (const fx of factors) {
    if (fx.length !== n) throw new RangeError(`factor length ${fx.length} != ${n}`)
  }
  const w = weights ?? factors.map(() => 1 / factors.length)
  if (w.length !== factors.length) throw new RangeError(`weights length ${w.length} != ${factors.length}`)
  const wSum = w.reduce((a, b) => a + b, 0)
  if (Math.abs(wSum - 1) > 1e-9) throw new RangeError(`weights must sum to 1, got ${wSum}`)
  const z: number[][] = factors.map(fx => {
    const mean = fx.reduce((a, b) => a + b, 0) / n
    const variance = fx.reduce((a, x) => a + (x - mean) ** 2, 0) / n
    const std = Math.sqrt(variance)
    return fx.map(x => (std === 0 ? 0 : (x - mean) / std))
  })
  const combined: number[] = new Array(n).fill(0)
  for (let k = 0; k < factors.length; k++) {
    for (let i = 0; i < n; i++) combined[i] += z[k]![i]! * w[k]!
  }
  // rank 归一化（升序 0..1）
  const sorted = [...combined].sort((a, b) => a - b)
  const signal = combined.map(v => {
    const idx = sorted.indexOf(v)
    return n === 1 ? 0 : idx / (n - 1)
  })
  return { signal, effectiveWeights: [...w], factorCount: factors.length }
}
