/**
 * factorNeutralize 手算测试（group z-score / OLS residual / zscore 对照组）。
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { factorNeutralize } from '../src/dsh-alpha/factor.ts'

test('factorNeutralize: zscore 对照组 —— 标准化后 mean=0, std=1', () => {
  const out = factorNeutralize([1, 2, 3, 4, 5])
  assert.equal(out.method, 'zscore')
  assert.equal(out.groupCount, 0)
  assert.equal(out.styleCount, 0)
  assert.equal(out.rSquared, null)
  // 手算：mean=3, std=sqrt(10/5)=sqrt(2)≈1.4142
  // values = [-1.4142, -0.7071, 0, 0.7071, 1.4142]
  const mean = out.values.reduce((a, b) => a + b, 0) / 5
  assert.ok(Math.abs(mean) < 1e-9, `mean=${mean}`)
  const variance = out.values.reduce((a, b) => a + b ** 2, 0) / 5
  assert.ok(Math.abs(variance - 1) < 1e-9, `variance=${variance}`)
  assert.ok(Math.abs(out.values[2]!) < 1e-9, `center=${out.values[2]}`)
})

test('factorNeutralize: group 组内 z-score —— 行业中性化简化版', () => {
  // 两组：A=[1,2,3], B=[10,20,30]（B 整体高但组内相对位置与 A 一致）
  const factor = [1, 2, 3, 10, 20, 30]
  const groups = [0, 0, 0, 1, 1, 1]
  const out = factorNeutralize(factor, { groups })
  assert.equal(out.method, 'group')
  assert.equal(out.groupCount, 2)
  // 组内标准化后：每组内部相对顺序保留，组间水平差异被消除
  // A 组 [1,2,3] → zscore；B 组 [10,20,30] → zscore；两组的排名方向一致
  assert.ok(out.values[0]! < out.values[1]!, 'A 组内递增')
  assert.ok(out.values[1]! < out.values[2]!, 'A 组内递增')
  assert.ok(out.values[3]! < out.values[4]!, 'B 组内递增')
  assert.ok(out.values[4]! < out.values[5]!, 'B 组内递增')
  // 组间水平差被消除：A 组最高 ≈ B 组最高（都标准化到同一尺度）
  assert.ok(Math.abs(Math.abs(out.values[2]!) - Math.abs(out.values[5]!)) < 1e-9)
})

test('factorNeutralize: ols 回归残差 —— 剔除风格暴露', () => {
  // 因子 = 2*style + 小噪声；回归残差应剔除 2*style 部分，R² 接近 1
  const style = [1, 2, 3, 4, 5]
  const noise = [0.1, -0.1, 0.05, -0.05, 0.02]
  const factor = style.map((s, i) => 2 * s + noise[i]!)
  const out = factorNeutralize(factor, { styleFactors: [style] })
  assert.equal(out.method, 'ols')
  assert.equal(out.styleCount, 1)
  // R² 高（风格解释了绝大部分）
  assert.ok(out.rSquared !== null && out.rSquared > 0.99, `rSquared=${out.rSquared}`)
  // 残差与 noise 同号（剔除风格后保留的是噪声部分）
  for (let i = 0; i < 5; i++) {
    assert.ok(out.values[i]! * noise[i]! > 0, `i=${i} value=${out.values[i]} noise=${noise[i]}`)
  }
})

test('factorNeutralize: ols 不完全解释 —— 残差保留非风格部分', () => {
  // 因子 = 1*style + 独立信号（奇数位 +1 / 偶数位 -1）
  const style = [1, 2, 3, 4, 5, 6]
  const signal = [1, -1, 1, -1, 1, -1]
  const factor = style.map((s, i) => s + signal[i]!)
  const out = factorNeutralize(factor, { styleFactors: [style] })
  assert.equal(out.method, 'ols')
  // 残差方向应与 signal 一致（R² 介于 0 和 1 之间）
  assert.ok(out.rSquared !== null && out.rSquared > 0.5 && out.rSquared < 0.99, `rSquared=${out.rSquared}`)
  // 残差符号：奇数位为正、偶数位为负（signal 的方向）
  for (let i = 0; i < 6; i++) {
    const expected = signal[i]!
    assert.ok(out.values[i]! * expected > 0, `i=${i} value=${out.values[i]} expected sign=${expected}`)
  }
})

test('factorNeutralize: 前置条件', () => {
  assert.throws(() => factorNeutralize([1]), /at least 2 values/)
  // group 方法需要 groups
  assert.throws(() => factorNeutralize([1, 2, 3], { method: 'group' }), /method group requires groups/)
  // ols 方法需要 styleFactors
  assert.throws(() => factorNeutralize([1, 2, 3], { method: 'ols' }), /method ols requires at least one style factor/)
  // 长度不一致报错
  assert.throws(
    () => factorNeutralize([1, 2, 3, 4], { groups: [0, 0] }),
    /groups length/,
  )
  assert.throws(
    () => factorNeutralize([1, 2, 3, 4], { styleFactors: [[1, 2]] }),
    /style factor length/,
  )
})
