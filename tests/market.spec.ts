/**
 * market.ts 纯函数测试：parseKlines（离线，使用 Binance 真实响应样本）。
 * 运行：cd deepseek-harness && pnpm exec tsx --test ../quant-indicators/tests/market.spec.ts
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { INTERVALS, MARKET_PROVIDERS, assertAShareSymbol, assertYahooSymbol, parseBybitKlines, parseKlines, parseOkxKlines, parseSinaKlines, parseTencentKlines } from '../src/dsh-data/market.ts'

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

// ===== #106: 覆盖率补齐（assert + sina + tencent 纯函数）=====

test('assertAShareSymbol: 合法 sh/sz/bj + 6 位通过', () => {
  assert.doesNotThrow(() => assertAShareSymbol('sh600000'))
  assert.doesNotThrow(() => assertAShareSymbol('sz000001'))
  assert.doesNotThrow(() => assertAShareSymbol('bj430047'))
})

test('assertAShareSymbol: 非法格式抛错', () => {
  assert.throws(() => assertAShareSymbol('600000'), /invalid A-share symbol/)
  assert.throws(() => assertAShareSymbol('sh60000'), /invalid A-share symbol/)
  assert.throws(() => assertAShareSymbol('SH600000'), /invalid A-share symbol/)
  assert.throws(() => assertAShareSymbol('xx600000'), /invalid A-share symbol/)
  assert.throws(() => assertAShareSymbol(''), /invalid A-share symbol/)
})

test('assertYahooSymbol: 合法 ticker/指数/港股通过', () => {
  assert.doesNotThrow(() => assertYahooSymbol('AAPL'))
  assert.doesNotThrow(() => assertYahooSymbol('^GSPC'))
  assert.doesNotThrow(() => assertYahooSymbol('0700.HK'))
  assert.doesNotThrow(() => assertYahooSymbol('BTC-USD'))
})

test('assertYahooSymbol: 非法格式抛错', () => {
  assert.throws(() => assertYahooSymbol('aapl'), /invalid yahoo symbol/)
  assert.throws(() => assertYahooSymbol('AAPL '), /invalid yahoo symbol/)
  assert.throws(() => assertYahooSymbol(''), /invalid yahoo symbol/)
})

test('parseSinaKlines: 对象行解析（含日期格式化）', () => {
  const candles = parseSinaKlines([
    { day: '2026-08-20', open: '69334.78', high: '73400', low: '68902.22', close: '73025.15', volume: '35904.79' },
    { day: '2026-08-21 15:00:00', open: '73027.02', high: '79500', low: '73027.02', close: '78338.03', volume: '44339.57' },
  ])
  assert.equal(candles.length, 2)
  // 纯日期 → T00:00:00+08:00；带时间 → T+08:00
  assert.equal(new Date(candles[0].openTime).toISOString(), '2026-08-19T16:00:00.000Z')
  assert.equal(candles[0].close, 73025.15)
  assert.equal(candles[1].volume, 44339.57)
})

test('parseSinaKlines: 缺 day / 非有限数抛错', () => {
  assert.throws(() => parseSinaKlines([{ open: '1' }]), /missing day field/)
  assert.throws(() => parseSinaKlines([{ day: '2026-08-20', open: 'abc' }]), /open is not a finite number/)
  assert.throws(() => parseSinaKlines([{ day: 'not-a-date', open: '1' }]), /unparsable day/)
})

test('parseTencentKlines: qfqday 优先 + 字段映射（date,open,close,high,low,volume）', () => {
  const json = {
    code: 0,
    data: {
      sh600000: {
        qfqday: [
          ['2026-08-20', '10.1', '10.5', '10.6', '10.0', '1000'],
          ['2026-08-21', '10.5', '10.8', '10.9', '10.4', '1200'],
        ],
      },
    },
  }
  const candles = parseTencentKlines('sh600000', json)
  assert.equal(candles.length, 2)
  assert.equal(candles[0].close, 10.5)  // row[2]
  assert.equal(candles[0].high, 10.6)   // row[3]
  assert.equal(candles[0].low, 10.0)    // row[4]
  assert.equal(candles[0].volume, 1000) // row[5]
})

test('parseTencentKlines: day 回退 + 错误路径', () => {
  const json = {
    code: 0,
    data: { sh600000: { day: [['2026-08-20', '1', '2', '3', '0.5', '500']] } },
  }
  assert.equal(parseTencentKlines('sh600000', json).length, 1)
  // code != 0
  assert.throws(() => parseTencentKlines('sh600000', { code: -1 }), /tencent fetch failed/)
  // 无该 symbol 数据
  assert.throws(() => parseTencentKlines('sh600000', { code: 0, data: {} }), /no kline data/)
  // 字段不足
  assert.throws(
    () => parseTencentKlines('sh600000', { code: 0, data: { sh600000: { qfqday: [['2026-08-20']] } } }),
    /expected >= 6 fields/,
  )
})
