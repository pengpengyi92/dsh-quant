/**
 * quant_data_guide 知识库测试。
 * 运行：cd deepseek-harness && pnpm exec tsx --test ../quant-indicators/tests/data-guide.spec.ts
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DATA_CHANNELS, findChannel, searchChannels } from '../src/data-guide.ts'

test('知识库：8 个渠道齐全且字段完整', () => {
  assert.equal(DATA_CHANNELS.length, 8)
  for (const c of DATA_CHANNELS) {
    assert.ok(c.name && c.displayName && c.url && c.cost)
    assert.ok(c.dataTypes.length > 0 && c.setup.length > 0 && c.tutorialUrls.length > 0)
    assert.ok(c.bestFor.length > 0)
  }
  const names = DATA_CHANNELS.map(c => c.name)
  assert.deepEqual(names, ['akshare', 'baostock', 'tushare', 'wind', 'ifind', 'sse', 'szse', 'csindex'])
})

test('findChannel：按名字/展示名查找', () => {
  assert.equal(findChannel('tushare')!.displayName, 'Tushare Pro')
  assert.equal(findChannel('AkShare')!.name, 'akshare')
  assert.equal(findChannel('nope'), undefined)
})

test('searchChannels：按数据类型关键词命中', () => {
  const r = searchChannels('财务')
  assert.ok(r.length >= 3, `expected >= 3 hits, got ${r.length}`)
  assert.ok(r.some(m => m.channel.name === 'tushare'))
  assert.ok(r.some(m => m.channel.name === 'akshare'))
})

test('searchChannels：渠道名命中优先', () => {
  const r = searchChannels('tushare')
  assert.equal(r[0]!.channel.name, 'tushare')
  assert.match(r[0]!.matchReason, /channel name/)
})

test('searchChannels：免费渠道查询', () => {
  const r = searchChannels('免费')
  assert.ok(r.length >= 2)
  for (const m of r) assert.match(m.channel.cost, /免费/)
})

test('searchChannels：空查询返回全部', () => {
  assert.equal(searchChannels('').length, 8)
})
