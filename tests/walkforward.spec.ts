/**
 * Walk-forward 手算测试（dsh-ml）。
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { walkForward } from '../src/dsh-ml/walkforward.ts'

test('walkForward: 完美线性特征 → OOS 预测精确、IC=1', () => {
  // features[t]=t+1 精确预测 returns[t+1]=t+1
  const features = [[1, 2, 3, 4, 5, 6]]
  const returns = [0, 1, 2, 3, 4, 5]
  const r = walkForward(returns, features, 3, 2)
  assert.equal(r.windows.length, 1)
  assert.equal(r.oosCount, 2)
  assert.deepEqual(r.predictions, [null, null, null, 4, 5, null])
  assert.equal(r.oosIc, 1)
  assert.equal(r.oosRankIc, 1)
  const w = r.windows[0]!
  assert.equal(w.trainStart, 0)
  assert.equal(w.trainEnd, 3)
  assert.equal(w.testStart, 3)
  assert.equal(w.testEnd, 5)
  assert.ok(Math.abs(w.intercept - 0) < 1e-9)
  assert.ok(Math.abs(w.weights[0]! - 1) < 1e-9)
  assert.equal(w.trainR2, 1)
})

test('walkForward: step=1 逐根推进 → 多个窗口', () => {
  const features = [[1, 2, 3, 4, 5, 6]]
  const returns = [0, 1, 2, 3, 4, 5]
  const r = walkForward(returns, features, 3, 2, 1)
  assert.equal(r.windows.length, 2)
  // 窗口1 预测 t=3,4；窗口2 预测 t=4,5（t=5 无 realized，不计入 OOS 统计）
  assert.deepEqual(r.predictions, [null, null, null, 4, 5, 6])
  assert.equal(r.oosCount, 2)
})

test('walkForward: 常数目标 → 预测全 0、IC 定义 0', () => {
  const features = [[1, 2, 3, 4, 5, 6]]
  const returns = [0, 0, 0, 0, 0, 0]
  const r = walkForward(returns, features, 3, 2)
  assert.equal(r.oosCount, 2)
  assert.equal(r.oosIc, 0)
  for (let t = 3; t < 5; t++) assert.ok(Math.abs(r.predictions[t]! - 0) < 1e-9)
})

test('walkForward: 常数特征（与截距共线）→ 奇异抛错', () => {
  assert.throws(
    () => walkForward([0, 1, 2, 3, 4], [[5, 5, 5, 5, 5]], 3, 1),
    /singular/,
  )
})

test('walkForward: 前置条件', () => {
  assert.throws(() => walkForward([1, 2], [[1, 2]], 2, 1), /at least 3/)
  assert.throws(() => walkForward([1, 2, 3], [], 2, 1), /features must not be empty/)
  assert.throws(() => walkForward([1, 2, 3], [[1, 2]], 2, 1), /feature length/)
  assert.throws(() => walkForward([1, 2, 3], [[1, 2, 3]], 1, 1), /trainWindow/)
  assert.throws(() => walkForward([1, 2, 3], [[1, 2, 3]], 2, 0), /testWindow/)
})
