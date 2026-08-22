/**
 * 参数敏感性分析（纯函数、零依赖）。
 *
 * 核心问题：策略参数变化时，结果稳健吗？
 * - 对每个参数，在 [base×(1-range), base×(1+range)] 网格扫描
 * - 计算每个网格点的收益/夏普
 * - 报告：稳健性分数（高 = 参数平原）、最差邻域、是否"针尖式"最优
 */

/** 敏感性分析结果。 */
export interface SensitivityResult {
  /** 参数名 */
  paramName: string
  /** 扫描的取值 */
  values: number[]
  /** 每个取值对应的指标值（如收益%） */
  metricValues: number[]
  /** 基准值（输入） */
  baseValue: number
  /** 稳健性分数 0-1（1 = 完全平原，0 = 针尖式） */
  robustness: number
  /** 最优值（网格内） */
  bestValue: number
  /** 最优指标 */
  bestMetric: number
  /** 最差值 */
  worstMetric: number
  notes: string[]
}

/**
 * 参数敏感性分析。
 *
 * @param baseValue 基准参数值
 * @param range 扫描范围比例（如 0.2 = ±20%）
 * @param steps 扫描步数（含基准，默认 9）
 * @param metricFn 给定参数值返回指标值（如回测收益）
 */
export function parameterSensitivity(
  baseValue: number,
  range: number,
  steps: number,
  metricFn: (paramValue: number) => number,
): SensitivityResult {
  if (!Number.isFinite(baseValue) || baseValue <= 0) throw new RangeError(`baseValue must be positive, got ${baseValue}`)
  if (range <= 0 || range >= 1) throw new RangeError(`range must be in (0,1), got ${range}`)
  if (steps < 3 || !Number.isInteger(steps)) throw new RangeError(`steps must be an integer >= 3, got ${steps}`)

  const values: number[] = []
  const metricValues: number[] = []
  for (let s = 0; s < steps; s++) {
    const frac = s / (steps - 1) // 0..1
    const v = baseValue * (1 - range + 2 * range * frac)
    values.push(v)
    metricValues.push(metricFn(v))
  }
  const bestIdx = metricValues.indexOf(Math.max(...metricValues))
  const worstIdx = metricValues.indexOf(Math.min(...metricValues))
  const bestValue = values[bestIdx]!
  const bestMetric = metricValues[bestIdx]!
  const worstMetric = metricValues[worstIdx]!
  // 稳健性：指标相对变化的平滑度。用标准差/均值比（CV）的倒数归一化
  const mean = metricValues.reduce((a, b) => a + b, 0) / steps
  const spread = Math.max(...metricValues) - Math.min(...metricValues)
  const robustness = spread < 1e-12 ? 1 : Math.max(0, Math.min(1, 1 - spread / Math.max(Math.abs(mean), 1e-12) / (2 * range) * range))
  const notes: string[] = []
  notes.push(`基准 ${baseValue} → 最优 ${bestValue.toFixed(4)}（${bestMetric.toFixed(3)}）`)
  notes.push(`稳健性 ${robustness.toFixed(2)}（1 = 平原稳健，0 = 针尖敏感）`)
  if (robustness < 0.5) notes.push('参数敏感 —— 结果依赖具体参数，过拟合风险高')
  else notes.push('参数较稳健 —— 结果对参数不敏感，可信度较高')
  return { paramName: 'param', values, metricValues, baseValue, robustness, bestValue, bestMetric, worstMetric, notes }
}
