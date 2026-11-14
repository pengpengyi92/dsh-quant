import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ccxtHourlyCandles, CCXT_HOUR_MS as H } from '../src/dsh-data/ccxt.ts'
import { candlesCheck } from '../src/dsh-data/stats.ts'
import { sma } from '../src/dsh-alpha/indicators.ts'

const T = Date.UTC(2026, 0, 1)
const rows = () => [[T, 10, 13, 9, 12, 0], [T + H, 12, 15, 11, 14, 2]]

test('CCXT: hand-computed mapping, base-unit zero volume and existing research functions', () => {
  const input = rows()
  const before = structuredClone(input)
  const candles = ccxtHourlyCandles(input, T, T + 2 * H)
  assert.deepEqual(candles, [
    { openTime: T, open: 10, high: 13, low: 9, close: 12, volume: 0 },
    { openTime: T + H, open: 12, high: 15, low: 11, close: 14, volume: 2 },
  ])
  assert.deepEqual(sma(candles.map(c => c.close), 2), [null, 13])
  assert.equal(candlesCheck(candles).healthy, true)
  assert.deepEqual(input, before)
})

test('CCXT: closed-window equality includes the exact closing boundary, not a future/current bar', () => {
  const input = [[T - H, 10, 13, 9, 12, 1], ...rows(), [T + 2 * H, 14, 16, 13, 15, 3]]
  assert.equal(ccxtHourlyCandles(input, T, T + 2 * H).length, 2)
  assert.equal(ccxtHourlyCandles(input, T, T + H).length, 1)
})

test('CCXT: null/blank/boolean/nonfinite values are rejected, not Number-coerced', () => {
  for (const bad of [null, undefined, '', ' ', false, '12', NaN, Infinity]) {
    for (let j = 0; j < 6; j++) {
      const input: unknown[][] = rows()
      input[0]![j] = bad
      assert.throws(() => ccxtHourlyCandles(input, T, T + 2 * H), /six finite numbers/)
    }
  }
})

test('CCXT: malformed, sparse, empty and incomplete datasets fail closed', () => {
  const sparse = rows()
  delete sparse[0]![3]
  for (const input of [null, {}, [null], [[T, 1]], [], [rows()[0]], [new Array(6)], sparse, [[...rows()[0]!, 7]]]) {
    assert.throws(() => ccxtHourlyCandles(input, T, T + 2 * H))
  }
})

test('CCXT: seconds, duplicate, descending and off-hour timestamps are rejected', () => {
  const input = rows()
  for (const value of [T / 1000, T + 1, T + H]) {
    assert.throws(() => ccxtHourlyCandles([[value, 10, 13, 9, 12, 1], input[1]], T, T + 2 * H))
  }
  assert.throws(() => ccxtHourlyCandles(input.slice().reverse(), T, T + 2 * H), /strictly increasing/)
})

test('CCXT: a missing bucket must not be silently padded', () => {
  assert.throws(() => ccxtHourlyCandles([rows()[0], [T + 2 * H, 12, 15, 11, 14, 2]], T, T + 3 * H), /no fill-forward/)
})

test('CCXT: impossible OHLC and negative volumes/prices are rejected', () => {
  for (const row of [[T, 10, 11, 9, 12, 1], [T, 10, 13, 11, 12, 1], [T, 10, 13, 9, 12, -1], [T, 0, 13, 0, 12, 1]]) {
    assert.throws(() => ccxtHourlyCandles([row], T, T + H), /invalid OHLC/)
  }
})

test('CCXT: invalid windows are rejected without network access', () => {
  for (const [start, end] of [[T, T], [T, T - H], [T + 1, T + H], [T / 1000, (T + H) / 1000], [T, T + 701 * H], [T, Infinity]]) {
    assert.throws(() => ccxtHourlyCandles(rows(), start!, end!), /window/)
  }
})
