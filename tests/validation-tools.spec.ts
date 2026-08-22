/**
 * factor-corr / deflated-sharpe / stress / sensitivity 手算测试。
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { factorCorrelation } from '../src/dsh-ml/factor-corr.ts'
import { deflatedSharpe } from '../src/dsh-ml/deflated-sharpe.ts'
import { stressTest } from '../src/dsh-risk/stress.ts'
import { parameterSensitivity } from '../src/dsh-ml/sensitivity.ts'

test('factorCorrelation: 完全相关因子 → 高相关对 + 有效数≈1', () => {
  const f1 = [1, 2, 3, 4, 5, 6]
  const f2 = f1.map(x => x * 2) // 完全线性相关
  const f3 = [6, 5, 4, 3, 2, 1] // 完全负相关
  const r = factorCorrelation([f1, f2, f3], ['a', 'b', 'c'], 0.7)
  // |ρ(a,b)| = 1, |ρ(a,c)| = 1, |ρ(b,c)| = 1 → 3 对高相关
  assert.equal(r.highCorrelationPairs.length, 3)
  assert.ok(Math.abs(r.correlationMatrix[0]![1]! - 1) < 1e-9)
  assert.ok(Math.abs(r.correlationMatrix[0]![2]! + 1) < 1e-9)
  // 有效独立因子数 ≈ 1（全冗余）
  assert.ok(r.effectiveFactorCount < 1.5, `eff=${r.effectiveFactorCount}`)
})

test('factorCorrelation: 独立因子 → 无高相关对', () => {
  const f1 = [1, 2, 3, 4, 5, 6, 7, 8]
  const f2 = [0, 1, 0, 1, 0, 1, 0, 1] // 与 f1 低相关
  const r = factorCorrelation([f1, f2], ['a', 'b'], 0.7)
  assert.equal(r.highCorrelationPairs.length, 0)
  assert.ok(Math.abs(r.correlationMatrix[0]![1]!) < 0.5, `ρ=${r.correlationMatrix[0][1]}`)
})

test('factorCorrelation: 前置条件', () => {
  assert.throws(() => factorCorrelation([[1]]), /at least 2 series/)
  assert.throws(() => factorCorrelation([[1, 2], [1]]), /length/)
  assert.throws(() => factorCorrelation([[1, 2], [3, 4]], ['a'], 0.7), /factorNames length/)
})

test('deflatedSharpe: 单次试验 → 最小显著夏普较低，高夏普显著', () => {
  const r = deflatedSharpe(1.5, 252, 1)
  assert.ok(r.observedSharpe === 1.5)
  // 单次试验无多重比较校正 → minSignificant 很小 → 显著
  assert.ok(r.minSignificantSharpe < 0.1, `minSig=${r.minSignificantSharpe}`)
  assert.ok(r.significant, `minSig=${r.minSignificantSharpe}`)
  assert.ok(r.pValue < 0.05)
})

test('deflatedSharpe: 大量试验 → 阈值抬高（过拟合校正生效）', () => {
  // 1000 次试验的校正阈值应显著高于单次试验
  const r = deflatedSharpe(0.5, 252, 1000)
  const single = deflatedSharpe(0.5, 252, 1)
  assert.ok(r.minSignificantSharpe > single.minSignificantSharpe * 3, `minSig=${r.minSignificantSharpe} vs single=${single.minSignificantSharpe}`)
  // 0.5 的夏普在 1000 次试验下比单次试验更难通过（p 值更高）
  assert.ok(r.pValue > single.pValue)
})

test('deflatedSharpe: 前置条件', () => {
  assert.throws(() => deflatedSharpe(1, 10), />= 30/)
  assert.throws(() => deflatedSharpe(1, 252, 0), /positive integer/)
})

test('stressTest: 高 beta 组合最坏情景亏损更大', () => {
  const r = stressTest([0.5, 0.5], [2, 2], [30, 30], 0.6) // 组合 beta = 2
  // 最坏情景应是市场冲击最大的（流动性危机 -30%）
  assert.equal(r.worstScenario, '流动性危机')
  assert.ok(r.maxLossPct > 20, `maxLoss=${r.maxLossPct}`)
  assert.ok(r.notes.some(n => /beta 偏高/.test(n)))
})

test('stressTest: 前置条件', () => {
  assert.throws(() => stressTest([1], [1, 2], [10, 10]), /betas length/)
  assert.throws(() => stressTest([0.5, 0.6], [1, 1], [10, 10]), /sum to 1/)
})

test('parameterSensitivity: 平原参数 → 高稳健性；针尖参数 → 低稳健性', () => {
  // 平原：所有参数值指标接近
  const flat = parameterSensitivity(10, 0.2, 9, () => 0.05)
  assert.ok(flat.robustness > 0.7, `flat robustness=${flat.robustness}`)
  // 针尖：基准值指标高，偏离后暴跌
  const spike = parameterSensitivity(10, 0.2, 9, (v) => (v === 10 ? 0.2 : -0.1))
  assert.ok(spike.robustness < 0.5, `spike robustness=${spike.robustness}`)
  assert.ok(Math.abs(spike.bestValue - 10) < 1e-9)
})

test('parameterSensitivity: 前置条件', () => {
  assert.throws(() => parameterSensitivity(0, 0.2, 9, () => 1), /positive/)
  assert.throws(() => parameterSensitivity(10, 1.5, 9, () => 1), /range/)
  assert.throws(() => parameterSensitivity(10, 0.2, 2, () => 1), /steps/)
})
