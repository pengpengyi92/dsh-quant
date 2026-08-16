/**
 * 回测纯函数（零 dsh 依赖，可独立测试）。
 *
 * 策略：双均线交叉——fast SMA 上穿 slow SMA 时全仓买入，下穿时清仓。
 * 信号在 bar i 确认，在 bar i+1 以收盘价成交（避免未来函数）。
 * 输出含交易列表、资金曲线、总收益、最大回撤、夏普比率（年化假设 365 根/年）。
 */

export interface BacktestTrade {
  /** 入场 bar 索引（信号确认的下一根） */
  entryIndex: number
  /** 入场价 */
  entryPrice: number
  /** 出场 bar 索引 */
  exitIndex: number | null
  /** 出场价（null = 持仓到末尾未平仓） */
  exitPrice: number | null
  /** 该笔收益（含手续费后的净收益率） */
  returnPct: number | null
}

export interface BacktestOutput {
  totalReturnPct: number
  maxDrawdownPct: number
  sharpe: number
  /** 与输入等长：1 表示满仓，0 表示空仓 */
  position: (0 | 1)[]
  /** 与输入等长的归一化资金曲线（初始 1） */
  equityCurve: number[]
  trades: BacktestTrade[]
  fast: number
  slow: number
  feeRate: number
}

/**
 * 双均线交叉回测。要求 fast < slow，feeRate >= 0。
 * 若序列尾部仍持仓，最后一笔交易的 exitIndex/exitPrice/returnPct 为 null（未平仓）。
 */
export function backtestMaCross(
  close: readonly number[],
  fast: number,
  slow: number,
  feeRate: number,
): BacktestOutput {
  if (!Number.isInteger(fast) || fast < 1) throw new RangeError(`fast must be a positive integer, got ${fast}`)
  if (!Number.isInteger(slow) || slow < 1) throw new RangeError(`slow must be a positive integer, got ${slow}`)
  if (fast >= slow) throw new RangeError('fast must be < slow')
  if (!Number.isFinite(feeRate) || feeRate < 0) throw new RangeError(`feeRate must be >= 0, got ${feeRate}`)

  const n = close.length
  if (n === 0) {
    return {
      totalReturnPct: 0, maxDrawdownPct: 0, sharpe: 0,
      position: [], equityCurve: [], trades: [], fast, slow, feeRate,
    }
  }
  const fastMa = smaArray(close, fast)
  const slowMa = smaArray(close, slow)

  const position: (0 | 1)[] = new Array(n).fill(0)
  const equityCurve: number[] = new Array(n).fill(1)
  const trades: BacktestTrade[] = []

  let cash = 1 // 归一化资金
  let holding = false
  let entryIndex: number | null = null
  let entryPrice = 0
  let pendingEntry = false
  let pendingExit = false

  for (let i = 0; i < n; i++) {
    // 1) 成交上一根 bar 确认的信号（bar i+1 收盘价成交）
    if (pendingEntry && !holding) {
      holding = true
      entryIndex = i
      entryPrice = close[i]!
      cash *= 1 - feeRate
    }
    if (pendingExit && holding) {
      const exitPrice = close[i]!
      cash *= 1 - feeRate
      trades.push({
        entryIndex: entryIndex!,
        entryPrice,
        exitIndex: i,
        exitPrice,
        returnPct: exitPrice / entryPrice - 1,
      })
      holding = false
      entryIndex = null
    }
    pendingEntry = false
    pendingExit = false

    // 2) 本根确认交叉信号（下一根成交）
    const prevValid = i > 0 && fastMa[i - 1] !== null && slowMa[i - 1] !== null
    const curValid = fastMa[i] !== null && slowMa[i] !== null
    if (prevValid && curValid) {
      const prevFast = fastMa[i - 1]!
      const prevSlow = slowMa[i - 1]!
      const curFast = fastMa[i]!
      const curSlow = slowMa[i]!
      const crossUp = prevFast <= prevSlow && curFast > curSlow
      const crossDown = prevFast >= prevSlow && curFast < curSlow
      if (crossUp && !holding) pendingEntry = true
      else if (crossDown && holding) pendingExit = true
    }

    // 3) 记录本根持仓与市值
    position[i] = holding ? 1 : 0
    equityCurve[i] = holding ? cash * (close[i]! / entryPrice) : cash
  }

  // 尾部未平仓：记录 open trade
  if (holding) {
    trades.push({
      entryIndex: entryIndex!,
      entryPrice,
      exitIndex: null,
      exitPrice: null,
      returnPct: null,
    })
  }

  const totalReturnPct = (equityCurve[n - 1]! - 1) * 100
  const maxDrawdownPct = computeMaxDrawdown(equityCurve)
  const sharpe = computeSharpe(equityCurve)
  return { totalReturnPct, maxDrawdownPct, sharpe, position, equityCurve, trades, fast, slow, feeRate }
}

/** 简单移动平均（与 indicators.ts 相同语义，内部复用避免跨文件依赖）。 */
function smaArray(values: readonly number[], window: number): (number | null)[] {
  const out: (number | null)[] = new Array(values.length).fill(null)
  if (values.length < window) return out
  let sum = 0
  for (let i = 0; i < window; i++) sum += values[i]!
  out[window - 1] = sum / window
  for (let i = window; i < values.length; i++) {
    sum += values[i]! - values[i - window]!
    out[i] = sum / window
  }
  return out
}

function computeMaxDrawdown(equity: readonly number[]): number {
  let peak = -Infinity
  let maxDd = 0
  for (const v of equity) {
    if (v > peak) peak = v
    const dd = (peak - v) / peak
    if (dd > maxDd) maxDd = dd
  }
  return maxDd * 100
}

function computeSharpe(equity: readonly number[]): number {
  if (equity.length < 2) return 0
  const returns: number[] = []
  for (let i = 1; i < equity.length; i++) {
    returns.push(equity[i]! / equity[i - 1]! - 1)
  }
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((a, r) => a + (r - mean) ** 2, 0) / returns.length
  const std = Math.sqrt(variance)
  if (std === 0) return 0
  // 年化：假设日频（365），sqrt(365)
  return (mean / std) * Math.sqrt(365)
}

export interface GridResult {
  fast: number
  slow: number
  totalReturnPct: number
  maxDrawdownPct: number
  sharpe: number
  trades: number
}

export interface BacktestGridOutput {
  /** 按总收益降序排列的所有组合结果 */
  results: GridResult[]
  /** 总收益最高的组合 */
  best: GridResult
  fastRange: { min: number; max: number }
  slowRange: { min: number; max: number }
  feeRate: number
}

/**
 * 双均线参数网格搜索：对 fast ∈ [fastMin, fastMax]、slow ∈ [slowMin, slowMax]
 * 的每个 (fast, slow) 组合（要求 fast < slow）跑 backtestMaCross，
 * 返回按总收益降序的结果列表与最佳组合。纯计算，零依赖。
 */
export function backtestGrid(
  close: readonly number[],
  fastMin: number,
  fastMax: number,
  slowMin: number,
  slowMax: number,
  feeRate: number,
): BacktestGridOutput {
  for (const [v, name] of [[fastMin, 'fastMin'], [fastMax, 'fastMax'], [slowMin, 'slowMin'], [slowMax, 'slowMax']] as const) {
    if (!Number.isInteger(v) || v < 1) throw new RangeError(`${name} must be a positive integer, got ${v}`)
  }
  if (fastMin > fastMax) throw new RangeError('fastMin must be <= fastMax')
  if (slowMin > slowMax) throw new RangeError('slowMin must be <= slowMax')
  if (!Number.isFinite(feeRate) || feeRate < 0) throw new RangeError(`feeRate must be >= 0, got ${feeRate}`)

  const results: GridResult[] = []
  for (let fast = fastMin; fast <= fastMax; fast++) {
    for (let slow = slowMin; slow <= slowMax; slow++) {
      if (fast >= slow) continue // 非法组合跳过
      const out = backtestMaCross(close, fast, slow, feeRate)
      results.push({
        fast,
        slow,
        totalReturnPct: out.totalReturnPct,
        maxDrawdownPct: out.maxDrawdownPct,
        sharpe: out.sharpe,
        trades: out.trades.length,
      })
    }
  }
  results.sort((a, b) => b.totalReturnPct - a.totalReturnPct)
  if (results.length === 0) {
    throw new RangeError('no valid (fast, slow) combinations in the given ranges')
  }
  return {
    results,
    best: results[0]!,
    fastRange: { min: fastMin, max: fastMax },
    slowRange: { min: slowMin, max: slowMax },
    feeRate,
  }
}
