/**
 * 因子相关性分析（纯函数、零依赖）。
 *
 * 核心问题：多个因子之间是否冗余？
 * - 相关性矩阵：因子两两 Pearson 相关
 * - 高相关对：|ρ| > 阈值 → 建议合并/去重（避免重复暴露）
 * - 独立因子数：基于相关矩阵的有效维数（特征值法）
 */

/** 因子相关性结果。 */
export interface FactorCorrelationResult {
  /** 因子名（输入顺序） */
  factorNames: string[]
  /** 相关性矩阵 [i][j]（Pearson） */
  correlationMatrix: number[][]
  /** 高相关对（|ρ| > threshold） */
  highCorrelationPairs: Array<{ i: number; j: number; correlation: number }>
  /** 平均相关性 */
  meanAbsCorrelation: number
  /** 有效独立因子数（基于特征值，1 = 全冗余，N = 全独立） */
  effectiveFactorCount: number
  notes: string[]
}

/** Pearson 相关。 */
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

/** 对称矩阵特征值（Jacobi 迭代，近似）。 */
function eigenvalues(matrix: number[][]): number[] {
  const n = matrix.length
  const A = matrix.map(row => [...row])
  for (let iter = 0; iter < 100; iter++) {
    // 找最大非对角元
    let p = 0
    let q = 1
    let maxOff = 0
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(A[i]![j]!) > maxOff) {
          maxOff = Math.abs(A[i]![j]!)
          p = i
          q = j
        }
      }
    }
    if (maxOff < 1e-12) break
    const app = A[p]![p]!
    const aqq = A[q]![q]!
    const apq = A[p]![q]!
    const theta = (aqq - app) / (2 * apq)
    const t = theta === 0 ? 1 : Math.sign(theta) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
    const c = 1 / Math.sqrt(t * t + 1)
    const s = t * c
    // 标准 Jacobi：只更新 p,q 行列
    for (let k = 0; k < n; k++) {
      if (k === p || k === q) continue
      const akp = A[k]![p]!
      const akq = A[k]![q]!
      A[k]![p] = c * akp - s * akq
      A[k]![q] = s * akp + c * akq
      A[p]![k] = A[k]![p]!
      A[q]![k] = A[k]![q]!
    }
    A[p]![p] = c * c * app - 2 * s * c * apq + s * s * aqq
    A[q]![q] = s * s * app + 2 * s * c * apq + c * c * aqq
    A[p]![q] = 0
    A[q]![p] = 0
  }
  return A.map((row, i) => row[i]!)
}

/** 因子相关性分析。 */
export function factorCorrelation(
  factors: readonly number[][],
  factorNames?: readonly string[],
  threshold = 0.7,
): FactorCorrelationResult {
  if (factors.length < 2) throw new RangeError('factors must have at least 2 series')
  const n = factors[0]!.length
  for (const f of factors) {
    if (f.length !== n) throw new RangeError(`factor length ${f.length} != ${n}`)
  }
  if (n < 2) throw new RangeError('factors must have at least 2 values')
  if (threshold < 0 || threshold > 1) throw new RangeError(`threshold must be in [0,1], got ${threshold}`)

  const k = factors.length
  const names = factorNames ?? factors.map((_, i) => `factor_${i + 1}`)
  if (names.length !== k) throw new RangeError(`factorNames length ${names.length} != ${k}`)

  const matrix: number[][] = []
  for (let i = 0; i < k; i++) {
    matrix.push(new Array<number>(k).fill(0))
    for (let j = 0; j < k; j++) {
      matrix[i]![j] = i === j ? 1 : pearson(factors[i]!, factors[j]!)
    }
  }
  const highCorrelationPairs: Array<{ i: number; j: number; correlation: number }> = []
  let meanAbs = 0
  let pairs = 0
  for (let i = 0; i < k; i++) {
    for (let j = i + 1; j < k; j++) {
      meanAbs += Math.abs(matrix[i]![j]!)
      pairs++
      if (Math.abs(matrix[i]![j]!) > threshold) {
        highCorrelationPairs.push({ i, j, correlation: matrix[i]![j]! })
      }
    }
  }
  meanAbs = pairs === 0 ? 0 : meanAbs / pairs
  // 有效维数：Participating Ratio PR = (Σλ)² / Σλ² —— 对相关矩阵，
  // 全冗余（一个特征值主导）→ PR≈1；全独立（对角）→ PR≈N
  const evals = eigenvalues(matrix)
  const sumEvals = evals.reduce((a, b) => a + b, 0)
  const sqSum = evals.reduce((a, b) => a + b * b, 0)
  const effectiveFactorCount = sqSum < 1e-12 ? 1 : Math.max(1, (sumEvals * sumEvals) / sqSum)
  const notes: string[] = []
  notes.push(`平均 |相关| ${meanAbs.toFixed(2)}，有效独立因子数 ${effectiveFactorCount.toFixed(1)}/${k}`)
  if (highCorrelationPairs.length > 0) {
    notes.push(`${highCorrelationPairs.length} 对高相关（|ρ|>${threshold}）：${highCorrelationPairs.map(p => `${names[p.i]}×${names[p.j]}`).join(', ')}`)
    notes.push('建议：高相关因子去重/合并，避免重复暴露')
  } else {
    notes.push('无高相关对，因子间较独立')
  }
  return { factorNames: [...names], correlationMatrix: matrix, highCorrelationPairs, meanAbsCorrelation: meanAbs, effectiveFactorCount, notes }
}
