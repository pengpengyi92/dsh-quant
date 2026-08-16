/**
 * risk.ts 手算测试。
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { riskMetrics } from '../src/risk.ts'

test('riskMetrics: 历史 VaR/CVaR 手算', () => {
  // 收益（小数）：[-0.03, -0.02, -0.01, 0.01, 0.02, 0.03]
  // 排序后 95% 分位：floor(0.05*6)-1 = -1 → max(0,-1)=0 → 第 0 个 = -0.03 → VaR = 3%
  const r = riskMetrics([-0.03, -0.02, -0.01, 0.01, 0.02, 0.03], { confidence: 0.95 })
  assert.ok(Math.abs(r.var95 - 0.03) < 1e-9, `var=${r.var95}`)
  assert.ok(Math.abs(r.cvar95 - 0.03) < 1e-9)
  assert.equal(r.periods, 6)
  assert.ok(Math.abs(r.maxDrawdownPct - 5.89) < 0.01, `dd=${r.maxDrawdownPct}`) // 三期连亏累计 DD
})

test('riskMetrics: 全负收益的最大回撤', () => {
  // [-0.01, -0.02]：NAV 1 → 0.99 → 0.9702；峰值 1，最终 0.9702 → DD 2.98%
  const r = riskMetrics([-0.01, -0.02])
  assert.ok(Math.abs(r.maxDrawdownPct - 2.98) < 0.001, `dd=${r.maxDrawdownPct}`)
  assert.ok(r.downsideDeviation > 0)
})

test('riskMetrics: beta/alpha 完美线性基准', () => {
  // 收益 = 2×基准 → beta = 2, alpha = 0
  const bench = [0.01, 0.02, -0.01, 0.03]
  const rets = bench.map(b => 2 * b)
  const r = riskMetrics(rets, { benchmarkReturns: bench })
  assert.ok(Math.abs(r.beta - 2) < 1e-9, `beta=${r.beta}`)
  assert.ok(Math.abs(r.alpha) < 1e-9, `alpha=${r.alpha}`)
  assert.ok(Math.abs(r.informationRatio) > 0) // 超额收益存在 → IR > 0
  assert.ok(r.trackingError > 0)
})

test('riskMetrics: 与基准完全相同的收益 → beta=1, TE=0, IR=0', () => {
  const bench = [0.01, -0.01, 0.02, -0.02]
  const r = riskMetrics(bench, { benchmarkReturns: bench })
  assert.ok(Math.abs(r.beta - 1) < 1e-9)
  assert.ok(Math.abs(r.trackingError) < 1e-9)
  assert.equal(r.informationRatio, 0)
})

test('riskMetrics: 无基准 → beta/alpha/IR/TE 为 0', () => {
  const r = riskMetrics([0.01, -0.01, 0.02])
  assert.equal(r.beta, 0)
  assert.equal(r.alpha, 0)
  assert.equal(r.informationRatio, 0)
})

test('riskMetrics: 前置条件', () => {
  assert.throws(() => riskMetrics([0.01]), />= 2/)
  assert.throws(() => riskMetrics([0.01, 0.02], { confidence: 1.5 }), /confidence/)
})
