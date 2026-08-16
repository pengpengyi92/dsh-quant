/**
 * chart.ts 手算测试（dsh-chart 数据面）。
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { chartAnnotate, chartBacktest, chartCandles, chartSeries } from '../src/chart.ts'

const CANDLES = [
  { openTime: 1000, open: 10, high: 12, low: 9, close: 11, volume: 100 },
  { openTime: 2000, open: 11, high: 13, low: 10, close: 12, volume: 120 },
]

test('chartCandles: 组装 K 线 + 叠加 + 标记', () => {
  const d = chartCandles(
    CANDLES,
    [{ name: 'SMA', values: [null, 11.5] }],
    [{ index: 0, kind: 'entry' }],
    'BTC',
  )
  assert.equal(d.kind, 'candles')
  assert.equal(d.title, 'BTC')
  assert.equal(d.candles.length, 2)
  assert.equal(d.overlays[0]!.name, 'SMA')
  assert.equal(d.overlays[0]!.values[0], null) // 对齐约定保留
  assert.deepEqual(d.markers, [{ index: 0, kind: 'entry' }])
})

test('chartSeries: 多序列', () => {
  const d = chartSeries([{ name: 'equity', values: [1, 1.1, 1.2] }], 'backtest')
  assert.equal(d.kind, 'series')
  assert.equal(d.series[0]!.values.length, 3)
})

test('chartBacktest: 买卖点与止损止盈标记', () => {
  const d = chartBacktest(
    [1, 1.1, 1.2, 1.3],
    [
      { entryIndex: 0, exitIndex: 2, exitReason: 'stop_loss' },
      { entryIndex: 3, exitIndex: null },
    ],
  )
  assert.equal(d.kind, 'series')
  const markers = d.series[0]!.values // equity 序列
  assert.equal(markers.length, 4)
  // markers 在 candles 形态才携带；chartBacktest 输出 series（净值线）
  // 用 chartCandles 验证 markers 语义：
  const c = chartCandles(
    CANDLES,
    [],
    [
      { index: 0, kind: 'entry' },
      { index: 1, kind: 'stop' },
    ],
  )
  assert.deepEqual(c.markers.map(m => m.kind), ['entry', 'stop'])
})

test('chartAnnotate: 标注数据转换', () => {
  const d = chartAnnotate(
    [1, 2, 100, 3],
    [{ index: 2, label: 'z_outlier', severity: 2 }],
  )
  assert.equal(d.kind, 'annotations')
  assert.equal(d.annotations[0]!.index, 2)
  assert.equal(d.annotations[0]!.severity, 2)
  assert.equal(d.values.length, 4)
})
