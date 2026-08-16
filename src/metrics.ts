/**
 * 回测指标库（纯函数、零依赖）。
 *
 * 指标系统设计：所有回测指标统一计算 + 统一目录（METRIC_CATALOG），
 * UI 渲染时按目录勾选显示。必有指标：totalReturn / maxDrawdown / sharpe；
 * 可选指标持续扩展（calmar / sortino / winRate / ic / icir / turnover …）。
 */

export interface EquityMetrics {
  totalReturnPct: number
  maxDrawdownPct: number
  sharpe: number
  /** 年化波动率 % */
  annualizedVol: number
  /** Calmar = 年化收益 / 最大回撤 */
  calmar: number
  /** Sortino = 年化收益 / 下行波动 */
  sortino: number
  /** 正收益期占比 % */
  winRate: number
  /** 总盈利 / 总亏损（>1 盈利；无亏损时为 null） */
  profitFactor: number | null
  /** 平均每期收益 % */
  avgPeriodReturnPct: number
  /** 收益期数 / 总期数 */
  positivePeriods: number
  periods: number
}

/** 从净值曲线计算全套指标。 */
export function equityMetrics(equityCurve: readonly number[]): EquityMetrics {
  const n = equityCurve.length
  if (n < 2) throw new RangeError(`equityCurve needs >= 2 points, got ${n}`)
  const totalReturnPct = (equityCurve[n - 1]! / equityCurve[0]! - 1) * 100
  // 逐期收益
  const rets: number[] = []
  for (let i = 1; i < n; i++) rets.push(equityCurve[i]! / equityCurve[i - 1]! - 1)
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length
  const variance = rets.reduce((a, x) => a + (x - mean) ** 2, 0) / rets.length
  const std = Math.sqrt(variance)
  const sharpe = std === 0 ? 0 : (mean / std) * Math.sqrt(365)
  const annualizedVol = std * Math.sqrt(365) * 100
  // 最大回撤
  let peak = equityCurve[0]!
  let maxDd = 0
  for (const v of equityCurve) {
    if (v > peak) peak = v
    const dd = (peak - v) / peak
    if (dd > maxDd) maxDd = dd
  }
  const maxDrawdownPct = maxDd * 100
  // 年化收益（按期数推算，日频假设 365）
  const annualReturn = (Math.pow(equityCurve[n - 1]! / equityCurve[0]!, 365 / (n - 1)) - 1) * 100
  const calmar = maxDd === 0 ? 0 : annualReturn / maxDrawdownPct
  // 下行波动（只取负收益）
  const downs = rets.filter(r => r < 0)
  const downVar = downs.length === 0 ? 0 : downs.reduce((a, x) => a + x ** 2, 0) / rets.length
  const downStd = Math.sqrt(downVar)
  const sortino = downStd === 0 ? 0 : (mean / downStd) * Math.sqrt(365)
  const positive = rets.filter(r => r > 0)
  const negative = rets.filter(r => r < 0)
  const winRate = rets.length === 0 ? 0 : (positive.length / rets.length) * 100
  const grossProfit = positive.reduce((a, b) => a + b, 0)
  const grossLoss = -negative.reduce((a, b) => a + b, 0)
  const profitFactor = grossLoss === 0 ? (grossProfit === 0 ? 1 : null) : grossProfit / grossLoss
  return {
    totalReturnPct,
    maxDrawdownPct,
    sharpe,
    annualizedVol,
    calmar,
    sortino,
    winRate,
    profitFactor,
    avgPeriodReturnPct: mean * 100,
    positivePeriods: positive.length,
    periods: rets.length,
  }
}

export interface TradeMetrics {
  tradeCount: number
  winRate: number
  avgReturnPct: number
  profitFactor: number | null
  avgHoldingPeriods: number
}

/** 从交易列表计算交易级指标。 */
export function tradeMetrics(
  trades: readonly { entryIndex: number; exitIndex: number | null; returnPct: number | null }[],
): TradeMetrics {
  const closed = trades.filter(t => t.returnPct !== null && t.exitIndex !== null)
  const n = closed.length
  if (n === 0) {
    return { tradeCount: trades.length, winRate: 0, avgReturnPct: 0, profitFactor: 0, avgHoldingPeriods: 0 }
  }
  const wins = closed.filter(t => t.returnPct! > 0)
  const losses = closed.filter(t => t.returnPct! <= 0)
  const winRate = (wins.length / n) * 100
  const avgReturnPct = (closed.reduce((a, t) => a + t.returnPct!, 0) / n) * 100
  const grossProfit = wins.reduce((a, t) => a + t.returnPct!, 0)
  const grossLoss = -losses.reduce((a, t) => a + t.returnPct!, 0)
  const profitFactor = grossLoss === 0 ? (grossProfit === 0 ? 1 : null) : grossProfit / grossLoss
  const avgHoldingPeriods = closed.reduce((a, t) => a + (t.exitIndex! - t.entryIndex), 0) / n
  return { tradeCount: trades.length, winRate, avgReturnPct, profitFactor, avgHoldingPeriods }
}

export interface MetricDef {
  key: string
  name: string
  /** 简短中文名 */
  nameZh: string
  /** 格式化函数 */
  format: (v: number) => string
  /** 是否必有（UI 始终显示） */
  required: boolean
}

/** 指标目录（UI 按此渲染选择器；欢迎 PR 扩展）。 */
export const METRIC_CATALOG: MetricDef[] = [
  { key: 'totalReturnPct', name: 'Total Return', nameZh: '总收益', format: v => `${v.toFixed(2)}%`, required: true },
  { key: 'maxDrawdownPct', name: 'Max Drawdown', nameZh: '最大回撤', format: v => `${v.toFixed(2)}%`, required: true },
  { key: 'sharpe', name: 'Sharpe', nameZh: '夏普', format: v => v.toFixed(3), required: true },
  { key: 'annualizedVol', name: 'Ann. Volatility', nameZh: '年化波动', format: v => `${v.toFixed(2)}%`, required: false },
  { key: 'calmar', name: 'Calmar', nameZh: '卡玛比率', format: v => v.toFixed(3), required: false },
  { key: 'sortino', name: 'Sortino', nameZh: '索提诺', format: v => v.toFixed(3), required: false },
  { key: 'winRate', name: 'Win Rate', nameZh: '胜率', format: v => `${v.toFixed(1)}%`, required: false },
  { key: 'profitFactor', name: 'Profit Factor', nameZh: '盈亏比', format: v => v === null ? '∞' : v.toFixed(3), required: false },
  { key: 'avgPeriodReturnPct', name: 'Avg Period Return', nameZh: '平均期收益', format: v => `${v.toFixed(3)}%`, required: false },
]

export interface FundSimResult {
  /** 初始资金 */
  initialCapital: number
  /** 初始净值（1.00） */
  initialNav: number
  /** 费前终期净值（策略净值） */
  finalNavGross: number
  /** 费后终期净值 */
  finalNavNet: number
  /** 费后终期 AUM */
  finalAum: number
  /** 费后峰值净值（高水位） */
  peakNav: number
  /** 费后峰值 AUM */
  peakAum: number
  /** 费前总收益 % */
  grossReturnPct: number
  /** 费后总收益 % */
  netReturnPct: number
  /** 累计管理费（按初始资金计） */
  managementFeeTotal: number
  /** 累计业绩提成（按初始资金计） */
  performanceFeeTotal: number
  /** 费后净值序列（与输入等长，用于画图） */
  navNet: number[]
}

export interface FundSimOptions {
  /** 初始资金（默认 1 亿） */
  initialCapital?: number
  /** 年化管理费率（默认 0.02 = 2%/年，按日计提） */
  managementFeeRate?: number
  /** 业绩提成率（默认 0.2 = 20%，高水位之上计提） */
  performanceFeeRate?: number
}

/**
 * 模拟量化私募基金：策略净值 → 计提管理费（按日）与业绩提成（高水位 20%）
 * → 费后净值 / AUM / 峰值。游戏化产品（模拟开私募）的基础模型。
 */
export function fundSimulate(
  equityCurve: readonly number[],
  options: FundSimOptions = {},
): FundSimResult {
  const initialCapital = options.initialCapital ?? 100_000_000
  const managementFeeRate = options.managementFeeRate ?? 0.02
  const performanceFeeRate = options.performanceFeeRate ?? 0.2
  if (initialCapital <= 0) throw new RangeError(`initialCapital must be > 0, got ${initialCapital}`)
  if (!Number.isFinite(managementFeeRate) || managementFeeRate < 0 || managementFeeRate >= 1) {
    throw new RangeError(`managementFeeRate must be in [0, 1), got ${managementFeeRate}`)
  }
  if (!Number.isFinite(performanceFeeRate) || performanceFeeRate < 0 || performanceFeeRate >= 1) {
    throw new RangeError(`performanceFeeRate must be in [0, 1), got ${performanceFeeRate}`)
  }
  const n = equityCurve.length
  if (n === 0) throw new RangeError('equityCurve must not be empty')
  const dailyMgmt = managementFeeRate / 365
  const navNet: number[] = new Array(n).fill(1)
  let hwm = 1 // 高水位（初始净值 1.00）
  let managementFeeTotal = 0
  let performanceFeeTotal = 0
  navNet[0] = 1
  for (let i = 1; i < n; i++) {
    const grossRet = equityCurve[i]! / equityCurve[i - 1]!
    let nav = navNet[i - 1]! * grossRet
    // 管理费（按日计提）
    const mgmt = nav * dailyMgmt
    nav -= mgmt
    managementFeeTotal += mgmt
    // 业绩提成（高水位之上）
    if (nav > hwm) {
      const perf = (nav - hwm) * performanceFeeRate
      nav -= perf
      performanceFeeTotal += perf
      hwm = nav
    }
    navNet[i] = nav
  }
  const finalNavNet = navNet[n - 1]!
  let peakNav = 1
  for (const v of navNet) if (v > peakNav) peakNav = v
  const finalNavGross = equityCurve[n - 1]! / equityCurve[0]!
  return {
    initialCapital,
    initialNav: 1,
    finalNavGross,
    finalNavNet,
    finalAum: initialCapital * finalNavNet,
    peakNav,
    peakAum: initialCapital * peakNav,
    grossReturnPct: (finalNavGross - 1) * 100,
    netReturnPct: (finalNavNet - 1) * 100,
    managementFeeTotal: managementFeeTotal * initialCapital,
    performanceFeeTotal: performanceFeeTotal * initialCapital,
    navNet,
  }
}
