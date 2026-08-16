/**
 * 回撤分析（纯函数、零依赖）—— dsh-risk 域（PRT 映射）。
 *
 * 从资金曲线提取：水下序列（underwater）、最大回撤、每段从新高开始的
 * 回撤（深度/持续/恢复），以及当前是否处于回撤中。
 */

export interface DrawdownPeriod {
  /** 峰值索引（回撤起点的新高） */
  peakIndex: number
  /** 谷底索引 */
  troughIndex: number
  /** 恢复索引（净值重新 ≥ 峰值的第一根；未恢复为 null） */
  recoveryIndex: number | null
  /** 回撤深度 %（正数，如 33.33 表示 -33.33%） */
  depthPct: number
  /** 峰值 → 谷底的根数 */
  durationBars: number
  /** 谷底 → 恢复的根数（未恢复为 null） */
  recoveryBars: number | null
}

export interface DrawdownResult {
  /** 水下序列（与输入等长，0 表示创新高，负数为回撤比例） */
  underwater: number[]
  /** 最大回撤 %（正数） */
  maxDrawdownPct: number
  /** 当前回撤 %（正数；创新高时为 0） */
  currentDrawdownPct: number
  /** 回撤段（按峰值索引升序，每个曾回撤的新高各一段） */
  periods: DrawdownPeriod[]
  /** 正在进行的未恢复回撤段（无则 null） */
  ongoing: DrawdownPeriod | null
}

/**
 * 回撤分析。equity 须为正数序列（资金曲线/净值）。
 * 回撤段定义：自某个新高起，净值跌破该新高，直到重新回到该新高水平。
 */
export function drawdownAnalysis(equity: readonly number[]): DrawdownResult {
  const n = equity.length
  if (n === 0) throw new RangeError('equity must not be empty')
  for (const v of equity) {
    if (!Number.isFinite(v) || v <= 0) throw new RangeError(`equity values must be finite positive numbers, got ${v}`)
  }
  let peak = equity[0]!
  let peakIndex = 0
  const underwater: number[] = new Array(n)
  for (let i = 0; i < n; i++) {
    if (equity[i]! > peak) {
      peak = equity[i]!
      peakIndex = i
    }
    underwater[i] = equity[i]! / peak - 1
  }

  const periods: DrawdownPeriod[] = []
  let lastPeakValue = equity[0]!
  let lastPeakIndex = 0
  let i = 1
  while (i < n) {
    if (equity[i]! >= lastPeakValue) {
      lastPeakValue = equity[i]!
      lastPeakIndex = i
      i++
      continue
    }
    // 从 lastPeakIndex 开始的一段回撤
    let troughIndex = i
    let recoveryIndex: number | null = null
    for (let j = i + 1; j < n; j++) {
      if (equity[j]! < equity[troughIndex]!) troughIndex = j
      if (equity[j]! >= lastPeakValue) {
        recoveryIndex = j
        break
      }
    }
    const depthPct = (1 - equity[troughIndex]! / lastPeakValue) * 100
    const period: DrawdownPeriod = {
      peakIndex: lastPeakIndex,
      troughIndex,
      recoveryIndex,
      depthPct,
      durationBars: troughIndex - lastPeakIndex,
      recoveryBars: recoveryIndex === null ? null : recoveryIndex - troughIndex,
    }
    periods.push(period)
    if (recoveryIndex === null) {
      return {
        underwater,
        maxDrawdownPct: (-Math.min(...underwater) * 100) || 0,
        currentDrawdownPct: (-underwater[n - 1]! * 100) || 0,
        periods,
        ongoing: period,
      }
    }
    lastPeakValue = equity[recoveryIndex]!
    lastPeakIndex = recoveryIndex
    i = recoveryIndex + 1
  }

  return {
    underwater,
    maxDrawdownPct: (-Math.min(...underwater) * 100) || 0,
    currentDrawdownPct: (-underwater[n - 1]! * 100) || 0,
    periods,
    ongoing: null,
  }
}
