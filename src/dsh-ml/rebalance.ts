/**
 * 再平衡调度分析（纯函数、零依赖）。
 *
 * 核心问题：多久再平衡一次最优？
 * - 再平衡越频繁：跟踪目标权重越紧（偏差小），但交易成本越高
 * - 再平衡越稀疏：成本低，但偏离目标权重（风险暴露漂移）
 * 用"成本 + 偏差"的联合代价找最优频率。
 */

/** 再平衡调度结果。 */
export interface RebalanceScheduleResult {
  /** 评估的频率（期数） */
  frequencies: number[]
  /** 每个频率的总代价（成本 + 偏差，越低越好） */
  totalCosts: number[]
  /** 最优频率 */
  bestFrequency: number
  /** 最优总代价 */
  bestCost: number
  /** 成本 vs 偏差分解（最优频率处） */
  costBreakdown: { tradingCost: number; driftCost: number }
  notes: string[]
}

/**
 * 再平衡调度分析。
 *
 * @param driftPerPeriod 每期权重偏离目标的比例（如 0.01 = 1%）
 * @param costPerRebalance 每次再平衡的成本比例（如 0.002 = 20bps）
 * @param maxFrequency 评估的最大频率（期数，默认 60）
 */
export function rebalanceSchedule(
  driftPerPeriod: number,
  costPerRebalance: number,
  maxFrequency = 60,
): RebalanceScheduleResult {
  if (driftPerPeriod < 0) throw new RangeError(`driftPerPeriod must be >= 0, got ${driftPerPeriod}`)
  if (costPerRebalance < 0) throw new RangeError(`costPerRebalance must be >= 0, got ${costPerRebalance}`)
  if (maxFrequency < 2 || !Number.isInteger(maxFrequency)) throw new RangeError(`maxFrequency must be an integer >= 2, got ${maxFrequency}`)

  const frequencies: number[] = []
  const totalCosts: number[] = []
  // 每 1..maxFrequency 期再平衡一次，评估总代价
  for (let freq = 1; freq <= maxFrequency; freq++) {
    // 每期偏差累积 ≈ drift × freq / 2（线性累积的平均偏离）
    // 再平衡成本摊到每期 ≈ costPerRebalance / freq
    const driftCost = (driftPerPeriod * freq) / 2 // 平均偏差（期）
    const tradingCost = costPerRebalance / freq
    // 偏差成本权重：把偏差（百分比）按 1:1 与交易成本（百分比）比较
    // 偏差成本用平方放大（偏差的代价随偏离加速）
    const totalCost = driftCost * driftCost * 100 + tradingCost
    frequencies.push(freq)
    totalCosts.push(totalCost)
  }
  const bestIdx = totalCosts.indexOf(Math.min(...totalCosts))
  const bestFrequency = frequencies[bestIdx]!
  const bestCost = totalCosts[bestIdx]!
  const costBreakdown = {
    tradingCost: costPerRebalance / bestFrequency,
    driftCost: (driftPerPeriod * bestFrequency) / 2,
  }
  const notes: string[] = []
  notes.push(`最优频率：每 ${bestFrequency} 期再平衡一次`)
  notes.push(`代价分解：交易成本 ${(costBreakdown.tradingCost * 10000).toFixed(0)}bps/期，平均偏离 ${(costBreakdown.driftCost * 100).toFixed(2)}%`)
  if (bestFrequency <= 3) notes.push('最优频率很高 —— 交易成本低/漂移快，适合高频再平衡')
  else if (bestFrequency >= 30) notes.push('最优频率低 —— 成本主导，适合低频再平衡')
  return { frequencies, totalCosts, bestFrequency, bestCost, costBreakdown, notes }
}
