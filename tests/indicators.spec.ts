/**
 * 纯函数数值正确性测试（node:test，零依赖；核心算法与 harness 解耦）。
 * 运行：cd deepseek-harness && pnpm exec tsx --test ../quant-indicators/tests/indicators.spec.ts
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { atr, bollinger, ema, macd, rsi, sma } from '../src/dsh-alpha/indicators.ts'

test('sma: 已知答案', () => {
  assert.deepEqual(sma([1, 2, 3, 4, 5], 3), [null, null, 2, 3, 4])
  assert.deepEqual(sma([5], 1), [5])
})

test('sma: 边界', () => {
  assert.deepEqual(sma([], 3), [])           // 空序列 → 空
  assert.deepEqual(sma([1, 2], 3), [null, null]) // window > len → 全 null
})

test('ema: 已知答案（seed = 前 window 均值, alpha = 2/(w+1)）', () => {
  // w=3, alpha=0.5: seed=mean(1,2,3)=2 → 之后 EMA[i]=0.5*x+0.5*prev
  assert.deepEqual(ema([1, 2, 3, 4, 5, 6, 7, 8], 3), [null, null, 2, 3, 4, 5, 6, 7])
  // w=1: alpha=1 → EMA = 原序列（无 null）
  assert.deepEqual(ema([10, 20, 30], 1), [10, 20, 30])
})

test('rsi: 全涨 → 100；全跌 → 0；对齐', () => {
  const up = rsi([1, 2, 3, 4, 5, 6], 3)
  assert.deepEqual(up, [null, null, null, 100, 100, 100])
  const down = rsi([6, 5, 4, 3, 2, 1], 3)
  assert.deepEqual(down, [null, null, null, 0, 0, 0])
  // 长度不足 → 全 null
  assert.deepEqual(rsi([1, 2, 3], 3), [null, null, null])
})

test('rsi: Wilder 经典混合样例（手算）', () => {
  // values = [44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.10, 45.42,
  //           45.84, 46.08, 45.89, 46.03, 45.61, 46.28, 46.28], w=14
  // 经典结果：第一个 RSI(14) ≈ 70.46（index 14）
  const values = [
    44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.1, 45.42,
    45.84, 46.08, 45.89, 46.03, 45.61, 46.28, 46.28,
  ]
  // 15 个值恰好够 window=14（需要 window+1 个）：第一个有效点在 index 14
  const out = rsi(values, 14)
  assert.equal(out.length, 15)
  assert.ok(Math.abs(out[14]! - 70.46) < 0.1, `got ${out[14]}`)
  // 更长序列：头部 14 个 null，index 14 起连续有效
  const values16 = [...values, 46.5]
  const out16 = rsi(values16, 14)
  for (let i = 0; i < 14; i++) assert.equal(out16[i], null)
  assert.ok(Math.abs(out16[14]! - 70.46) < 0.1, `got ${out16[14]}`)
  assert.equal(out16[15] !== null, true)
})

test('macd: 对齐与手算关键点', () => {
  const n = 30
  const series = Array.from({ length: n }, (_, i) => i + 1)
  const { macd: m, signal: s, histogram: h } = macd(series, 3, 5, 3)
  assert.equal(m.length, n)
  assert.equal(s.length, n)
  assert.equal(h.length, n)
  // slow=5 → macd 头部 4 个 null，第一个有效 index 4
  for (let i = 0; i < 4; i++) assert.equal(m[i], null)
  // 手算：EMA3[4]=4, EMA5[4]=3 → macd[4]=1
  assert.ok(Math.abs(m[4]! - 1) < 1e-9)
  // signal 头部 slow+signal-2 = 6 个 null，signal[6] = mean(macd[4..6]) = 1
  for (let i = 0; i < 6; i++) assert.equal(s[i], null)
  assert.ok(Math.abs(s[6]! - 1) < 1e-9)
  assert.ok(Math.abs(h[6]! - 0) < 1e-9)
})

test('macd: fast >= slow 抛错', () => {
  assert.throws(() => macd([1, 2, 3, 4, 5], 5, 3, 2), /fast must be < slow/)
})

test('bollinger: middle = SMA, band 对称', () => {
  const { upper, middle, lower } = bollinger([1, 2, 3, 4, 5], 3, 2)
  assert.deepEqual(middle, [null, null, 2, 3, 4])
  assert.equal(upper[2]! - middle[2]!, middle[2]! - lower[2]!)
  // 常数列 → 标准差 0 → 三带重合
  const flat = bollinger([5, 5, 5, 5], 2, 2)
  assert.deepEqual(flat.upper, [null, 5, 5, 5])
  assert.deepEqual(flat.lower, [null, 5, 5, 5])
})

test('bollinger: 非法 multiplier 抛错', () => {
  assert.throws(() => bollinger([1, 2, 3], 2, 0), /multiplier/)
})

test('atr: 手算（high/low/close 样例）', () => {
  const high = [3, 4, 5, 6, 7, 8, 9, 10]
  const low = [1, 2, 3, 4, 5, 6, 7, 8]
  const close = [1, 2, 3, 4, 5, 6, 7, 8]
  const out = atr(high, low, close, 3)
  assert.equal(out.length, 8)
  // TR = [2,3,3,3,3,3,3,3]（|h-pc| 主导）
  // ATR[3] = mean(2,3,3) = 8/3；之后递归 (prev*2 + TR[i])/3
  assert.ok(Math.abs(out[3]! - 8 / 3) < 1e-9)
  assert.ok(Math.abs(out[4]! - (8 / 3 * 2 + 3) / 3) < 1e-9)
  assert.equal(out[7] !== null, true)
})

test('atr: 长度不等抛错', () => {
  assert.throws(() => atr([1, 2], [1], [1, 2], 2), /equal length/)
})

test('window 前置条件', () => {
  for (const fn of [sma, ema, rsi]) {
    assert.throws(() => fn([1, 2, 3], 0), /positive integer/)
    assert.throws(() => fn([1, 2, 3], 2.5), /positive integer/)
  }
})
