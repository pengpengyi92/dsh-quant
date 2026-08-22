/**
 * 分层回测（纯函数、零依赖）。
 *
 * 核心问题：把因子值分层（分位数分组），跟踪"买入 top 组 / 卖出
 * bottom 组"的组合净值 —— 从"因子评估"到"策略雏形"的桥梁。
 *
 * 设计：每期按因子值分 N 层，持有 top 层（做多）、bottom 层（做空
 * 或只做多），等权，定期调仓（horizon 期），含交易成本。
 */

/** 分层回测结果。 */
export interface LayeredBacktestResult {
  /** 分层数 */
  layers: number
  /** top 组合净值曲线（持有因子值最高的 1/layers 部分） */
  topEquity: number[]
  /** bottom 组合净值曲线 */
  bottomEquity: number[]
  /** 多空组合净值曲线（long top + short bottom） */
  longShortEquity: number[]
  /** top 组合累计收益 % */
  topReturnPct: number
  /** bottom 组合累计收益 % */
  bottomReturnPct: number
  /** 多空累计收益 % */
  longShortReturnPct: number
  /** 调仓次数 */
  rebalances: number
  /** 每层的平均收益 %（诊断用） */
  layerMeanReturnPct: number[]
  notes: string[]
}

/**
 * 分层回测。
 *
 * 输入：
 * - factor：每期每资产的因子值矩阵 [time][asset]
 * - returns：每期每资产的收益矩阵 [time][asset]
 * - layers：分层数（默认 5）
 * - horizon：调仓周期（默认 5 期）
 * - feeRate：单边费用（默认 0.001）
 *
 * 假设：每期初按 factor 分位分层，等权持有该层所有资产，
 * 持有 horizon 期后按新 factor 调仓（t 期信号，t+horizon 起生效）。
 */
export function layeredBacktest(
  factor: readonly number[][],
  returns: readonly number[][],
  layers = 5,
  horizon = 5,
  feeRate = 0.001,
): LayeredBacktestResult {
  const t = factor.length
  if (t < 5) throw new RangeError(`factor must have at least 5 time points, got ${t}`)
  const n = factor[0]!.length
  if (n < 2) throw new RangeError('factor must have at least 2 assets')
  for (let i = 0; i < t; i++) {
    if (factor[i]!.length !== n) throw new RangeError(`factor row ${i} length ${factor[i]!.length} != ${n}`)
    if (returns[i]!.length !== n) throw new RangeError(`returns row ${i} length != ${n}`)
  }
  if (layers < 2 || !Number.isInteger(layers)) throw new RangeError(`layers must be an integer >= 2, got ${layers}`)
  if (horizon < 1 || !Number.isInteger(horizon)) throw new RangeError(`horizon must be a positive integer, got ${horizon}`)
  if (!Number.isFinite(feeRate) || feeRate < 0) throw new RangeError(`feeRate must be >= 0, got ${feeRate}`)

  const topEquity = new Array<number>(t).fill(1)
  const bottomEquity = new Array<number>(t).fill(1)
  const longShortEquity = new Array<number>(t).fill(1)
  const layerMeanReturnPct = new Array<number>(layers).fill(0)
  const layerCount = new Array<number>(layers).fill(0)

  let rebalances = 0
  let topHold = 1
  let bottomHold = 1
  let lsHold = 1

  for (let start = 0; start < t; start += horizon) {
    const end = Math.min(start + horizon, t)
    // 当期因子分层
    const f = factor[start]!
    const order = f.map((_, i) => i).sort((a, b) => f[a]! - f[b]!)
    const perLayer = Math.max(1, Math.floor(n / layers))
    const topIdx = order.slice(Math.max(0, n - perLayer))
    const bottomIdx = order.slice(0, perLayer)
    // 持有期收益
    let topRet = 0
    let bottomRet = 0
    for (let i = start + 1; i < end; i++) {
      const r = returns[i]!
      const topAvg = topIdx.reduce((a, idx) => a + r[idx]!, 0) / topIdx.length
      const bottomAvg = bottomIdx.reduce((a, idx) => a + r[idx]!, 0) / bottomIdx.length
      topRet += topAvg
      bottomRet += bottomAvg
    }
    // 分层统计（第 start 期）
    for (let l = 0; l < layers; l++) {
      const from = l * perLayer
      const to = Math.min(from + perLayer, n)
      if (from >= to) continue
      const avg = order.slice(from, to).reduce((a, idx) => a + returns[start]![idx]!, 0) / (to - from)
      layerMeanReturnPct[l]! += avg * 100
      layerCount[l]!++
    }
    // 调仓成本（双边）
    const turnoverFee = 2 * feeRate
    topHold *= (1 + topRet) * (1 - turnoverFee)
    bottomHold *= (1 + bottomRet) * (1 - turnoverFee)
    lsHold *= (1 + topRet - bottomRet) * (1 - turnoverFee)
    rebalances++
    // 填充持有期净值
    for (let i = start; i < end; i++) {
      topEquity[i] = topHold
      bottomEquity[i] = bottomHold
      longShortEquity[i] = lsHold
    }
  }
  // 填充尾部
  for (let i = t - 1; i >= 0; i--) {
    if (topEquity[i] === 1 && i > 0) topEquity[i] = topEquity[i - 1]!
    if (bottomEquity[i] === 1 && i > 0) bottomEquity[i] = bottomEquity[i - 1]!
    if (longShortEquity[i] === 1 && i > 0) longShortEquity[i] = longShortEquity[i - 1]!
  }
  for (let l = 0; l < layers; l++) {
    if (layerCount[l]! > 0) layerMeanReturnPct[l] = layerMeanReturnPct[l]! / layerCount[l]!
  }
  const topReturnPct = (topHold - 1) * 100
  const bottomReturnPct = (bottomHold - 1) * 100
  const longShortReturnPct = (lsHold - 1) * 100
  const notes: string[] = []
  notes.push(`${rebalances} 次调仓（horizon=${horizon}），每层 ${Math.max(1, Math.floor(n / layers))} 个资产`)
  if (longShortReturnPct > 0) notes.push('多空组合为正 —— 因子有分层区分度')
  else notes.push('多空组合为负 —— 因子分层区分度不足，考虑中性化')
  return {
    layers, topEquity, bottomEquity, longShortEquity,
    topReturnPct, bottomReturnPct, longShortReturnPct,
    rebalances, layerMeanReturnPct, notes,
  }
}
