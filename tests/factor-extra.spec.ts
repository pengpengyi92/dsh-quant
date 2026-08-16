/**
 * 因子环补全手算测试：RankIC / IC 衰减 / 因子中性化。
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { factorEvaluate, factorNeutralize } from '../src/dsh-alpha/factor.ts'

test('factorEvaluate: 完美单调因子 → IC=1, RankIC=1', () => {
  const r = factorEvaluate([1, 2, 3, 4, 5], [2, 3, 4, 5, 6], 5, 5)
  assert.equal(r.ic, 1)
  assert.equal(r.rankIc, 1)
  assert.equal(r.n, 4)
})

test('factorEvaluate: IC 衰减逐 horizon 手算', () => {
  const r = factorEvaluate([1, 2, 3, 4, 5], [2, 3, 4, 5, 6], 5, 5, 3)
  // n=4 配对：h=1: (1,4)(2,5)(3,6) → 1；h=2: (1,5)(2,6) → 1；h=3: (1,6) 单样本 → 0
  assert.deepEqual(r.icDecay, [1, 1, 0])
})

test('factorEvaluate: 衰减 horizon 样本不足 → 0', () => {
  const r = factorEvaluate([1, 2, 3, 4, 5], [2, 3, 4, 5, 6], 5, 5, 5)
  assert.deepEqual(r.icDecay, [1, 1, 0, 0, 0])
})

test('factorEvaluate: RankIC 对单调但不线性的序列 = 1，IC < 1', () => {
  const f = [1, 2, 4, 8, 16]
  const r = [4, 8, 32, 128, 512] // 配对 (1,8)(2,32)(4,128)(8,512)：r = 8f²，单调非线性
  const res = factorEvaluate(f, r, 5, 5)
  assert.equal(res.rankIc, 1)
  assert.ok(res.ic < 1)
})

test('factorNeutralize: zscore 手算', () => {
  const r = factorNeutralize([2, 4, 6])
  // mean 4, var 8/3 → std 1.63299 → [-1.2247, 0, 1.2247]
  assert.equal(r.method, 'zscore')
  assert.equal(r.values.length, 3)
  assert.ok(Math.abs(r.values[0]! - (-1.224744871391589)) < 1e-9)
  assert.ok(Math.abs(r.values[1]! - 0) < 1e-9)
  assert.ok(Math.abs(r.values[2]! - 1.224744871391589) < 1e-9)
})

test('factorNeutralize: 组内 z-score（行业中性化简化版）', () => {
  const r = factorNeutralize([1, 2, 10, 12], { groups: ['a', 'a', 'b', 'b'] })
  // 组 a: mean 1.5 std 0.5 → [-1, 1]；组 b: mean 11 std 1 → [-1, 1]
  assert.equal(r.method, 'group')
  assert.equal(r.groupCount, 2)
  assert.deepEqual(r.values, [-1, 1, -1, 1])
})

test('factorNeutralize: ols 完美线性剥离 → 残差全 0、R2=1', () => {
  const r = factorNeutralize([2, 4, 6, 8], { styleFactors: [[1, 2, 3, 4]] })
  assert.equal(r.method, 'ols')
  assert.equal(r.styleCount, 1)
  assert.equal(r.rSquared, 1)
  assert.deepEqual(r.values, [0, 0, 0, 0])
})

test('factorNeutralize: ols 带噪声手算（β=[0.9,0.4], R2=0.8）', () => {
  // X=[1,x]（x=0..3），y=[1,1,2,2]：X'X=[[4,6],[6,14]]，X'y=[6,11] → β=[0.9,0.4]
  const r = factorNeutralize([1, 1, 2, 2], { styleFactors: [[0, 1, 2, 3]] })
  assert.equal(r.method, 'ols')
  assert.ok(Math.abs(r.rSquared! - 0.8) < 1e-9)
  // 残差 [0.1,-0.3,0.3,-0.1]，std sqrt(0.05)
  const s = Math.sqrt(0.05)
  assert.ok(Math.abs(r.values[0]! - 0.1 / s) < 1e-9)
  assert.ok(Math.abs(r.values[1]! - (-0.3 / s)) < 1e-9)
  assert.ok(Math.abs(r.values[2]! - 0.3 / s) < 1e-9)
  assert.ok(Math.abs(r.values[3]! - (-0.1 / s)) < 1e-9)
})

test('factorNeutralize: 共线风格因子 → 奇异矩阵抛错', () => {
  assert.throws(
    () => factorNeutralize([1, 2, 3, 4], { styleFactors: [[1, 2, 3, 4], [2, 4, 6, 8]] }),
    /singular/,
  )
})

test('factorNeutralize: 前置条件', () => {
  assert.throws(() => factorNeutralize([1]), /at least 2/)
  assert.throws(() => factorNeutralize([1, 2, 3], { groups: ['a', 'b'] }), /groups length/)
  assert.throws(() => factorNeutralize([1, 2, 3], { styleFactors: [[1, 2]] }), /style factor length/)
})
