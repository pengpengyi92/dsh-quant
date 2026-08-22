/**
 * 组合优化器（纯函数、零依赖）。
 *
 * 三种经典目标：
 * - maxSharpe：最大化夏普（均值-方差最优，带权重非负约束的解析近似）
 * - minVar：最小方差组合
 * - riskParity：风险平价（各资产风险贡献相等，迭代求解）
 *
 * 输入：资产收益矩阵（行 = 时间，列 = 资产）。零依赖，纯数值。
 */

/** 组合优化结果。 */
export interface PortfolioOptimizeResult {
  /** 优化方法 */
  method: 'maxSharpe' | 'minVar' | 'riskParity'
  /** 权重（和 = 1，非负） */
  weights: number[]
  /** 组合年化收益 %（假设 252 交易日） */
  annualReturnPct: number
  /** 组合年化波动 % */
  annualVolPct: number
  /** 组合夏普（无风险利率 0） */
  sharpe: number
  /** 单资产年化夏普（对比用） */
  assetSharpe: number[]
  /** 权重集中度（HHI，1/n = 最分散，1 = 全押一个） */
  concentration: number
}

/** 协方差矩阵（n x n）。 */
function covMatrix(returns: readonly number[][]): number[][] {
  const t = returns.length
  const n = returns[0]!.length
  const means = new Array<number>(n).fill(0)
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < t; i++) means[j]! += returns[i]![j]!
    means[j]! /= t
  }
  const cov: number[][] = []
  for (let a = 0; a < n; a++) {
    cov.push(new Array<number>(n).fill(0))
    for (let b = 0; b < n; b++) {
      let s = 0
      for (let i = 0; i < t; i++) s += (returns[i]![a]! - means[a]!) * (returns[i]![b]! - means[b]!)
      cov[a]![b] = s / t
    }
  }
  return cov
}

/** 均值向量。 */
function meanVec(returns: readonly number[][]): number[] {
  const t = returns.length
  const n = returns[0]!.length
  const m = new Array<number>(n).fill(0)
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < t; i++) m[j]! += returns[i]![j]!
    m[j]! /= t
  }
  return m
}

/** 高斯消元解 Ax=b（列主元）。 */
function solve(A: number[][], b: number[]): number[] {
  const n = b.length
  const M = A.map((row, i) => [...row, b[i]!])
  for (let col = 0; col < n; col++) {
    let pivot = col
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r]![col]!) > Math.abs(M[pivot]![col]!)) pivot = r
    }
    if (Math.abs(M[pivot]![col]!) < 1e-12) throw new RangeError('singular matrix in solver')
    ;[M[col], M[pivot]] = [M[pivot]!, M[col]!]
    for (let r = 0; r < n; r++) {
      if (r === col) continue
      const f = M[r]![col]! / M[col]![col]!
      for (let c = col; c <= n; c++) M[r]![c]! -= f * M[col]![c]!
    }
  }
  return M.map((row, i) => row[n]! / row[i]!)
}

/** 投影到单纯形（权重 ≥ 0 且和 = 1）—— Duchi 算法。 */
function projectSimplex(v: number[], target = 1): number[] {
  const n = v.length
  const u = [...v].sort((a, b) => b - a)
  let cssV = 0
  let rho = -1
  for (let i = 0; i < n; i++) {
    cssV += u[i]!
    const t = (cssV - target) / (i + 1)
    if (u[i]! > t) rho = i
  }
  const theta = (u.slice(0, rho + 1).reduce((a, b) => a + b, 0) - target) / (rho + 1)
  return v.map(x => Math.max(x - theta, 0))
}

/**
 * 组合优化。
 *
 * @param returns 收益矩阵（行 = 时间，列 = 资产）
 * @param method maxSharpe | minVar | riskParity
 * @param iterations 风险平价的迭代次数（默认 50）
 */
export function portfolioOptimize(
  returns: readonly number[][],
  method: 'maxSharpe' | 'minVar' | 'riskParity' = 'maxSharpe',
  iterations = 50,
): PortfolioOptimizeResult {
  const t = returns.length
  if (t < 5) throw new RangeError(`returns must have at least 5 time points, got ${t}`)
  const n = returns[0]!.length
  if (n < 2) throw new RangeError('returns must have at least 2 assets')
  for (const row of returns) {
    if (row.length !== n) throw new RangeError(`row length ${row.length} != ${n}`)
    for (const x of row) {
      if (!Number.isFinite(x)) throw new RangeError('returns must be finite')
    }
  }
  if (method !== 'maxSharpe' && method !== 'minVar' && method !== 'riskParity') {
    throw new RangeError(`method must be maxSharpe|minVar|riskParity, got ${method}`)
  }

  const cov = covMatrix(returns)
  const mu = meanVec(returns)

  let weights: number[]
  if (method === 'minVar') {
    // min w'Σw  s.t. Σw=1  → w = Σ⁻¹1 / (1'Σ⁻¹1)，再投影非负
    const ones = new Array<number>(n).fill(1)
    const invCovOnes = solve(cov, ones)
    const denom = invCovOnes.reduce((a, b) => a + b, 0)
    const raw = denom === 0 ? new Array<number>(n).fill(1 / n) : invCovOnes.map(x => x / denom)
    weights = projectSimplex(raw)
  } else if (method === 'maxSharpe') {
    // max (μ'w) / sqrt(w'Σw)  s.t. Σw=1 → w ∝ Σ⁻¹μ，再投影非负
    const invCovMu = solve(cov, mu)
    const denom = invCovMu.reduce((a, b) => a + b, 0)
    const raw = Math.abs(denom) < 1e-12
      ? new Array<number>(n).fill(1 / n)
      : invCovMu.map(x => x / denom)
    weights = projectSimplex(raw)
    // 若全非负投影后和为 0（全负均值），退化为最小方差
    if (weights.reduce((a, b) => a + b, 0) < 1e-9) {
      const ones = new Array<number>(n).fill(1)
      const invCovOnes = solve(cov, ones)
      const d2 = invCovOnes.reduce((a, b) => a + b, 0)
      weights = projectSimplex(d2 === 0 ? new Array<number>(n).fill(1 / n) : invCovOnes.map(x => x / d2))
    }
  } else {
    // riskParity：迭代调整权重使各资产风险贡献相等
    weights = new Array<number>(n).fill(1 / n)
    for (let it = 0; it < iterations; it++) {
      // 资产 i 的边际风险贡献 ∝ (Σw)_i
      const mrc = new Array<number>(n).fill(0)
      for (let i = 0; i < n; i++) {
        let s = 0
        for (let j = 0; j < n; j++) s += cov[i]![j]! * weights[j]!
        mrc[i] = s
      }
      // 目标：w_i * mrc_i 相等 → w_i ∝ 1/mrc_i（风险贡献反比）
      const inv = mrc.map(x => (Math.abs(x) < 1e-12 ? 1 : 1 / Math.abs(x)))
      const sum = inv.reduce((a, b) => a + b, 0)
      const next = inv.map(x => x / sum)
      // 阻尼更新
      weights = weights.map((w, i) => 0.5 * w + 0.5 * next[i]!)
    }
    weights = projectSimplex(weights)
  }

  // 组合统计
  let pRet = 0
  let pVar = 0
  for (let i = 0; i < n; i++) {
    pRet += weights[i]! * mu[i]!
    for (let j = 0; j < n; j++) pVar += weights[i]! * cov[i]![j]! * weights[j]!
  }
  const pVol = Math.sqrt(Math.max(pVar, 0))
  const annualReturnPct = pRet * 252 * 100
  const annualVolPct = pVol * Math.sqrt(252) * 100
  const sharpe = pVol < 1e-12 ? 0 : (pRet / pVol) * Math.sqrt(252)
  const assetSharpe = mu.map((m, i) => {
    const v = cov[i]![i]!
    return v < 1e-12 ? 0 : (m / Math.sqrt(v)) * Math.sqrt(252)
  })
  const hhi = weights.reduce((a, w) => a + w * w, 0)
  return {
    method,
    weights,
    annualReturnPct,
    annualVolPct,
    sharpe,
    assetSharpe,
    concentration: hhi,
  }
}
