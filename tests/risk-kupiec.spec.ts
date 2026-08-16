/**
 * Kupiec 检验手算测试。
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { kupiecTest } from '../src/risk.ts'

test('kupiecTest: 失败率与置信度一致 → 通过', () => {
  // n=100, p=5%：5 次失败 ≈ 期望 → LR 小 → passed
  const rets = new Array(100).fill(0)
  const vars = new Array(100).fill(0.01)
  for (let i = 0; i < 5; i++) rets[i] = -0.02 // 5 次失败
  const r = kupiecTest(rets, vars, 0.95)
  assert.equal(r.failures, 5)
  assert.ok(Math.abs(r.expected - 5) < 1e-9)
  assert.ok(r.passed, `lr=${r.lrStat}`)
})

test('kupiecTest: 失败次数远高于期望 → 拒绝', () => {
  const rets = new Array(100).fill(0)
  const vars = new Array(100).fill(0.01)
  for (let i = 0; i < 20; i++) rets[i] = -0.02 // 20% 失败 vs 期望 5%
  const r = kupiecTest(rets, vars, 0.95)
  assert.equal(r.failures, 20)
  assert.equal(r.passed, false)
  assert.ok(r.lrStat > 3.841, `lr=${r.lrStat}`)
})

test('kupiecTest: 完美 VaR（0 失败）→ 不通过（过于保守）', () => {
  const rets = new Array(100).fill(0.001)
  const vars = new Array(100).fill(1) // 超大 VaR
  const r = kupiecTest(rets, vars, 0.95)
  assert.equal(r.failures, 0)
  assert.equal(r.passed, false)
})

test('kupiecTest: 前置条件', () => {
  assert.throws(() => kupiecTest([0.01], [0.02]), />= 2/)
  assert.throws(() => kupiecTest([0.01, 0.02], [0.01]), /varSeries length/)
})
