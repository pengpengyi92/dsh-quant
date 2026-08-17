/**
 * 期权定价与希腊字母（纯函数、零依赖）—— dsh-risk 域。
 *
 * 灵感来源：Optiver 的公开思路（Ready Trader Go 做市仿真、optibook 模拟
 * 交易所、期权定价挑战赛）：定价 → greeks → 波动率 → 对冲，方法公开，
 * 做市执行与库存管理留在内部。
 *
 * 模型：Black-Scholes（欧式、无股息、连续复利）。N(·) 用 erf 近似。
 */

/** 标准正态 CDF（erf 近似，精度 ~1e-7）。 */
function normalCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2))
}

function erf(x: number): number {
  const sign = x < 0 ? -1 : 1
  const ax = Math.abs(x)
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911
  const t = 1 / (1 + p * ax)
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax)
  return sign * y
}

/** 标准正态 PDF。 */
function normalPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)
}

export interface OptionInput {
  /** 标的价格 */
  spot: number
  /** 行权价 */
  strike: number
  /** 到期时间（年） */
  timeToMaturity: number
  /** 无风险利率（年化小数） */
  riskFreeRate: number
  /** 波动率（年化小数）；与 price 二选一 */
  volatility?: number
  /** 期权市场价格；与 volatility 二选一（用于反解 IV） */
  price?: number
  type: 'call' | 'put'
}

export interface OptionAnalytics {
  spot: number
  strike: number
  timeToMaturity: number
  riskFreeRate: number
  type: 'call' | 'put'
  /** 理论价 */
  price: number
  /** 隐含波动率 */
  impliedVolatility: number
  delta: number
  gamma: number
  /** 每 1% 波动率变动的价格变化 */
  vega: number
  /** 每 1 年的 theta（价格/年） */
  theta: number
  /** 每 1% 利率变动的价格变化 */
  rho: number
}

/** Black-Scholes 理论价（纯函数）。 */
export function bsPrice(spot: number, strike: number, t: number, r: number, sigma: number, type: 'call' | 'put'): number {
  const d1 = (Math.log(spot / strike) + (r + 0.5 * sigma * sigma) * t) / (sigma * Math.sqrt(t))
  const d2 = d1 - sigma * Math.sqrt(t)
  if (type === 'call') return spot * normalCdf(d1) - strike * Math.exp(-r * t) * normalCdf(d2)
  return strike * Math.exp(-r * t) * normalCdf(-d2) - spot * normalCdf(-d1)
}

/** 隐含波动率反解（二分法，纯函数）。 */
export function impliedVolatility(spot: number, strike: number, t: number, r: number, marketPrice: number, type: 'call' | 'put'): number {
  let lo = 1e-6
  let hi = 5
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    const p = bsPrice(spot, strike, t, r, mid, type)
    if (p > marketPrice) hi = mid
    else lo = mid
  }
  return (lo + hi) / 2
}

/**
 * 期权全量分析：价格/IV 互算 + 五大希腊字母。
 * volatility 与 price 必须恰好给一个。
 */
export function optionAnalytics(input: OptionInput): OptionAnalytics {
  const { spot, strike, timeToMaturity: t, riskFreeRate: r, type } = input
  if (!Number.isFinite(spot) || spot <= 0) throw new RangeError(`spot must be > 0, got ${spot}`)
  if (!Number.isFinite(strike) || strike <= 0) throw new RangeError(`strike must be > 0, got ${strike}`)
  if (!Number.isFinite(t) || t <= 0) throw new RangeError(`timeToMaturity must be > 0, got ${t}`)
  if (!Number.isFinite(r) || r < 0) throw new RangeError(`riskFreeRate must be >= 0, got ${r}`)
  if ((input.volatility === undefined) === (input.price === undefined)) {
    throw new RangeError('exactly one of volatility or price must be provided')
  }
  const sigma = input.volatility ?? impliedVolatility(spot, strike, t, r, input.price!, type)
  if (!Number.isFinite(sigma) || sigma <= 0 || sigma >= 5) throw new RangeError(`volatility must be in (0, 5), got ${sigma}`)
  const price = input.price ?? bsPrice(spot, strike, t, r, sigma, type)

  const d1 = (Math.log(spot / strike) + (r + 0.5 * sigma * sigma) * t) / (sigma * Math.sqrt(t))
  const d2 = d1 - sigma * Math.sqrt(t)
  const sqrtt = Math.sqrt(t)
  const discount = Math.exp(-r * t)
  const gamma = normalPdf(d1) / (spot * sigma * sqrtt)
  const vega = (spot * sqrtt * normalPdf(d1)) / 100
  const delta = type === 'call' ? normalCdf(d1) : normalCdf(d1) - 1
  const theta = type === 'call'
    ? -(spot * normalPdf(d1) * sigma) / (2 * sqrtt) - r * strike * discount * normalCdf(d2)
    : -(spot * normalPdf(d1) * sigma) / (2 * sqrtt) + r * strike * discount * normalCdf(-d2)
  const rho = (type === 'call' ? strike * t * discount * normalCdf(d2) : -strike * t * discount * normalCdf(-d2)) / 100

  return {
    spot, strike, timeToMaturity: t, riskFreeRate: r, type,
    price, impliedVolatility: sigma, delta, gamma, vega, theta, rho,
  }
}
