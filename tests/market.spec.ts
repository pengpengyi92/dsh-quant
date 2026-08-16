/**
 * market.ts 纯函数测试：parseKlines（离线，使用 Binance 真实响应样本）。
 * 运行：cd deepseek-harness && pnpm exec tsx --test ../quant-indicators/tests/market.spec.ts
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { INTERVALS, MARKET_PROVIDERS, parseBybitKlines, parseKlines, parseOkxKlines } from '../src/market.ts'

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

// OKX 与 Bybit 真实响应样本（2026-08-16 抓取，倒序）
const OKX_SAMPLE = [
  ['1786809600000', '63094', '63172.1', '63005', '63063.3', '461.10566882', '29090904.425990646', '29090904.425990646', '0'],
  ['1786723200000', '62984.8', '63244.6', '62800', '63093.9', '1609.44088092', '101443411.222909332', '101443411.222909332', '1'],
] as const

const BYBIT_SAMPLE = [
  ['1786838400000', '63085.1', '63152.2', '63002.9', '63066.1', '479.033223', '30215205.7355616'],
  ['1786752000000', '63039.2', '63186', '62915.9', '63085.1', '1699.538092', '107176894.5246433'],
] as const

test('parseOkxKlines: 倒序反转为正序 + 字段映射', () => {
  const candles = parseOkxKlines(OKX_SAMPLE)
  assert.equal(candles.length, 2)
  assert.equal(candles[0].openTime, 1786723200000) // 最早在前
  assert.equal(candles[1].openTime, 1786809600000)
  assert.equal(candles[0].close, 63093.9)
  assert.equal(candles[1].open, 63094)
})

test('parseBybitKlines: 倒序反转为正序 + 字段映射', () => {
  const candles = parseBybitKlines(BYBIT_SAMPLE)
  assert.equal(candles.length, 2)
  assert.equal(candles[0].openTime, 1786752000000)
  assert.equal(candles[1].close, 63066.1)
  assert.equal(candles[0].volume, 1699.538092)
})

test('parseOkx/Bybit: 非法行抛错', () => {
  assert.throws(() => parseOkxKlines([[1, 'x']]), /expected >= 6 fields/)
  assert.throws(() => parseBybitKlines([[1, 'a', '2', '3', '4', '5']]), /open is not a finite number/)
})
