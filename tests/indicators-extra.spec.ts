/**
 * 新指标纯函数测试（手算基准）。
 * 运行：cd deepseek-harness && pnpm exec tsx --test ../quant-indicators/tests/indicators-extra.spec.ts
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { adx, cci, kdj, obv, roc, williamsR } from '../src/dsh-alpha/indicators.ts'

const H = [10, 11, 12, 13]
const L = [8, 9, 10, 11]
const C = [9, 10, 11, 12]

test('kdj: 手算（RSV 法, K/D 初始 50）', () => {
  const { k, d, j } = kdj(H, L, C, 3)
  assert.equal(k.length, 4)
  // i=2: hn=12 ln=8 → RSV=(11-8)/4*100=75 → K=(100+75)/3=58.333, D=(100+K)/3=52.778, J=3K-2D
  assert.ok(Math.abs(k[2]! - 175 / 3) < 1e-9, `k2=${k[2]}`)
  assert.ok(Math.abs(d[2]! - 475 / 9) < 1e-9, `d2=${d[2]}`)
  assert.ok(Math.abs(j[2]! - (3 * (175 / 3) - 2 * (475 / 9))) < 1e-9)
  assert.equal(k[0], null)
  assert.equal(k[1], null)
})

test('williamsR: 手算', () => {
  const out = williamsR(H, L, C, 3)
  // i=2: (12-11)/(12-8)*-100 = -25；i=3: (13-12)/(13-9)*-100 = -25
  assert.ok(Math.abs(out[2]! - -25) < 1e-9)
  assert.ok(Math.abs(out[3]! - -25) < 1e-9)
  assert.equal(out[0], null)
  assert.equal(out[1], null)
})

test('cci: 手算（TP 等差序列 → CCI=100）', () => {
  // TP = [9,10,11,12], w=3: SMA=10, meanDev=2/3, CCI[2]=(11-10)/(0.015*2/3)=100
  const out = cci(H, L, C, 3)
  assert.ok(Math.abs(out[2]! - 100) < 1e-6, `cci2=${out[2]}`)
  assert.equal(out[0], null)
  assert.equal(out[1], null)
})

test('obv: 手算', () => {
  const close = [10, 11, 10, 12]
  const volume = [100, 150, 120, 200]
  assert.deepEqual(obv(close, volume), [0, 150, 30, 230])
  assert.throws(() => obv([1, 2], [1]), /equal length/)
})

test('adx: 持续上涨手算（+DI=50, -DI=0, ADX=100）', () => {
  const n = 11
  const high = Array.from({ length: n }, (_, i) => 10 + i)
  const low = Array.from({ length: n }, (_, i) => 8 + i)
  const close = Array.from({ length: n }, (_, i) => 9 + i)
  const { adx: a, plusDi, minusDi } = adx(high, low, close, 3)
  // +DM=1 每根, -DM=0, TR=2 → +DI=50, -DI=0, DX=100
  assert.equal(plusDi[3], 50)
  assert.equal(minusDi[3], 0)
  // 首个 ADX 在 index 2*3-1=5，为 DX[3..5] 的均值 = 100
  assert.equal(a[4], null)
  assert.ok(Math.abs(a[5]! - 100) < 1e-9, `adx5=${a[5]}`)
  assert.ok(Math.abs(a[6]! - 100) < 1e-9)
  assert.equal(a[3], null)
})

test('roc: 手算', () => {
  const out = roc([1, 2, 3, 4, 5], 2)
  assert.equal(out[0], null)
  assert.equal(out[1], null)
  assert.ok(Math.abs(out[2]! - 200) < 1e-9)
  assert.ok(Math.abs(out[3]! - 100) < 1e-9)
  assert.ok(Math.abs(out[4]! - 200 / 3) < 1e-9)
})
