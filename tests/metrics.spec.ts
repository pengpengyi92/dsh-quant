/**
 * metrics.ts 手算测试。
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { METRIC_CATALOG, equityMetrics, tradeMetrics } from '../src/metrics.ts'

test('equityMetrics: 单调上涨净值（无回撤）', () => {
  const m = equityMetrics([1, 1.1, 1.2, 1.3])
  assert.ok(Math.abs(m.totalReturnPct - 30) < 1e-9)
  assert.equal(m.maxDrawdownPct, 0)
  assert.equal(m.winRate, 100)
  assert.equal(m.positivePeriods, 3)
  assert.equal(m.periods, 3)
  // 波动 > 0（收益非零）
  assert.ok(m.annualizedVol > 0)
})

test('equityMetrics: 有回撤的序列', () => {
  // 峰值 1.2 后跌到 1.0 → 回撤 (1.2-1.0)/1.2 = 16.67%
  const m = equityMetrics([1, 1.1, 1.2, 1.0])
  assert.ok(Math.abs(m.maxDrawdownPct - 16.666) < 0.01, `dd=${m.maxDrawdownPct}`)
  assert.equal(m.winRate, 2 / 3 * 100)
  assert.equal(m.calmar, 0) // 总收益 0 → 年化收益 0 → calmar 0？总收益 0 → annualReturn 0 → calmar 0
})

test('equityMetrics: 全跌序列', () => {
  const m = equityMetrics([1, 0.9, 0.8])
  assert.ok(Math.abs(m.totalReturnPct + 20) < 1e-9)
  assert.equal(m.winRate, 0)
  assert.ok(m.sortino < 0)
  assert.ok(m.profitFactor < 1)
})

test('equityMetrics: 前置条件', () => {
  assert.throws(() => equityMetrics([1]), />= 2/)
})

test('tradeMetrics: 手算交易指标', () => {
  const m = tradeMetrics([
    { entryIndex: 0, exitIndex: 2, returnPct: 0.1 },   // 盈
    { entryIndex: 3, exitIndex: 5, returnPct: -0.05 }, // 亏
    { entryIndex: 6, exitIndex: null, returnPct: null }, // 未平仓不计
  ])
  assert.equal(m.tradeCount, 3)
  assert.equal(m.winRate, 50)
  assert.ok(Math.abs(m.avgReturnPct - 2.5) < 1e-9) // (10% + -5%)/2 = 2.5%
  assert.ok(Math.abs(m.profitFactor - 2) < 1e-9)   // 0.1/0.05
  assert.equal(m.avgHoldingPeriods, 2)              // (2+2)/2
})

test('tradeMetrics: 空交易', () => {
  const m = tradeMetrics([])
  assert.equal(m.tradeCount, 0)
  assert.equal(m.winRate, 0)
})

test('METRIC_CATALOG: 必有指标三件套 + 目录完整', () => {
  const required = METRIC_CATALOG.filter(m => m.required).map(m => m.key)
  assert.deepEqual(required, ['totalReturnPct', 'maxDrawdownPct', 'sharpe'])
  for (const m of METRIC_CATALOG) {
    assert.ok(m.key && m.name && m.nameZh && m.format(1.234).length > 0)
  }
})
