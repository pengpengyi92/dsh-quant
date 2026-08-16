/**
 * 生成 UI demo 数据：真实回测 MVP → demos/ui-demo-data.json。
 * 运行：npx tsx demos/gen-ui-demo-data.ts（需网络）
 */
import { writeFileSync } from 'node:fs'
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
  ctx.tools.execute({ callId: `gen-${name}`, name, arguments: args, signal })

// 1. 取数 + 指标 + 回测
const btc = await call('quant_market_fetch', { symbol: 'BTCUSDT', interval: '1d', limit: 120 })
if (btc.isError) throw new Error(String(btc.error?.message))
const closes = btc.value.candles.map((c: { close: number }) => c.close)
const sma20 = await call('quant_sma', { values: closes, window: 20 })
const sma50 = await call('quant_sma', { values: closes, window: 50 })
const bt = await call('quant_backtest', { close: closes, fast: 5, slow: 20, feeRate: 0.001, stopLoss: 0.05, takeProfit: 0.15 })
const metrics = await call('quant_metrics', { equityCurve: bt.value.equityCurve, trades: bt.value.trades })
// 2. 因子（ROC）评估
const roc = await call('quant_roc', { values: closes, window: 10 })
const rocVals = roc.value.values.filter((v: unknown) => v !== null) as number[]
const rets = closes.slice(1).map((c: number, i: number) => c / closes[i] - 1)
const fe = await call('quant_factor_evaluate', { factorValues: rocVals.slice(0, 100), forwardReturns: rets.slice(10, 110), quantiles: 5, window: 20 })

const fund = await call('quant_fund', { equityCurve: bt.value.equityCurve, initialCapital: 100_000_000, managementFeeRate: 0.02, performanceFeeRate: 0.2 })

const demoData = {
  generatedAt: new Date().toISOString(),
  symbol: 'BTCUSDT',
  interval: '1d',
  candles: btc.value.candles,
  overlays: [
    { name: 'SMA20', values: sma20.value.values },
    { name: 'SMA50', values: sma50.value.values },
  ],
  equity: { name: 'MA5/20 equity', values: bt.value.equityCurve },
  trades: bt.value.trades,
  metrics: metrics.value,
  factor: { name: 'ROC(10) factor', ic: fe.value.ic, icir: fe.value.icir, longShort: fe.value.longShort, turnover: fe.value.turnover },
  fund: fund.value,
  strategy: 'dual-MA crossover (5/20), stopLoss 5%, takeProfit 15%, fee 0.1%',
}
writeFileSync(new URL('./ui-demo-data.json', import.meta.url), JSON.stringify(demoData))
console.log('generated demos/ui-demo-data.json')
console.log('summary:', JSON.stringify({ total: metrics.value.totalReturnPct.toFixed(2) + '%', maxDD: metrics.value.maxDrawdownPct.toFixed(2) + '%', sharpe: metrics.value.sharpe.toFixed(3), trades: bt.value.trades.length }))
console.log('fund:', JSON.stringify({ initial: (fund.value.initialCapital / 1e8).toFixed(2) + '亿', finalNav: fund.value.finalNavNet.toFixed(4), finalAum: (fund.value.finalAum / 1e8).toFixed(3) + '亿', net: fund.value.netReturnPct.toFixed(2) + '%' }))
await ctx.fiber.dispose()
