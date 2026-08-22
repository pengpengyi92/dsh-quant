/**
 * 组合压力测试（纯函数、零依赖）。
 *
 * 核心问题：组合在极端市场情景下亏多少？
 * 给定资产收益的协方差结构，模拟常见压力情景（市场 -20%/-10%、
 * 波动率飙升、相关性上升），估算组合损失。
 *
 * 简化模型：假设组合对市场有 beta 暴露，压力情景 = 市场收益 × beta
 * + 特质波动冲击。非精确 VaR，但给出"最坏情形下亏多少"的直觉。
 */

/** 压力测试结果。 */
export interface StressTestResult {
  /** 组合当前权重 */
  weights: number[]
  /** 各情景下的组合损失 %（正数 = 亏损） */
  scenarioLossesPct: Array<{ scenario: string; lossPct: number }>
  /** 最大损失情景 */
  worstScenario: string
  /** 最大损失 % */
  maxLossPct: number
  /** 组合年化波动（输入推算） */
  portfolioVolPct: number
  notes: string[]
}

/** 内置压力情景（市场收益冲击，%） */
const SCENARIOS: Array<{ name: string; marketShockPct: number }> = [
  { name: '温和下跌', marketShockPct: -5 },
  { name: '显著下跌', marketShockPct: -10 },
  { name: '市场崩盘', marketShockPct: -20 },
  { name: '流动性危机', marketShockPct: -30 },
  { name: '波动率飙升', marketShockPct: -15 },
  { name: '相关性上升', marketShockPct: -12 },
]

/**
 * 压力测试。
 *
 * @param weights 资产权重（和 = 1）
 * @param betas 各资产对市场的 beta
 * @param assetVolsPct 各资产年化波动 %
 * @param correlation 资产与市场的平均相关（默认 0.6）
 */
export function stressTest(
  weights: readonly number[],
  betas: readonly number[],
  assetVolsPct: readonly number[],
  correlation = 0.6,
): StressTestResult {
  const n = weights.length
  if (n < 1) throw new RangeError('weights must not be empty')
  if (betas.length !== n) throw new RangeError(`betas length ${betas.length} != ${n}`)
  if (assetVolsPct.length !== n) throw new RangeError(`assetVolsPct length != ${n}`)
  const wSum = weights.reduce((a, b) => a + b, 0)
  if (Math.abs(wSum - 1) > 1e-6) throw new RangeError(`weights must sum to 1, got ${wSum}`)
  if (correlation < -1 || correlation > 1) throw new RangeError(`correlation must be in [-1,1], got ${correlation}`)

  // 组合 beta 和波动
  const portfolioBeta = weights.reduce((a, w, i) => a + w * betas[i]!, 0)
  // 组合波动（假设资产间相关 = correlation² 的简化）
  let varSum = 0
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const corr = i === j ? 1 : correlation * correlation
      varSum += weights[i]! * weights[j]! * (assetVolsPct[i]! / 100) * (assetVolsPct[j]! / 100) * corr
    }
  }
  const portfolioVolPct = Math.sqrt(Math.max(varSum, 0)) * 100

  const scenarioLossesPct: Array<{ scenario: string; lossPct: number }> = []
  for (const sc of SCENARIOS) {
    // 损失 = 市场冲击 × beta + 特质波动冲击（假设压力下波动放大）
    const shock = Math.abs(sc.marketShockPct) / 100
    const volImpact = correlation * shock * 0.3 // 特质部分对压力的贡献（简化）
    const lossPct = Math.abs(sc.marketShockPct) * Math.abs(portfolioBeta) + volImpact * 100
    scenarioLossesPct.push({ scenario: sc.name, lossPct })
  }
  const worst = scenarioLossesPct.reduce((a, b) => (b.lossPct > a.lossPct ? b : a))
  const notes: string[] = []
  notes.push(`组合 beta ${portfolioBeta.toFixed(2)}，年化波动 ${portfolioVolPct.toFixed(1)}%`)
  notes.push(`最坏情景「${worst.scenario}」预计亏损 ${worst.lossPct.toFixed(1)}%`)
  if (portfolioBeta > 1.5) notes.push('组合 beta 偏高 —— 压力下暴露大，考虑对冲或降杠杆')
  return { weights: [...weights], scenarioLossesPct, worstScenario: worst.scenario, maxLossPct: worst.lossPct, portfolioVolPct, notes }
}
