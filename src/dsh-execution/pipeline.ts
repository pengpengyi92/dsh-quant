/**
 * 端到端研究管线（dsh-execution 域）：一条函数跑通 PDAT→PET 全链路。
 *
 * 数据 → 质量 → 统计 → 指标 → 回测 → 指标库 → 风控 → 回撤 → 基金 →
 * 因子 → 报告 → 图表。所有环节复用各域纯函数，输出一个可直接写进
 * 研究报告/UI 的结果包。
 */
import type { Candle, Interval, MarketProvider } from '../dsh-data/market.js'
import { fetchKlines } from '../dsh-data/market.js'
import { candlesCheck, seriesStats } from '../dsh-data/stats.js'
import { sma } from '../dsh-alpha/indicators.js'
import { factorEvaluate } from '../dsh-alpha/factor.js'
import { backtestMaCross } from '../dsh-ml/backtest.js'
import { equityMetrics, tradeMetrics } from '../dsh-ml/metrics.js'
import { riskMetrics } from '../dsh-risk/risk.js'
import { drawdownAnalysis } from '../dsh-risk/drawdown.js'
import { fundSimulate } from './fund.js'
import { generateReport } from './report.js'
import type { ChartData } from './chart.js'
import { chartBacktest, chartCandles, chartSeries } from './chart.js'

export interface PipelineOptions {
  /** 直接提供 K 线则跳过网络获取 */
  candles?: readonly Candle[]
  symbol?: string
  interval?: Interval
  limit?: number
  provider?: MarketProvider
  /** 双均线参数（默认 5/20） */
  fast?: number
  slow?: number
  feeRate?: number
  stopLoss?: number
  takeProfit?: number
  /** 因子评估窗口（默认 20） */
  factorWindow?: number
  /** 基金初始资金（默认 1 亿） */
  initialCapital?: number
}

export interface PipelineResult {
  symbol: string
  provider: string
  interval: string
  candles: { count: number; from: number; to: number }
  quality: ReturnType<typeof candlesCheck>
  stats: ReturnType<typeof seriesStats>
  metrics: ReturnType<typeof equityMetrics> & { trades: ReturnType<typeof tradeMetrics> }
  risk: ReturnType<typeof riskMetrics>
  drawdown: ReturnType<typeof drawdownAnalysis>
  fund: ReturnType<typeof fundSimulate>
  factor: ReturnType<typeof factorEvaluate>
  report: string
  charts: { candles: ChartData; equity: ChartData; underwater: ChartData }
}

/** 加密三所容错链（去重；A 股 provider 直接单点，失败即报错）。 */
async function fetchWithFallback(
  symbol: string,
  interval: Interval,
  limit: number,
  signal: AbortSignal,
  provider: MarketProvider,
): Promise<Candle[]> {
  if (provider === 'sina' || provider === 'tencent') {
    return fetchKlines(symbol, interval, limit, signal, provider)
  }
  const chain = [...new Set([provider, 'binance', 'okx', 'bybit'] as MarketProvider[])]
  let lastError: unknown
  for (const p of chain) {
    try {
      return await fetchKlines(symbol, interval, limit, signal, p)
    } catch (err) {
      lastError = err
    }
  }
  throw new Error(`all providers failed for ${symbol}: ${(lastError as Error).message}`)
}

/** 跑通全链路研究：返回可直接消费的结果包（含 Markdown 报告与图表数据）。 */
export async function researchPipeline(
  options: PipelineOptions,
  signal: AbortSignal,
): Promise<PipelineResult> {
  const interval = options.interval ?? '1d'
  const limit = options.limit ?? 120
  const provider = options.provider ?? 'binance'
  let symbol = options.symbol ?? 'BTCUSDT'
  let candles: Candle[]
  if (options.candles !== undefined && options.candles.length > 0) {
    candles = [...options.candles]
  } else {
    candles = await fetchWithFallback(symbol, interval, limit, signal, provider)
    symbol = options.symbol ?? 'BTCUSDT'
  }
  if (candles.length < 30) throw new RangeError(`pipeline needs at least 30 candles, got ${candles.length}`)
  const close = candles.map(c => c.close)
  const fast = options.fast ?? 5
  const slow = options.slow ?? 20
  if (fast >= slow) throw new RangeError(`fast ${fast} must be < slow ${slow}`)

  const quality = candlesCheck(candles)
  const stats = seriesStats(close)
  const smaValues = sma(close, slow)
  const bt = backtestMaCross(close, fast, slow, options.feeRate ?? 0.001, options.stopLoss, options.takeProfit)
  const em = equityMetrics(bt.equityCurve)
  const tm = tradeMetrics(bt.trades)
  const returns = close.slice(1).map((c, i) => c / close[i]! - 1)
  const rk = riskMetrics(returns, { confidence: 0.95 })
  const dd = drawdownAnalysis(bt.equityCurve)
  const fund = fundSimulate(bt.equityCurve, {
    initialCapital: options.initialCapital ?? 100_000_000,
    managementFeeRate: 0.02,
    performanceFeeRate: 0.2,
  })

  // 动量因子：close[t]/close[t-12]-1 预测 close[t+1]/close[t]-1
  const factorWindow = options.factorWindow ?? 20
  const f: number[] = []
  const r: number[] = []
  for (let t = 12; t < close.length - 1; t++) {
    f.push(close[t]! / close[t - 12]! - 1)
    r.push(close[t + 1]! / close[t]! - 1)
  }
  const fe = f.length >= 2 ? factorEvaluate(f, r, 5, Math.min(factorWindow, f.length)) : null

  const report = generateReport({
    strategy: `dual-MA crossover ${fast}/${slow} on ${symbol} ${interval} (${provider})`,
    metrics: {
      totalReturnPct: em.totalReturnPct,
      maxDrawdownPct: em.maxDrawdownPct,
      sharpe: em.sharpe,
      annualizedVol: em.annualizedVol,
      calmar: em.calmar,
      sortino: em.sortino,
      winRate: tm.winRate,
      profitFactor: tm.profitFactor,
      avgPeriodReturnPct: em.avgPeriodReturnPct,
    },
    risk: {
      var95: rk.var95, cvar95: rk.cvar95, maxDrawdownPct: rk.maxDrawdownPct,
      beta: rk.beta, informationRatio: rk.informationRatio, trackingError: rk.trackingError,
    },
    fund: {
      initialCapital: fund.initialCapital, finalNavNet: fund.finalNavNet,
      finalAum: fund.finalAum, netReturnPct: fund.netReturnPct,
      managementFeeTotal: fund.managementFeeTotal, performanceFeeTotal: fund.performanceFeeTotal,
    },
    factor: fe === null ? undefined : { ic: fe.ic, icir: fe.icir },
  })

  const markers = bt.trades
    .filter(t => t.exitIndex !== null)
    .map(t => ({ index: t.entryIndex, kind: 'entry' as const }))
  const chartCandleData = chartCandles(
    candles.map(c => ({ openTime: c.openTime, open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume })),
    [{ name: `SMA${slow}`, values: [...smaValues] }],
    markers,
    `${symbol} ${interval}`,
  )
  const chartEquityData = chartBacktest(bt.equityCurve, bt.trades, `${fast}/${slow} equity`)
  const chartUnderwaterData = chartSeries([{ name: 'underwater', values: [...dd.underwater] }], 'underwater')

  return {
    symbol,
    provider: options.candles !== undefined && options.candles.length > 0 ? 'fixture' : provider,
    interval,
    candles: { count: candles.length, from: candles[0]!.openTime, to: candles[candles.length - 1]!.openTime },
    quality,
    stats,
    metrics: { ...em, trades: tm },
    risk: rk,
    drawdown: dd,
    fund,
    factor: fe ?? { ic: 0, rankIc: 0, icDecay: [], icir: 0, icSeries: [], quantileReturns: [], longShort: 0, turnover: 0, autocorr1: 0, n: 0 },
    report,
    charts: { candles: chartCandleData, equity: chartEquityData, underwater: chartUnderwaterData },
  }
}
