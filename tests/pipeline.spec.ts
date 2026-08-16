/**
 * 端到端研究管线测试：fixture K 线（离线）+ 前置条件。
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { researchPipeline } from '../src/dsh-execution/pipeline.ts'

/** 60 根线性上涨的日线（简单、可预测）。 */
function fixtureCandles(n = 60) {
  const out: { openTime: number; open: number; high: number; low: number; close: number; volume: number }[] = []
  const day = 24 * 3600 * 1000
  for (let i = 0; i < n; i++) {
    const open = 100 + i
    const close = 100 + i + 0.5
    out.push({
      openTime: Date.parse('2026-01-01T00:00:00+08:00') + i * day,
      open,
      high: close + 1,
      low: open - 1,
      close,
      volume: 1000 + i,
    })
  }
  return out
}

test('researchPipeline: fixture 全链路跑通且各域输出齐全', async () => {
  const candles = fixtureCandles()
  const r = await researchPipeline(
    { candles, fast: 5, slow: 20, factorWindow: 10, initialCapital: 100_000_000 },
    new AbortController().signal,
  )
  assert.equal(r.candles.count, 60)
  assert.equal(r.provider, 'fixture')
  assert.equal(r.quality.count, 60)
  assert.equal(r.quality.healthy, true)
  assert.equal(r.stats.count, 60)
  assert.ok(Number.isFinite(r.metrics.totalReturnPct))
  assert.ok(Number.isFinite(r.metrics.sharpe))
  assert.ok(Number.isInteger(r.metrics.trades.tradeCount))
  assert.ok(r.charts.candles.markers.length <= r.metrics.trades.tradeCount)
  assert.ok(Number.isFinite(r.risk.var95))
  assert.ok(r.drawdown.maxDrawdownPct >= 0)
  assert.equal(r.fund.navNet.length, 60)
  assert.equal(r.fund.initialCapital, 100_000_000)
  assert.ok(r.factor.n > 0)
  assert.match(r.report, /Quant Research Report/)
  assert.match(r.report, /Fund Simulation/)
  assert.equal(r.charts.candles.kind, 'candles')
  assert.equal(r.charts.equity.kind, 'series')
  assert.equal(r.charts.underwater.kind, 'series')
  assert.equal(r.charts.underwater.series[0]!.values.length, 60)
})

test('researchPipeline: 不足 30 根抛错', async () => {
  await assert.rejects(
    () => researchPipeline({ candles: fixtureCandles(10) }, new AbortController().signal),
    /at least 30/,
  )
})

test('researchPipeline: fast >= slow 抛错', async () => {
  await assert.rejects(
    () => researchPipeline({ candles: fixtureCandles(40), fast: 20, slow: 10 }, new AbortController().signal),
    /fast 20 must be < slow 10/,
  )
})
