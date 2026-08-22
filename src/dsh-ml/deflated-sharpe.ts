/**
 * Deflated Sharpe Ratio（过拟合校正夏普，纯函数、零依赖）。
 *
 * 核心问题：回测出来的夏普有多大概率是过拟合的？
 * 多次试验（调参/多因子/多策略）后，最好结果的夏普会被高估。
 * Deflated Sharpe（Bailey & López de Prado, 2014）用试验次数 N 和
 * 回测长度 T 校正这一偏差，给出"经试验次数修正后的最小显著夏普"。
 */

/** Deflated Sharpe 结果。 */
export interface DeflatedSharpeResult {
  /** 观察到的夏普（年化） */
  observedSharpe: number
  /** 试验次数校正后的最小显著夏普（超过它才算真有效） */
  minSignificantSharpe: number
  /** Deflated Sharpe = (observed - minSignificant) * sqrt(T-1) 的标准化值 */
  deflatedSharpe: number
  /** 是否显著（observed > minSignificant） */
  significant: boolean
  /** 通过概率（标准正态 CDF） */
  pValue: number
  notes: string[]
}

/** 标准正态 CDF（近似，Abramowitz-Stegun）。 */
function normCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x))
  const d = 0.3989423 * Math.exp(-x * x / 2)
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return x > 0 ? 1 - p : p
}

/** 逆正态 CDF（Acklam 近似）。 */
function normInv(p: number): number {
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00]
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01]
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00]
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00]
  const plow = 0.02425
  const phigh = 1 - plow
  if (p < plow) {
    const q = Math.sqrt(-2 * Math.log(p))
    return (((((c[0]! * q + c[1]!) * q + c[2]!) * q + c[3]!) * q + c[4]!) * q + c[5]!) / ((((d[0]! * q + d[1]!) * q + d[2]!) * q + d[3]!) * q + 1)
  }
  if (p > phigh) {
    return -normInv(1 - p)
  }
  const q = p - 0.5
  const r = q * q
  return (((((a[0]! * r + a[1]!) * r + a[2]!) * r + a[3]!) * r + a[4]!) * r + a[5]!) * q / (((((b[0]! * r + b[1]!) * r + b[2]!) * r + b[3]!) * r + b[4]!) * r + 1)
}

/**
 * Deflated Sharpe 计算。
 *
 * @param observedSharpe 观察到的年化夏普
 * @param numPeriods 回测期数（年化周期数，如日频 = 天数）
 * @param numTrials 试验次数（参数搜索/因子数量，至少 1）
 * @param skewness 收益偏度（默认 0）
 * @param kurtosis 超额峰度（默认 0）
 */
export function deflatedSharpe(
  observedSharpe: number,
  numPeriods: number,
  numTrials = 1,
  skewness = 0,
  kurtosis = 0,
): DeflatedSharpeResult {
  if (!Number.isFinite(observedSharpe)) throw new RangeError('observedSharpe must be finite')
  if (numPeriods < 30) throw new RangeError(`numPeriods must be >= 30, got ${numPeriods}`)
  if (numTrials < 1 || !Number.isInteger(numTrials)) throw new RangeError(`numTrials must be a positive integer, got ${numTrials}`)

  // 期望最大夏普（试验次数校正）：E[max] ≈ (1-γ)Φ⁻¹(1-1/N) + γΦ⁻¹(1-1/(Ne))
  // 单次试验（N=1）：无多重比较，E[max] = 0（取期望夏普本身）
  const gamma = 0.5772156649 // Euler-Mascheroni
  let eMaxSharpe: number
  if (numTrials === 1) {
    eMaxSharpe = 0
  } else {
    const z1 = normInv(1 - 1 / numTrials)
    const z2 = normInv(1 - 1 / (numTrials * Math.E))
    eMaxSharpe = (1 - gamma) * z1 + gamma * z2
  }

  // 标准误校正（含偏度峰度）：SR std ≈ sqrt((1 + 0.5 SR² - skew SR + (kurt-1)/4 SR²) / (T-1))
  const srm = observedSharpe
  const se = Math.sqrt((1 + 0.5 * srm * srm - skewness * srm + ((kurtosis - 1) / 4) * srm * srm) / (numPeriods - 1))
  const minSignificantSharpe = eMaxSharpe * se

  // Deflated Sharpe
  const deflated = numPeriods > 1
    ? (observedSharpe - minSignificantSharpe) * Math.sqrt(numPeriods - 1)
    : observedSharpe - minSignificantSharpe
  const pValue = 1 - normCdf(deflated)
  const significant = observedSharpe > minSignificantSharpe
  const notes: string[] = []
  notes.push(`试验次数 ${numTrials} → 期望最大夏普 ${eMaxSharpe.toFixed(2)} 个标准误`)
  notes.push(`最小显著夏普 ${minSignificantSharpe.toFixed(3)}（observed ${observedSharpe.toFixed(3)}）`)
  if (significant) notes.push('通过 Deflated Sharpe 检验 —— 结果不太可能是过拟合')
  else notes.push('未通过 —— 结果可能在试验次数内被高估（过拟合风险）')
  return { observedSharpe, minSignificantSharpe, deflatedSharpe: deflated, significant, pValue, notes }
}
