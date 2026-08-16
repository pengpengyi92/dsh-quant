/**
 * R&D 工作流 MVP demo：真实数据端到端研究流程。
 *
 * 运行：npx tsx demos/rd-workflow.ts（需网络访问交易所公共 API）
 *
 * 这是 dsh-quant 作为 "research & engineering 助手" 的示范工作流：
 *   fetch（取数）→ stats（理解）→ quality（信任）→ indicators（计算）
 *   → factor eval（因子检验）→ backtest + grid（策略验证）→ 结论
 */
import { Context } from '@deepseek-ai/cordis'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import { apply } from '../src/index.ts'

const ctx = new Context()
await ctx.plugin(SystemPrompt)
await ctx.plugin(ToolRuntime)
await ctx.plugin({ name: 'dsh-quant', inject: ['tools'], apply })
const signal = new AbortController().signal
const call = (name: string, args: Record<string, unknown>) =>
  ctx.tools.execute({ callId: `demo-${name}`, name, arguments: args, signal })

const section = (title: string) => console.log(`\n━━━ ${title} ━━━`)

async function run() {
  console.log('# dsh-quant R&D workflow demo（真实数据）')

  // 1. 取数
  section('1. Fetch — 取数（Binance 公共 API）')
  const btc = await call('quant_market_fetch', { symbol: 'BTCUSDT', interval: '1d', limit: 120 })
  if (btc.isError) throw new Error(String(btc.error?.message))
  const closes = btc.value.candles.map((c: { close: number }) => c.close)
  console.log(`fetched ${btc.value.candles.length} daily candles of BTCUSDT`)

  // 2. 理解数据
  section('2. Stats — 理解数据')
  const stats = await call('quant_series_stats', { values: closes })
  console.log(`n=${stats.value.count} mean=${stats.value.mean.toFixed(2)} annVol=${stats.value.annualizedVol.toFixed(2)}% ` +
    `skew=${stats.value.skew.toFixed(3)} total=${stats.value.totalReturnPct.toFixed(2)}%`)

  // 3. 信任数据
  section('3. Quality — 信任数据')
  const quality = await call('quant_data_quality', { candles: btc.value.candles })
  console.log(quality.value.healthy ? 'data healthy ✓' : `issues: ${JSON.stringify(quality.value)}`)

  // 4. 指标
  section('4. Indicators — 计算')
  const rsi = await call('quant_rsi', { values: closes, window: 14 })
  const bb = await call('quant_bollinger', { values: closes, window: 20, multiplier: 2 })
  const lastRsi = rsi.value.values[rsi.value.values.length - 1]
  const lastBb = bb.value
  console.log(`RSI(14) latest = ${lastRsi?.toFixed(2)}（>70 超买 / <30 超卖）`)
  console.log(`Bollinger(20,2) latest: upper ${lastBb.upper[lastBb.upper.length - 1]?.toFixed(2)} ` +
    `/ mid ${lastBb.middle[lastBb.middle.length - 1]?.toFixed(2)} / lower ${lastBb.lower[lastBb.lower.length - 1]?.toFixed(2)}`)

  // 5. 因子检验
  section('5. Factor eval — 因子检验（ROC 动量）')
  const roc = await call('quant_roc', { values: closes, window: 10 })
  const rocVals = roc.value.values.filter((v: unknown) => v !== null) as number[]
  const rets = closes.slice(1).map((c: number, i: number) => c / closes[i] - 1)
  const fe = await call('quant_factor_evaluate', {
    factorValues: rocVals.slice(0, 100),
    forwardReturns: rets.slice(10, 110),
    quantiles: 5,
    window: 20,
  })
  console.log(`ROC factor: IC=${fe.value.ic.toFixed(4)} ICIR=${fe.value.icir.toFixed(3)} ` +
    `longShort=${fe.value.longShort.toFixed(4)} turnover=${fe.value.turnover.toFixed(3)}`)
  console.log(`interpretation: ${Math.abs(fe.value.ic) < 0.05 ? 'IC 弱 — 当前市场该因子预测力有限（诚实结论）' : fe.value.ic > 0 ? '正向预测力' : '反向预测力'}`)

  // 6. 策略验证
  section('6. Backtest — 策略验证（MA 交叉 + 网格寻优）')
  const bt = await call('quant_backtest', { close: closes, fast: 5, slow: 20, feeRate: 0.001, stopLoss: 0.05, takeProfit: 0.15 })
  console.log(`MA(5/20) with stop/target: ${bt.value.trades.length} trades, total=${bt.value.totalReturnPct.toFixed(2)}%, ` +
    `maxDD=${bt.value.maxDrawdownPct.toFixed(2)}%, sharpe=${bt.value.sharpe.toFixed(3)}`)
  console.log(`exit reasons: ${bt.value.trades.map((t: { exitReason?: string }) => t.exitReason ?? 'open').join(', ')}`)
  const grid = await call('quant_backtest_grid', { close: closes, fastMin: 3, fastMax: 6, slowMin: 10, slowMax: 30, feeRate: 0.001 })
  console.log(`grid search: ${grid.value.results.length} combos, best (${grid.value.best.fast},${grid.value.best.slow}) ` +
    `total=${grid.value.best.totalReturnPct.toFixed(2)}%`)

  // 7. 结论
  section('7. Conclusion — 研究结论')
  console.log(`BTC 近 ${closes.length} 日：总收益 ${stats.value.totalReturnPct.toFixed(2)}%，年化波动 ${stats.value.annualizedVol.toFixed(2)}%`)
  console.log(`动量因子 IC ${fe.value.ic.toFixed(4)}，策略最优参数 (${grid.value.best.fast},${grid.value.best.slow})，`)
  console.log(`最优回测收益 ${grid.value.best.totalReturnPct.toFixed(2)}%（含手续费，样本内）`)
  console.log('\n✅ R&D workflow complete — 这就是 dsh-quant 辅助研究的标准流程。')
}

await run()
await ctx.fiber.dispose()
