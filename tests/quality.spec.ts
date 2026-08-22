/**
 * quality.ts 手算测试（PIT / 幸存者偏差 / 渠道可靠性 / 总报告）。
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { channelReliability, dataQualityReport, pitCheck, survivorshipCheck } from '../src/dsh-data/quality.ts'

test('pitCheck: 平滑序列通过，台阶序列检测到断点', () => {
  const smooth = [1, 1.1, 1.2, 1.15, 1.25, 1.3]
  const r1 = pitCheck(smooth)
  assert.equal(r1.pass, true)

  // 台阶：中间跳变后不回落（事后修正特征）
  const step = [1, 1.1, 5, 5.1, 5.2, 5.3] // 1.1 -> 5 是 3.5 倍跳变
  const r2 = pitCheck(step)
  assert.equal(r2.pass, false)
  assert.ok(r2.lookAheadIndices.length > 0)
})

test('pitCheck: 短序列跳过', () => {
  const r = pitCheck([1, 2])
  assert.equal(r.pass, true)
  assert.match(r.notes[0]!, /过短/)
})

test('survivorshipCheck: 连续序列通过', () => {
  const r = survivorshipCheck([1, 2, 3, 4, 5])
  assert.equal(r.continuous, true)
  assert.equal(r.tailTruncated, false)
  assert.equal(r.gaps.length, 0)
})

test('survivorshipCheck: 尾部缺失 = 疑似幸存者偏差', () => {
  const r = survivorshipCheck([1, 2, null, null])
  assert.equal(r.continuous, false)
  assert.equal(r.tailTruncated, true) // 最后一段缺失到结尾
  assert.ok(r.notes.some(n => /幸存者/.test(n)))
})

test('survivorshipCheck: 中间缺失段被检出', () => {
  const r = survivorshipCheck([1, null, null, 4, 5])
  assert.equal(r.continuous, false)
  assert.equal(r.gaps.length, 1)
  assert.deepEqual(r.gaps[0], { start: 1, end: 3 })
  assert.equal(r.tailTruncated, false)
})

test('channelReliability: 已知渠道排序 + 可靠度区间', () => {
  const r = channelReliability(['wind', 'akshare', 'binance', 'unknown-xyz'])
  assert.equal(r.length, 4)
  // 排序：可靠度降序
  for (let i = 1; i < r.length; i++) {
    assert.ok(r[i - 1]!.reliability >= r[i]!.reliability)
  }
  // wind 最高，未知渠道兜底 0.5
  assert.equal(r[0]!.channel, 'wind')
  const unknown = r.find(x => x.channel === 'unknown-xyz')!
  assert.equal(unknown.reliability, 0.5)
  assert.equal(unknown.cost, 'freemium')
})

test('dataQualityReport: 综合健康度 = PIT 50% + 连续 30% + 渠道 20%', () => {
  // 平滑连续序列 + binance 渠道 → 高分
  const good = dataQualityReport([1, 1.1, 1.2, 1.15, 1.25, 1.3], ['binance'])
  assert.ok(good.healthScore > 0.8, `health=${good.healthScore}`)
  // 台阶 + 尾部缺失 + 未知渠道 → 低分
  const bad = dataQualityReport([1, 1.1, 5, null, null], ['unknown'])
  assert.ok(bad.healthScore < 0.6, `health=${bad.healthScore}`)
})
