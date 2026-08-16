/**
 * 验证脚本：boot ctx → 注册 quant-indicators → 验证 6 个工具的
 * 模型可见 schema、完整执行管线、数值正确性（已知答案）、isError 路径。
 *
 * 运行（从 deepseek-harness 目录）：
 *   pnpm exec tsx ../quant-indicators/verify.ts
 */
import { Context } from '@deepseek-ai/cordis'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import { apply as applyQuantTools } from './src/index.ts'

const ctx = new Context()
await ctx.plugin(SystemPrompt)
await ctx.plugin(ToolRuntime)
await ctx.plugin({ name: 'quant-indicators', inject: ['tools'], apply: applyQuantTools })

const signal = new AbortController().signal
const call = (name: string, args: Record<string, unknown>) =>
  ctx.tools.execute({ callId: `q-${name}`, name, arguments: args, signal })

// 多交易所 fallback：地区封锁时自动切换 provider（resilience 实测：Binance 451 / Bybit CloudFront）
async function fetchWithFallback(symbol: string, interval: string, limit: number) {
  for (const provider of ['binance', 'okx', 'bybit'] as const) {
    const r = await call('quant_market_fetch', { symbol, interval, limit, provider })
    if (!r.isError) return { ...r, provider }
  }
  throw new Error(`all providers failed for ${symbol}`)
}

// 1) 模型可见 schema
const names = ctx.tools.schemas().map(s => s.name).sort()
console.log('=== schemas() ===')
console.log(names.join(', '))
if (names.length !== 42) throw new Error(`expected 42 tools, got ${names.length}`)

// 2) 数值正确性（已知答案）
console.log('\n=== numeric correctness ===')
const series = [1, 2, 3, 4, 5, 6, 7, 8]

const smaR = await call('quant_sma', { values: series, window: 3 })
console.log('sma(3):        ', JSON.stringify(smaR.value))
assert(smaR.value.values[2] === 2 && smaR.value.values[7] === 7, 'sma wrong')

const emaR = await call('quant_ema', { values: series, window: 3 })
console.log('ema(3):        ', JSON.stringify(emaR.value))
// seed = mean(1,2,3)=2; alpha=0.5; 手工推进
const emaExpected = [null, null, 2, 3, 4, 5, 6, 7]
assert(JSON.stringify(emaR.value.values) === JSON.stringify(emaExpected), 'ema wrong')

const rsiR = await call('quant_rsi', { values: series, window: 3 })
console.log('rsi(3):        ', JSON.stringify(rsiR.value))
// 全涨序列 → avgLoss=0 → RSI=100
assert(rsiR.value.values[3] === 100 && rsiR.value.values[7] === 100, 'rsi wrong')

const macdR = await call('quant_macd', { values: series })
console.log('macd:          ', JSON.stringify(macdR.value))
assert(macdR.value.macd.length === 8, 'macd length wrong')

const bbR = await call('quant_bollinger', { values: series, window: 3 })
console.log('bollinger(3):  ', JSON.stringify(bbR.value))
assert(bbR.value.middle[2] === 2 && bbR.value.upper[2]! > 2 && bbR.value.lower[2]! < 2, 'bollinger wrong')

const high = [3, 4, 5, 6, 7, 8, 9, 10]
const low = [1, 2, 3, 4, 5, 6, 7, 8]
const atrR = await call('quant_atr', { high, low, close: series, window: 3 })
console.log('atr(3):        ', JSON.stringify(atrR.value))
assert(atrR.value.values[3] !== null, 'atr wrong')

// 3) isError 路径
console.log('\n=== isError paths ===')
const bad1 = await call('quant_sma', { values: [1, 2], window: 3 }) // window > length → 全 null 合法结果
console.log('window>len:     isError:', bad1.isError, '| value:', JSON.stringify(bad1.value))
assert(!bad1.isError, 'window>len should be a legal all-null result')

const bad2 = await call('quant_sma', { values: series, window: 0 }) // window=0
console.log('window=0:       isError:', bad2.isError, '| error:', JSON.stringify(bad2.error))
assert(bad2.isError, 'window=0 must be an error')

const bad3 = await call('quant_sma', { values: [1, 2, Number.NaN, 4], window: 2 }) // NaN
console.log('NaN input:      isError:', bad3.isError, '| error:', JSON.stringify(bad3.error))
assert(bad3.isError, 'NaN must be an error')

const bad4 = await call('quant_sma', { values: series }) // 缺 window
console.log('missing window: isError:', bad4.isError, '| error:', JSON.stringify(bad4.error))
assert(bad4.isError, 'missing window must be an error')

const bad5 = await call('quant_atr', { high, low, close: [1, 2], window: 2 }) // 长度不等
console.log('atr len-mismatch: isError:', bad5.isError, '| error:', JSON.stringify(bad5.error))
assert(bad5.isError, 'atr length mismatch must be an error')

const bad6 = await call('quant_macd', { values: series, fast: 26, slow: 12 }) // fast >= slow
console.log('macd fast>=slow: isError:', bad6.isError, '| error:', JSON.stringify(bad6.error))
assert(bad6.isError, 'macd fast>=slow must be an error')

// 4) quant_market_fetch（真实 Binance 公共 API；网络不可达时此用例红）
console.log('\n=== quant_market_fetch (live Binance) ===')
const market = await fetchWithFallback('BTCUSDT', '1d', 5)
console.log('fetch:           isError:', market.isError, '| candles:', market.value?.candles?.length ?? market.error, '| via', market.provider)
assert(!market.isError, 'live fetch should succeed')
assert(market.value.candles.length === 5, 'expected 5 candles')
assert(market.value.candles[0].openTime > 0 && market.value.candles[0].close > 0, 'candle fields sane')
// 链路验证：fetch 的 close 喂给 quant_sma
const closes = market.value.candles.map(c => c.close)
const chained = await call('quant_sma', { values: closes, window: 3 })
console.log('fetch→sma chain: isError:', chained.isError, '| value:', JSON.stringify(chained.value))
assert(!chained.isError && chained.value.values.length === 5, 'fetch→sma chain should work')

const bad7 = await call('quant_market_fetch', { symbol: 'btcusdt', interval: '1d' }) // 小写
console.log('lowercase sym:   isError:', bad7.isError, '| error:', JSON.stringify(bad7.error))
assert(bad7.isError, 'lowercase symbol must be an error')

const bad8 = await call('quant_market_fetch', { symbol: 'BTCUSDT', limit: 0 })
console.log('limit=0:         isError:', bad8.isError, '| error:', JSON.stringify(bad8.error))
assert(bad8.isError, 'limit out of range must be an error')

// 5) quant_backtest（真实行情 → 指标 → 回测 端到端）
console.log('\n=== quant_backtest (real data end-to-end) ===')
const history = await fetchWithFallback('BTCUSDT', '1d', 120)
assert(!history.isError, 'history fetch should succeed')
const btCloses = history.value.candles.map(c => c.close)
const bt = await call('quant_backtest', { close: btCloses, fast: 5, slow: 20, feeRate: 0.001 })
console.log('backtest:        isError:', bt.isError, '|', JSON.stringify(bt.value))
assert(!bt.isError, 'backtest should succeed')
assert(bt.value.trades.length >= 0 && bt.value.equityCurve.length === 120, 'backtest output shape')
assert(Number.isFinite(bt.value.totalReturnPct) && Number.isFinite(bt.value.maxDrawdownPct), 'metrics finite')
// 端到端链路：fetch → 指标 → 回测全部串起来
const e2eEma = await call('quant_ema', { values: btCloses, window: 20 })
assert(!e2eEma.isError, 'ema on fetched closes should work')
console.log('full chain:      fetch(120) → backtest ✓ | ema(20) first-non-null:', JSON.stringify(e2eEma.value.values.find(v => v !== null)?.toFixed(2)))

// 6) quant_backtest_grid（真实行情 → 参数网格搜索）
console.log('\n=== quant_backtest_grid (real data) ===')
const grid = await call('quant_backtest_grid', { close: btCloses, fastMin: 3, fastMax: 5, slowMin: 10, slowMax: 20, feeRate: 0.001 })
console.log('grid:            isError:', grid.isError, '| combos:', grid.value?.results?.length, '| best:', JSON.stringify(grid.value?.best))
assert(!grid.isError, 'grid should succeed')
assert(grid.value.results.length > 0, 'grid should have results')
assert(grid.value.best.totalReturnPct >= grid.value.results[0].totalReturnPct - 1e-9, 'best is top result')

const bad9 = await call('quant_backtest_grid', { close: btCloses, fastMin: 5, fastMax: 3 })
console.log('grid bad range:  isError:', bad9.isError, '| error:', JSON.stringify(bad9.error))
assert(bad9.isError, 'invalid grid range must be an error')


// 7) 新指标（真实 BTC 数据链路）
console.log('\n=== new indicators (real data) ===')
const highs = history.value.candles.map(c => c.high)
const lows = history.value.candles.map(c => c.low)
const vols = history.value.candles.map(c => c.volume)
const kdjR = await call('quant_kdj', { high: highs, low: lows, close: btCloses, window: 9 })
const cciR = await call('quant_cci', { high: highs, low: lows, close: btCloses, window: 20 })
const obvR = await call('quant_obv', { close: btCloses, volume: vols })
const adxR = await call('quant_adx', { high: highs, low: lows, close: btCloses, window: 14 })
assert(!kdjR.isError && !cciR.isError && !obvR.isError && !adxR.isError, 'new indicators should succeed')
assert(kdjR.value.k.length === 120 && kdjR.value.j[8] !== null, 'kdj shape')
assert(obvR.value.values.length === 120 && obvR.value.values[0] === 0, 'obv shape')
assert(adxR.value.adx[27] !== null && adxR.value.plusDi[14] !== null, 'adx alignment')
console.log('kdj[-1]:', JSON.stringify({ k: kdjR.value.k[119], d: kdjR.value.d[119], j: kdjR.value.j[119] }))
console.log('cci[-1]:', cciR.value.values[119]?.toFixed(2), '| obv[-1]:', obvR.value.values[119]?.toFixed(2), '| adx[-1]:', adxR.value.adx[119]?.toFixed(2))


// 8) 新策略（真实 BTC 数据 + 资金管理）
console.log('\n=== new strategies (real data) ===')
const bb = await call('quant_backtest_bollinger', { close: btCloses, window: 20, multiplier: 2, feeRate: 0.001 })
const rs = await call('quant_backtest_rsi', { close: btCloses, rsiWindow: 14, buyBelow: 30, sellAbove: 70, feeRate: 0.001 })
const mcSl = await call('quant_backtest', { close: btCloses, fast: 5, slow: 20, feeRate: 0.001, stopLoss: 0.05, takeProfit: 0.15 })
assert(!bb.isError && !rs.isError && !mcSl.isError, 'strategy backtests should succeed')
console.log('bollinger:       trades:', bb.value.trades.length, '| total:', bb.value.totalReturnPct.toFixed(2) + '%')
console.log('rsi-reversion:   trades:', rs.value.trades.length, '| total:', rs.value.totalReturnPct.toFixed(2) + '%')
console.log('ma-cross +stop:  trades:', mcSl.value.trades.length, '| reasons:', JSON.stringify(mcSl.value.trades.map(t => t.exitReason)))
assert(mcSl.value.trades.every(t => ['signal', 'stop_loss', 'take_profit', null].includes(t.exitReason)), 'exitReason vocabulary')


// 9) 组合回测（真实双资产 BTC+ETH）
console.log('\n=== portfolio (real data) ===')
const ethRes = await fetchWithFallback('ETHUSDT', '1d', 120)
  const eth = ethRes
  assert(!eth.isError, 'eth fetch should succeed')
const ethCloses = eth.value.candles.map(c => c.close)
const pf = await call('quant_backtest_portfolio', {
  assets: [{ name: 'BTC', close: btCloses }, { name: 'ETH', close: ethCloses }],
  weights: [0.6, 0.4],
  rebalanceEvery: 30,
  feeRate: 0.001,
})
assert(!pf.isError, 'portfolio should succeed')
console.log('btc+eth 60/40:   total:', pf.value.totalReturnPct.toFixed(2) + '%', '| maxDD:', pf.value.maxDrawdownPct.toFixed(2) + '%', '| rebalances:', pf.value.rebalances)
console.log('final weights:  ', JSON.stringify(pf.value.finalWeights.map(x => x.toFixed(3))))
assert(pf.value.equityCurve.length === 120 && pf.value.rebalances >= 3, 'portfolio shape')


// 10) 多交易所（OKX / Bybit 真实数据）
console.log('\n=== multi-exchange (real data) ===')
const okx = await call('quant_market_fetch', { symbol: 'BTCUSDT', interval: '1d', limit: 5, provider: 'okx' })
assert(!okx.isError, 'okx should succeed')
assert(okx.value.candles[0].openTime < okx.value.candles[4].openTime, 'okx ascending order')
console.log('okx BTC close:  ', okx.value.candles.map(c => c.close).join(', '))
const byb = await call('quant_market_fetch', { symbol: 'BTCUSDT', interval: '1d', limit: 5, provider: 'bybit' })
if (!byb.isError) {
  assert(byb.value.candles[0].openTime < byb.value.candles[4].openTime, 'bybit ascending order')
  const lastOkx = okx.value.candles[4].close
  const lastByb = byb.value.candles[4].close
  assert(Math.abs(lastOkx - lastByb) / lastByb < 0.02, `cross-exchange close mismatch: okx ${lastOkx} vs bybit ${lastByb}`)
  console.log('bybit BTC close:', byb.value.candles.map(c => c.close).join(', '), '| cross-check ok')
} else {
  console.log('bybit blocked in this region — skipped cross-check (okx primary works)')
}
// 非法 provider 由 enum 拒绝
const badP = await call('quant_market_fetch', { symbol: 'BTCUSDT', interval: '1d', provider: 'kraken' })
assert(badP.isError, 'unknown provider must be an error')


// 11) 数据渠道指南（知识库查询）
console.log('\n=== data guide ===')
const g1 = await call('quant_data_guide', { query: 'tushare' })
const g2 = await call('quant_data_guide', { query: '财务' })
const g3 = await call('quant_data_guide', { channel: 'akshare' })
assert(!g1.isError && !g2.isError && !g3.isError, 'guide queries should succeed')
assert(g1.value.results[0].name === 'tushare' && g1.value.results[0].url === 'https://tushare.pro', 'exact channel')
assert(g2.value.results.length >= 3, 'data-type search should hit multiple channels')
assert(g3.value.results.length === 1 && g3.value.results[0].category === 'python-lib', 'channel detail')
const g4 = await call('quant_data_guide', { channel: 'nope' })
assert(g4.isError, 'unknown channel must be an error')
console.log('guide "tushare":', g1.value.results[0].displayName, '| cost:', g1.value.results[0].cost.slice(0, 24), '…')
console.log('guide "财务" hits:', g2.value.results.map(r => r.name).join(', '))


// 14) 因子评估（真实 BTC 数据：ROC 因子 → 未来收益）
console.log('\n=== factor eval (real data) ===')
const rocR = await call('quant_roc', { values: btCloses, window: 10 })
assert(!rocR.isError, 'roc should succeed')
const rocVals = rocR.value.values.filter(v => v !== null)
const rets = btCloses.slice(1).map((c, i) => c / btCloses[i] - 1)
// ROC 有效区间：原始 index 10..119（110 个）；rets 原始 index 0..118（119 个）
// 对齐：rocVals[i]（原始 index 10+i）预测 rets[10+i]（原始 index 10+i 的下一期）
const fe = await call('quant_factor_evaluate', {
  factorValues: rocVals.slice(0, 100),
  forwardReturns: rets.slice(10, 110),
  quantiles: 5,
  window: 20,
})
assert(!fe.isError, 'factor eval should succeed')
console.log('ROC factor:      IC', fe.value.ic.toFixed(4), '| ICIR', fe.value.icir.toFixed(3), '| longShort', fe.value.longShort.toFixed(4), '| turnover', fe.value.turnover.toFixed(3))
const fc = await call('quant_factor_combine', { factors: [[1, 2, 3, 4, 5], [5, 4, 3, 2, 1]] })
assert(!fc.isError && fc.value.signal.length === 5, 'factor combine should succeed')
console.log('combine demo:    signal', JSON.stringify(fc.value.signal.map(x => x.toFixed(3))))


// 15) chart 数据面（真实数据：K线+均线叠加 / 回测净值+标记 / 标注图）
console.log('\n=== chart data (real data) ===')
const sma20 = await call('quant_sma', { values: btCloses, window: 20 })
const c1 = await call('quant_chart', {
  kind: 'candles', title: 'BTCUSDT with SMA20',
  candles: history.value.candles,
  overlays: [{ name: 'SMA20', values: sma20.value.values }],
  markers: bt.value.trades.filter(t => t.exitIndex !== null).map(t => ({ index: t.entryIndex, kind: 'entry' })),
})
assert(!c1.isError, 'candles chart should succeed')
assert(c1.value.candles.length === 120 && c1.value.overlays[0].values.length === 120, 'chart shape')
const c2 = await call('quant_chart', { kind: 'series', title: 'equity', series: [{ name: 'MA5/20', values: bt.value.equityCurve }] })
assert(!c2.isError && c2.value.series[0].values.length === 120, 'series chart')
const c3 = await call('quant_chart', {
  kind: 'annotations', title: 'BTC closes', values: btCloses,
  annotations: [{ index: 10, label: 'example', severity: 1 }],
})
assert(!c3.isError && c3.value.annotations.length === 1, 'annotation chart')
console.log('candles chart:   120 bars + SMA20 overlay ✓')
console.log('series chart:    equity 120 pts ✓ | annotation chart: 1 label ✓')


// 16) 指标库（真实回测 → 完整指标集）
console.log('\n=== metrics (real data) ===')
const mt = await call('quant_metrics', { equityCurve: bt.value.equityCurve, trades: bt.value.trades })
assert(!mt.isError, 'metrics should succeed')
console.log('metrics:         total', mt.value.totalReturnPct.toFixed(2) + '%', '| maxDD', mt.value.maxDrawdownPct.toFixed(2) + '%', '| sharpe', mt.value.sharpe.toFixed(3))
console.log('                 calmar', mt.value.calmar.toFixed(3), '| sortino', mt.value.sortino.toFixed(3), '| win', mt.value.winRate.toFixed(1) + '%', '| PF', String(mt.value.profitFactor))
assert(mt.value.tradeMetrics.tradeCount === 3, 'trade metrics count')


// 17) 量化基金模拟（1 亿 → 费后净值）
console.log('\n=== quant fund (real data) ===')
const fund = await call('quant_fund', { equityCurve: bt.value.equityCurve, initialCapital: 100_000_000, managementFeeRate: 0.02, performanceFeeRate: 0.2 })
assert(!fund.isError, 'fund sim should succeed')
console.log('fund:            1.00亿 → NAV', fund.value.finalNavNet.toFixed(4), '| AUM', (fund.value.finalAum / 1e8).toFixed(3) + '亿', '| net', fund.value.netReturnPct.toFixed(2) + '%')
assert(fund.value.navNet.length === 120, 'nav series length')


// 18) 风险指标（真实 BTC 收益 + 因子基准）
console.log('\n=== risk (real data) ===')
const riskRets = btCloses.slice(1).map((c, i) => c / btCloses[i] - 1)
const rk = await call('quant_risk', { returns: riskRets, confidence: 0.95 })
assert(!rk.isError, 'risk should succeed')
console.log('risk:            VaR95', (rk.value.var95 * 100).toFixed(2) + '%', '| CVaR95', (rk.value.cvar95 * 100).toFixed(2) + '%', '| maxDD', rk.value.maxDrawdownPct.toFixed(2) + '%', '| downDev', (rk.value.downsideDeviation * 100).toFixed(2) + '%')
const btcBench = riskRets.map(() => 0) // 基准 = 现金（0 收益）
const rk2 = await call('quant_risk', { returns: riskRets, benchmarkReturns: btcBench })
assert(!rk2.isError, 'risk with benchmark should succeed')
console.log('vs cash:         beta', rk2.value.beta.toFixed(3), '| IR', rk2.value.informationRatio.toFixed(3), '| TE', rk2.value.trackingError.toFixed(2) + '%')

// 19) 开源生态域（真实 GitHub + npm 公共 API，吃自己的狗粮：度量 dsh-quant 自己）
console.log('\n=== dsh-community (live GitHub + npm) ===')
const repoStats = await call('quant_repo_stats', { owner: 'pengpengyi92', repo: 'dsh-quant' })
assert(!repoStats.isError, 'quant_repo_stats should succeed')
assert(repoStats.value.stars >= 3, 'dsh-quant should have at least 3 stars')
console.log('repo:            stars', repoStats.value.stars, '| forks', repoStats.value.forks, '| open issues', repoStats.value.openIssues, '| open PRs', repoStats.value.openPullRequests, '| latest release', repoStats.value.latestRelease)

const npmStats = await call('quant_npm_stats', { pkg: 'dsh-quant' })
assert(!npmStats.isError, 'quant_npm_stats should succeed')
assert(typeof npmStats.value.weeklyDownloads === 'number', 'weeklyDownloads should be a number')
console.log('npm:             latest', npmStats.value.latest, '| 7d downloads', npmStats.value.weeklyDownloads, '| 30d', String(npmStats.value.monthlyDownloads))

const pulse = await call('quant_oss_pulse', {
  stars: repoStats.value.stars,
  downloadsWeekly: npmStats.value.weeklyDownloads,
  openIssues: repoStats.value.openIssues,
  openPullRequests: repoStats.value.openPullRequests,
  daysSinceRelease: 0,
})
assert(!pulse.isError, 'quant_oss_pulse should succeed')
assert(pulse.value.score >= 0 && pulse.value.score <= 100, 'pulse score must be in [0, 100]')
console.log('pulse:           score', pulse.value.score, '| grade', pulse.value.grade)
console.log('                 ' + pulse.value.summary)
for (const s of pulse.value.suggestions) console.log('                 - ' + s)

const pulseKnown = await call('quant_oss_pulse', { stars: 3, downloadsWeekly: 0, openIssues: 0, openPullRequests: 0, daysSinceRelease: 1 })
assert(pulseKnown.value.score === 56 && pulseKnown.value.grade === 'C', 'hand-computed pulse case (3 stars → 56/C)')
console.log('hand-computed:   3 stars → score 56 / grade C ✓')

const badRepo = await call('quant_repo_stats', { owner: 'not a repo', repo: 'x' })
assert(badRepo.isError, 'invalid owner must be an error')
console.log('isError path:    invalid owner → isError ✓')

// 20) A 股免费行情（新浪日线 + 腾讯前复权日线，公共接口无凭据）
console.log('\n=== A-share market (live sina + tencent) ===')
const sinaA = await call('quant_market_fetch', { symbol: 'sh600000', interval: '1d', limit: 5, provider: 'sina' })
assert(!sinaA.isError, `sina fetch should succeed: ${sinaA.error}`)
assert(sinaA.value.candles.length === 5, 'sina should return 5 candles')
console.log('sina sh600000:   ', sinaA.value.candles[0]?.open, '→', sinaA.value.candles[4]?.close, `(${sinaA.value.candles.length} daily candles)`)
const tencentA = await call('quant_market_fetch', { symbol: 'sh600000', interval: '1d', limit: 5, provider: 'tencent' })
assert(!tencentA.isError, `tencent fetch should succeed: ${tencentA.error}`)
assert(tencentA.value.candles.length === 5, 'tencent should return 5 candles')
console.log('tencent qfq:     ', tencentA.value.candles[0]?.open, '→', tencentA.value.candles[4]?.close, '(forward-adjusted)')
const badAShare = await call('quant_market_fetch', { symbol: '600000', interval: '1d', provider: 'sina' })
assert(badAShare.isError, 'invalid A-share symbol must be an error')
console.log('isError path:    invalid A-share symbol → isError ✓')

// 21) 回撤分析 + 执行模拟 + walk-forward（真实 BTC 回测数据）
console.log('\n=== drawdown / execution / walk-forward (real data) ===')
const dd2 = await call('quant_drawdown', { equity: bt.value.equityCurve })
assert(!dd2.isError && dd2.value.maxDrawdownPct >= 0 && dd2.value.underwater.length === 120, 'drawdown should succeed')
console.log('drawdown:        max', dd2.value.maxDrawdownPct.toFixed(2) + '%', '| periods', dd2.value.periods.length, '| ongoing', dd2.value.ongoing === null ? 'no' : 'yes')
const ex = await call('quant_execute_sim', {
  close: btCloses,
  orders: [
    { index: 10, side: 'buy', valueFraction: 0.5 },
    { index: 30, side: 'sell', valueFraction: 1 },
  ],
  initialCash: 1_000_000, feeRate: 0.001, slippageBps: 10,
})
assert(!ex.isError && ex.value.tradeCount === 2, 'execute sim should fill both orders')
console.log('execute sim:     ', ex.value.tradeCount, 'fills | return', ex.value.totalReturnPct.toFixed(2) + '%', '| fees', ex.value.totalFee.toFixed(2), '| slippage', ex.value.totalSlippageCost.toFixed(2))
const rets2 = btCloses.slice(1).map((c, i) => c / btCloses[i]! - 1)
const wf = await call('quant_walk_forward', {
  returns: [0, ...rets2],
  features: [[0, ...rets2]], // features[t] = returns[t] → 完美线性，OOS IC 应 ≈ 1
  trainWindow: 30, testWindow: 10,
})
assert(!wf.isError, 'walk-forward should succeed')
assert(wf.value.windows.length >= 1 && wf.value.oosCount > 0, 'walk-forward should produce OOS predictions')
console.log('walk-forward:    ', wf.value.windows.length, 'windows | OOS n', wf.value.oosCount, '| OOS IC', wf.value.oosIc.toFixed(4))

// 22) 端到端研究管线（真实行情 → PDAT→PET 全链路）
console.log('\n=== research pipeline (live BTC, full chain) ===')
const pipe = await call('quant_research_pipeline', { symbol: 'BTCUSDT', interval: '1d', limit: 120, fast: 5, slow: 20 })
assert(!pipe.isError, `pipeline should succeed: ${pipe.error}`)
assert(pipe.value.candles.count === 120, 'pipeline candle count')
assert(pipe.value.fund.navNet.length === 120, 'pipeline fund series length')
assert(pipe.value.report.includes('Quant Research Report'), 'pipeline report')
assert(pipe.value.charts.candles.kind === 'candles' && pipe.value.charts.equity.kind === 'series', 'pipeline charts')
console.log('pipeline:        120 candles → return', pipe.value.metrics.totalReturnPct.toFixed(2) + '%', '| maxDD', pipe.value.metrics.maxDrawdownPct.toFixed(2) + '%', '| NAV', pipe.value.fund.finalNavNet.toFixed(4))
console.log('                 drawdown periods', pipe.value.drawdown.periods.length, '| factor n', pipe.value.factor.n)

console.log('\n✅ all quant-indicators checks passed')

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`assertion failed: ${msg}`)
}
