/**
 * 技术指标纯函数实现（零 dsh 依赖，可独立测试）。
 *
 * 对齐约定（与 DESIGN.md 一致）：
 * - 输出与输入等长，头部无法计算的窗口位置为 `null`（模型可按索引对齐）
 * - 空输入或 window > 长度 → 全 null（合法结果）
 * - 前置条件（由调用方保证）：window >= 1 且为整数；输入数组只含有限数
 * - 违反前置条件抛 RangeError/TypeError（execute 层负责转成模型可见错误）
 */

/** 简单移动平均。头部 window-1 个 null。 */
export function sma(values: readonly number[], window: number): (number | null)[] {
  assertWindow(window)
  const out: (number | null)[] = new Array(values.length).fill(null)
  if (values.length === 0 || values.length < window) return out
  let sum = 0
  for (let i = 0; i < window; i++) sum += values[i]!
  out[window - 1] = sum / window
  for (let i = window; i < values.length; i++) {
    sum += values[i]! - values[i - window]!
    out[i] = sum / window
  }
  return out
}

/**
 * 指数移动平均（TA-Lib 风格）：seed = 前 window 个值的简单平均，
 * 之后 EMA[i] = alpha * values[i] + (1 - alpha) * EMA[i-1]，alpha = 2/(window+1)。
 * 头部 window-1 个 null，与 sma 对齐。
 */
export function ema(values: readonly number[], window: number): (number | null)[] {
  assertWindow(window)
  const out: (number | null)[] = new Array(values.length).fill(null)
  if (values.length === 0 || values.length < window) return out
  const alpha = 2 / (window + 1)
  let prev = 0
  for (let i = 0; i < window; i++) prev += values[i]!
  prev /= window
  out[window - 1] = prev
  for (let i = window; i < values.length; i++) {
    prev = alpha * values[i]! + (1 - alpha) * prev
    out[i] = prev
  }
  return out
}

/**
 * 相对强弱指数（Wilder 平滑）。
 * 需要 window+1 个值才有第一个有效点，因此头部 window 个 null，
 * 第一个有效值在 index window。
 */
export function rsi(values: readonly number[], window: number): (number | null)[] {
  assertWindow(window)
  const out: (number | null)[] = new Array(values.length).fill(null)
  if (values.length < window + 1) return out
  const deltas: number[] = []
  for (let i = 1; i < values.length; i++) deltas.push(values[i]! - values[i - 1]!)
  let avgGain = 0
  let avgLoss = 0
  for (let i = 0; i < window; i++) {
    const d = deltas[i]!
    if (d >= 0) avgGain += d
    else avgLoss -= d
  }
  avgGain /= window
  avgLoss /= window
  out[window] = rsiFrom(avgGain, avgLoss)
  for (let i = window; i < deltas.length; i++) {
    const d = deltas[i]!
    avgGain = (avgGain * (window - 1) + Math.max(d, 0)) / window
    avgLoss = (avgLoss * (window - 1) + Math.max(-d, 0)) / window
    out[i + 1] = rsiFrom(avgGain, avgLoss)
  }
  return out
}

function rsiFrom(avgGain: number, avgLoss: number): number {
  if (avgLoss === 0) return 100 // 全涨
  const rs = avgGain / avgLoss
  return 100 - 100 / (1 + rs)
}

export interface MacdOutput {
  /** 等长；头部 slow-1 个 null */
  macd: (number | null)[]
  /** 等长；头部 slow+signal-2 个 null */
  signal: (number | null)[]
  /** 等长；头部 slow+signal-2 个 null */
  histogram: (number | null)[]
}

/**
 * MACD：macd = EMA(fast) - EMA(slow)；signal = EMA(signal) of macd；
 * histogram = macd - signal。要求 fast < slow。
 */
export function macd(
  values: readonly number[],
  fast: number,
  slow: number,
  signal: number,
): MacdOutput {
  assertWindow(fast)
  assertWindow(slow)
  assertWindow(signal)
  if (fast >= slow) throw new RangeError('fast must be < slow')
  const n = values.length
  const macdArr: (number | null)[] = new Array(n).fill(null)
  const signalArr: (number | null)[] = new Array(n).fill(null)
  const histogram: (number | null)[] = new Array(n).fill(null)
  if (n < slow) return { macd: macdArr, signal: signalArr, histogram }
  const fastEma = ema(values, fast)
  const slowEma = ema(values, slow)
  // 从 slow-1（两条 EMA 都有效）起逐点算 macd
  for (let i = slow - 1; i < n; i++) {
    macdArr[i] = fastEma[i]! - slowEma[i]!
  }
  // signal = EMA(signal) of macd（只取非 null 段）
  const macdTail: number[] = []
  for (let i = slow - 1; i < n; i++) macdTail.push(macdArr[i]!)
  const signalEma = ema(macdTail, signal)
  for (let i = 0; i < signalEma.length; i++) {
    const v = signalEma[i]
    if (v === null) continue
    const idx = slow - 1 + i
    signalArr[idx] = v
    histogram[idx] = macdArr[idx]! - v
  }
  return { macd: macdArr, signal: signalArr, histogram }
}

export interface BollingerOutput {
  upper: (number | null)[]
  middle: (number | null)[]
  lower: (number | null)[]
}

/** 布林带：middle = SMA，band = multiplier * 总体标准差（除以 n）。头部 window-1 个 null。 */
export function bollinger(
  values: readonly number[],
  window: number,
  multiplier: number,
): BollingerOutput {
  assertWindow(window)
  if (!Number.isFinite(multiplier) || multiplier <= 0) {
    throw new RangeError('multiplier must be a positive finite number')
  }
  const n = values.length
  const upper: (number | null)[] = new Array(n).fill(null)
  const middle: (number | null)[] = new Array(n).fill(null)
  const lower: (number | null)[] = new Array(n).fill(null)
  if (n < window) return { upper, middle, lower }
  for (let i = window - 1; i < n; i++) {
    let sum = 0
    let sumSq = 0
    for (let j = i - window + 1; j <= i; j++) {
      sum += values[j]!
      sumSq += values[j]! * values[j]!
    }
    const mean = sum / window
    const variance = sumSq / window - mean * mean
    const std = Math.sqrt(Math.max(variance, 0))
    middle[i] = mean
    upper[i] = mean + multiplier * std
    lower[i] = mean - multiplier * std
  }
  return { upper, middle, lower }
}

/**
 * 平均真实波幅（Wilder）：TR = max(h-l, |h-pc|, |l-pc|)，首个 TR = h[0]-l[0]。
 * 第一个 ATR = 前 window 个 TR 的简单平均；之后递归平滑。
 * 头部 window 个 null，第一个有效值在 index window。三个输入必须等长。
 */
export function atr(
  high: readonly number[],
  low: readonly number[],
  close: readonly number[],
  window: number,
): (number | null)[] {
  assertWindow(window)
  const n = high.length
  const out: (number | null)[] = new Array(n).fill(null)
  if (n === 0 || high.length !== low.length || high.length !== close.length) {
    if (n !== 0 && (high.length !== low.length || high.length !== close.length)) {
      throw new RangeError('high/low/close must have equal length')
    }
    return out
  }
  if (n < window + 1) return out
  const tr: number[] = new Array(n)
  tr[0] = high[0]! - low[0]!
  for (let i = 1; i < n; i++) {
    const h = high[i]!
    const l = low[i]!
    const pc = close[i - 1]!
    tr[i] = Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc))
  }
  let prev = 0
  for (let i = 0; i < window; i++) prev += tr[i]!
  prev /= window
  out[window] = prev
  for (let i = window; i < n - 1; i++) {
    prev = (prev * (window - 1) + tr[i]!) / window
    out[i + 1] = prev
  }
  return out
}

function assertWindow(window: number): void {
  if (!Number.isInteger(window) || window < 1) {
    throw new RangeError(`window must be a positive integer, got ${window}`)
  }
}

/** execute 层用的有限数检查：返回违规说明，无违规返回 null。 */
export function firstNonFinite(values: readonly number[]): number | null {
  for (let i = 0; i < values.length; i++) {
    if (!Number.isFinite(values[i])) return i
  }
  return null
}
