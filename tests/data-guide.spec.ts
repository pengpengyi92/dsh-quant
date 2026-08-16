/**
 * quant_data_guide 知识库测试。
 * 运行：cd deepseek-harness && pnpm exec tsx --test ../quant-indicators/tests/data-guide.spec.ts
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DATA_CHANNELS, adviseChannels, compareChannels, findChannel, searchChannels } from '../src/dsh-data/data-guide.ts'

test('知识库：13 个渠道齐全且字段完整', () => {
  assert.equal(DATA_CHANNELS.length, 13)
  for (const c of DATA_CHANNELS) {
    assert.ok(c.name && c.displayName && c.url && c.cost)
    assert.ok(c.dataTypes.length > 0 && c.setup.length > 0 && c.tutorialUrls.length > 0)
    assert.ok(c.bestFor.length > 0)
  }
  const names = DATA_CHANNELS.map(c => c.name)
  assert.deepEqual(names, ['akshare', 'baostock', 'tushare', 'wind', 'ifind', 'sse', 'szse', 'csindex', 'tencent', 'yahoo', 'capital-generation', 'dsh-us-stocks', 'data-mcp'])
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
  assert.equal(searchChannels('').length, 13)
})

test('compareChannels: 覆盖类型排前 + 覆盖标记', () => {
  const out = compareChannels('财务')
  assert.equal(out.channels.length, 13)
  assert.equal(out.channels[0]!.covers, true)
  assert.ok(out.channels.filter(c => c.covers).length >= 4)
  const tushare = out.channels.find(c => c.name === 'tushare')!
  assert.equal(tushare.covers, true)
})

test('adviseChannels: free + backtest → baostock 优先', () => {
  const r = adviseChannels({ dataType: '日线', budget: 'free', purpose: 'backtest' })
  assert.equal(r[0]!.name, 'baostock')
  assert.match(r[0]!.reason, /回测/)
})

test('adviseChannels: low budget → tushare 优先', () => {
  const r = adviseChannels({ dataType: '财务', budget: 'low', purpose: 'research' })
  assert.equal(r[0]!.name, 'tushare')
  assert.match(r[0]!.reason, /积分/)
})

test('adviseChannels: institutional → wind 优先', () => {
  const r = adviseChannels({ dataType: '行情', budget: 'institutional', purpose: 'research' })
  assert.equal(r[0]!.name, 'wind')
  assert.match(r[0]!.reason, /机构/)
})

test('adviseChannels: official 用途 → 交易所官网优先', () => {
  const r = adviseChannels({ dataType: '指数', budget: 'free', purpose: 'official' })
  assert.ok(r.some(x => x.name === 'csindex'))
  assert.ok(r.every(x => x.rank === r.indexOf(x) + 1)) // 连续排名
})
