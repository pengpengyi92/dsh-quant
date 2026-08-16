/**
 * 回撤分析手算测试（dsh-risk）。
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { drawdownAnalysis } from '../src/dsh-risk/drawdown.ts'

function approx(a: number, b: number): void {
  assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`)
}

test('drawdown: 单段回撤 + 恢复（手算）', () => {
  const r = drawdownAnalysis([100, 120, 90, 80, 110, 130])
  const expected = [0, 0, -0.25, 80 / 120 - 1, 110 / 120 - 1, 0]
  r.underwater.forEach((v, i) => approx(v, expected[i]!))
  approx(r.maxDrawdownPct, (1 - 80 / 120) * 100)
  assert.equal(r.currentDrawdownPct, 0)
  assert.equal(r.periods.length, 1)
  const p = r.periods[0]!
  assert.equal(p.peakIndex, 1)
  assert.equal(p.troughIndex, 3)
  assert.equal(p.recoveryIndex, 5)
  assert.equal(p.durationBars, 2)
  assert.equal(p.recoveryBars, 2)
  assert.equal(r.ongoing, null)
})

test('drawdown: 未恢复回撤 → ongoing 非空', () => {
  const r = drawdownAnalysis([100, 90, 80])
  approx(r.underwater[1]!, 90 / 100 - 1)
  approx(r.underwater[2]!, 80 / 100 - 1)
  approx(r.maxDrawdownPct, 20)
  approx(r.currentDrawdownPct, 20)
  assert.equal(r.periods.length, 1)
  const p = r.periods[0]!
  assert.equal(p.peakIndex, 0)
  assert.equal(p.troughIndex, 2)
  assert.equal(p.recoveryIndex, null)
  assert.equal(p.recoveryBars, null)
  assert.equal(r.ongoing, p)
})

test('drawdown: 回撤后恰好回到前高即恢复', () => {
  const r = drawdownAnalysis([100, 110, 100, 110])
  assert.equal(r.periods.length, 1)
  const p = r.periods[0]!
  assert.equal(p.peakIndex, 1)
  assert.equal(p.troughIndex, 2)
  assert.equal(p.recoveryIndex, 3)
  approx(p.depthPct, (1 - 100 / 110) * 100)
})

test('drawdown: 连续上涨无回撤', () => {
  const r = drawdownAnalysis([100, 101, 102, 103])
  assert.deepEqual(r.underwater, [0, 0, 0, 0])
  assert.equal(r.maxDrawdownPct, 0)
  assert.equal(r.currentDrawdownPct, 0)
  assert.equal(r.periods.length, 0)
  assert.equal(r.ongoing, null)
})

test('drawdown: 前置条件', () => {
  assert.throws(() => drawdownAnalysis([]), /not be empty/)
  assert.throws(() => drawdownAnalysis([100, 0, 101]), /positive/)
  assert.throws(() => drawdownAnalysis([100, Number.NaN]), /finite positive/)
})
