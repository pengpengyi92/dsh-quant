import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { fixtureLedger, linePath, renderVisualization, visualizationFixture } from '../demos/data-visualization.ts'

test('visualization: deterministic synthetic fixture, aligned nullable overlays and scripted fills', () => {
  const m = visualizationFixture()
  assert.deepEqual(m, visualizationFixture())
  assert.equal(m.candles.length, 80)
  for (const values of [m.fast, m.slow, m.equity, m.underwaterPct]) assert.equal(values.length, 80)
  assert(m.fast.slice(0, 4).every(v => v === null))
  assert(m.slow.slice(0, 14).every(v => v === null))
  assert.equal(m.markers.length, 4)
  assert(m.underwaterPct.every(v => v <= 0))
  assert(m.assumptions.execution.includes('NOT a strategy/backtest'))
  assert.equal(m.chartData.length, 3)
})

test('visualization fixture ledger: independent winning/losing/flat round-trip accounting', () => {
  for (const [exit, fee] of [[120, 0], [120, 0.001], [80, 0.001], [100, 0.001]]) {
    const values = fixtureLedger([100, exit!], [{ entryIndex: 0, exitIndex: 1 }], fee!)
    assert(Math.abs(values[1]! - exit! / 100 * (1 - fee!) ** 2) < 1e-12)
  }
  const two = fixtureLedger([100, 120, 100, 80], [{ entryIndex: 0, exitIndex: 1 }, { entryIndex: 2, exitIndex: 3 }], 0)
  assert(Math.abs(two.at(-1)! - 0.96) < 1e-12)
  assert.throws(() => fixtureLedger([100, 120], [{ entryIndex: 1, exitIndex: 1 }], 0))
  assert.throws(() => fixtureLedger([100, NaN], [], 0))
})

test('visualization: null gaps split paths, bad numbers rejected; no implied interpolation', () => {
  assert.equal(linePath([1, null, 2], i => i, v => v), 'M0.00,1.00  M2.00,2.00')
  assert.throws(() => linePath([Infinity], i => i, v => v), /finite/)
})

test('visualization: standalone SVG includes all candles/fills, three views and safety labels', () => {
  const svg = renderVisualization()
  assert.equal((svg.match(/data-candle=/g) ?? []).length, 80)
  assert.equal((svg.match(/data-fill=/g) ?? []).length, 4)
  assert(svg.includes('NOT a strategy result'))
  assert(svg.includes('Drawdown (%)'))
  assert(!/<script|<foreignObject|<image|NaN|Infinity/.test(svg))
  assert.match(svg, /viewBox="0 0 1220 810"/)
  assert.equal(svg, readFileSync(new URL('../demos/data-visualization/example.svg', import.meta.url), 'utf8'))
})
