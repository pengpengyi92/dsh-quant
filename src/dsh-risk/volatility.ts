/**
 * 波动率板块（纯函数、零依赖）—— dsh-risk 域。
 *
 * 已实现波动率：对数收益的总体标准差年化。与 options.ts 的隐含波动率
 * 互为对照：RV（历史）vs IV（市场预期）的差 = 波动率风险溢价的研究入口。
 */

export interface RealizedVolResult {
  /** 年化已实现波动率（小数） */
  annualized: number
  /** 周期已实现波动率（小数） */
  perPeriod: number
  /** 年化因子（默认 252 交易日） */
  annualization: number
  /** 收益样本数 */
  n: number
  /** 对数收益序列（与输入 close 对齐，首值为 null） */
  logReturns: (number | null)[]
}

/**
 * 已实现波动率：log(close[t]/close[t-1]) 的总体标准差 × √annualization。
 * close 须为正数序列；样本数 < 2 时波动率为 0（对齐约定：合法结果）。
 */
export function realizedVolatility(
  close: readonly number[],
  annualization = 252,
): RealizedVolResult {
  if (close.length === 0) throw new RangeError('close must not be empty')
  if (!Number.isInteger(annualization) || annualization < 1) {
    throw new RangeError(`annualization must be an integer >= 1, got ${annualization}`)
  }
  for (const v of close) {
    if (!Number.isFinite(v) || v <= 0) throw new RangeError(`close values must be finite positive numbers, got ${v}`)
  }
  const n = close.length
  const logReturns: (number | null)[] = new Array(n).fill(null)
  const rets: number[] = []
  for (let i = 1; i < n; i++) {
    const lr = Math.log(close[i]! / close[i - 1]!)
    logReturns[i] = lr
    rets.push(lr)
  }
  if (rets.length < 2) {
    return { annualized: 0, perPeriod: 0, annualization, n: rets.length, logReturns }
  }
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length
  const variance = rets.reduce((a, x) => a + (x - mean) ** 2, 0) / rets.length
  const perPeriod = Math.sqrt(variance)
  return { annualized: perPeriod * Math.sqrt(annualization), perPeriod, annualization, n: rets.length, logReturns }
}
