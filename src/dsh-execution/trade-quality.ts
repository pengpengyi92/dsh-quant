/**
 * 交易质量分析（纯函数、零依赖）。
 *
 * 核心问题：模拟/实盘成交记录的质量如何？
 * - 成交率：订单成交比例（未成交 = 滑点或流动性问题）
 * - 滑点：成交价 vs 信号价的偏离
 * - 持仓周期：买入到卖出的时间跨度
 * 输入为 executeSimulate 的 SimResult（成交 + 订单），输出诊断指标。
 */

export interface SimFillLike {
  orderIndex: number
  side: 'buy' | 'sell'
  fillIndex: number
  fillPrice: number
  quantity: number
  value: number
  fee: number
  slippageCost: number
  cashAfter: number
  positionAfter: number
  equityAfter: number
}

/** 交易质量分析结果。 */
export interface TradeQualityResult {
  /** 订单数 */
  orders: number
  /** 成交数 */
  fills: number
  /** 成交率（0-1） */
  fillRate: number
  /** 总滑点成本 */
  totalSlippageCost: number
  /** 平均单笔滑点（占成交额比例） */
  avgSlippageBps: number
  /** 平均持仓周期（K 线数）—— 从买入到卖出 */
  avgHoldingBars: number
  /** 买卖笔数 */
  buys: number
  sells: number
  /** 平均单笔成交额 */
  avgFillValue: number
  /** 诊断 */
  notes: string[]
}

/** 交易质量分析。 */
export function tradeQuality(
  fills: readonly SimFillLike[],
  unfilledOrders = 0,
  holdingPeriodBars?: readonly number[],
): TradeQualityResult {
  const fillsCount = fills.length
  const orders = fillsCount + unfilledOrders
  const fillRate = orders === 0 ? 0 : fillsCount / orders
  const totalSlippageCost = fills.reduce((a, f) => a + f.slippageCost, 0)
  // 滑点占成交额比例 → bps
  const totalValue = fills.reduce((a, f) => a + f.value, 0)
  const avgSlippageBps = totalValue === 0 ? 0 : (totalSlippageCost / totalValue) * 10000
  // 持仓周期：若提供，取均值；否则用成交 index 差异估算（同资产买→卖）
  let avgHoldingBars = 0
  if (holdingPeriodBars && holdingPeriodBars.length > 0) {
    avgHoldingBars = holdingPeriodBars.reduce((a, b) => a + b, 0) / holdingPeriodBars.length
  } else if (fills.length >= 2) {
    // 启发式：相邻同资产 买→卖 对
    const periods: number[] = []
    for (let i = 0; i + 1 < fills.length; i++) {
      const a = fills[i]!
      const b = fills[i + 1]!
      if (a.side === 'buy' && b.side === 'sell' && a.orderIndex === b.orderIndex) {
        periods.push(b.fillIndex - a.fillIndex)
      }
    }
    if (periods.length > 0) avgHoldingBars = periods.reduce((x, y) => x + y, 0) / periods.length
  }
  const buys = fills.filter(f => f.side === 'buy').length
  const sells = fills.filter(f => f.side === 'sell').length
  const avgFillValue = fills.length === 0 ? 0 : totalValue / fills.length
  const notes: string[] = []
  if (fillRate < 0.8) notes.push(`成交率 ${(fillRate * 100).toFixed(0)}% 偏低 —— 检查流动性/滑点假设`)
  else if (fillRate >= 0.99) notes.push(`成交率 ${(fillRate * 100).toFixed(0)}% 很高（可能过于理想）`)
  if (avgSlippageBps > 50) notes.push(`平均滑点 ${avgSlippageBps.toFixed(0)} bps 偏高`)
  if (unfilledOrders > 0) notes.push(`${unfilledOrders} 笔未成交`)
  if (avgHoldingBars > 0) notes.push(`平均持仓 ${avgHoldingBars.toFixed(0)} 根 K 线`)
  return {
    orders, fills: fillsCount, fillRate, totalSlippageCost, avgSlippageBps,
    avgHoldingBars, buys, sells, avgFillValue, notes,
  }
}
