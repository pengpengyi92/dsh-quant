/**
 * 组合归因（纯函数、零依赖）。
 *
 * 核心问题：组合收益来自哪里？
 * - 资产贡献：每个资产对组合收益的贡献（权重 × 收益）
 * - 因子暴露贡献：组合在已知因子上的暴露带来的收益（回归）
 * - 残差：无法解释的部分（选股 alpha）
 */

/** 组合归因结果。 */
export interface AttributionResult {
  /** 组合总收益 % */
  totalReturnPct: number
  /** 各资产贡献（权重 × 收益），与输入资产顺序一致 */
  assetContributionsPct: number[]
  /** 资产贡献占比（归一化到 100%） */
  assetContribShares: number[]
  /** 因子暴露贡献（回归系数 × 组合暴露）% */
  factorContributionsPct: number[]
  /** 残差（alpha）% */
  residualPct: number
  /** 归因 R²（因子解释的比例） */
  factorR2: number
  notes: string[]
}

/** 线性回归系数（最小二乘）。 */
function regress(y: number[], X: number[][]): { beta: number[]; r2: number } {
  const m = y.length
  const k = X[0]!.length
  // XtX, Xty
  const XtX: number[][] = Array.from({ length: k }, () => new Array<number>(k).fill(0))
  const Xty = new Array<number>(k).fill(0)
  for (let i = 0; i < m; i++) {
    for (let a = 0; a < k; a++) {
      Xty[a]! += X[i]![a]! * y[i]!
      for (let b = 0; b < k; b++) XtX[a]![b]! += X[i]![a]! * X[i]![b]!
    }
  }
  // 高斯消元
  const M = XtX.map((row, i) => [...row, Xty[i]!])
  const n = k
  for (let col = 0; col < n; col++) {
    let pivot = col
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r]![col]!) > Math.abs(M[pivot]![col]!)) pivot = r
    }
    if (Math.abs(M[pivot]![col]!) < 1e-12) return { beta: new Array<number>(k).fill(0), r2: 0 }
    ;[M[col], M[pivot]] = [M[pivot]!, M[col]!]
    for (let r = 0; r < n; r++) {
      if (r === col) continue
      const f = M[r]![col]! / M[col]![col]!
      for (let c = col; c <= n; c++) M[r]![c]! -= f * M[col]![c]!
    }
  }
  const beta = M.map((row, i) => row[n]! / row[i]!)
  // R²
  const yMean = y.reduce((a, b) => a + b, 0) / m
  let ssTot = 0
  let ssRes = 0
  for (let i = 0; i < m; i++) {
    let pred = 0
    for (let a = 0; a < k; a++) pred += X[i]![a]! * beta[a]!
    ssTot += (y[i]! - yMean) ** 2
    ssRes += (y[i]! - pred) ** 2
  }
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot
  return { beta, r2 }
}

/**
 * 组合归因。
 *
 * 输入：
 * - returns：每期每资产收益矩阵 [time][asset]
 * - weights：资产权重（和为 1）
 * - factorExposures：可选，每期每资产的因子暴露 [time][asset][factor]
 *
 * 输出：资产贡献 + 因子暴露贡献（若提供 factorExposures）+ 残差 alpha。
 */
export function attribution(
  returns: readonly number[][],
  weights: readonly number[],
  factorExposures?: readonly number[][][],
): AttributionResult {
  const t = returns.length
  if (t < 5) throw new RangeError(`returns must have at least 5 time points, got ${t}`)
  const n = returns[0]!.length
  if (n < 1) throw new RangeError('returns must have at least 1 asset')
  if (weights.length !== n) throw new RangeError(`weights length ${weights.length} != assets ${n}`)
  const wSum = weights.reduce((a, b) => a + b, 0)
  if (Math.abs(wSum - 1) > 1e-6) throw new RangeError(`weights must sum to 1, got ${wSum}`)
  for (const row of returns) {
    if (row.length !== n) throw new RangeError(`returns row length != ${n}`)
  }
  if (factorExposures !== undefined) {
    if (factorExposures.length !== t) throw new RangeError(`factorExposures time length ${factorExposures.length} != ${t}`)
    for (let i = 0; i < t; i++) {
      if (factorExposures[i]!.length !== n) throw new RangeError(`factorExposures row ${i} length != ${n}`)
    }
  }

  // 资产贡献：每期 w_i * r_i，累计
  const assetContributionsPct = new Array<number>(n).fill(0)
  for (let i = 0; i < t; i++) {
    for (let a = 0; a < n; a++) {
      assetContributionsPct[a]! += weights[a]! * returns[i]![a]! * 100
    }
  }
  const totalReturnPct = assetContributionsPct.reduce((a, b) => a + b, 0)
  const assetContribShares = totalReturnPct === 0
    ? new Array<number>(n).fill(1 / n)
    : assetContributionsPct.map(x => x / totalReturnPct)

  // 因子归因（若提供暴露）
  let factorContributionsPct: number[] = []
  let residualPct = 0
  let factorR2 = 0
  if (factorExposures !== undefined) {
    const k = factorExposures[0]![0]!.length
    // 组合暴露序列 [time][factor]
    const portExpo: number[][] = []
    const portRet: number[] = []
    for (let i = 0; i < t; i++) {
      const ex = new Array<number>(k).fill(0)
      let r = 0
      for (let a = 0; a < n; a++) {
        for (let f = 0; f < k; f++) ex[f]! += weights[a]! * factorExposures[i]![a]![f]!
        r += weights[a]! * returns[i]![a]!
      }
      portExpo.push(ex)
      portRet.push(r)
    }
    const { beta, r2 } = regress(portRet, portExpo)
    factorR2 = r2
    // 因子贡献 = beta_f × Σ期组合暴露_f（累计，与总收益同口径）
    factorContributionsPct = beta.map((b, f) => b * portExpo.reduce((s, e) => s + e[f]!, 0) * 100)
    // 残差 = 总收益 - 因子解释
    const explained = factorContributionsPct.reduce((a, b) => a + b, 0)
    residualPct = totalReturnPct - explained
  }

  const notes: string[] = []
  const topAsset = assetContribShares.indexOf(Math.max(...assetContribShares))
  notes.push(`最大贡献资产 #${topAsset}（占比 ${(assetContribShares[topAsset]! * 100).toFixed(0)}%）`)
  if (factorExposures !== undefined) {
    notes.push(`因子解释度 R²=${factorR2.toFixed(2)}，残差 alpha ${residualPct.toFixed(2)}%`)
  }
  return {
    totalReturnPct, assetContributionsPct, assetContribShares,
    factorContributionsPct, residualPct, factorR2, notes,
  }
}
