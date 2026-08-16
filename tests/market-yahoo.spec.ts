/**
 * Yahoo 行情解析与代码校验手算测试。
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { assertAShareSymbol, assertYahooSymbol, parseYahooChart } from '../src/dsh-data/market.ts'

test('parseYahooChart: 标准 fixture + null 行过滤', () => {
  const json = {
    chart: {
      result: [{
        timestamp: [1786291200, 1786377600, 1786464000],
        indicators: {
          quote: [{
            open: [306.0, 308.1, null],
            high: [308.5, 310.2, null],
            low: [304.3, 306.8, null],
            close: [305.93, 309.5, null],
            volume: [28229375, 30000000, null],
          }],
        },
      }],
    },
  }
  const c = parseYahooChart('AAPL', json)
  assert.equal(c.length, 2) // null 行被过滤
  assert.equal(c[0]!.openTime, 1786291200 * 1000)
  assert.equal(c[0]!.open, 306.0)
  assert.equal(c[0]!.close, 305.93)
  assert.equal(c[0]!.volume, 28229375)
  assert.equal(c[1]!.close, 309.5)
})

test('parseYahooChart: 无结果 → 抛错（含 error 信息）', () => {
  assert.throws(() => parseYahooChart('NOPE', { chart: { result: [], error: { code: 'Not Found' } } }), /no chart data/)
  assert.throws(() => parseYahooChart('X', {}), /no chart data/)
})

test('assertYahooSymbol: 美股/指数/港股代码', () => {
  assert.doesNotThrow(() => assertYahooSymbol('AAPL'))
  assert.doesNotThrow(() => assertYahooSymbol('^GSPC'))
  assert.doesNotThrow(() => assertYahooSymbol('0700.HK'))
  assert.throws(() => assertYahooSymbol('aapl us'), /invalid yahoo symbol/)
  assert.throws(() => assertYahooSymbol('600000'), /invalid yahoo symbol/)
})

test('assertAShareSymbol: 腾讯/新浪 A 股边界（美股代码走 yahoo）', () => {
  assert.doesNotThrow(() => assertAShareSymbol('sh600000'))
  assert.throws(() => assertAShareSymbol('usAAPL'), /invalid A-share symbol/)
  assert.throws(() => assertAShareSymbol('AAPL'), /invalid A-share symbol/)
})
