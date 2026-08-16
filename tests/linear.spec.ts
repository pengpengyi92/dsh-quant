/**
 * 线性模型（OLS/Ridge）手算测试（dsh-ml）。
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { evaluatePredictions, fitLinearModel, predictLinearModel } from '../src/dsh-ml/linear.ts'

test('fitLinearModel: 单特征完美线性 → β=[1,1], R2=1', () => {
  const fit = fitLinearModel([[0], [1], [2], [3]], [1, 2, 3, 4])
  assert.equal(fit.n, 4)
  assert.equal(fit.lambda, 0)
  assert.ok(Math.abs(fit.intercept - 1) < 1e-9)
  assert.ok(Math.abs(fit.weights[0]! - 1) < 1e-9)
  assert.ok(Math.abs(fit.trainR2 - 1) < 1e-9)
})

test('predictLinearModel: 外推预测', () => {
  const fit = fitLinearModel([[0], [1], [2], [3]], [1, 2, 3, 4])
  const pred = predictLinearModel(fit, [[4], [5]])
  assert.deepEqual(pred.map(v => Math.round(v * 1e9) / 1e9), [5, 6])
})

test('fitLinearModel: 双特征完美线性 → β=[2,3], 截距 0', () => {
  const fit = fitLinearModel([[1, 0], [0, 1], [2, 0]], [2, 3, 4])
  assert.ok(Math.abs(fit.intercept) < 1e-9)
  assert.ok(Math.abs(fit.weights[0]! - 2) < 1e-9)
  assert.ok(Math.abs(fit.weights[1]! - 3) < 1e-9)
  assert.ok(Math.abs(fit.trainR2 - 1) < 1e-9)
})

test('fitLinearModel: Ridge 收缩权重、R2 下降', () => {
  const ols = fitLinearModel([[0], [1], [2], [3]], [1, 2, 3, 4], 0)
  const ridge = fitLinearModel([[0], [1], [2], [3]], [1, 2, 3, 4], 10)
  assert.ok(ridge.weights[0]! < ols.weights[0]!)
  assert.ok(ridge.trainR2 < 1)
  assert.equal(ridge.lambda, 10)
})

test('fitLinearModel: 带噪声拟合（已知 β）', () => {
  // y = 0.9 + 0.4x + ε，ε 均值为 0 但残差非零 → R2 < 1
  const X = [[0], [1], [2], [3]]
  const y = [0.9, 1.3, 1.7, 2.1]
  const fit = fitLinearModel(X, y)
  assert.ok(Math.abs(fit.intercept - 0.9) < 1e-9)
  assert.ok(Math.abs(fit.weights[0]! - 0.4) < 1e-9)
  assert.ok(Math.abs(fit.trainR2 - 1) < 1e-9)
})

test('evaluatePredictions: 完美预测 → R2=1, IC=1；常数目标 → R2=null', () => {
  const perfect = evaluatePredictions([1, 2, 3, 4], [1, 2, 3, 4])
  assert.equal(perfect.r2, 1)
  assert.equal(perfect.ic, 1)
  const constant = evaluatePredictions([0, 0, 0], [5, 5, 5])
  assert.equal(constant.r2, null)
  assert.equal(constant.ic, 0)
})

test('fitLinearModel: 前置条件', () => {
  assert.throws(() => fitLinearModel([[1]], [1]), /at least 2/)
  assert.throws(() => fitLinearModel([[1], [2]], [1]), /y length/)
  assert.throws(() => fitLinearModel([[1], [2, 3]], [1, 2]), /feature count/)
  assert.throws(() => fitLinearModel([[], []], [1, 2]), /at least 1 feature/)
  assert.throws(() => fitLinearModel([[1], [2]], [1, 2], -1), /lambda/)
  assert.throws(() => fitLinearModel([[5], [5]], [1, 2]), /singular/)
})
