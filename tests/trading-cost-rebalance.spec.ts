/**
 * trading-cost / rebalance 手算测试。
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { tradingCost } from '../src/dsh-execution/trading-cost.ts'
import { rebalanceSchedule } from '../src/dsh-ml/rebalance.ts'

test('tradingCost: 无冲击时 = 佣金 + 半价差', () => {
  const r = tradingCost(1, 100, 0.001, 10, 30) // 10bps 佣金 + 5bps 滑点
  assert.ok(Math.abs(r.totalCostBps - 15) < 1e-9, `total=${r.totalCostBps}`)
  assert.ok(Math.abs(r.commissionBps - 10) < 1e-9)
  assert.ok(Math.abs(r.slippageBps - 5) < 1e-9)
  assert.equal(r.impactBps, 0)
  assert.ok(Math.abs(r.notional - 100) < 1e-9)
})

test('tradingCost: 提供 ADV 时冲击成本 > 0 且随参与率上升', () => {
  const r1 = tradingCost(10, 100, 0.001, 5, 30, 100000, 0.01) // ADV=100k，单笔 1k
  const r2 = tradingCost(10, 100, 0.001, 5, 30, 100000, 0.05) // 参与率更高 → 冲击更大
  assert.ok(r1.impactBps > 0, `impact=${r1.impactBps}`)
  assert.ok(r2.impactBps > r1.impactBps, `${r2.impactBps} > ${r1.impactBps}`)
  assert.ok(r1.totalCostBps > r1.commissionBps + r1.slippageBps)
})

test('tradingCost: 前置条件', () => {
  assert.throws(() => tradingCost(0, 100), /quantity/)
  assert.throws(() => tradingCost(1, 0), /price/)
  assert.throws(() => tradingCost(1, 100, 0.001, 5, 30, 1000, 0), /participationRate/)
})

test('rebalanceSchedule: 高漂移 → 高频率最优；低漂移高成本 → 频率更低', () => {
  // 漂移快（1%/期）+ 成本低（2bps）→ 频繁再平衡
  const fast = rebalanceSchedule(0.01, 0.0002, 60)
  assert.ok(fast.bestFrequency <= 5, `fast=${fast.bestFrequency}`)
  // 漂移慢（0.05%/期）+ 成本高（50bps）→ 频率明显低于 fast
  const slow = rebalanceSchedule(0.0005, 0.005, 60)
  assert.ok(slow.bestFrequency > fast.bestFrequency, `slow=${slow.bestFrequency} fast=${fast.bestFrequency}`)
})

test('rebalanceSchedule: 分解一致 + 前置条件', () => {
  const r = rebalanceSchedule(0.01, 0.001, 60)
  // tradingCost = cost/freq, driftCost = drift×freq/2
  assert.ok(Math.abs(r.costBreakdown.tradingCost - 0.001 / r.bestFrequency) < 1e-12)
  assert.ok(Math.abs(r.costBreakdown.driftCost - (0.01 * r.bestFrequency) / 2) < 1e-12)
  assert.throws(() => rebalanceSchedule(-0.1, 0.001), /driftPerPeriod/)
  assert.throws(() => rebalanceSchedule(0.01, -0.1), /costPerRebalance/)
  assert.throws(() => rebalanceSchedule(0.01, 0.001, 1), /maxFrequency/)
})
