/**
 * factor.ts 手算测试（alphalens 方法论）。
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { combineFactors, factorEvaluate } from '../src/factor.ts'

test('factorEvaluate: 完美线性因子 → IC=1, 分层单调, longShort 正确', () => {
  // factor [1..10]，未来收益 = 2*factor（完全预测）→ IC = 1
  const f = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  const r = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
  const e = factorEvaluate(f, r, 5, 5)
  assert.ok(Math.abs(e.ic - 1) < 1e-9, `ic=${e.ic}`)
  assert.equal(e.quantileReturns.length, 5)
  // 滞后配对：factor[i] 配 r[i+1] → f=[1..9] 配 r=[4..20]；9 样本 5 组（2,2,2,2,1）
  // Q1（f=1,2 → r=4,6）均值 5；Q5（f=9 → r=20）均值 20 → longShort = 15
  assert.ok(Math.abs(e.quantileReturns[0]!.meanReturn - 5) < 1e-9)
  assert.ok(Math.abs(e.quantileReturns[4]!.meanReturn - 20) < 1e-9)
  assert.ok(Math.abs(e.longShort - 15) < 1e-9)
  assert.ok(Math.abs(e.autocorr1 - 1) < 1e-9)
})

test('factorEvaluate: 反向因子 → IC 为负, longShort 为负', () => {
  const f = [1, 2, 3, 4, 5, 6]
  const r = [6, 5, 4, 3, 2, 1] // 未来收益与因子相反
  const e = factorEvaluate(f, r, 3, 5)
  assert.ok(e.ic < -0.9, `ic=${e.ic}`)
  assert.ok(e.longShort < 0, `longShort=${e.longShort}`)
})

test('factorEvaluate: 前置条件', () => {
  assert.throws(() => factorEvaluate([1, 2], [1, 2]), /at least 2 paired/)
  assert.throws(() => factorEvaluate([1, 2, 3, 4], [1, 2, 3, 4], 1), /quantiles/)
  assert.throws(() => factorEvaluate([1, 2, 3, 4], [1, 2, 3, 4], 5, 2), /window/)
})

test('combineFactors: 等权合成 + rank 归一化', () => {
  const out = combineFactors([[1, 2, 3, 4], [4, 3, 2, 1]])
  assert.equal(out.factorCount, 2)
  assert.equal(out.signal.length, 4)
  // 两因子标准化后对称 → 合成全 0 → rank 归一化时全部相同 → idx 0/(n-1)
  for (const s of out.signal) assert.ok(s >= 0 && s <= 1)
  assert.ok(Math.abs(out.signal[0]! - out.signal[3]!) < 1e-9) // 对称性
})

test('combineFactors: 加权与前置条件', () => {
  const out = combineFactors([[1, 2, 3], [10, 20, 30]], [0.7, 0.3])
  assert.deepEqual(out.effectiveWeights, [0.7, 0.3])
  assert.throws(() => combineFactors([], undefined), /must not be empty/)
  assert.throws(() => combineFactors([[1, 2], [1, 2]], [0.5]), /weights length/)
  assert.throws(() => combineFactors([[1, 2]], [0.4]), /sum to 1/)
})

test('combineFactors: 单调因子合成保持单调', () => {
  const out = combineFactors([[1, 2, 3, 4, 5], [2, 4, 6, 8, 10]])
  const s = out.signal
  for (let i = 1; i < s.length; i++) assert.ok(s[i]! >= s[i - 1]!)
})
