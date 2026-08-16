/**
 * stats.ts 手算测试。
 * 运行：cd deepseek-harness && pnpm exec tsx --test ../quant-indicators/tests/stats.spec.ts
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { annotateSeries, candlesCheck, seriesQuality, seriesStats } from '../src/dsh-data/stats.ts'

test('seriesStats: 等差数列手算', () => {
  const s = seriesStats([1, 2, 3, 4, 5])
  assert.equal(s.count, 5)
  assert.equal(s.mean, 3)
  assert.equal(s.median, 3)
  assert.equal(s.min, 1)
  assert.equal(s.max, 5)
  // 方差 = 2 → std = sqrt(2)；对称 → skew 0
  assert.ok(Math.abs(s.std - Math.sqrt(2)) < 1e-9)
  assert.ok(Math.abs(s.skew) < 1e-9)
  assert.ok(Math.abs(s.totalReturnPct - 400) < 1e-9)
})

test('seriesStats: 常数序列零方差', () => {
  const s = seriesStats([7, 7, 7])
  assert.equal(s.std, 0)
  assert.equal(s.skew, 0)
  assert.equal(s.kurtosis, 0)
  assert.equal(s.annualizedVol, 0)
  assert.equal(s.totalReturnPct, 0)
})

test('seriesStats: 空/全非法抛错', () => {
  assert.throws(() => seriesStats([]), /finite/)
})

test('candlesCheck: 健康数据 → healthy', () => {
  const candles = [1000, 2000, 3000].map((t, i) => ({
    openTime: t, open: 10 + i, high: 12 + i, low: 9 + i, close: 11 + i, volume: 100,
  }))
  const q = candlesCheck(candles)
  assert.equal(q.healthy, true)
  assert.equal(q.count, 3)
})

test('candlesCheck: 各违规项计数', () => {
  const q = candlesCheck([
    { openTime: 1000, open: 10, high: 9, low: 11, close: 11, volume: 1 },   // high<low
    { openTime: 1000, open: -1, high: 12, low: 9, close: 11, volume: 1 },   // 时间未增 + 非正
    { openTime: 5000, open: 10, high: 12, low: 9, close: 40, volume: 1 },   // 缺口 + 极端变动
  ])
  assert.equal(q.highBelowLow, 1)
  assert.equal(q.nonPositive, 1)
  assert.equal(q.timeNotIncreasing, 1)
  assert.equal(q.timeGaps, 1)
  assert.equal(q.extremeMoves, 1)
  assert.equal(q.healthy, false)
})

test('seriesQuality: 缺值 + z 异常 + 冻结检测', () => {
  // 19 个 1 + 100（z≈4.35 > 3）+ NaN：missing 1、z 异常 1、跳变 1、冻结 run 19
  const vals = [...new Array(19).fill(1), 100, Number.NaN]
  const q = seriesQuality(vals)
  assert.equal(q.count, 21)
  assert.equal(q.missingCount, 1)
  assert.equal(q.zOutliers, 1)
  assert.equal(q.jumps, 1)
  assert.equal(q.longestConstantRun, 19)
  assert.equal(q.healthy, false)
})

test('seriesQuality: 健康序列 → healthy', () => {
  const q = seriesQuality([100, 101, 102, 103, 104, 105]) // 逐点 +1%
  assert.equal(q.healthy, true)
  assert.equal(q.missingCount, 0)
  assert.equal(q.zOutliers, 0)
  assert.equal(q.jumps, 0)
})

test('annotateSeries: 点级标签齐全', () => {
  const vals = [...new Array(19).fill(1), 100, Number.NaN]
  const a = annotateSeries(vals)
  assert.equal(a.summary.missing, 1)
  assert.equal(a.summary.zOutliers, 1)
  assert.ok(a.summary.frozen >= 1)
  const missing = a.annotations.find(x => x.label === 'missing')!
  assert.equal(missing.index, 20)
  assert.equal(missing.severity, 3)
  const z = a.annotations.find(x => x.label === 'z_outlier')!
  assert.equal(z.index, 19)
  assert.ok(z.severity >= 2)
  const frozen = a.annotations.find(x => x.label === 'frozen')!
  assert.equal(frozen.index, 0)
  assert.equal(frozen.severity, 3) // run 19 >= 10
  assert.match(frozen.detail, /19 consecutive/)
})

test('annotateSeries: 干净序列无标注', () => {
  const a = annotateSeries([100, 101, 102, 103, 104])
  assert.equal(a.annotations.length, 0)
  assert.deepEqual(a.summary, { missing: 0, zOutliers: 0, jumps: 0, frozen: 0 })
})
