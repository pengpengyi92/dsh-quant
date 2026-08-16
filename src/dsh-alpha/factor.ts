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

/** 平均秩（并列值取平均秩）。 */
function averageRanks(values: readonly number[]): number[] {
  const n = values.length
  const order = values.map((_, i) => i).sort((a, b) => values[a]! - values[b]!)
  const ranks = new Array<number>(n).fill(0)
  let i = 0
  while (i < n) {
    let j = i
    while (j + 1 < n && values[order[j + 1]!] === values[order[i]!]) j++
    const avg = (i + j) / 2 + 1
    for (let k = i; k <= j; k++) ranks[order[k]!] = avg
    i = j + 1
  }
  return ranks
}

/** Spearman 秩相关（RankIC 的载体）。 */
function spearman(a: readonly number[], b: readonly number[]): number {
  if (Math.min(a.length, b.length) < 2) return 0
  return pearson(averageRanks(a), averageRanks(b))
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
  /** RankIC（Spearman 秩相关，对异常值稳健） */
  rankIc: number
  /** IC 衰减：horizon 1..decayHorizons 的 IC（factor[i] 配 forwardReturns[i+h]） */
  icDecay: number[]
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

/** 因子评估（IC/RankIC/IC衰减/ICIR/分层/换手/自相关）。 */
export function factorEvaluate(
  factorValues: readonly number[],
  forwardReturns: readonly number[],
  quantiles = 5,
  window = 20,
  decayHorizons = 5,
): FactorEval {
  if (quantiles < 2 || !Number.isInteger(quantiles)) throw new RangeError(`quantiles must be an integer >= 2, got ${quantiles}`)
  if (window < 5 || !Number.isInteger(window)) throw new RangeError(`window must be an integer >= 5, got ${window}`)
  if (decayHorizons < 1 || !Number.isInteger(decayHorizons)) throw new RangeError(`decayHorizons must be an integer >= 1, got ${decayHorizons}`)
  const { f, r } = lagPair(factorValues, forwardReturns)
  const n = f.length
  if (n < 2) throw new RangeError(`need at least 2 paired observations, got ${n}`)
  const ic = pearson(f, r)
  const rankIc = spearman(f, r)
  // IC 衰减：horizon h 的配对 f[i] vs r[i+h]
  const icDecay: number[] = []
  for (let h = 1; h <= decayHorizons; h++) {
    icDecay.push(n - h >= 2 ? pearson(f.slice(0, n - h), r.slice(h)) : 0)
  }
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
  return { ic, rankIc, icDecay, icir, icSeries, quantileReturns, longShort, turnover, autocorr1, n }
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

export interface NeutralizeOptions {
  /** 分组标签（如行业代码），与 factor 等长；配合 method: group */
  groups?: readonly (string | number)[]
  /** 风格因子（如市值/动量），每个与 factor 等长；配合 method: ols */
  styleFactors?: readonly (readonly number[])[]
  /** 方法；缺省按输入推断：styleFactors → ols，groups → group，否则 zscore */
  method?: 'group' | 'ols' | 'zscore'
}

export interface NeutralizeResult {
  /** 中性化后的因子值（z-score 标准化：均值 0、总体标准差 1） */
  values: number[]
  method: 'group' | 'ols' | 'zscore'
  /** 分组数（仅 group） */
  groupCount: number
  /** 风格因子数（仅 ols） */
  styleCount: number
  /** ols 拟合优度（仅 ols；目标方差为 0 时为 null） */
  rSquared: number | null
}

/** 总体标准差 z-score；标准差为 0 时输出全 0。 */
function zscore(values: readonly number[]): number[] {
  const n = values.length
  const mean = values.reduce((a, b) => a + b, 0) / n
  const variance = values.reduce((a, x) => a + (x - mean) ** 2, 0) / n
  const std = Math.sqrt(variance)
  return values.map(x => (std === 0 ? 0 : (x - mean) / std))
}

/** 高斯消元（列主元）解 Ax=b；奇异矩阵抛错。 */
function solveLinear(A: number[][], b: number[]): number[] {
  const m = A.length
  const M = A.map((row, i) => [...row, b[i]!])
  for (let col = 0; col < m; col++) {
    let piv = col
    for (let r = col + 1; r < m; r++) {
      if (Math.abs(M[r]![col]!) > Math.abs(M[piv]![col]!)) piv = r
    }
    if (Math.abs(M[piv]![col]!) < 1e-12) {
      throw new Error('singular design matrix: style factors may be collinear')
    }
    if (piv !== col) [M[piv], M[col]] = [M[col]!, M[piv]!]
    const d = M[col]![col]!
    for (let c = col; c <= m; c++) M[col]![c]! /= d
    for (let r = 0; r < m; r++) {
      if (r === col) continue
      const f = M[r]![col]!
      if (f === 0) continue
      for (let c = col; c <= m; c++) M[r]![c]! -= f * M[col]![c]!
    }
  }
  return M.map(row => row[m]!)
}

/**
 * 因子中性化：剥离分组/风格暴露后做 z-score 标准化。
 * - zscore：截面标准化（对照组）
 * - group：组内 z-score（行业中性化的简化版）
 * - ols：对风格因子 + 截距回归取残差再标准化（回归中性化）
 */
export function factorNeutralize(
  factor: readonly number[],
  options: NeutralizeOptions = {},
): NeutralizeResult {
  const n = factor.length
  if (n < 2) throw new RangeError(`factor must have at least 2 values, got ${n}`)
  const method = options.method
    ?? (options.styleFactors !== undefined && options.styleFactors.length > 0 ? 'ols'
      : options.groups !== undefined ? 'group' : 'zscore')

  if (method === 'group') {
    if (options.groups === undefined) throw new RangeError('method group requires groups')
    if (options.groups.length !== n) throw new RangeError(`groups length ${options.groups.length} != factor length ${n}`)
    const byGroup = new Map<string | number, number[]>()
    options.groups.forEach((g, i) => {
      const list = byGroup.get(g) ?? []
      list.push(i)
      byGroup.set(g, list)
    })
    const values = new Array<number>(n).fill(0)
    for (const indices of byGroup.values()) {
      const z = zscore(indices.map(i => factor[i]!))
      indices.forEach((idx, k) => { values[idx] = z[k]! })
    }
    return { values, method, groupCount: byGroup.size, styleCount: 0, rSquared: null }
  }

  if (method === 'ols') {
    if (options.styleFactors === undefined || options.styleFactors.length === 0) {
      throw new RangeError('method ols requires at least one style factor')
    }
    const styles = options.styleFactors
    for (const s of styles) {
      if (s.length !== n) throw new RangeError(`style factor length ${s.length} != factor length ${n}`)
    }
    const k = styles.length + 1 // 截距 + 风格因子
    const XtX: number[][] = []
    const Xty: number[] = []
    for (let i = 0; i < k; i++) {
      XtX.push(new Array<number>(k).fill(0))
      Xty.push(0)
    }
    for (let t = 0; t < n; t++) {
      const row = [1, ...styles.map(s => s[t]!)]
      for (let i = 0; i < k; i++) {
        Xty[i]! += row[i]! * factor[t]!
        for (let j = 0; j < k; j++) XtX[i]![j]! += row[i]! * row[j]!
      }
    }
    const beta = solveLinear(XtX, Xty)
    const fitted = factor.map((_, t) => {
      let y = beta[0]!
      for (let s = 0; s < styles.length; s++) y += beta[s + 1]! * styles[s]![t]!
      return y
    })
    const residuals = factor.map((y, t) => y - fitted[t]!)
    const meanY = factor.reduce((a, b) => a + b, 0) / n
    const ssTot = factor.reduce((a, y) => a + (y - meanY) ** 2, 0)
    const ssRes = residuals.reduce((a, e) => a + e ** 2, 0)
    const rSquared = ssTot === 0 ? null : 1 - ssRes / ssTot
    return { values: zscore(residuals), method, groupCount: 0, styleCount: styles.length, rSquared }
  }

  return { values: zscore(factor), method: 'zscore', groupCount: 0, styleCount: 0, rSquared: null }
}
