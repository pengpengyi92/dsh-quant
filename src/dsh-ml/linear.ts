/**
 * 线性模型（纯函数、零依赖）—— dsh-ml 域（PCPT 映射）。
 *
 * OLS / Ridge 的独立 fit/predict：把 walk-forward 与因子中性化里用到的
 * 回归引擎抽成通用工具，是「ML 框架」承诺的最小可解释单元。
 *
 * 约定：X 为样本×特征（X[i] 是第 i 个样本的特征向量），y 与样本对齐。
 * Ridge 只惩罚特征权重（不惩罚截距），lambda=0 即 OLS。
 */

export interface LinearModelFit {
  intercept: number
  weights: number[]
  /** 训练集拟合优度（目标方差为 0 且拟合精确时为 1） */
  trainR2: number
  /** 样本数 */
  n: number
  /** Ridge 惩罚系数（0 = OLS） */
  lambda: number
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
      throw new Error('singular design matrix: features may be constant or collinear')
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
 * 拟合线性模型 y ≈ intercept + Σ w_k · X[i][k]（Ridge 时惩罚特征权重）。
 * X 样本数须与 y 等长；样本特征维度须一致且 ≥ 1。
 */
export function fitLinearModel(
  X: readonly (readonly number[])[],
  y: readonly number[],
  lambda = 0,
): LinearModelFit {
  const n = X.length
  if (n < 2) throw new RangeError(`X must have at least 2 samples, got ${n}`)
  if (y.length !== n) throw new RangeError(`y length ${y.length} != X samples ${n}`)
  if (!Number.isFinite(lambda) || lambda < 0) throw new RangeError(`lambda must be a finite number >= 0, got ${lambda}`)
  const f = X[0]!.length
  if (f < 1) throw new RangeError('each sample must have at least 1 feature')
  for (const xi of X) {
    if (xi.length !== f) throw new RangeError(`sample feature count ${xi.length} != ${f}`)
  }
  const dim = f + 1
  const XtX: number[][] = []
  const Xty: number[] = []
  for (let i = 0; i < dim; i++) {
    XtX.push(new Array<number>(dim).fill(0))
    Xty.push(0)
  }
  for (let i = 0; i < n; i++) {
    const row = [1, ...X[i]!]
    for (let a = 0; a < dim; a++) {
      Xty[a]! += row[a]! * y[i]!
      for (let b = 0; b < dim; b++) XtX[a]![b]! += row[a]! * row[b]!
    }
  }
  // Ridge：仅惩罚特征权重
  for (let k = 1; k < dim; k++) XtX[k]![k]! += lambda
  const beta = solveLinear(XtX, Xty)

  const yMean = y.reduce((a, b) => a + b, 0) / n
  let ssTot = 0
  let ssRes = 0
  for (let i = 0; i < n; i++) {
    let yhat = beta[0]!
    for (let k = 0; k < f; k++) yhat += beta[k + 1]! * X[i]![k]!
    ssTot += (y[i]! - yMean) ** 2
    ssRes += (y[i]! - yhat) ** 2
  }
  const trainR2 = ssTot === 0 ? (ssRes === 0 ? 1 : 0) : 1 - ssRes / ssTot
  return { intercept: beta[0]!, weights: beta.slice(1), trainR2, n, lambda }
}

/** 用拟合结果对 X（样本×特征）做预测。 */
export function predictLinearModel(fit: LinearModelFit, X: readonly (readonly number[])[]): number[] {
  const f = fit.weights.length
  return X.map(xi => {
    if (xi.length !== f) throw new RangeError(`sample feature count ${xi.length} != ${f}`)
    let yhat = fit.intercept
    for (let k = 0; k < f; k++) yhat += fit.weights[k]! * xi[k]!
    return yhat
  })
}

/** 简单 Pearson 相关（与 factor.ts 相同的定义）。 */
export function pearson(a: readonly number[], b: readonly number[]): number {
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

/** 预测 vs 真值的外样本评价：R² + IC（Pearson）。 */
export function evaluatePredictions(predictions: readonly number[], actual: readonly number[]): { r2: number | null; ic: number } {
  const n = Math.min(predictions.length, actual.length)
  if (n < 2) return { r2: null, ic: 0 }
  const yMean = actual.slice(0, n).reduce((a, b) => a + b, 0) / n
  let ssTot = 0
  let ssRes = 0
  for (let i = 0; i < n; i++) {
    ssTot += (actual[i]! - yMean) ** 2
    ssRes += (actual[i]! - predictions[i]!) ** 2
  }
  const r2 = ssTot === 0 ? null : 1 - ssRes / ssTot
  return { r2, ic: pearson(predictions.slice(0, n), actual.slice(0, n)) }
}
