/**
 * 基金模拟（纯函数、零依赖）—— dsh-execution 域（PET 映射）。
 */
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
