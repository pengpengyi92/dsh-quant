/**
 * decay.ts + optimizer.ts 手算测试。
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { icDecayAnalysis } from '../src/dsh-alpha/decay.ts'
import { portfolioOptimize } from '../src/dsh-ml/optimizer.ts'

test('icDecayAnalysis: 短周期信号 —— 半衰期短、类型 short', () => {
  // 交替符号因子：只预测下一期收益，累计 horizon 互相抵消
  const n = 300
  const factor: number[] = []
  const returns: number[] = []
  for (let i = 0; i < n; i++) {
    factor.push(i % 2 === 0 ? 1 : -1) // 周期 2 的高周转短信号
    // 收益 = factor 滞后 1 期；偶数位 +0.3，奇数位 -0.3（确定性）
    returns.push(i === 0 ? 0 : factor[i - 1]! * 0.3)
  }
  const r = icDecayAnalysis(factor, returns, 10)
  // h=1：IC = 1（完全预测）
  assert.ok(r.icByHorizon[0]! > 0.9, `ic1=${r.icByHorizon[0]}`)
  assert.equal(r.peakHorizon, 1)
  // h=2：累计抵消 → IC 骤降 → 半衰期短
  assert.ok(r.halfLife <= 2, `halfLife=${r.halfLife}`)
  assert.equal(r.signalType, 'short')
})

test('icDecayAnalysis: 长周期信号 —— 半衰期长、类型 long', () => {
  // 高自相关 AR(1)（φ=0.95）：强趋势 → 累计收益随 horizon 增强，IC 不衰减
  const n = 600
  const factor: number[] = []
  const returns: number[] = []
  let prev = 0.01
  for (let i = 0; i < n; i++) {
    prev = 0.95 * prev + Math.sin(i * 0.3) * 0.0005
    factor.push(prev)
    returns.push(prev)
  }
  const r = icDecayAnalysis(factor, returns, 10)
  // 高自相关 → 半衰期接近 maxHorizon，类型 long
  assert.ok(r.halfLife > 5, `halfLife=${r.halfLife}`)
  assert.equal(r.signalType, 'long')
  assert.ok(r.bestHorizon >= 5, `bestHorizon=${r.bestHorizon}`)
})

test('icDecayAnalysis: 前置条件', () => {
  assert.throws(() => icDecayAnalysis([1, 2], [1, 2]), /at least 3/)
  assert.throws(() => icDecayAnalysis([1, 2, 3, 4, 5], [1, 2, 3, 4]), /length/)
  assert.throws(() => icDecayAnalysis([1, 2, 3], [1, 2, 3], 0), /maxHorizon/)
})

test('portfolioOptimize: 最小方差 —— 权重和为 1 且非负', () => {
  // 两个资产：A 波动大、B 波动小 → 最小方差应偏向 B
  const returns: number[][] = []
  for (let i = 0; i < 100; i++) {
    const a = Math.sin(i * 0.5) * 0.05
    const b = Math.cos(i * 0.3) * 0.01
    returns.push([a, b])
  }
  const r = portfolioOptimize(returns, 'minVar')
  assert.equal(r.method, 'minVar')
  assert.ok(Math.abs(r.weights.reduce((a, b) => a + b, 0) - 1) < 1e-6)
  for (const w of r.weights) assert.ok(w >= 0, `w=${w}`)
  // B 波动小 → 权重应显著大于 A
  assert.ok(r.weights[1]! > r.weights[0]!, `weights=${r.weights}`)
  assert.ok(r.concentration > 0.5, `conc=${r.concentration}`)
})

test('portfolioOptimize: maxSharpe —— 高夏普资产权重更高', () => {
  // A 高收益高波动、B 低收益低波动 → maxSharpe 应偏向 B（夏普更高）
  const returns: number[][] = []
  for (let i = 0; i < 200; i++) {
    const a = 0.01 + Math.sin(i * 0.5) * 0.05 // 高收益高波动
    const b = 0.002 + Math.cos(i * 0.3) * 0.005 // 低收益低波动（夏普更高）
    returns.push([a, b])
  }
  const r = portfolioOptimize(returns, 'maxSharpe')
  assert.equal(r.method, 'maxSharpe')
  assert.ok(Math.abs(r.weights.reduce((a, b) => a + b, 0) - 1) < 1e-6)
  assert.ok(r.weights[1]! > r.weights[0]!, `weights=${r.weights}`)
  // 组合夏普 ≥ 单资产最高夏普的 90%（优化有效）
  const maxAsset = Math.max(...r.assetSharpe)
  assert.ok(r.sharpe > maxAsset * 0.9 - 0.01, `sharpe=${r.sharpe} maxAsset=${maxAsset}`)
})

test('portfolioOptimize: riskParity —— 风险贡献接近相等', () => {
  // 两资产不同波动 → riskParity 应让各自风险贡献（w_i * sigma_i）接近
  const returns: number[][] = []
  for (let i = 0; i < 300; i++) {
    const a = Math.sin(i * 0.7) * 0.06
    const b = Math.cos(i * 0.2) * 0.02
    returns.push([a, b])
  }
  const r = portfolioOptimize(returns, 'riskParity')
  assert.equal(r.method, 'riskParity')
  assert.ok(Math.abs(r.weights.reduce((a, b) => a + b, 0) - 1) < 1e-6)
  // 波动大的资产权重应更小（风险平价补偿）
  assert.ok(r.weights[0]! < r.weights[1]!, `weights=${r.weights}`)
  // 风险贡献 ≈ 相等：w0*σ0 ≈ w1*σ1
  const sigma = [0.06, 0.02]
  const rc0 = r.weights[0]! * sigma[0]!
  const rc1 = r.weights[1]! * sigma[1]!
  const ratio = Math.min(rc0, rc1) / Math.max(rc0, rc1)
  assert.ok(ratio > 0.8, `risk contribution ratio=${ratio}`)
})

test('portfolioOptimize: 前置条件', () => {
  assert.throws(() => portfolioOptimize([[1, 2], [3, 4]]), /at least 5/)
  assert.throws(() => portfolioOptimize([[1], [2], [3], [4], [5]]), /at least 2 assets/)
  assert.throws(
    () => portfolioOptimize([[1, 2], [3], [4, 5], [6, 7], [8, 9]]),
    /row length/,
  )
})
