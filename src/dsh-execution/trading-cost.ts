/**
 * 交易成本模型（纯函数、零依赖）。
 *
 * 核心问题：一单交易的真实成本是多少？
 * 三层成本：佣金（固定比例）+ 滑点（价差/成交延迟）+ 市场冲击（大单推价）。
 * 用 Almgren-Chriss 风格的简化冲击模型：cost ∝ σ × sqrt(volume/ADV)。
 */

/** 交易成本结果。 */
export interface TradingCostResult {
  /** 总成本（占交易额比例，bps） */
  totalCostBps: number
  /** 佣金成本 bps */
  commissionBps: number
  /** 滑点成本 bps */
  slippageBps: number
  /** 市场冲击成本 bps */
  impactBps: number
  /** 交易额（数量×价格） */
  notional: number
  notes: string[]
}

/**
 * 交易成本估算。
 *
 * @param quantity 交易数量
 * @param price 参考价格
 * @param commissionRate 佣金比例（如 0.001 = 10bps）
 * @param spreadBps 价差 bps（滑点 ≈ spread/2）
 * @param annualVolPct 资产年化波动 %
 * @param dailyAdv 日均成交额（用于冲击模型；不提供则冲击=0）
 * @param participationRate 参与率（交易额/ADV，默认 0.01）
 */
export function tradingCost(
  quantity: number,
  price: number,
  commissionRate = 0.001,
  spreadBps = 5,
  annualVolPct = 30,
  dailyAdv?: number,
  participationRate = 0.01,
): TradingCostResult {
  if (!Number.isFinite(quantity) || quantity <= 0) throw new RangeError(`quantity must be positive, got ${quantity}`)
  if (!Number.isFinite(price) || price <= 0) throw new RangeError(`price must be positive, got ${price}`)
  if (commissionRate < 0) throw new RangeError(`commissionRate must be >= 0, got ${commissionRate}`)
  if (spreadBps < 0) throw new RangeError(`spreadBps must be >= 0, got ${spreadBps}`)
  if (annualVolPct < 0) throw new RangeError(`annualVolPct must be >= 0, got ${annualVolPct}`)
  if (participationRate <= 0 || participationRate > 1) throw new RangeError(`participationRate must be in (0,1], got ${participationRate}`)

  const notional = quantity * price
  const commissionBps = commissionRate * 10000
  // 滑点 ≈ 半价差
  const slippageBps = spreadBps / 2
  // 市场冲击：Almgren-Chriss 简化 — impact ∝ σ_daily × sqrt(participation × 10^4)
  // 参与率越高，订单相对流动性越大，冲击越大；与单笔规模正相关
  let impactBps = 0
  if (dailyAdv !== undefined && dailyAdv > 0) {
    const dailyVolPct = annualVolPct / Math.sqrt(252)
    const advRatio = notional / dailyAdv // 单笔占 ADV 比例
    const participation = Math.min(Math.max(advRatio, participationRate), 1) // 有效参与率
    impactBps = 0.1 * dailyVolPct * Math.sqrt(participation * 10000)
  }
  const totalCostBps = commissionBps + slippageBps + impactBps
  const notes: string[] = []
  notes.push(`佣金 ${commissionBps.toFixed(1)}bps + 滑点 ${slippageBps.toFixed(1)}bps${impactBps > 0 ? ` + 冲击 ${impactBps.toFixed(1)}bps` : ''}`)
  if (impactBps > slippageBps) notes.push('市场冲击主导成本 —— 大单建议拆单/降低参与率')
  return { totalCostBps, commissionBps, slippageBps, impactBps, notional, notes }
}
