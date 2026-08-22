/**
 * IC 衰减分析（纯函数、零依赖）。
 *
 * 核心问题：因子信号的预测力随预测周期（horizon）如何衰减？
 * - 快速衰减 → 信号是短周期（适合高频/换手高）
 * - 慢速衰减 → 信号是长周期（适合低频/换手低）
 * 半衰期 = IC 降到峰值一半的 horizon —— 信号"保质期"的直观度量。
 */

/** IC 衰减分析结果。 */
export interface IcDecayResult {
  /** horizons: 1..maxHorizon */
  horizons: number[]
  /** 每个 horizon 的 IC（factor[i] 配 forwardReturns[i+h]） */
  icByHorizon: number[]
  /** 半衰期：IC 降到峰值一半的 horizon（未降到则 = maxHorizon） */
  halfLife: number
  /** 最优 horizon：IC 仍为正且大于其峰值 50% 的最长 horizon */
  bestHorizon: number
  /** 峰值 IC 及对应 horizon */
  peakIc: number
  peakHorizon: number
  /** 信号类型判断 */
  signalType: 'short' | 'medium' | 'long'
  notes: string[]
}

/** Pearson 相关（两个等长数组，至少 2 个配对）。 */
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

/**
 * IC 衰减分析。
 *
 * 输入：factor（时间序列）+ returns（同长度收益序列）。
 * 对每个 horizon h ∈ [1, maxHorizon]：IC(h) = corr(factor[i], sum(returns[i+1..i+h]))
 * 注：与 factorEvaluate 的 icDecay 同源，但独立成工具并加半衰期/最优/信号类型。
 */
export function icDecayAnalysis(
  factor: readonly number[],
  returns: readonly number[],
  maxHorizon = 10,
): IcDecayResult {
  if (factor.length < 3 || returns.length < 3) {
    throw new RangeError('factor and returns must have at least 3 values')
  }
  if (factor.length !== returns.length) {
    throw new RangeError(`factor length ${factor.length} != returns length ${returns.length}`)
  }
  if (maxHorizon < 1 || !Number.isInteger(maxHorizon)) {
    throw new RangeError(`maxHorizon must be a positive integer, got ${maxHorizon}`)
  }
  const n = factor.length
  const horizons: number[] = []
  const icByHorizon: number[] = []
  for (let h = 1; h <= maxHorizon; h++) {
    // factor[i] 配 returns[i+1..i+h] 的累计和（预测 h 期累计收益）
    const f: number[] = []
    const r: number[] = []
    for (let i = 0; i + h < n; i++) {
      let acc = 0
      for (let k = 1; k <= h; k++) acc += returns[i + k]!
      f.push(factor[i]!)
      r.push(acc)
    }
    horizons.push(h)
    icByHorizon.push(pearson(f, r))
  }
  // 峰值
  let peakIc = -Infinity
  let peakHorizon = 1
  for (let h = 0; h < horizons.length; h++) {
    if (icByHorizon[h]! > peakIc) {
      peakIc = icByHorizon[h]!
      peakHorizon = horizons[h]!
    }
  }
  if (peakIc < 0) peakIc = 0 // 无正 IC，视为无信号
  // 半衰期：IC 降到峰值一半的 horizon
  let halfLife = maxHorizon
  const halfTarget = peakIc / 2
  for (let h = 0; h < horizons.length; h++) {
    if (icByHorizon[h]! <= halfTarget && icByHorizon[h]! >= 0) {
      halfLife = horizons[h]!
      break
    }
    if (icByHorizon[h]! < 0 && h > 0) {
      // 转负即认为已过保质期
      halfLife = horizons[h]!
      break
    }
  }
  // 最优 horizon：IC 仍 > 峰值一半的最长 horizon
  let bestHorizon = 1
  for (let h = 0; h < horizons.length; h++) {
    if (icByHorizon[h]! >= halfTarget && icByHorizon[h]! > 0) {
      bestHorizon = horizons[h]!
    }
  }
  // 信号类型
  let signalType: 'short' | 'medium' | 'long'
  if (halfLife <= Math.max(2, Math.floor(maxHorizon / 3))) signalType = 'short'
  else if (halfLife <= Math.max(4, Math.floor((2 * maxHorizon) / 3))) signalType = 'medium'
  else signalType = 'long'
  const notes: string[] = []
  notes.push(`IC 峰值 ${peakIc.toFixed(4)} @ h=${peakHorizon}，半衰期 h=${halfLife}`)
  notes.push(`信号类型：${signalType}（half-life ≤ ${Math.max(2, Math.floor(maxHorizon / 3))} = short，≤ ${Math.max(4, Math.floor((2 * maxHorizon) / 3))} = medium，否则 long）`)
  if (peakIc === 0) notes.push('未检测到显著正 IC —— 因子可能无预测力或需要中性化')
  return { horizons, icByHorizon, halfLife, bestHorizon, peakIc, peakHorizon, signalType, notes }
}
