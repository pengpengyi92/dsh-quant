/**
 * quant_data_guide 知识库测试。
 * 运行：cd deepseek-harness && pnpm exec tsx --test ../quant-indicators/tests/data-guide.spec.ts
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DATA_CHANNELS, accessReadiness, adviseChannels, channelAccessGuide, compareChannels, findChannel, searchChannels } from '../src/dsh-data/data-guide.ts'
import { channelReliability } from '../src/dsh-data/quality.ts'

test('知识库：16 个渠道齐全且字段完整', () => {
  assert.equal(DATA_CHANNELS.length, 16)
  for (const c of DATA_CHANNELS) {
    assert.ok(c.name && c.displayName && c.url && c.cost)
    assert.ok(c.dataTypes.length > 0 && c.setup.length > 0 && c.tutorialUrls.length > 0)
    assert.ok(c.bestFor.length > 0)
  }
  const names = DATA_CHANNELS.map(c => c.name)
  assert.deepEqual(names, ['akshare', 'baostock', 'tushare', 'wind', 'ifind', 'sse', 'szse', 'csindex', 'tencent', 'yahoo', 'capital-generation', 'dsh-us-stocks', 'data-mcp', 'chinabond', 'cfets', 'siftingio'])
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
  assert.equal(searchChannels('').length, 16)
})

test('compareChannels: 覆盖类型排前 + 覆盖标记', () => {
  const out = compareChannels('财务')
  assert.equal(out.channels.length, 16)
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

test('SiftingIO：可查询的商业渠道保留贡献来源与验证边界', () => {
  const c = findChannel('SiftingIO')!
  assert.equal(c.category, 'api-platform')
  assert.equal(searchChannels('siftingio')[0]!.channel.name, c.name)
  for (const type of ['ETF', '外汇', '大宗商品', '加密货币']) {
    assert.ok(compareChannels(type).channels.some(x => x.name === c.name && x.covers))
  }
  assert.match(c.cost, /API Key/)
  assert.match(c.cost, /内部非商业/)
  assert.match(c.notes!, /2026-11-06/)
  assert.match(c.notes!, /@aprsn/)
  assert.match(c.notes!, /issuecomment-6659567979/)
  assert.match(c.notes!, /未执行有效凭据 API 测试/)
  assert.match(c.notes!, /未做正式 dsh 插件兼容性验证/)
  assert.match(c.notes!, /MIT 许可不授予行情数据使用权/)
  assert.ok(c.tutorialUrls.includes('https://sifting.io/legal/terms-of-use'))
})

test('SiftingIO：免费计划仍须凭据，接入提示不等于测试通过', () => {
  const missing = accessReadiness('siftingio')
  assert.equal(missing.ready, false)
  assert.ok(missing.blockers.some(x => x.includes('凭据')))
  assert.equal(accessReadiness('siftingio', true).ready, true) // only the local credential heuristic
  const g = channelAccessGuide('siftingio')
  assert.ok(g.prerequisites.some(x => x.includes('用途许可')))
  assert.ok(g.steps.some(x => x.includes('X-API-Key')))
  assert.match(g.fallback, /不代表 API 实测/)
})

test('SiftingIO：目录收录不提升为官方来源或已测质量', () => {
  assert.ok(!adviseChannels({ dataType: '外汇', purpose: 'official' }).some(x => x.name === 'siftingio'))
  assert.deepEqual(channelReliability(['siftingio']), channelReliability(['unreviewed-provider']).map(x => ({ ...x, channel: 'siftingio' })))
  assert.ok(channelReliability(['siftingio'])[0]!.risks.some(x => x.includes('需实测')))
})

test('LLMQuant Data: listed MCP client is not an anonymous free native DSH plugin', () => {
  const c = findChannel('data-mcp')!
  assert.equal(c.category, 'api-platform')
  assert.match(c.displayName, /LLMQuant/)
  assert.match(c.cost, /MIT/)
  assert.match(c.cost, /账号/)
  assert.match(c.cost, /credit/i)
  assert.match(c.notes!, /2026-11-14/)
  assert.match(c.notes!, /不授予.*数据/)
  assert.ok(c.tutorialUrls.includes('https://llmquantdata.com/pricing'))
})

test('LLMQuant Data: missing credentials block readiness; local credential flag is not API validation', () => {
  const missing = accessReadiness('data-mcp')
  assert.equal(missing.ready, false)
  assert.ok(missing.blockers.some(x => /凭据/.test(x)))
  assert.equal(accessReadiness('DATA-MCP', true).ready, true)
  const guide = channelAccessGuide('data-mcp')
  assert.ok(guide.prerequisites.some(x => /Node.js.*20/.test(x)))
  assert.ok(guide.prerequisites.some(x => /账号/.test(x)))
  assert.match(guide.example, /@llmquant\/data-mcp@0\.7\.1/)
  assert.match(guide.fallback, /不代表.*实测/)
  assert.match(guide.fallback, /403/)
})

test('LLMQuant Data: listing/credentials do not upgrade data reliability or official-source status', () => {
  assert.deepEqual(channelReliability(['data-mcp']),
    channelReliability(['unreviewed-provider']).map(x => ({ ...x, channel: 'data-mcp' })))
  assert.ok(!adviseChannels({ dataType: '行情', purpose: 'official' }).some(x => x.name === 'data-mcp'))
})
