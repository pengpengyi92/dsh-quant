/**
 * A 股行情解析手算测试（新浪 / 腾讯）。
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { assertAShareSymbol, parseSinaKlines, parseTencentKlines } from '../src/dsh-data/market.ts'

test('parseSinaKlines: 日线 fixture（东八区零点）', () => {
  const rows = [
    { day: '2026-08-10', open: '9.200', high: '9.380', low: '9.160', close: '9.290', volume: '62542539' },
    { day: '2026-08-11', open: '9.270', high: '9.340', low: '9.180', close: '9.210', volume: '50942433' },
  ]
  const c = parseSinaKlines(rows)
  assert.equal(c.length, 2)
  assert.equal(c[0]!.openTime, Date.parse('2026-08-10T00:00:00+08:00'))
  assert.equal(c[0]!.open, 9.2)
  assert.equal(c[0]!.high, 9.38)
  assert.equal(c[0]!.low, 9.16)
  assert.equal(c[0]!.close, 9.29)
  assert.equal(c[0]!.volume, 62542539)
})

test('parseSinaKlines: 分钟线时间戳带时分秒', () => {
  const c = parseSinaKlines([{ day: '2026-08-10 10:30:00', open: '9.2', high: '9.3', low: '9.1', close: '9.25', volume: '100' }])
  assert.equal(c[0]!.openTime, Date.parse('2026-08-10T10:30:00+08:00'))
})

test('parseSinaKlines: 非法行抛错', () => {
  assert.throws(
    () => parseSinaKlines([{ day: '2026-08-10', open: 'abc', high: '9', low: '9', close: '9', volume: '1' }]),
    /finite number/,
  )
  assert.throws(
    () => parseSinaKlines([{ day: 'bad-day', open: '9', high: '9', low: '9', close: '9', volume: '1' }]),
    /unparsable day/,
  )
  assert.throws(
    () => parseSinaKlines([{ open: '9', high: '9', low: '9', close: '9', volume: '1' }]),
    /missing day field/,
  )
})

test('parseTencentKlines: qfqday 字段顺序 [date, open, close, high, low, volume]', () => {
  const json = {
    code: 0,
    data: {
      sh600000: {
        qfqday: [
          ['2026-08-10', '9.200', '9.290', '9.380', '9.160', '625425.000'],
        ],
      },
    },
  }
  const c = parseTencentKlines('sh600000', json)
  assert.equal(c.length, 1)
  assert.equal(c[0]!.openTime, Date.parse('2026-08-10T00:00:00+08:00'))
  assert.equal(c[0]!.open, 9.2)
  assert.equal(c[0]!.close, 9.29)
  assert.equal(c[0]!.high, 9.38)
  assert.equal(c[0]!.low, 9.16)
  assert.equal(c[0]!.volume, 625425)
})

test('parseTencentKlines: 无 qfq 时回退 day；缺数据/错误码抛错', () => {
  const json = {
    code: 0,
    data: { sz000001: { day: [['2026-08-10', '1', '1', '1', '1', '1']] } },
  }
  const c = parseTencentKlines('sz000001', json)
  assert.equal(c.length, 1)
  assert.throws(() => parseTencentKlines('sz000001', { code: -1 }), /code/)
  assert.throws(() => parseTencentKlines('sz000001', { code: 0, data: {} }), /no kline data/)
})

test('assertAShareSymbol: sh/sz/bj + 6 位数字', () => {
  assert.doesNotThrow(() => assertAShareSymbol('sh600000'))
  assert.doesNotThrow(() => assertAShareSymbol('sz000001'))
  assert.doesNotThrow(() => assertAShareSymbol('bj430047'))
  assert.throws(() => assertAShareSymbol('600000'), /invalid A-share symbol/)
  assert.throws(() => assertAShareSymbol('sh60000'), /invalid A-share symbol/)
  assert.throws(() => assertAShareSymbol('SH600000'), /invalid A-share symbol/)
  assert.throws(() => assertAShareSymbol('BTCUSDT'), /invalid A-share symbol/)
})
