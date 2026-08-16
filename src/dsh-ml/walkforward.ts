/**
 * Walk-forward 训练评估框架（纯函数、零依赖）—— dsh-ml 域（PCPT 映射）。
 *
 * 兑现「提供 demo + ML 知识 + 训练评估框架」承诺的最小可用形态：
 * 滚动训练 / 样本外预测的线性回归，输出全样本外预测、IC/RankIC 与
 * 逐窗口权重——量化 ML 的入门金标准流程（训练不偷看未来）。
 *
 * 对齐约定（与 factor.ts 一致）：features[t] 预测 returns[t+1]。
 */

export interface WalkForwardWindow {
  /** 训练区间起点（features 索引） */
  trainStart: number
  /** 训练区间终点（不含） */
  trainEnd: number
  /** 样本外区间起点 */
  testStart: number
  /** 样本外区间终点（不含） */
  testEnd: number
  /** 截距 */
  intercept: number
  /** 各特征系数（与 features 顺序一致） */
  weights: number[]
  /** 训练集拟合优度 */
  trainR2: number
}

export interface WalkForwardResult {
  /** 样本外预测序列（与 features 等长；训练区与尾部为 null） */
  predictions: (number | null)[]
  /** 样本外 IC（Pearson） */
  oosIc: number
  /** 样本外 RankIC（Spearman） */
  oosRankIc: number
  /** 样本外预测样本数 */
  oosCount: number
  /** 逐窗口模型 */
  windows: WalkForwardWindow[]
  /** 训练集平均拟合优度 */
  trainR2Mean: number
}

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

/** 高斯消元（列主元）解 Ax=b；奇异矩阵抛错（含常数特征等共线情形）。 */
function solveLinear(A: number[][], b: number[]): number[] {
  const m = A.length
  const M = A.map((row, i) => [...row, b[i]!])
  for (let col = 0; col < m; col++) {
    let piv = col
    for (let r = col + 1; r < m; r++) {
      if (Math.abs(M[r]![col]!) > Math.abs(M[piv]![col]!)) piv = r
    }
    if (Math.abs(M[piv]![col]!) < 1e-12) {
      throw new Error('singular design matrix: features may be constant or collinear in a training window')
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
 * Walk-forward：滚动 OLS 训练（截距 + 特征）→ 样本外预测 → IC/RankIC。
 * 窗口按 step（默认 = testWindow）前进；窗口起点从 trainWindow 开始，
 * 保证每个训练窗口只使用区间内的历史，样本外绝不进入训练。
 */
export function walkForward(
  returns: readonly number[],
  features: readonly (readonly number[])[],
  trainWindow: number,
  testWindow: number,
  step?: number,
): WalkForwardResult {
  const n = returns.length
  if (n < 3) throw new RangeError(`returns must have at least 3 values, got ${n}`)
  if (features.length === 0) throw new RangeError('features must not be empty')
  for (const fx of features) {
    if (fx.length !== n) throw new RangeError(`feature length ${fx.length} != returns length ${n}`)
  }
  if (!Number.isInteger(trainWindow) || trainWindow < 2) throw new RangeError(`trainWindow must be an integer >= 2, got ${trainWindow}`)
  if (!Number.isInteger(testWindow) || testWindow < 1) throw new RangeError(`testWindow must be an integer >= 1, got ${testWindow}`)
  const advance = step ?? testWindow
  if (!Number.isInteger(advance) || advance < 1) throw new RangeError(`step must be an integer >= 1, got ${advance}`)

  // 模型：returns[t+1] ≈ intercept + Σ w_k * features[k][t]，t = 0..n-2
  const predictions: (number | null)[] = new Array(n).fill(null)
  const windows: WalkForwardWindow[] = []
  const f = features
  const k = f.length

  for (let testStart = trainWindow; testStart + testWindow - 1 <= n - 1; testStart += advance) {
    const testEnd = Math.min(testStart + testWindow, n)
    const trainEnd = testStart
    const trainStart = trainEnd - trainWindow
    if (trainStart < 0) continue
    // 法方程：X 行 = [1, f[0][t]..f[k-1][t]]，y = returns[t+1]，t ∈ [trainStart, trainEnd)
    const dim = k + 1
    const XtX: number[][] = []
    const Xty: number[] = []
    for (let i = 0; i < dim; i++) {
      XtX.push(new Array<number>(dim).fill(0))
      Xty.push(0)
    }
    let ySum = 0
    for (let t = trainStart; t < trainEnd; t++) {
      const row = [1, ...f.map(fx => fx[t]!)]
      const y = returns[t + 1]!
      ySum += y
      for (let i = 0; i < dim; i++) {
        Xty[i]! += row[i]! * y
        for (let j = 0; j < dim; j++) XtX[i]![j]! += row[i]! * row[j]!
      }
    }
    const beta = solveLinear(XtX, Xty)
    const yMean = ySum / trainWindow
    let ssTot = 0
    let ssRes = 0
    for (let t = trainStart; t < trainEnd; t++) {
      const row = [1, ...f.map(fx => fx[t]!)]
      let yhat = beta[0]!
      for (let i = 0; i < k; i++) yhat += beta[i + 1]! * row[i + 1]!
      const y = returns[t + 1]!
      ssTot += (y - yMean) ** 2
      ssRes += (y - yhat) ** 2
    }
    const trainR2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot
    // 样本外预测（testEnd-1 是最后一个可用 returns 索引）
    for (let t = testStart; t < testEnd; t++) {
      let yhat = beta[0]!
      for (let i = 0; i < k; i++) yhat += beta[i + 1]! * f[i]![t]!
      predictions[t] = yhat
    }
    windows.push({
      trainStart, trainEnd, testStart, testEnd,
      intercept: beta[0]!, weights: beta.slice(1), trainR2,
    })
  }

  const oosPred: number[] = []
  const oosReal: number[] = []
  for (let t = 0; t < n - 1; t++) {
    if (predictions[t] !== null) {
      oosPred.push(predictions[t]!)
      oosReal.push(returns[t + 1]!)
    }
  }
  const oosIc = oosPred.length >= 2 ? pearson(oosPred, oosReal) : 0
  const oosRankIc = oosPred.length >= 2
    ? pearson(averageRanks(oosPred), averageRanks(oosReal))
    : 0
  const trainR2Mean = windows.length === 0
    ? 0
    : windows.reduce((a, w) => a + w.trainR2, 0) / windows.length

  return { predictions, oosIc, oosRankIc, oosCount: oosPred.length, windows, trainR2Mean }
}
