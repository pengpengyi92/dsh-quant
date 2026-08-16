/**
 * 债券分析（纯函数、零依赖）—— dsh-risk 域（PRT 映射）。
 *
 * FICC 联动：本模块是公开侧的固定收益方法论（定价/久期/凸性/DV01），
 * 与内部 PFIC（Pengyi FICC）同语言：公开方法，头寸/策略/执行支持在内部。
 *
 * 模型：按票息期折现（每期利率 = ytm/paymentsPerYear，票息 = couponRate
 * ×face/paymentsPerYear），久期/凸性为教科书定义（连续复利与日期计数
 * 约定不在本模块范围——见 notes）。
 */

export interface BondInput {
  /** 面值（默认 100） */
  faceValue?: number
  /** 票息率（年化，小数如 0.03） */
  couponRate: number
  /** 剩余期限（年） */
  periodsToMaturity: number
  /** 每年付息次数（1/2/4/12，默认 2） */
  paymentsPerYear?: number
  /** 到期收益率（与 price 二选一） */
  ytm?: number
  /** 全价（与 ytm 二选一） */
  price?: number
}

export interface BondAnalytics {
  faceValue: number
  couponRate: number
  periodsToMaturity: number
  paymentsPerYear: number
  /** 全价 */
  price: number
  /** 到期收益率 */
  yieldToMaturity: number
  /** 麦考利久期（年） */
  macaulayDuration: number
  /** 修正久期（年） */
  modifiedDuration: number
  /** 凸性（年²） */
  convexity: number
  /** DV01 = 修正久期 × 全价 / 10000（收益率上行 1bp 的价格变动） */
  dv01: number
}

/** 给定收益率 → 全价（现金流折现，纯函数）。 */
export function priceFromYield(faceValue: number, couponRate: number, periodsToMaturity: number, paymentsPerYear: number, ytm: number): number {
  const n = Math.round(periodsToMaturity * paymentsPerYear)
  const r = ytm / paymentsPerYear
  const c = (couponRate * faceValue) / paymentsPerYear
  let price = 0
  for (let t = 1; t <= n; t++) {
    price += c / (1 + r) ** t
  }
  price += faceValue / (1 + r) ** n
  return price
}

/** 给定全价 → 到期收益率（二分法，纯函数）。 */
export function yieldFromPrice(faceValue: number, couponRate: number, periodsToMaturity: number, paymentsPerYear: number, price: number): number {
  let lo = 1e-6
  let hi = 2
  for (let i = 0; i < 120; i++) {
    const mid = (lo + hi) / 2
    const p = priceFromYield(faceValue, couponRate, periodsToMaturity, paymentsPerYear, mid)
    if (p > price) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

/**
 * 债券全量分析：价格/收益率互算 + 麦考利久期 + 修正久期 + 凸性 + DV01。
 * ytm 与 price 必须恰好给一个。
 */
export function bondAnalytics(input: BondInput): BondAnalytics {
  const faceValue = input.faceValue ?? 100
  const paymentsPerYear = input.paymentsPerYear ?? 2
  if (!Number.isFinite(faceValue) || faceValue <= 0) throw new RangeError(`faceValue must be > 0, got ${faceValue}`)
  if (!Number.isFinite(input.couponRate) || input.couponRate < 0) throw new RangeError(`couponRate must be >= 0, got ${input.couponRate}`)
  if (!Number.isFinite(input.periodsToMaturity) || input.periodsToMaturity <= 0) {
    throw new RangeError(`periodsToMaturity must be > 0, got ${input.periodsToMaturity}`)
  }
  if (![1, 2, 4, 12].includes(paymentsPerYear)) throw new RangeError(`paymentsPerYear must be 1/2/4/12, got ${paymentsPerYear}`)
  if ((input.ytm === undefined) === (input.price === undefined)) {
    throw new RangeError('exactly one of ytm or price must be provided')
  }
  const ytm = input.ytm ?? yieldFromPrice(faceValue, input.couponRate, input.periodsToMaturity, paymentsPerYear, input.price!)
  if (!Number.isFinite(ytm) || ytm <= 0 || ytm >= 2) throw new RangeError(`ytm must be in (0, 2), got ${ytm}`)
  const price = input.price ?? priceFromYield(faceValue, input.couponRate, input.periodsToMaturity, paymentsPerYear, ytm)

  const n = Math.round(input.periodsToMaturity * paymentsPerYear)
  const r = ytm / paymentsPerYear
  const c = (input.couponRate * faceValue) / paymentsPerYear
  let sumT = 0 // Σ t·PV
  let sumTT = 0 // Σ t(t+1)·PV
  for (let t = 1; t <= n; t++) {
    const pv = (t < n ? c : c + faceValue) / (1 + r) ** t
    sumT += t * pv
    sumTT += t * (t + 1) * pv
  }
  const macaulay = sumT / price / paymentsPerYear
  const modified = macaulay / (1 + r)
  const convexity = sumTT / price / (1 + r) ** 2 / paymentsPerYear ** 2
  const dv01 = (modified * price) / 10000
  return {
    faceValue, couponRate: input.couponRate, periodsToMaturity: input.periodsToMaturity,
    paymentsPerYear, price, yieldToMaturity: ytm,
    macaulayDuration: macaulay, modifiedDuration: modified, convexity, dv01,
  }
}
