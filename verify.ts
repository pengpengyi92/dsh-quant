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

// 1) 模型可见 schema
const names = ctx.tools.schemas().map(s => s.name).sort()
console.log('=== schemas() ===')
console.log(names.join(', '))
if (names.length !== 15) throw new Error(`expected 15 tools, got ${names.length}`)

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
const market = await call('quant_market_fetch', { symbol: 'BTCUSDT', interval: '1d', limit: 5 })
console.log('fetch:           isError:', market.isError, '| candles:', market.value?.candles?.length ?? market.error)
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
const history = await call('quant_market_fetch', { symbol: 'BTCUSDT', interval: '1d', limit: 120 })
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

console.log('\n✅ all quant-indicators checks passed')

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`assertion failed: ${msg}`)
}
