/**
 * layered / trade-quality / attribution 手算测试。
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { layeredBacktest } from '../src/dsh-ml/layered.ts'
import { tradeQuality } from '../src/dsh-execution/trade-quality.ts'
import { attribution } from '../src/dsh-ml/attribution.ts'

test('layeredBacktest: 完美分层因子 → 多空为正、top 高于 bottom', () => {
  // 因子 = 资产 id（高因子值资产收益更高）→ top 层（最高因子）收益 > bottom
  const t = 30
  const n = 10
  const factor: number[][] = []
  const returns: number[][] = []
  for (let i = 0; i < t; i++) {
    factor.push(Array.from({ length: n }, (_, a) => a)) // 因子 = 0..9
    returns.push(Array.from({ length: n }, (_, a) => 0.001 * a)) // 收益随因子递增
  }
  const r = layeredBacktest(factor, returns, 5, 5, 0)
  assert.equal(r.layers, 5)
  // top 收益 > bottom 收益，多空为正
  assert.ok(r.topReturnPct > r.bottomReturnPct, `top=${r.topReturnPct} bottom=${r.bottomReturnPct}`)
  assert.ok(r.longShortReturnPct > 0, `ls=${r.longShortReturnPct}`)
  // 分层单调：layerMeanReturnPct 递增
  for (let l = 1; l < r.layerMeanReturnPct.length; l++) {
    assert.ok(r.layerMeanReturnPct[l]! >= r.layerMeanReturnPct[l - 1]!, `layer ${l} 应 >= ${l - 1}`)
  }
})

test('layeredBacktest: 前置条件', () => {
  assert.throws(() => layeredBacktest([[1]], [[1]]), /at least 5/)
  assert.throws(() => layeredBacktest(Array.from({ length: 5 }, () => [1]), Array.from({ length: 5 }, () => [1])), /at least 2 assets/)
  assert.throws(
    () => layeredBacktest(Array.from({ length: 5 }, () => [1, 2]), Array.from({ length: 5 }, () => [1, 2]), 1),
    /layers/,
  )
})

test('tradeQuality: 成交率 + 滑点 + 持仓', () => {
  const fills = [
    { orderIndex: 0, side: 'buy', fillIndex: 1, fillPrice: 100, quantity: 1, value: 100, fee: 0.1, slippageCost: 0.5, cashAfter: 0, positionAfter: 1, equityAfter: 100 },
    { orderIndex: 0, side: 'sell', fillIndex: 6, fillPrice: 105, quantity: 1, value: 105, fee: 0.1, slippageCost: 0.5, cashAfter: 105, positionAfter: 0, equityAfter: 105 },
  ]
  const r = tradeQuality(fills, 0)
  assert.equal(r.orders, 2)
  assert.equal(r.fills, 2)
  assert.equal(r.fillRate, 1)
  assert.equal(r.buys, 1)
  assert.equal(r.sells, 1)
  // 滑点 = 1.0 / 205 * 10000 ≈ 48.8 bps
  assert.ok(r.avgSlippageBps > 40 && r.avgSlippageBps < 60, `slippage=${r.avgSlippageBps}`)
  // 持仓 6-1 = 5 bars
  assert.ok(Math.abs(r.avgHoldingBars - 5) < 1e-9, `hold=${r.avgHoldingBars}`)
})

test('tradeQuality: 未成交订单降低成交率', () => {
  const fills = [
    { orderIndex: 0, side: 'buy', fillIndex: 1, fillPrice: 100, quantity: 1, value: 100, fee: 0.1, slippageCost: 0.5, cashAfter: 0, positionAfter: 1, equityAfter: 100 },
  ]
  const r = tradeQuality(fills, 3) // 1 成交 + 3 未成交
  assert.equal(r.orders, 4)
  assert.equal(r.fillRate, 0.25)
  assert.ok(r.notes.some(n => /偏低/.test(n)))
})

test('attribution: 资产贡献 = 权重×收益', () => {
  const returns = [[0.01, 0.02], [0.01, 0.02], [0.01, 0.02], [0.01, 0.02], [0.01, 0.02]]
  const weights = [0.5, 0.5]
  const r = attribution(returns, weights)
  // 每期组合收益 = 0.5*0.01 + 0.5*0.02 = 0.015，5 期 → 7.5%（简单相加近似）
  assert.ok(Math.abs(r.totalReturnPct - 7.5) < 0.01, `total=${r.totalReturnPct}`)
  // 资产 0 贡献 = 0.5*0.01*5*100 = 2.5%，资产 1 = 0.5*0.02*5*100 = 5%
  assert.ok(Math.abs(r.assetContributionsPct[0]! - 2.5) < 1e-9, `c0=${r.assetContributionsPct[0]}`)
  assert.ok(Math.abs(r.assetContributionsPct[1]! - 5) < 1e-9, `c1=${r.assetContributionsPct[1]}`)
  // 份额 = 2.5/7.5, 5/7.5
  assert.ok(Math.abs(r.assetContribShares[0]! - 2.5 / 7.5) < 1e-9)
})

test('attribution: 因子归因 —— 收益完全由因子解释时 R²≈1', () => {
  // 单因子：组合收益 = 2 * 暴露（完全线性）
  const t = 10
  const returns: number[][] = []
  const exposures: number[][][] = []
  for (let i = 0; i < t; i++) {
    const e = Math.sin(i) * 0.5
    returns.push([2 * e]) // 单资产，收益 = 2*暴露
    exposures.push([[e]]) // [time][asset][factor]
  }
  const r = attribution(returns, [1], exposures)
  assert.ok(r.factorR2 > 0.99, `r2=${r.factorR2}`)
  assert.ok(Math.abs(r.residualPct) < 0.01, `residual=${r.residualPct}`)
})

test('attribution: 前置条件', () => {
  assert.throws(() => attribution([[0.1]], [1]), /at least 5/)
  assert.throws(() => attribution(Array.from({ length: 5 }, () => [0.1, 0.2]), [1]), /weights length/)
  assert.throws(() => attribution(Array.from({ length: 5 }, () => [0.1, 0.2]), [0.5, 0.6]), /sum to 1/)
})
