/**
 * 多标的并行研究 demo（可执行）：N 个标的一条命令并行跑全链路研究，
 * 单标的失败不阻断其他标的。在 dsh 会话中规模化时，把每个 symbol 交给
 * 一个 subagent（官方 subagent 包），subagent 内调用 quant_research_pipeline。
 *
 * 运行：npx tsx demos/multi-asset-research.ts
 */
import { researchMultiAsset } from '../src/dsh-execution/pipeline.js'

const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT']

const t0 = Date.now()
const { items, succeeded, failed } = await researchMultiAsset(
  symbols,
  { interval: '1d', limit: 120, fast: 5, slow: 20, factorWindow: 10 },
  new AbortController().signal,
)
const dt = ((Date.now() - t0) / 1000).toFixed(1)

console.log(`=== multi-asset research: ${succeeded}/${symbols.length} succeeded in ${dt}s ===\n`)
for (const item of items) {
  if (item.error !== null || item.result === null) {
    console.log(`❌ ${item.symbol}: ${item.error}`)
    continue
  }
  const r = item.result
  console.log(`✅ ${r.symbol} ${r.interval} (${r.provider})`)
  console.log(`   candles ${r.candles.count} | return ${r.metrics.totalReturnPct.toFixed(2)}% | maxDD ${r.metrics.maxDrawdownPct.toFixed(2)}% | sharpe ${r.metrics.sharpe.toFixed(3)}`)
  console.log(`   trades ${r.metrics.trades.tradeCount} | factor n ${r.factor.n} | IC ${r.factor.ic.toFixed(4)} | RankIC ${r.factor.rankIc.toFixed(4)}`)
  console.log(`   fund NAV ${r.fund.finalNavNet.toFixed(4)} | drawdown periods ${r.drawdown.periods.length}`)
  console.log('')
}

// 教育性收尾
console.log('=== notes ===')
console.log('- 并行度：Promise.all 全并发；单标的异常被隔离（failed 只计数不中断）')
console.log('- 规模化：在 dsh 会话里用官方 subagent 包，每个 symbol 一个 subagent 调')
console.log('  quant_research_pipeline，天然并行 + 独立上下文 + 独立容错')
console.log('- 下一步：跨标的截面比较（IC 排名 / 动量轮动）可接 quant_factor_evaluate')
