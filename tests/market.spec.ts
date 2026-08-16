/**
 * market.ts 纯函数测试：parseKlines（离线，使用 Binance 真实响应样本）。
 * 运行：cd deepseek-harness && pnpm exec tsx --test ../quant-indicators/tests/market.spec.ts
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { INTERVALS, parseKlines } from '../src/market.ts'

// 2026-08-16 从 api.binance.com/api/v3/klines 抓取的真实两行样本
const SAMPLE = [
  [1786752000000, '63043.56000000', '63187.98000000', '62920.00000000', '63086.01000000', '5405.16038000', 1786838399999, '340890632.35788360', 540313, '3110.52011000', '196180469.50074570', '0'],
  [1786838400000, '63086.01000000', '63158.80000000', '63012.00000000', '63071.30000000', '1252.57536000', 1786924799999, '79019512.06205650', 109911, '630.66323000', '39783526.86583410', '0'],
] as const

test('parseKlines: 解析真实 Binance 响应', () => {
  const candles = parseKlines(SAMPLE)
  assert.equal(candles.length, 2)
  assert.deepEqual(candles[0], {
    openTime: 1786752000000,
    open: 63043.56,
    high: 63187.98,
    low: 62920,
    close: 63086.01,
    volume: 5405.16038,
  })
  assert.equal(candles[1].openTime, 1786838400000)
})

test('parseKlines: 空数组 → 空', () => {
  assert.deepEqual(parseKlines([]), [])
})

test('parseKlines: 非法行抛错', () => {
  assert.throws(() => parseKlines([[1, 'x', 'y']]), /expected >= 6 fields/)
  assert.throws(() => parseKlines([[1, 'abc', '2', '3', '4', '5']]), /open is not a finite number/)
  assert.throws(() => parseKlines([[Number.NaN, '2', '3', '4', '5', '6']]), /openTime is not a finite number/)
})

test('INTERVALS: 覆盖主流周期且为 Binance 枚举', () => {
  for (const i of ['1m', '1h', '4h', '1d', '1w', '1M']) assert.ok(INTERVALS.includes(i as never))
})
