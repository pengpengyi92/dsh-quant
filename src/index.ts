/**
 * dsh-quant-indicators 插件：给模型一组纯计算技术指标工具。
 *
 * 结构遵循官方工具包约定（见 packages/AGENTS.md）：
 * - 函数插件：named-export name / inject / apply，无 default export
 * - 每个工具用 defineTool：统一 schema DSL + canonical output + render
 * - 注册是可逆 effect（ctx.tools.register 返回 disposer，fiber 释放即注销）
 *
 * 契约要点（defineTool 铁律，见 notes/03-tool-system.md）：
 * - 参数由 defineTool 校验（类型/必填/整数），DSL 表达不了的约束在 execute 手检
 * - execute 只返回 canonical 值；错误抛错 → registry 转 isError 结果
 * - 非有限数在 registry 的 lossless-JSON 参数快照层已被拒绝（模型 JSON 边界）
 * - isConcurrencySafe: true（纯函数、无共享状态、可并行）
 */
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { adx, atr, bollinger, cci, ema, kdj, macd, obv, roc, rsi, sma, williamsR } from './dsh-alpha/indicators.js'
import { backtestBollingerBreakout, backtestGrid, backtestMaCross, backtestPortfolio, backtestRsiReversion } from './dsh-ml/backtest.js'
import { portfolioOptimize } from './dsh-ml/optimizer.js'
import { layeredBacktest } from './dsh-ml/layered.js'
import { attribution } from './dsh-ml/attribution.js'
import { factorCorrelation } from './dsh-ml/factor-corr.js'
import { deflatedSharpe } from './dsh-ml/deflated-sharpe.js'
import { parameterSensitivity } from './dsh-ml/sensitivity.js'
import { INTERVALS, MARKET_PROVIDERS, fetchKlines } from './dsh-data/market.js'
import { accessReadiness, adviseChannels, channelAccessGuide, compareChannels, findChannel, searchChannels } from './dsh-data/data-guide.js'
import { annotateSeries, candlesCheck, seriesQuality, seriesStats } from './dsh-data/stats.js'
import { dataQualityReport } from './dsh-data/quality.js'
import { combineFactors, factorEvaluate } from './dsh-alpha/factor.js'
import { icDecayAnalysis } from './dsh-alpha/decay.js'
import { tradeQuality } from './dsh-execution/trade-quality.js'
import { stressTest } from './dsh-risk/stress.js'
import { chartAnnotate, chartBacktest, chartCandles, chartSeries } from './dsh-execution/chart.js'
import { equityMetrics, tradeMetrics } from './dsh-ml/metrics.js'
import { kupiecTest, riskMetrics } from './dsh-risk/risk.js'
import { resampleCandles } from './dsh-data/resample.js'
import { fundSimulate } from './dsh-execution/fund.js'
import { generateReport } from './dsh-execution/report.js'
import { fetchRepoStats } from './dsh-community/github.js'
import { fetchNpmStats } from './dsh-community/npm.js'
import { ossPulse } from './dsh-community/pulse.js'
import { factorNeutralize } from './dsh-alpha/factor.js'
import { walkForward } from './dsh-ml/walkforward.js'
import { evaluatePredictions, fitLinearModel, predictLinearModel } from './dsh-ml/linear.js'
import { drawdownAnalysis } from './dsh-risk/drawdown.js'
import { bondAnalytics } from './dsh-risk/bond.js'
import { optionAnalytics } from './dsh-risk/options.js'
import { realizedVolatility } from './dsh-risk/volatility.js'
import { executeSimulate } from './dsh-execution/execute.js'
import { researchPipeline } from './dsh-execution/pipeline.js'
import { assertAShareSymbol, assertYahooSymbol } from './dsh-data/market.js'

// ── 纯函数再导出：非 dsh 环境（任意 Node 项目）直接 import 使用 ──
// 注意：本插件仍是纯 named-export 函数插件（无 default export），Loader 不受影响。
export { adx, atr, bollinger, cci, ema, kdj, macd, obv, roc, rsi, sma, williamsR } from './dsh-alpha/indicators.js'
export { backtestBollingerBreakout, backtestGrid, backtestMaCross, backtestPortfolio, backtestRsiReversion } from './dsh-ml/backtest.js'
export { portfolioOptimize } from './dsh-ml/optimizer.js'
export { layeredBacktest } from './dsh-ml/layered.js'
export { attribution } from './dsh-ml/attribution.js'
export { factorCorrelation } from './dsh-ml/factor-corr.js'
export { deflatedSharpe } from './dsh-ml/deflated-sharpe.js'
export { parameterSensitivity } from './dsh-ml/sensitivity.js'
export { fetchKlines, parseKlines, parseOkxKlines, parseBybitKlines, parseSinaKlines, parseTencentKlines, parseYahooChart, INTERVALS, MARKET_PROVIDERS } from './dsh-data/market.js'
export { DATA_CHANNELS, accessReadiness, adviseChannels, channelAccessGuide, compareChannels, findChannel, searchChannels } from './dsh-data/data-guide.js'
export { annotateSeries, candlesCheck, seriesQuality, seriesStats } from './dsh-data/stats.js'
export { channelReliability, dataQualityReport, pitCheck, survivorshipCheck } from './dsh-data/quality.js'
export { combineFactors, factorEvaluate, factorNeutralize } from './dsh-alpha/factor.js'
export { icDecayAnalysis } from './dsh-alpha/decay.js'
export { tradeQuality } from './dsh-execution/trade-quality.js'
export { stressTest } from './dsh-risk/stress.js'
export { chartAnnotate, chartBacktest, chartCandles, chartSeries } from './dsh-execution/chart.js'
export { equityMetrics, tradeMetrics, METRIC_CATALOG } from './dsh-ml/metrics.js'
export { kupiecTest, riskMetrics } from './dsh-risk/risk.js'
export { resampleCandles } from './dsh-data/resample.js'
export { fetchRepoStats, parseRepoStats } from './dsh-community/github.js'
export { fetchNpmStats, parseNpmStats } from './dsh-community/npm.js'
export { ossPulse } from './dsh-community/pulse.js'
export { walkForward } from './dsh-ml/walkforward.js'
export { evaluatePredictions, fitLinearModel, predictLinearModel } from './dsh-ml/linear.js'
export { drawdownAnalysis } from './dsh-risk/drawdown.js'
export { bondAnalytics, priceFromYield, yieldFromPrice } from './dsh-risk/bond.js'
export { bsPrice, impliedVolatility, optionAnalytics } from './dsh-risk/options.js'
export { realizedVolatility } from './dsh-risk/volatility.js'
export { executeSimulate } from './dsh-execution/execute.js'
export { researchPipeline, researchMultiAsset } from './dsh-execution/pipeline.js'

export const name = 'dsh-quant'
export const inject = ['tools'] as const

const numberArrayParam = {
  type: 'array' as const,
  items: { type: 'number' as const },
  description: 'Price series, oldest first',
}

export function apply(ctx: Context) {
  ctx.tools.register(defineTool({
    name: 'quant_sma',
    description:
      'Compute the simple moving average (SMA) of a price series over a window. ' +
      'Returns values aligned to the input length; the first window-1 positions are null.',
    parameters: {
      values: { ...numberArrayParam, required: true },
      window: { type: 'integer', required: true, description: 'Window size (>= 1)' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          values: { type: 'array', items: { oneOf: [{ type: 'number' }, { type: 'null' }] } , required: true},
          window: { type: 'integer' , required: true},
        },
        additionalProperties: false,
      },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value.values) }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return { values: sma(args.values, args.window), window: args.window }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_ema',
    description:
      'Compute the exponential moving average (EMA) of a price series over a window ' +
      '(alpha = 2/(window+1), seed = mean of the first window). ' +
      'Returns values aligned to the input length; the first window-1 positions are null.',
    parameters: {
      values: { ...numberArrayParam, required: true },
      window: { type: 'integer', required: true, description: 'Window size (>= 1)' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          values: { type: 'array', items: { oneOf: [{ type: 'number' }, { type: 'null' }] } , required: true},
          window: { type: 'integer' , required: true},
        },
        additionalProperties: false,
      },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value.values) }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return { values: ema(args.values, args.window), window: args.window }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_rsi',
    description:
      'Compute the Relative Strength Index (RSI, Wilder smoothing) of a price series. ' +
      'Returns values aligned to the input length; the first window positions are null ' +
      '(the first valid value needs window+1 inputs).',
    parameters: {
      values: { ...numberArrayParam, required: true },
      window: { type: 'integer', description: 'Window size (>= 1), default 14' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          values: { type: 'array', items: { oneOf: [{ type: 'number' }, { type: 'null' }] } , required: true},
          window: { type: 'integer' , required: true},
        },
        additionalProperties: false,
      },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value.values) }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const window = args.window ?? 14
      return { values: rsi(args.values, window), window }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_macd',
    description:
      'Compute the MACD oscillator (fast/slow EMAs, signal EMA of the MACD line, histogram). ' +
      'All three arrays are aligned to the input length: macd has slow-1 leading nulls, ' +
      'signal and histogram have slow+signal-2 leading nulls.',
    parameters: {
      values: { ...numberArrayParam, required: true },
      fast: { type: 'integer', description: 'Fast EMA window, default 12' },
      slow: { type: 'integer', description: 'Slow EMA window, default 26' },
      signal: { type: 'integer', description: 'Signal EMA window, default 9' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          macd: { type: 'array', items: { oneOf: [{ type: 'number' }, { type: 'null' }] } , required: true},
          signal: { type: 'array', items: { oneOf: [{ type: 'number' }, { type: 'null' }] } , required: true},
          histogram: { type: 'array', items: { oneOf: [{ type: 'number' }, { type: 'null' }] } , required: true},
        },
        additionalProperties: false,
      },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return macd(args.values, args.fast ?? 12, args.slow ?? 26, args.signal ?? 9)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_bollinger',
    description:
      'Compute Bollinger Bands (middle = SMA, bands = multiplier * population standard deviation). ' +
      'Returns upper/middle/lower aligned to the input length; the first window-1 positions are null.',
    parameters: {
      values: { ...numberArrayParam, required: true },
      window: { type: 'integer', description: 'Window size (>= 1), default 20' },
      multiplier: { type: 'number', description: 'Standard-deviation multiplier, default 2' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          upper: { type: 'array', items: { oneOf: [{ type: 'number' }, { type: 'null' }] } , required: true},
          middle: { type: 'array', items: { oneOf: [{ type: 'number' }, { type: 'null' }] } , required: true},
          lower: { type: 'array', items: { oneOf: [{ type: 'number' }, { type: 'null' }] } , required: true},
          window: { type: 'integer' , required: true},
          multiplier: { type: 'number' , required: true},
        },
        additionalProperties: false,
      },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const window = args.window ?? 20
      const multiplier = args.multiplier ?? 2
      const { upper, middle, lower } = bollinger(args.values, window, multiplier)
      return { upper, middle, lower, window, multiplier }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_atr',
    description:
      'Compute the Average True Range (ATR, Wilder smoothing) from high/low/close arrays. ' +
      'Returns values aligned to the input length; the first window positions are null ' +
      '(the first valid value needs window+1 inputs).',
    parameters: {
      high: { type: 'array', items: { type: 'number' }, required: true, description: 'High prices, oldest first' },
      low: { type: 'array', items: { type: 'number' }, required: true, description: 'Low prices, oldest first' },
      close: { type: 'array', items: { type: 'number' }, required: true, description: 'Close prices, oldest first' },
      window: { type: 'integer', description: 'Window size (>= 1), default 14' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          values: { type: 'array', items: { oneOf: [{ type: 'number' }, { type: 'null' }] } , required: true},
          window: { type: 'integer' , required: true},
        },
        additionalProperties: false,
      },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value.values) }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const window = args.window ?? 14
      return { values: atr(args.high, args.low, args.close, window), window }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_market_fetch',
    description:
      'Fetch OHLCV candles for a symbol from free public APIs (no credentials). ' +
      'Returns structured candles (openTime in Unix ms, open/high/low/close/volume). ' +
      'Crypto providers binance/okx/bybit use symbols like BTCUSDT; ' +
      'A-share providers sina/tencent use sh/sz/bj + 6 digits (e.g. sh600000, tencent qfq adjusted); ' +
      'yahoo serves US/global daily klines (AAPL, ^GSPC, 0700.HK). ' +
      'Feed the close values into quant_sma / quant_ema / quant_rsi / quant_macd / ' +
      'quant_bollinger / quant_atr for indicators.',
    parameters: {
      symbol: {
        type: 'string', required: true,
        description: 'Trading pair (BTCUSDT), A-share code (sh600000), HK (hk00700), US (usAAPL / AAPL)',
      },
      interval: {
        type: 'string', enum: INTERVALS,
        description: 'Candle interval',
      },
      limit: {
        type: 'integer',
        description: 'Number of candles to fetch (1-1000), default 100',
      },
      provider: {
        type: 'string', enum: MARKET_PROVIDERS,
        description: 'Data provider: binance (default) / okx / bybit / sina / tencent / yahoo',
      },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          symbol: { type: 'string' , required: true},
          interval: { type: 'string' , required: true},
          provider: { type: 'string' , required: true},
          candles: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                openTime: { type: 'integer' , required: true},
                open: { type: 'number' , required: true},
                high: { type: 'number' , required: true},
                low: { type: 'number' , required: true},
                close: { type: 'number' , required: true},
                volume: { type: 'number' , required: true},
              },
              additionalProperties: false,
            },
            required: true,
          },
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `fetched ${value.candles.length} ${value.interval} candles of ${value.symbol} from ${value.provider} (first open ${value.candles[0]?.openTime ?? 'n/a'})`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args, exec) {
      const provider = args.provider ?? 'binance'
      if (provider === 'sina' || provider === 'tencent') {
        assertAShareSymbol(args.symbol)
      } else if (provider === 'yahoo') {
        assertYahooSymbol(args.symbol)
      } else if (!/^[A-Z0-9]+$/.test(args.symbol)) {
        throw new Error(`invalid symbol "${args.symbol}": crypto providers expect uppercase letters and digits, e.g. BTCUSDT`)
      }
      const interval = args.interval ?? '1d'
      const limit = args.limit ?? 100
      if (!Number.isInteger(limit) || limit < 1 || limit > 1000) {
        throw new Error(`limit must be an integer in [1, 1000], got ${limit}`)
      }
      const signal = AbortSignal.any([exec.signal, AbortSignal.timeout(15_000)])
      const candles = await fetchKlines(args.symbol, interval, limit, signal, provider)
      if (candles.length === 0) throw new Error(`no candles returned for ${args.symbol} ${interval}`)
      return { symbol: args.symbol, interval, provider, candles }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_backtest',
    description:
      'Backtest a dual moving-average crossover strategy on a close series: buy all-in when the fast SMA ' +
      'crosses above the slow SMA, sell all-out when it crosses below. Signals confirm on bar i and execute ' +
      'at the next bar close (no look-ahead). Returns trades, position, normalized equity curve, total return, ' +
      'max drawdown and annualized Sharpe. Feed quant_market_fetch close values or your own series.',
    parameters: {
      close: { type: 'array', items: { type: 'number' }, required: true, description: 'Close prices, oldest first' },
      fast: { type: 'integer', description: 'Fast SMA window, default 10' },
      slow: { type: 'integer', description: 'Slow SMA window, default 30' },
      feeRate: { type: 'number', description: 'Round-trip fee rate applied per side, default 0.001' },
      stopLoss: { type: 'number', description: 'Optional stop-loss as a fraction of entry price, e.g. 0.05 = 5% below entry' },
      takeProfit: { type: 'number', description: 'Optional take-profit as a fraction of entry price, e.g. 0.10 = 10% above entry' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          totalReturnPct: { type: 'number' , required: true},
          maxDrawdownPct: { type: 'number' , required: true},
          sharpe: { type: 'number' , required: true},
          position: { type: 'array', items: { oneOf: [{ type: 'integer' }, { type: 'null' }] } , required: true},
          equityCurve: { type: 'array', items: { type: 'number' } , required: true},
          trades: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                entryIndex: { type: 'integer' , required: true},
                entryPrice: { type: 'number' , required: true},
                exitIndex: { oneOf: [{ type: 'integer' }, { type: 'null' }] },
                exitPrice: { oneOf: [{ type: 'number' }, { type: 'null' }] },
                returnPct: { oneOf: [{ type: 'number' }, { type: 'null' }] },
                exitReason: { oneOf: [{ type: 'string', enum: ['signal', 'stop_loss', 'take_profit'] }, { type: 'null' }] },
              },
              additionalProperties: false,
            },
            required: true,
          },
          fast: { type: 'integer' , required: true},
          slow: { type: 'integer' , required: true},
          feeRate: { type: 'number' , required: true},
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `backtest ${args.fast ?? 10}/${args.slow ?? 30} MA cross: ${value.trades.length} trades, ` +
          `total ${value.totalReturnPct.toFixed(2)}%, maxDD ${value.maxDrawdownPct.toFixed(2)}%, sharpe ${value.sharpe.toFixed(2)}`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      if (args.close.length === 0) throw new Error('close must not be empty')
      const fast = args.fast ?? 10
      const slow = args.slow ?? 30
      const feeRate = args.feeRate ?? 0.001
      return backtestMaCross(args.close, fast, slow, feeRate, args.stopLoss, args.takeProfit)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_backtest_grid',
    description:
      'Grid-search the fast/slow windows of the dual-MA crossover strategy: run quant_backtest for every ' +
      '(fast, slow) pair in the given ranges and return results sorted by total return with the best combo. ' +
      'Pairs where fast >= slow are skipped. Use to find promising parameters before deeper analysis.',
    parameters: {
      close: { type: 'array', items: { type: 'number' }, required: true, description: 'Close prices, oldest first' },
      fastMin: { type: 'integer', description: 'Fast window lower bound, default 3' },
      fastMax: { type: 'integer', description: 'Fast window upper bound, default 10' },
      slowMin: { type: 'integer', description: 'Slow window lower bound, default 10' },
      slowMax: { type: 'integer', description: 'Slow window upper bound, default 30' },
      feeRate: { type: 'number', description: 'Round-trip fee rate applied per side, default 0.001' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                fast: { type: 'integer' , required: true},
                slow: { type: 'integer' , required: true},
                totalReturnPct: { type: 'number' , required: true},
                maxDrawdownPct: { type: 'number' , required: true},
                sharpe: { type: 'number' , required: true},
                trades: { type: 'integer' , required: true},
              },
              additionalProperties: false,
            },
            required: true,
          },
          best: {
            type: 'object',
            properties: {
              fast: { type: 'integer' , required: true},
              slow: { type: 'integer' , required: true},
              totalReturnPct: { type: 'number' , required: true},
              maxDrawdownPct: { type: 'number' , required: true},
              sharpe: { type: 'number' , required: true},
              trades: { type: 'integer' , required: true},
            },
            additionalProperties: false,
            required: true,
          },
          fastRange: {
            type: 'object',
            properties: {
              min: { type: 'integer' , required: true},
              max: { type: 'integer' , required: true},
            },
            additionalProperties: false,
            required: true,
          },
          slowRange: {
            type: 'object',
            properties: {
              min: { type: 'integer' , required: true},
              max: { type: 'integer' , required: true},
            },
            additionalProperties: false,
            required: true,
          },
          feeRate: { type: 'number' , required: true},
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `grid search ${value.fastRange.min}-${value.fastRange.max} × ${value.slowRange.min}-${value.slowRange.max}: ` +
          `${value.results.length} combos, best ${value.best.fast}/${value.best.slow} ` +
          `total ${value.best.totalReturnPct.toFixed(2)}%, maxDD ${value.best.maxDrawdownPct.toFixed(2)}%, ` +
          `${value.best.trades} trades`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      if (args.close.length === 0) throw new Error('close must not be empty')
      const fastMin = args.fastMin ?? 3
      const fastMax = args.fastMax ?? 10
      const slowMin = args.slowMin ?? 10
      const slowMax = args.slowMax ?? 30
      const feeRate = args.feeRate ?? 0.001
      return backtestGrid(args.close, fastMin, fastMax, slowMin, slowMax, feeRate)
    },
  }))
  ctx.tools.register(defineTool({
    name: 'quant_kdj',
    description:
      'Compute the KDJ stochastic oscillator (RSV method, K/D seeded at 50): K = (2*K_prev + RSV)/3, ' +
      'D = (2*D_prev + K)/3, J = 3K - 2D over a rolling high/low window. ' +
      'Returns k/d/j arrays aligned to the input length; the first window-1 positions are null.',
    parameters: {
      high: { type: 'array', items: { type: 'number' }, required: true, description: 'High prices, oldest first' },
      low: { type: 'array', items: { type: 'number' }, required: true, description: 'Low prices, oldest first' },
      close: { type: 'array', items: { type: 'number' }, required: true, description: 'Close prices, oldest first' },
      window: { type: 'integer', description: 'Window size (>= 1), default 9' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          k: { type: 'array', items: { oneOf: [{ type: 'number' }, { type: 'null' }] }, required: true },
          d: { type: 'array', items: { oneOf: [{ type: 'number' }, { type: 'null' }] }, required: true },
          j: { type: 'array', items: { oneOf: [{ type: 'number' }, { type: 'null' }] }, required: true },
        },
        additionalProperties: false,
      },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify({ k: value.k, d: value.d, j: value.j }) }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const window = args.window ?? 9
      return kdj(args.high, args.low, args.close, window)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_williams_r',
    description:
      'Compute the Williams %R oscillator: (highest high - close) / (highest high - lowest low) * -100 over a rolling window, ' +
      'range -100..0 (-20 and above = overbought, -80 and below = oversold). ' +
      'Returns values aligned to the input length; the first window-1 positions are null.',
    parameters: {
      high: { type: 'array', items: { type: 'number' }, required: true, description: 'High prices, oldest first' },
      low: { type: 'array', items: { type: 'number' }, required: true, description: 'Low prices, oldest first' },
      close: { type: 'array', items: { type: 'number' }, required: true, description: 'Close prices, oldest first' },
      window: { type: 'integer', description: 'Window size (>= 1), default 14' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          values: { type: 'array', items: { oneOf: [{ type: 'number' }, { type: 'null' }] }, required: true },
          window: { type: 'integer', required: true },
        },
        additionalProperties: false,
      },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value.values) }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const window = args.window ?? 14
      return { values: williamsR(args.high, args.low, args.close, window), window }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_cci',
    description:
      'Compute the Commodity Channel Index (CCI): (typical price - SMA of typical price) / (0.015 * mean absolute deviation). ' +
      'Readings above +100 suggest overbought, below -100 oversold. ' +
      'Returns values aligned to the input length; the first window-1 positions are null.',
    parameters: {
      high: { type: 'array', items: { type: 'number' }, required: true, description: 'High prices, oldest first' },
      low: { type: 'array', items: { type: 'number' }, required: true, description: 'Low prices, oldest first' },
      close: { type: 'array', items: { type: 'number' }, required: true, description: 'Close prices, oldest first' },
      window: { type: 'integer', description: 'Window size (>= 1), default 20' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          values: { type: 'array', items: { oneOf: [{ type: 'number' }, { type: 'null' }] }, required: true },
          window: { type: 'integer', required: true },
        },
        additionalProperties: false,
      },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value.values) }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const window = args.window ?? 20
      return { values: cci(args.high, args.low, args.close, window), window }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_obv',
    description:
      'Compute On-Balance Volume (OBV): a cumulative line that adds volume on up days and subtracts it on down days. ' +
      'Returns values aligned to the input length (first value 0, no nulls). Feed with volume from quant_market_fetch candles.',
    parameters: {
      close: { type: 'array', items: { type: 'number' }, required: true, description: 'Close prices, oldest first' },
      volume: { type: 'array', items: { type: 'number' }, required: true, description: 'Volumes, aligned with close' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          values: { type: 'array', items: { type: 'number' }, required: true },
        },
        additionalProperties: false,
      },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value.values) }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return { values: obv(args.close, args.volume) }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_adx',
    description:
      'Compute the Average Directional Index (ADX) with +DI and -DI (Wilder smoothing). ' +
      'ADX above 25 signals a trending market; +DI above -DI signals upward trend. ' +
      'plusDi/minusDi start at index window; adx starts at index 2*window-1 (earlier positions are null).',
    parameters: {
      high: { type: 'array', items: { type: 'number' }, required: true, description: 'High prices, oldest first' },
      low: { type: 'array', items: { type: 'number' }, required: true, description: 'Low prices, oldest first' },
      close: { type: 'array', items: { type: 'number' }, required: true, description: 'Close prices, oldest first' },
      window: { type: 'integer', description: 'Window size (>= 1), default 14' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          adx: { type: 'array', items: { oneOf: [{ type: 'number' }, { type: 'null' }] }, required: true },
          plusDi: { type: 'array', items: { oneOf: [{ type: 'number' }, { type: 'null' }] }, required: true },
          minusDi: { type: 'array', items: { oneOf: [{ type: 'number' }, { type: 'null' }] }, required: true },
          window: { type: 'integer', required: true },
        },
        additionalProperties: false,
      },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const window = args.window ?? 14
      const { adx: adxArr, plusDi, minusDi } = adx(args.high, args.low, args.close, window)
      return { adx: adxArr, plusDi, minusDi, window }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_roc',
    description:
      'Compute the Rate of Change (ROC): (close - close n bars ago) / close n bars ago * 100. ' +
      'Positive = upward momentum, negative = downward. ' +
      'Returns values aligned to the input length; the first window positions are null.',
    parameters: {
      values: { type: 'array', items: { type: 'number' }, required: true, description: 'Price series, oldest first' },
      window: { type: 'integer', description: 'Lookback window (>= 1), default 12' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          values: { type: 'array', items: { oneOf: [{ type: 'number' }, { type: 'null' }] }, required: true },
          window: { type: 'integer', required: true },
        },
        additionalProperties: false,
      },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value.values) }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const window = args.window ?? 12
      return { values: roc(args.values, window), window }
    },
  }))
  ctx.tools.register(defineTool({
    name: 'quant_backtest_bollinger',
    description:
      'Backtest a Bollinger-band breakout strategy: buy when close crosses above the upper band, ' +
      'sell when close crosses below the middle band (SMA), with optional stop-loss/take-profit. ' +
      'Signals confirm on bar i and execute at bar i+1 close (no look-ahead). ' +
      'Returns trades (with exitReason), position, equity curve, total return, max drawdown and Sharpe.',
    parameters: {
      close: { type: 'array', items: { type: 'number' }, required: true, description: 'Close prices, oldest first' },
      window: { type: 'integer', description: 'Bollinger window, default 20' },
      multiplier: { type: 'number', description: 'Band standard-deviation multiplier, default 2' },
      feeRate: { type: 'number', description: 'Round-trip fee rate applied per side, default 0.001' },
      stopLoss: { type: 'number', description: 'Optional stop-loss fraction of entry price, e.g. 0.05' },
      takeProfit: { type: 'number', description: 'Optional take-profit fraction of entry price, e.g. 0.10' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          totalReturnPct: { type: 'number' , required: true},
          maxDrawdownPct: { type: 'number' , required: true},
          sharpe: { type: 'number' , required: true},
          position: { type: 'array', items: { oneOf: [{ type: 'integer' }, { type: 'null' }] }, required: true},
          equityCurve: { type: 'array', items: { type: 'number' }, required: true},
          trades: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                entryIndex: { type: 'integer' , required: true},
                entryPrice: { type: 'number' , required: true},
                exitIndex: { oneOf: [{ type: 'integer' }, { type: 'null' }] },
                exitPrice: { oneOf: [{ type: 'number' }, { type: 'null' }] },
                returnPct: { oneOf: [{ type: 'number' }, { type: 'null' }] },
                exitReason: { oneOf: [{ type: 'string', enum: ['signal', 'stop_loss', 'take_profit'] }, { type: 'null' }] },
              },
              additionalProperties: false,
            },
            required: true,
          },
          fast: { type: 'integer' , required: true},
          slow: { type: 'integer' , required: true},
          feeRate: { type: 'number' , required: true},
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `bollinger breakout (${args.window ?? 20}, ${args.multiplier ?? 2}): ${value.trades.length} trades, ` +
          `total ${value.totalReturnPct.toFixed(2)}%, maxDD ${value.maxDrawdownPct.toFixed(2)}%, sharpe ${value.sharpe.toFixed(2)}`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      if (args.close.length === 0) throw new Error('close must not be empty')
      const window = args.window ?? 20
      const multiplier = args.multiplier ?? 2
      const feeRate = args.feeRate ?? 0.001
      return backtestBollingerBreakout(args.close, window, multiplier, feeRate, args.stopLoss, args.takeProfit)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_backtest_rsi',
    description:
      'Backtest an RSI mean-reversion strategy: buy when RSI crosses above buyBelow (default 30), ' +
      'sell when RSI crosses below sellAbove (default 70), with optional stop-loss/take-profit. ' +
      'Signals confirm on bar i and execute at bar i+1 close (no look-ahead). ' +
      'Returns trades (with exitReason), position, equity curve, total return, max drawdown and Sharpe.',
    parameters: {
      close: { type: 'array', items: { type: 'number' }, required: true, description: 'Close prices, oldest first' },
      rsiWindow: { type: 'integer', description: 'RSI window, default 14' },
      buyBelow: { type: 'number', description: 'Buy threshold (RSI crosses above), default 30' },
      sellAbove: { type: 'number', description: 'Sell threshold (RSI crosses below), default 70' },
      feeRate: { type: 'number', description: 'Round-trip fee rate applied per side, default 0.001' },
      stopLoss: { type: 'number', description: 'Optional stop-loss fraction of entry price, e.g. 0.05' },
      takeProfit: { type: 'number', description: 'Optional take-profit fraction of entry price, e.g. 0.10' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          totalReturnPct: { type: 'number' , required: true},
          maxDrawdownPct: { type: 'number' , required: true},
          sharpe: { type: 'number' , required: true},
          position: { type: 'array', items: { oneOf: [{ type: 'integer' }, { type: 'null' }] }, required: true},
          equityCurve: { type: 'array', items: { type: 'number' }, required: true},
          trades: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                entryIndex: { type: 'integer' , required: true},
                entryPrice: { type: 'number' , required: true},
                exitIndex: { oneOf: [{ type: 'integer' }, { type: 'null' }] },
                exitPrice: { oneOf: [{ type: 'number' }, { type: 'null' }] },
                returnPct: { oneOf: [{ type: 'number' }, { type: 'null' }] },
                exitReason: { oneOf: [{ type: 'string', enum: ['signal', 'stop_loss', 'take_profit'] }, { type: 'null' }] },
              },
              additionalProperties: false,
            },
            required: true,
          },
          fast: { type: 'integer' , required: true},
          slow: { type: 'integer' , required: true},
          feeRate: { type: 'number' , required: true},
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `rsi reversion (${args.rsiWindow ?? 14}, buy<${args.buyBelow ?? 30}, sell>${args.sellAbove ?? 70}): ` +
          `${value.trades.length} trades, total ${value.totalReturnPct.toFixed(2)}%, maxDD ${value.maxDrawdownPct.toFixed(2)}%, sharpe ${value.sharpe.toFixed(2)}`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      if (args.close.length === 0) throw new Error('close must not be empty')
      const rsiWindow = args.rsiWindow ?? 14
      const buyBelow = args.buyBelow ?? 30
      const sellAbove = args.sellAbove ?? 70
      const feeRate = args.feeRate ?? 0.001
      return backtestRsiReversion(args.close, rsiWindow, buyBelow, sellAbove, feeRate, args.stopLoss, args.takeProfit)
    },
  }))
  ctx.tools.register(defineTool({
    name: 'quant_backtest_portfolio',
    description:
      'Backtest a multi-asset portfolio: initial allocation by weights, optional periodic rebalancing ' +
      'back to target weights every rebalanceEvery bars, two-sided fees on all trades. ' +
      'Returns normalized equity curve, total return, max drawdown, Sharpe, final weights and rebalance count.',
    parameters: {
      assets: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', required: true },
            close: { type: 'array', items: { type: 'number' }, required: true },
          },
          additionalProperties: false,
        },
        required: true,
        description: 'Assets with equal-length close series, e.g. from quant_market_fetch per symbol',
      },
      weights: {
        type: 'array', items: { type: 'number' },
        description: 'Optional target weights summing to 1; defaults to equal weight',
      },
      rebalanceEvery: {
        type: 'integer',
        description: 'Optional rebalance period in bars; omit for buy-and-hold',
      },
      feeRate: { type: 'number', description: 'Round-trip fee rate applied per side, default 0.001' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          totalReturnPct: { type: 'number' , required: true},
          maxDrawdownPct: { type: 'number' , required: true},
          sharpe: { type: 'number' , required: true},
          equityCurve: { type: 'array', items: { type: 'number' }, required: true},
          assetNames: { type: 'array', items: { type: 'string' }, required: true},
          finalWeights: { type: 'array', items: { type: 'number' }, required: true},
          rebalances: { type: 'integer' , required: true},
          feeRate: { type: 'number' , required: true},
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `portfolio [${value.assetNames.join(', ')}]: total ${value.totalReturnPct.toFixed(2)}%, ` +
          `maxDD ${value.maxDrawdownPct.toFixed(2)}%, sharpe ${value.sharpe.toFixed(2)}, rebalances ${value.rebalances}`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const feeRate = args.feeRate ?? 0.001
      return backtestPortfolio(args.assets, args.weights, args.rebalanceEvery, feeRate)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_portfolio_optimize',
    description:
      'Portfolio weight optimizer: maxSharpe (mean-variance), minVar (minimum variance), or riskParity ' +
      '(equal risk contribution). Input: return matrix (rows = time, cols = assets). Returns weights (non-negative, ' +
      'sum 1), portfolio annual return/vol/Sharpe, per-asset Sharpe, and concentration. ' +
      'Use quant_backtest_portfolio to backtest the optimized weights.',
    parameters: {
      returns: {
        type: 'array', items: { type: 'array', items: { type: 'number' } },
        required: true,
        description: 'Return matrix: rows = time points, cols = assets (all rows same length)',
      },
      method: {
        type: 'string', enum: ['maxSharpe', 'minVar', 'riskParity'],
        description: 'Optimization objective (default maxSharpe)',
      },
      iterations: {
        type: 'integer',
        description: 'Risk-parity iterations (default 50)',
      },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          method: { type: 'string', enum: ['maxSharpe', 'minVar', 'riskParity'], required: true },
          weights: { type: 'array', items: { type: 'number' }, required: true },
          annualReturnPct: { type: 'number', required: true },
          annualVolPct: { type: 'number', required: true },
          sharpe: { type: 'number', required: true },
          assetSharpe: { type: 'array', items: { type: 'number' }, required: true },
          concentration: { type: 'number', required: true },
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `${value.method}: weights [${value.weights.map((w: number) => w.toFixed(3)).join(', ')}], ` +
          `annRet ${value.annualReturnPct.toFixed(1)}%, annVol ${value.annualVolPct.toFixed(1)}%, ` +
          `Sharpe ${value.sharpe.toFixed(2)}, conc ${value.concentration.toFixed(3)}`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return portfolioOptimize(args.returns, args.method, args.iterations)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_data_guide',
    description:
      'Guide to China A-share / financial data channels: query by channel name (akshare, baostock, tushare, ' +
      'wind, ifind, sse, szse, csindex) or by data type (行情/财务/宏观/期货/指数/基金…). ' +
      'Returns structured channel info: url, cost, data types, setup steps, tutorials, best-for. ' +
      'This plugin ships channel knowledge, not data APIs — users bring their own credentials and budgets.',
    parameters: {
      query: {
        type: 'string',
        description: 'Channel name or data type to search, e.g. "tushare", "日线行情", "财务" (omit when channel is given)',
      },
      channel: {
        type: 'string',
        description: 'Exact channel name to fetch one detailed record (takes precedence over query)',
      },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          query: { type: 'string' , required: true},
          results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' , required: true},
                displayName: { type: 'string' , required: true},
                category: { type: 'string' , required: true},
                url: { type: 'string' , required: true},
                cost: { type: 'string' , required: true},
                dataTypes: { type: 'array', items: { type: 'string' }, required: true},
                setup: { type: 'array', items: { type: 'string' }, required: true},
                tutorialUrls: { type: 'array', items: { type: 'string' }, required: true},
                bestFor: { type: 'string' , required: true},
                notes: { type: 'string' },
                matchReason: { type: 'string' , required: true},
              },
              additionalProperties: false,
            },
            required: true,
          },
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `data guide for "${args.query}": ${value.results.map(r => r.displayName).join(', ') || 'no matches'}`
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      if (args.channel) {
        const c = findChannel(args.channel)
        if (c === undefined) throw new Error(`unknown channel "${args.channel}"`)
        return { query: args.channel, results: [{ ...c, matchReason: `exact channel "${args.channel}"` }] }
      }
      if (args.query === undefined) throw new Error('provide either query or channel')
      const results = searchChannels(args.query).map(r => ({ ...r.channel, matchReason: r.matchReason }))
      return { query: args.query, results }
    },
  }))
  ctx.tools.register(defineTool({
    name: 'quant_data_compare',
    description:
      'Compare A-share data channels for one data type (e.g. 日线行情, 财务, 宏观, 期货): ' +
      'returns every channel with whether it covers the type, its cost/tier and best-for. ' +
      'Channels that cover the type come first. Pair with quant_data_guide for full channel details.',
    parameters: {
      dataType: { type: 'string', required: true, description: 'Data type to compare, e.g. "日线行情", "财务", "宏观"' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          dataType: { type: 'string' , required: true},
          channels: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' , required: true},
                displayName: { type: 'string' , required: true},
                cost: { type: 'string' , required: true},
                covers: { type: 'boolean' , required: true},
                bestFor: { type: 'string' , required: true},
              },
              additionalProperties: false,
            },
            required: true,
          },
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `channels covering "${args.dataType}": ${value.channels.filter(c => c.covers).map(c => c.displayName).join(', ') || 'none'}`
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return compareChannels(args.dataType)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_data_advice',
    description:
      'Recommend A-share data channels for a need: data type + budget (free/low/institutional) + purpose ' +
      '(research/backtest/official). Returns a ranked list with reasons. ' +
      'This is channel navigation, not data provisioning — users bring their own credentials and budgets.',
    parameters: {
      dataType: { type: 'string', required: true, description: 'Data type needed, e.g. "日线行情", "财务"' },
      budget: {
        type: 'string', enum: ['free', 'low', 'institutional'],
        description: 'Budget tier: free (默认) / low (可小额付费如 tushare 积分) / institutional (有机构账号)',
      },
      purpose: {
        type: 'string', enum: ['research', 'backtest', 'official'],
        description: 'Purpose: research (默认) / backtest / official (权威合规)',
      },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                rank: { type: 'integer' , required: true},
                name: { type: 'string' , required: true},
                displayName: { type: 'string' , required: true},
                reason: { type: 'string' , required: true},
              },
              additionalProperties: false,
            },
            required: true,
          },
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `advice for ${args.dataType}: ${value.recommendations.map(r => r.displayName).join(' > ') || 'no channel covers this type'}`
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const recommendations = adviseChannels({
        dataType: args.dataType,
        budget: args.budget,
        purpose: args.purpose,
      })
      if (recommendations.length === 0) {
        throw new Error(`no channel covers data type "${args.dataType}"`)
      }
      return { recommendations }
    },
  }))
  ctx.tools.register(defineTool({
    name: 'quant_series_stats',
    description:
      'Descriptive statistics for a numeric series: count, mean, std, min/max, median, skewness, excess ' +
      'kurtosis, lag-1 autocorrelation, annualized volatility (sqrt(365) of period returns) and total return %. ' +
      'Run this first after fetching data to understand the series before applying indicators or backtests.',
    parameters: {
      values: { type: 'array', items: { type: 'number' }, required: true, description: 'Numeric series (e.g. closes), oldest first' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          count: { type: 'integer' , required: true},
          mean: { type: 'number' , required: true},
          std: { type: 'number' , required: true},
          min: { type: 'number' , required: true},
          max: { type: 'number' , required: true},
          median: { type: 'number' , required: true},
          skew: { type: 'number' , required: true},
          kurtosis: { type: 'number' , required: true},
          autocorr1: { type: 'number' , required: true},
          annualizedVol: { type: 'number' , required: true},
          totalReturnPct: { type: 'number' , required: true},
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `stats (n=${value.count}): mean ${value.mean.toFixed(4)}, std ${value.std.toFixed(4)}, ` +
          `min ${value.min}, max ${value.max}, skew ${value.skew.toFixed(3)}, kurt ${value.kurtosis.toFixed(3)}, ` +
          `annVol ${value.annualizedVol.toFixed(2)}%, total ${value.totalReturnPct.toFixed(2)}%`
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return seriesStats(args.values)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_data_quality',
    description:
      'Check OHLCV candle health before analysis: high<low violations, non-positive prices, ' +
      'non-increasing timestamps, time gaps (uneven intervals), and extreme moves (>50% close change). ' +
      'Returns counts per issue plus a healthy flag. Feed quant_market_fetch candles directly.',
    parameters: {
      candles: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            openTime: { type: 'integer', required: true },
            open: { type: 'number', required: true },
            high: { type: 'number', required: true },
            low: { type: 'number', required: true },
            close: { type: 'number', required: true },
            volume: { type: 'number', required: true },
          },
          additionalProperties: false,
        },
        required: true,
        description: 'OHLCV candles as returned by quant_market_fetch',
      },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          count: { type: 'integer' , required: true},
          highBelowLow: { type: 'integer' , required: true},
          nonPositive: { type: 'integer' , required: true},
          timeNotIncreasing: { type: 'integer' , required: true},
          timeGaps: { type: 'integer' , required: true},
          extremeMoves: { type: 'integer' , required: true},
          healthy: { type: 'boolean' , required: true},
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: value.healthy
          ? `data quality: healthy (${value.count} candles)`
          : `data quality: ${value.count} candles, issues — high<low ${value.highBelowLow}, ` +
            `nonPositive ${value.nonPositive}, time ${value.timeNotIncreasing}, gaps ${value.timeGaps}, ` +
            `extremeMoves ${value.extremeMoves}`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return candlesCheck(args.candles)
    },
  }))
  ctx.tools.register(defineTool({
    name: 'quant_series_quality',
    description:
      'Quality check for a raw numeric series: missing (non-finite) values, z-score outliers (>3σ), ' +
      'jumps (adjacent change above threshold, default 20%), and frozen runs (consecutive identical values >= 3). ' +
      'Returns counts plus a healthy flag. Use before indicators/backtests; pair with quant_data_annotate for point-level labels.',
    parameters: {
      values: { type: 'array', items: { type: 'number' }, required: true, description: 'Numeric series to check' },
      jumpThreshold: { type: 'number', description: 'Adjacent-change threshold as fraction, default 0.2' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          count: { type: 'integer' , required: true},
          missingCount: { type: 'integer' , required: true},
          zOutliers: { type: 'integer' , required: true},
          jumps: { type: 'integer' , required: true},
          longestConstantRun: { type: 'integer' , required: true},
          healthy: { type: 'boolean' , required: true},
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: value.healthy
          ? `series quality: healthy (${value.count} points)`
          : `series quality: ${value.count} points, missing ${value.missingCount}, z-outliers ${value.zOutliers}, jumps ${value.jumps}, frozen-run ${value.longestConstantRun}`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return seriesQuality(args.values, args.jumpThreshold)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_data_annotate',
    description:
      'Annotate a numeric series point by point: labels every issue as missing / z_outlier / jump_up / jump_down / ' +
      'frozen with index, severity (1 hint, 2 clear, 3 needs human review) and a detail string. ' +
      'Inspired by the Scale AI data-labeling philosophy: quality is not one verdict but locatable, reviewable, ' +
      'governable per-point labels. Welcome PRs for more annotation dimensions.',
    parameters: {
      values: { type: 'array', items: { type: 'number' }, required: true, description: 'Numeric series to annotate' },
      jumpThreshold: { type: 'number', description: 'Adjacent-change threshold as fraction, default 0.2' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          count: { type: 'integer' , required: true},
          annotations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                index: { type: 'integer', required: true },
                label: { type: 'string', enum: ['missing', 'z_outlier', 'jump_up', 'jump_down', 'frozen'], required: true },
                severity: { type: 'integer', enum: [1, 2, 3], required: true },
                detail: { type: 'string', required: true },
              },
              additionalProperties: false,
            },
            required: true,
          },
          summary: {
            type: 'object',
            properties: {
              missing: { type: 'integer', required: true },
              zOutliers: { type: 'integer', required: true },
              jumps: { type: 'integer', required: true },
              frozen: { type: 'integer', required: true },
            },
            additionalProperties: false,
            required: true,
          },
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `annotations: ${value.annotations.length} issues (missing ${value.summary.missing}, z-outliers ${value.summary.zOutliers}, jumps ${value.summary.jumps}, frozen ${value.summary.frozen})`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return annotateSeries(args.values, args.jumpThreshold)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_data_pit',
    description:
      'AI-infra level data quality report on a value series: point-in-time check (look-ahead step detection), ' +
      'survivorship check (silent missing segments, tail truncation), and channel reliability ranking. ' +
      'Returns a health score 0-1 and per-check notes. Feed any price/return series (null = missing).',
    parameters: {
      values: {
        type: 'array', items: { oneOf: [{ type: 'number' }, { type: 'null' }] },
        required: true,
        description: 'Time-ordered series; null marks missing points',
      },
      channels: {
        type: 'array', items: { type: 'string' },
        description: 'Optional data channel names (e.g. binance, akshare, wind) for reliability ranking',
      },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          healthScore: { type: 'number', required: true },
          pit: {
            type: 'object',
            properties: {
              pass: { type: 'boolean', required: true },
              lookAheadIndices: { type: 'array', items: { type: 'integer' }, required: true },
              notes: { type: 'array', items: { type: 'string' }, required: true },
            },
            additionalProperties: false,
            required: true,
          },
          survivorship: {
            type: 'object',
            properties: {
              continuous: { type: 'boolean', required: true },
              gaps: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    start: { type: 'integer', required: true },
                    end: { type: 'integer', required: true },
                  },
                  additionalProperties: false,
                },
                required: true,
              },
              tailTruncated: { type: 'boolean', required: true },
              notes: { type: 'array', items: { type: 'string' }, required: true },
            },
            additionalProperties: false,
            required: true,
          },
          channels: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                channel: { type: 'string', required: true },
                reliability: { type: 'number', required: true },
                cost: { type: 'string', enum: ['free', 'paid', 'freemium'], required: true },
                risks: { type: 'array', items: { type: 'string' }, required: true },
              },
              additionalProperties: false,
            },
            required: true,
          },
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `data PIT: health ${(value.healthScore * 100).toFixed(0)}/100 — ` +
          `PIT ${value.pit.pass ? 'pass' : value.pit.lookAheadIndices.length + ' steps'}, ` +
          `survivorship ${value.survivorship.continuous ? 'continuous' : value.survivorship.gaps.length + ' gaps'}` +
          (value.channels.length > 0 ? `, top channel ${value.channels[0].channel}` : ''),
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return dataQualityReport(args.values, args.channels)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_channel_guide',
    description:
      'Data channel access guide for agents: copy-paste setup steps, prerequisites, example call, and fallback ' +
      'for a named channel (akshare/tushare/baostock/binance/okx/bybit/yahoo/sina/tencent/wind/ifind). ' +
      'With --check it also reports access readiness (paid? needs credentials?).',
    parameters: {
      channel: { type: 'string', required: true, description: 'Channel name, e.g. akshare' },
      check: { type: 'boolean', description: 'Also return access readiness assessment' },
      hasCredentials: { type: 'boolean', description: 'Whether credentials are already available (for readiness)' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          channel: { type: 'string', required: true },
          displayName: { type: 'string', required: true },
          steps: { type: 'array', items: { type: 'string' }, required: true },
          prerequisites: { type: 'array', items: { type: 'string' }, required: true },
          example: { type: 'string', required: true },
          fallback: { type: 'string', required: true },
          readiness: {
            oneOf: [
              {
                type: 'object',
                properties: {
                  ready: { type: 'boolean', required: true },
                  blockers: { type: 'array', items: { type: 'string' }, required: true },
                  actions: { type: 'array', items: { type: 'string' }, required: true },
                },
                additionalProperties: false,
              },
              { type: 'null' },
            ],
          },
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `${value.displayName}: ${value.steps.length} steps` +
          (value.prerequisites.length > 0 ? `, needs ${value.prerequisites.join('; ')}` : '') +
          (value.readiness ? `, ready=${value.readiness.ready}` : ''),
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const guide = channelAccessGuide(args.channel)
      if (args.check) {
        const readiness = accessReadiness(args.channel, args.hasCredentials)
        return { ...guide, readiness }
      }
      return { ...guide, readiness: null }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_factor_evaluate',
    description:
      'Evaluate a predictive factor against forward returns (alphalens-style): IC (Pearson of factor vs next-period return), ' +
      'RankIC (Spearman rank correlation), IC decay across horizons, ICIR (rolling-IC stability), quantile bucket returns ' +
      '(default 5 groups by factor value), long-short spread, turnover (group-change frequency) and factor autocorrelation. ' +
      'Pass single-asset time series (factor[i] predicts forwardReturns[i+1]) or flattened cross-sections. ' +
      'This plugin ships methods, not data — adapt your own series.',
    parameters: {
      factorValues: { type: 'array', items: { type: 'number' }, required: true, description: 'Factor values over time, oldest first' },
      forwardReturns: { type: 'array', items: { type: 'number' }, required: true, description: 'Next-period returns aligned so factor[i] predicts forwardReturns[i+1]' },
      quantiles: { type: 'integer', description: 'Number of quantile buckets, default 5' },
      window: { type: 'integer', description: 'Rolling-IC window, default 20' },
      decayHorizons: { type: 'integer', description: 'IC decay horizons, default 5' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          ic: { type: 'number' , required: true},
          rankIc: { type: 'number' , required: true},
          icDecay: { type: 'array', items: { type: 'number' }, required: true},
          icir: { type: 'number' , required: true},
          icSeries: { type: 'array', items: { type: 'number' }, required: true},
          quantileReturns: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                quantile: { type: 'integer', required: true },
                meanReturn: { type: 'number', required: true },
                count: { type: 'integer', required: true },
              },
              additionalProperties: false,
            },
            required: true,
          },
          longShort: { type: 'number' , required: true},
          turnover: { type: 'number' , required: true},
          autocorr1: { type: 'number' , required: true},
          n: { type: 'integer' , required: true},
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `factor eval (n=${value.n}): IC ${value.ic.toFixed(4)}, RankIC ${value.rankIc.toFixed(4)}, ICIR ${value.icir.toFixed(3)}, ` +
          `IC decay [${value.icDecay.map((x: number) => x.toFixed(3)).join(', ')}], ` +
          `long-short ${value.longShort.toFixed(4)}, turnover ${value.turnover.toFixed(3)}, autocorr ${value.autocorr1.toFixed(3)}`
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return factorEvaluate(args.factorValues, args.forwardReturns, args.quantiles, args.window, args.decayHorizons)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_ic_decay',
    description:
      'Analyze how a factor prediction decays across horizons: IC per horizon h (factor[i] vs cumulative returns[i+1..i+h]), ' +
      'half-life (horizon where IC halves), best horizon (IC still above half-peak), and signal type (short/medium/long). ' +
      'Feed a factor series and its matching return series. Use to choose rebalance frequency before backtesting.',
    parameters: {
      factor: {
        type: 'array', items: { type: 'number' },
        required: true,
        description: 'Factor values (time series)',
      },
      returns: {
        type: 'array', items: { type: 'number' },
        required: true,
        description: 'Return series, same length as factor (factor[i] predicts returns[i+1..])',
      },
      maxHorizon: {
        type: 'integer',
        description: 'Max horizon to test (default 10)',
      },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          horizons: { type: 'array', items: { type: 'integer' }, required: true },
          icByHorizon: { type: 'array', items: { type: 'number' }, required: true },
          halfLife: { type: 'integer', required: true },
          bestHorizon: { type: 'integer', required: true },
          peakIc: { type: 'number', required: true },
          peakHorizon: { type: 'integer', required: true },
          signalType: { type: 'string', enum: ['short', 'medium', 'long'], required: true },
          notes: { type: 'array', items: { type: 'string' }, required: true },
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `IC decay: peak ${value.peakIc.toFixed(4)} @ h=${value.peakHorizon}, half-life h=${value.halfLife}, ` +
          `best h=${value.bestHorizon}, type ${value.signalType}`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return icDecayAnalysis(args.factor, args.returns, args.maxHorizon)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_factor_combine',
    description:
      'Combine multiple factors into one signal: z-score standardize each factor, weighted-sum (default equal weight), ' +
      'then cross-sectional rank-normalize to 0..1 (higher = better). Pass factor arrays of equal length. ' +
      'Use quant_factor_evaluate on the combined signal to validate it.',
    parameters: {
      factors: {
        type: 'array', items: { type: 'array', items: { type: 'number' } },
        required: true,
        description: 'Factor series of equal length, e.g. [[momentum...], [reversal...]]',
      },
      weights: {
        type: 'array', items: { type: 'number' },
        description: 'Optional weights summing to 1; defaults to equal weight',
      },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          signal: { type: 'array', items: { type: 'number' }, required: true},
          effectiveWeights: { type: 'array', items: { type: 'number' }, required: true},
          factorCount: { type: 'integer' , required: true},
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `combined signal from ${value.factorCount} factors (${value.effectiveWeights.map(w => w.toFixed(2)).join('/')}), ` +
          `range ${Math.min(...value.signal).toFixed(3)}..${Math.max(...value.signal).toFixed(3)}`
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return combineFactors(args.factors, args.weights)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_layered_backtest',
    description:
      'Layered backtest: split assets into quantile layers each period by factor, hold the top layer (long) ' +
      'and bottom layer (short), rebalance every `horizon` bars with fees. Returns top/bottom/long-short equity ' +
      'curves, returns, and per-layer mean returns. Bridge from factor evaluation to a strategy sketch. ' +
      'Feed quant_factor_evaluate-style factor + return matrices.',
    parameters: {
      factor: {
        type: 'array', items: { type: 'array', items: { type: 'number' } },
        required: true,
        description: 'Factor matrix [time][asset]',
      },
      returns: {
        type: 'array', items: { type: 'array', items: { type: 'number' } },
        required: true,
        description: 'Return matrix [time][asset], same shape as factor',
      },
      layers: { type: 'integer', description: 'Number of layers (default 5)' },
      horizon: { type: 'integer', description: 'Rebalance period in bars (default 5)' },
      feeRate: { type: 'number', description: 'One-way fee (default 0.001)' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          layers: { type: 'integer', required: true },
          topEquity: { type: 'array', items: { type: 'number' }, required: true },
          bottomEquity: { type: 'array', items: { type: 'number' }, required: true },
          longShortEquity: { type: 'array', items: { type: 'number' }, required: true },
          topReturnPct: { type: 'number', required: true },
          bottomReturnPct: { type: 'number', required: true },
          longShortReturnPct: { type: 'number', required: true },
          rebalances: { type: 'integer', required: true },
          layerMeanReturnPct: { type: 'array', items: { type: 'number' }, required: true },
          notes: { type: 'array', items: { type: 'string' }, required: true },
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `layered backtest (${value.layers} layers): long-short ${value.longShortReturnPct.toFixed(2)}%, ` +
          `top ${value.topReturnPct.toFixed(2)}%, bottom ${value.bottomReturnPct.toFixed(2)}%, ${value.rebalances} rebalances`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return layeredBacktest(args.factor, args.returns, args.layers, args.horizon, args.feeRate)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_attribution',
    description:
      'Portfolio attribution: per-asset contribution (weight × return), optional factor-exposure contribution ' +
      'via regression (with R² and residual alpha). Input return matrix [time][asset], weights (sum 1), ' +
      'and optional factor exposures [time][asset][factor]. Answers "where did the return come from".',
    parameters: {
      returns: {
        type: 'array', items: { type: 'array', items: { type: 'number' } },
        required: true,
        description: 'Return matrix [time][asset]',
      },
      weights: {
        type: 'array', items: { type: 'number' },
        required: true,
        description: 'Asset weights (sum to 1)',
      },
      factorExposures: {
        type: 'array', items: { type: 'array', items: { type: 'array', items: { type: 'number' } } },
        description: 'Optional factor exposures [time][asset][factor]',
      },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          totalReturnPct: { type: 'number', required: true },
          assetContributionsPct: { type: 'array', items: { type: 'number' }, required: true },
          assetContribShares: { type: 'array', items: { type: 'number' }, required: true },
          factorContributionsPct: { type: 'array', items: { type: 'number' }, required: true },
          residualPct: { type: 'number', required: true },
          factorR2: { type: 'number', required: true },
          notes: { type: 'array', items: { type: 'string' }, required: true },
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `attribution: total ${value.totalReturnPct.toFixed(2)}%` +
          (value.factorContributionsPct.length > 0
            ? `, factor R² ${value.factorR2.toFixed(2)}, residual alpha ${value.residualPct.toFixed(2)}%`
            : '' ),
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return attribution(args.returns, args.weights, args.factorExposures)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_factor_correlation',
    description:
      'Factor correlation analysis: pairwise Pearson matrix, high-correlation pairs (|ρ|>threshold), mean |ρ|, ' +
      'and effective independent factor count (eigenvalue-based). Answers "are my factors redundant". ' +
      'Feed factor series of equal length; use to deduplicate before combining.',
    parameters: {
      factors: {
        type: 'array', items: { type: 'array', items: { type: 'number' } },
        required: true,
        description: 'Factor series of equal length, e.g. [[momentum...], [value...]]',
      },
      factorNames: { type: 'array', items: { type: 'string' }, description: 'Optional factor names' },
      threshold: { type: 'number', description: 'High-correlation threshold (default 0.7)' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          factorNames: { type: 'array', items: { type: 'string' }, required: true },
          correlationMatrix: { type: 'array', items: { type: 'array', items: { type: 'number' } }, required: true },
          highCorrelationPairs: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                i: { type: 'integer', required: true },
                j: { type: 'integer', required: true },
                correlation: { type: 'number', required: true },
              },
              additionalProperties: false,
            },
            required: true,
          },
          meanAbsCorrelation: { type: 'number', required: true },
          effectiveFactorCount: { type: 'number', required: true },
          notes: { type: 'array', items: { type: 'string' }, required: true },
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `factor correlation: ${value.factorNames.length} factors, mean |ρ| ${value.meanAbsCorrelation.toFixed(2)}, ` +
          `effective ${value.effectiveFactorCount.toFixed(1)}, ${value.highCorrelationPairs.length} high pairs`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return factorCorrelation(args.factors, args.factorNames, args.threshold)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_deflated_sharpe',
    description:
      'Deflated Sharpe Ratio (Bailey & López de Prado): correct an observed Sharpe for the number of trials ' +
      '(parameter searches, factor counts, strategy counts) and series length. Returns the minimum significant ' +
      'Sharpe, deflated Sharpe, p-value, and a significant flag. Use after any backtest that involved tuning — ' +
      'the gold standard against overfitting.',
    parameters: {
      observedSharpe: { type: 'number', required: true, description: 'Observed annualized Sharpe from the backtest' },
      numPeriods: { type: 'integer', required: true, description: 'Number of return periods (e.g. trading days)' },
      numTrials: { type: 'integer', description: 'Number of trials/parameter-combinations tried (default 1)' },
      skewness: { type: 'number', description: 'Return skewness (default 0)' },
      kurtosis: { type: 'number', description: 'Excess kurtosis (default 0)' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          observedSharpe: { type: 'number', required: true },
          minSignificantSharpe: { type: 'number', required: true },
          deflatedSharpe: { type: 'number', required: true },
          significant: { type: 'boolean', required: true },
          pValue: { type: 'number', required: true },
          notes: { type: 'array', items: { type: 'string' }, required: true },
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `deflated Sharpe: observed ${value.observedSharpe.toFixed(2)} vs min-significant ${value.minSignificantSharpe.toFixed(2)} — ` +
          `${value.significant ? 'SIGNIFICANT (passes)' : 'NOT significant (overfit risk)'} (p=${value.pValue.toFixed(3)})`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return deflatedSharpe(args.observedSharpe, args.numPeriods, args.numTrials, args.skewness, args.kurtosis)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_parameter_sensitivity',
    description:
      'Parameter sensitivity analysis: scan a strategy parameter across [base×(1±range)] grid, evaluate a metric ' +
      'function at each point, and report robustness (0 = needle-sharp optimal, 1 = flat plateau). ' +
      'Pass a callback via the metricFn identifier — in dsh, provide the backtest metric values directly ' +
      'as an array, or use the tool with a small grid to detect overfitting.',
    parameters: {
      baseValue: { type: 'number', required: true, description: 'Base parameter value' },
      range: { type: 'number', description: 'Scan range ratio, e.g. 0.2 = ±20% (default 0.2)' },
      steps: { type: 'integer', description: 'Grid steps including base (default 9)' },
      metricValues: {
        type: 'array', items: { type: 'number' },
        description: 'Pre-computed metric at each grid point (alternative to metricFn)',
      },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          paramName: { type: 'string', required: true },
          values: { type: 'array', items: { type: 'number' }, required: true },
          metricValues: { type: 'array', items: { type: 'number' }, required: true },
          baseValue: { type: 'number', required: true },
          robustness: { type: 'number', required: true },
          bestValue: { type: 'number', required: true },
          bestMetric: { type: 'number', required: true },
          worstMetric: { type: 'number', required: true },
          notes: { type: 'array', items: { type: 'string' }, required: true },
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `sensitivity: base ${value.baseValue} → best ${value.bestValue.toFixed(3)} (${value.bestMetric.toFixed(3)}), ` +
          `robustness ${value.robustness.toFixed(2)}`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const steps = args.steps ?? 9
      const range = args.range ?? 0.2
      // 用传入的 metricValues 直接构造（避免回调序列化问题）
      const values: number[] = []
      for (let s = 0; s < steps; s++) {
        const frac = s / (steps - 1)
        values.push(args.baseValue * (1 - range + 2 * range * frac))
      }
      const metricValues = args.metricValues ?? values.map(() => 0)
      return parameterSensitivity(args.baseValue, range, steps, (v) => {
        const idx = values.indexOf(v)
        return idx >= 0 ? metricValues[idx]! : 0
      })
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_chart',
    description:
      'Build structured chart data (dsh-chart protocol) for a frontend renderer: ' +
      'kind candles (K-lines + overlay series like SMA + entry/exit/stop/target markers), ' +
      'kind series (equity curves, IC series), or kind annotations (series + point-level labels with severity 1/2/3). ' +
      'Feed it quant_market_fetch candles, indicator outputs, backtest trades, or quant_data_annotate results. ' +
      'The chart data is renderer-neutral — dsh-quant-ui consumes it.',
    parameters: {
      kind: { type: 'string', enum: ['candles', 'series', 'annotations'], required: true, description: 'Chart kind' },
      title: { type: 'string', description: 'Chart title' },
      candles: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            openTime: { type: 'integer', required: true },
            open: { type: 'number', required: true },
            high: { type: 'number', required: true },
            low: { type: 'number', required: true },
            close: { type: 'number', required: true },
            volume: { type: 'number', required: true },
          },
          additionalProperties: false,
        },
        description: 'For kind candles: OHLCV candles from quant_market_fetch',
      },
      overlays: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', required: true },
            values: { type: 'array', items: { oneOf: [{ type: 'number' }, { type: 'null' }] }, required: true },
          },
          additionalProperties: false,
        },
        description: 'For kind candles: overlay series (e.g. SMA/EMA aligned to candles)',
      },
      markers: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            index: { type: 'integer', required: true },
            kind: { type: 'string', enum: ['entry', 'exit', 'stop', 'target'], required: true },
          },
          additionalProperties: false,
        },
        description: 'For kind candles: trade markers at candle indices',
      },
      series: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', required: true },
            values: { type: 'array', items: { oneOf: [{ type: 'number' }, { type: 'null' }] }, required: true },
          },
          additionalProperties: false,
        },
        description: 'For kind series: named series (e.g. equity curve)',
      },
      values: {
        type: 'array', items: { oneOf: [{ type: 'number' }, { type: 'null' }] },
        description: 'For kind annotations: the base series',
      },
      annotations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            index: { type: 'integer', required: true },
            label: { type: 'string', required: true },
            severity: { type: 'integer', enum: [1, 2, 3], required: true },
          },
          additionalProperties: false,
        },
        description: 'For kind annotations: point-level labels (from quant_data_annotate)',
      },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          kind: { type: 'string' , required: true},
          title: { type: 'string' , required: true},
          candles: { type: 'array', items: { type: 'object', additionalProperties: true } },
          overlays: { type: 'array', items: { type: 'object', additionalProperties: true } },
          markers: { type: 'array', items: { type: 'object', additionalProperties: true } },
          series: { type: 'array', items: { type: 'object', additionalProperties: true } },
          values: { type: 'array', items: { oneOf: [{ type: 'number' }, { type: 'null' }] } },
          annotations: { type: 'array', items: { type: 'object', additionalProperties: true } },
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `chart data (${value.kind}) "${value.title}": ${value.kind === 'candles' ? `${value.candles?.length ?? 0} candles` : value.kind === 'series' ? `${value.series?.length ?? 0} series` : `${value.annotations?.length ?? 0} annotations`}`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const title = args.title ?? 'chart'
      if (args.kind === 'candles') {
        return chartCandles(args.candles ?? [], args.overlays ?? [], args.markers ?? [], title)
      }
      if (args.kind === 'series') {
        return chartSeries(args.series ?? [], title)
      }
      return chartAnnotate(args.values ?? [], args.annotations ?? [], title)
    },
  }))
  ctx.tools.register(defineTool({
    name: 'quant_metrics',
    description:
      'Compute the full backtest metric suite from an equity curve and optional trades: ' +
      'total return, max drawdown, Sharpe, annualized volatility, Calmar, Sortino, win rate, profit factor, ' +
      'avg period return (required trio: return/drawdown/sharpe; the rest are optional extensions). ' +
      'Trade-level metrics (trade count, trade win rate, avg trade return, avg holding periods) are computed when trades are given. ' +
      'UI surfaces can pick which metrics to display via METRIC_CATALOG.',
    parameters: {
      equityCurve: { type: 'array', items: { type: 'number' }, required: true, description: 'Normalized equity curve (initial value 1)' },
      trades: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            entryIndex: { type: 'integer', required: true },
            exitIndex: { oneOf: [{ type: 'integer' }, { type: 'null' }], required: true },
            returnPct: { oneOf: [{ type: 'number' }, { type: 'null' }], required: true },
          },
          additionalProperties: true,
        },
        description: 'Optional trades from quant_backtest* (extra fields accepted)',
      },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          totalReturnPct: { type: 'number' , required: true},
          maxDrawdownPct: { type: 'number' , required: true},
          sharpe: { type: 'number' , required: true},
          annualizedVol: { type: 'number' , required: true},
          calmar: { type: 'number' , required: true},
          sortino: { type: 'number' , required: true},
          winRate: { type: 'number' , required: true},
          profitFactor: { oneOf: [{ type: 'number' }, { type: 'null' }] , required: true},
          avgPeriodReturnPct: { type: 'number' , required: true},
          positivePeriods: { type: 'integer' , required: true},
          periods: { type: 'integer' , required: true},
          tradeMetrics: {
            type: 'object',
            properties: {
              tradeCount: { type: 'integer', required: true },
              winRate: { type: 'number', required: true },
              avgReturnPct: { type: 'number', required: true },
              profitFactor: { oneOf: [{ type: "number" }, { type: "null" }], required: true },
              avgHoldingPeriods: { type: 'number', required: true },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `metrics: total ${value.totalReturnPct.toFixed(2)}%, maxDD ${value.maxDrawdownPct.toFixed(2)}%, ` +
          `sharpe ${value.sharpe.toFixed(3)}, calmar ${value.calmar.toFixed(3)}, sortino ${value.sortino.toFixed(3)}, win ${value.winRate.toFixed(1)}%`
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const equity = equityMetrics(args.equityCurve)
      const trades = args.trades !== undefined ? tradeMetrics(args.trades) : undefined
      return { ...equity, tradeMetrics: trades }
    },
  }))
  ctx.tools.register(defineTool({
    name: 'quant_fund',
    description:
      'Simulate a quantitative hedge fund around a strategy equity curve: start with initialCapital ' +
      '(default 100,000,000) at NAV 1.00, accrue annual management fee daily (default 2%), charge ' +
      'performance fee above the high-water mark (default 20%), and report final NAV, final AUM, peak NAV/AUM, ' +
      'gross vs net return, total fees, and the net-NAV series for charting. ' +
      'The foundation for a quant-fund simulation game.',
    parameters: {
      equityCurve: { type: 'array', items: { type: 'number' }, required: true, description: 'Strategy equity curve (initial value 1)' },
      initialCapital: { type: 'number', description: 'Initial capital, default 100000000 (1 亿)' },
      managementFeeRate: { type: 'number', description: 'Annual management fee rate, default 0.02' },
      performanceFeeRate: { type: 'number', description: 'Performance fee above high-water mark, default 0.2' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          initialCapital: { type: 'number' , required: true},
          initialNav: { type: 'number' , required: true},
          finalNavGross: { type: 'number' , required: true},
          finalNavNet: { type: 'number' , required: true},
          finalAum: { type: 'number' , required: true},
          peakNav: { type: 'number' , required: true},
          peakAum: { type: 'number' , required: true},
          grossReturnPct: { type: 'number' , required: true},
          netReturnPct: { type: 'number' , required: true},
          managementFeeTotal: { type: 'number' , required: true},
          performanceFeeTotal: { type: 'number' , required: true},
          navNet: { type: 'array', items: { type: 'number' }, required: true},
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `quant fund: initial ${(value.initialCapital / 1e8).toFixed(2)}亿, NAV 1.00 → ${value.finalNavNet.toFixed(4)}, ` +
          `AUM ${(value.finalAum / 1e8).toFixed(3)}亿 (peak ${(value.peakAum / 1e8).toFixed(3)}亿), ` +
          `net ${value.netReturnPct.toFixed(2)}%, fees: mgmt ${(value.managementFeeTotal / 1e4).toFixed(1)}万 + perf ${(value.performanceFeeTotal / 1e4).toFixed(1)}万`
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return fundSimulate(args.equityCurve, {
        initialCapital: args.initialCapital,
        managementFeeRate: args.managementFeeRate,
        performanceFeeRate: args.performanceFeeRate,
      })
    },
  }))
  ctx.tools.register(defineTool({
    name: 'quant_risk',
    description:
      'Risk metrics for a return series (with optional benchmark): historical VaR and CVaR/Expected Shortfall at a ' +
      'confidence level (default 95%), downside deviation, max drawdown, Beta, Jensen alpha, information ratio and ' +
      'tracking error against the benchmark. Feed period returns as decimals (0.01 = 1%), e.g. derived from close prices. ' +
      'Core module for quant research risk analysis.',
    parameters: {
      returns: { type: 'array', items: { type: 'number' }, required: true, description: 'Period returns as decimals (0.01 = 1%), oldest first' },
      benchmarkReturns: { type: 'array', items: { type: 'number' }, description: 'Optional benchmark returns aligned with returns (for beta/alpha/IR)' },
      confidence: { type: 'number', description: 'VaR confidence level, default 0.95' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          var95: { type: 'number' , required: true},
          cvar95: { type: 'number' , required: true},
          downsideDeviation: { type: 'number' , required: true},
          maxDrawdownPct: { type: 'number' , required: true},
          beta: { type: 'number' , required: true},
          alpha: { type: 'number' , required: true},
          informationRatio: { type: 'number' , required: true},
          trackingError: { type: 'number' , required: true},
          periods: { type: 'integer' , required: true},
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `risk (n=${value.periods}): VaR95 ${(value.var95 * 100).toFixed(2)}%, CVaR95 ${(value.cvar95 * 100).toFixed(2)}%, ` +
          `maxDD ${value.maxDrawdownPct.toFixed(2)}%, downDev ${(value.downsideDeviation * 100).toFixed(2)}%` +
          (value.beta !== 0 ? `, beta ${value.beta.toFixed(3)}, IR ${value.informationRatio.toFixed(3)}` : '')
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return riskMetrics(args.returns, { benchmarkReturns: args.benchmarkReturns, confidence: args.confidence })
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_stress_test',
    description:
      'Portfolio stress test: estimate loss under common market scenarios (mild drop, crash, liquidity crisis, ' +
      'vol spike, correlation rise) given asset weights, betas and annual volatilities. Returns per-scenario ' +
      'loss %, worst scenario, portfolio vol, and beta-based risk notes. The "how much do I lose in a crash" answer.',
    parameters: {
      weights: { type: 'array', items: { type: 'number' }, required: true, description: 'Asset weights (sum to 1)' },
      betas: { type: 'array', items: { type: 'number' }, required: true, description: 'Per-asset market beta' },
      assetVolsPct: { type: 'array', items: { type: 'number' }, required: true, description: 'Per-asset annualized vol %' },
      correlation: { type: 'number', description: 'Asset-market average correlation (default 0.6)' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          weights: { type: 'array', items: { type: 'number' }, required: true },
          scenarioLossesPct: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                scenario: { type: 'string', required: true },
                lossPct: { type: 'number', required: true },
              },
              additionalProperties: false,
            },
            required: true,
          },
          worstScenario: { type: 'string', required: true },
          maxLossPct: { type: 'number', required: true },
          portfolioVolPct: { type: 'number', required: true },
          notes: { type: 'array', items: { type: 'string' }, required: true },
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `stress test: worst "${value.worstScenario}" → -${value.maxLossPct.toFixed(1)}%, ` +
          `port vol ${value.portfolioVolPct.toFixed(1)}%`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return stressTest(args.weights, args.betas, args.assetVolsPct, args.correlation)
    },
  }))
  ctx.tools.register(defineTool({
    name: 'quant_var_backtest',
    description:
      'Kupiec POF test: backtest a VaR series against realized returns — counts failures (losses exceeding VaR), ' +
      'compares against the expected count, computes the likelihood-ratio statistic and approximate p-value, ' +
      'and reports whether the VaR model passes at 95% (LR <= 3.841). Too-few failures (overly conservative VaR) ' +
      'also fail. Feed returns and the matching per-period VaR series (positive loss values).',
    parameters: {
      returns: { type: 'array', items: { type: 'number' }, required: true, description: 'Realized returns as decimals' },
      varSeries: { type: 'array', items: { type: 'number' }, required: true, description: 'VaR per period (positive loss), aligned with returns' },
      confidence: { type: 'number', description: 'VaR confidence level, default 0.95' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          failures: { type: 'integer' , required: true},
          expected: { type: 'number' , required: true},
          lrStat: { type: 'number' , required: true},
          pValue: { type: 'number' , required: true},
          passed: { type: 'boolean' , required: true},
          periods: { type: 'integer' , required: true},
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `VaR backtest: ${value.failures} failures (expected ${value.expected.toFixed(1)}), ` +
          `LR ${value.lrStat === Number.POSITIVE_INFINITY ? '∞' : value.lrStat.toFixed(3)}, ${value.passed ? 'PASS ✓' : 'FAIL ✗'}`
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return kupiecTest(args.returns, args.varSeries, args.confidence)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_resample',
    description:
      'Resample OHLCV candles to a coarser period by fixed bar buckets: week = 7 bars, month = 30 bars ' +
      '(designed for 24/7 crypto markets; for A-share trading calendars pass pre-bucketed data). ' +
      'Each bucket aggregates open/high/low/close/volume plus the bar count.',
    parameters: {
      candles: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            openTime: { type: 'integer', required: true },
            open: { type: 'number', required: true },
            high: { type: 'number', required: true },
            low: { type: 'number', required: true },
            close: { type: 'number', required: true },
            volume: { type: 'number', required: true },
          },
          additionalProperties: false,
        },
        required: true,
        description: 'OHLCV candles from quant_market_fetch',
      },
      period: { type: 'string', enum: ['week', 'month'], required: true, description: 'Target period' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          candles: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                openTime: { type: 'integer', required: true },
                open: { type: 'number', required: true },
                high: { type: 'number', required: true },
                low: { type: 'number', required: true },
                close: { type: 'number', required: true },
                volume: { type: 'number', required: true },
                bars: { type: 'integer', required: true },
              },
              additionalProperties: false,
            },
            required: true,
          },
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `resampled to ${args.period}: ${value.candles.length} candles (last bucket ${value.candles[value.candles.length - 1]?.bars ?? 0} bars)`
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return { candles: resampleCandles(args.candles, args.period) }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_report',
    description:
      'Generate a Markdown research report from dsh-quant module outputs: strategy, performance metrics, ' +
      'risk metrics, factor evaluation and fund simulation. Pass the results of quant_metrics / quant_risk / ' +
      'quant_factor_evaluate / quant_fund to assemble one readable conclusion document.',
    parameters: {
      strategy: { type: 'string', description: 'Strategy description' },
      metrics: { type: 'object', additionalProperties: true, description: 'quant_metrics output' },
      risk: { type: 'object', additionalProperties: true, description: 'quant_risk output' },
      factor: { type: 'object', additionalProperties: true, description: 'quant_factor_evaluate output' },
      fund: { type: 'object', additionalProperties: true, description: 'quant_fund output' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          report: { type: 'string' , required: true},
        },
        additionalProperties: false,
      },
      render: (_args, value) => [{ type: 'text', text: value.report }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return { report: generateReport({
        strategy: args.strategy,
        metrics: args.metrics as Record<string, number | null> | undefined,
        risk: args.risk as never,
        factor: args.factor as never,
        fund: args.fund as never,
      }) }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_repo_stats',
    description:
      'Fetch live GitHub ecosystem stats for a public repository (no credentials required): stars, forks, watchers, ' +
      'open issues, open pull requests, topics, language, license and latest release. ' +
      'Uses the GITHUB_TOKEN environment variable automatically when present (higher rate limit); ' +
      'unauthenticated requests are limited to 60 per hour per IP. ' +
      'Feed the numbers into quant_oss_pulse to score open-source influence.',
    parameters: {
      owner: { type: 'string', required: true, description: 'GitHub owner (user or org), e.g. pengpengyi92' },
      repo: { type: 'string', required: true, description: 'Repository name, e.g. dsh-quant' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          owner: { type: 'string', required: true },
          repo: { type: 'string', required: true },
          stars: { type: 'integer', required: true },
          forks: { type: 'integer', required: true },
          watchers: { type: 'integer', required: true },
          openIssues: { type: 'integer', required: true },
          openPullRequests: { type: 'integer', required: true },
          language: { oneOf: [{ type: 'string' }, { type: 'null' }], required: true },
          topics: { type: 'array', items: { type: 'string' }, required: true },
          license: { oneOf: [{ type: 'string' }, { type: 'null' }], required: true },
          description: { oneOf: [{ type: 'string' }, { type: 'null' }], required: true },
          createdAt: { type: 'string', required: true },
          pushedAt: { type: 'string', required: true },
          latestRelease: { oneOf: [{ type: 'string' }, { type: 'null' }], required: true },
          latestReleaseAt: { oneOf: [{ type: 'string' }, { type: 'null' }], required: true },
          url: { type: 'string', required: true },
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `${value.owner}/${value.repo}: ${value.stars} stars, ${value.forks} forks, ` +
          `${value.openIssues} open issues, ${value.openPullRequests} open PRs, latest release ${value.latestRelease ?? 'n/a'}`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args, exec) {
      if (!/^[\w.-]+$/.test(args.owner) || !/^[\w.-]+$/.test(args.repo)) {
        throw new Error(`invalid repo "${args.owner}/${args.repo}": owner/repo must match [A-Za-z0-9_.-]+`)
      }
      const signal = AbortSignal.any([exec.signal, AbortSignal.timeout(15_000)])
      return fetchRepoStats(args.owner, args.repo, signal)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_npm_stats',
    description:
      'Fetch live npm ecosystem stats for a published package (no credentials): latest version, ' +
      'last-week and last-month downloads, description and homepage. ' +
      'Feed weeklyDownloads into quant_oss_pulse to score open-source influence.',
    parameters: {
      pkg: { type: 'string', required: true, description: 'npm package name, e.g. dsh-quant' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          pkg: { type: 'string', required: true },
          latest: { type: 'string', required: true },
          weeklyDownloads: { type: 'integer', required: true },
          monthlyDownloads: { oneOf: [{ type: 'integer' }, { type: 'null' }], required: true },
          description: { oneOf: [{ type: 'string' }, { type: 'null' }], required: true },
          homepage: { oneOf: [{ type: 'string' }, { type: 'null' }], required: true },
          updatedAt: { type: 'string', required: true },
          url: { type: 'string', required: true },
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `${value.pkg}@${value.latest}: ${value.weeklyDownloads} downloads last week` +
          `${value.monthlyDownloads !== null ? `, ${value.monthlyDownloads} last month` : ''}`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args, exec) {
      if (!/^[@\w.-]+$/.test(args.pkg)) {
        throw new Error(`invalid npm package "${args.pkg}": expected a package name like dsh-quant`)
      }
      const signal = AbortSignal.any([exec.signal, AbortSignal.timeout(15_000)])
      return fetchNpmStats(args.pkg, signal)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_oss_pulse',
    description:
      'Score open-source ecosystem influence on a 0-100 pulse with an A/B/C/D grade and concrete action ' +
      'suggestions. Components: stars base (20%), weekly npm downloads (15%), star momentum vs a previous ' +
      'snapshot (25%), community health = open issue+PR backlog vs stars (20%), release freshness (20%). ' +
      'Missing optional inputs score neutral 50. Feed quant_repo_stats and quant_npm_stats outputs, and ' +
      'snapshot stars weekly to supply starsPrevious.',
    parameters: {
      stars: { type: 'number', required: true, description: 'Current star count (>= 0)' },
      downloadsWeekly: { type: 'number', description: 'npm downloads in the last 7 days' },
      starsPrevious: { type: 'number', description: 'Star count at the previous snapshot (e.g. 7 days ago)' },
      openIssues: { type: 'number', description: 'Open issues (excluding PRs)' },
      openPullRequests: { type: 'number', description: 'Open pull requests' },
      daysSinceRelease: { type: 'number', description: 'Days since the latest release' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          score: { type: 'integer', required: true },
          grade: { type: 'string', enum: ['A', 'B', 'C', 'D'], required: true },
          components: {
            type: 'object',
            properties: {
              stars: { type: 'number', required: true },
              downloads: { type: 'number', required: true },
              momentum: { type: 'number', required: true },
              health: { type: 'number', required: true },
              freshness: { type: 'number', required: true },
            },
            additionalProperties: false,
            required: true,
          },
          suggestions: { type: 'array', items: { type: 'string' }, required: true },
          summary: { type: 'string', required: true },
        },
        additionalProperties: false,
      },
      render: (_args, value) => [{
        type: 'text',
        text: `${value.summary}\n${value.suggestions.map((s: string) => `- ${s}`).join('\n')}`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return ossPulse({
        stars: args.stars,
        downloadsWeekly: args.downloadsWeekly,
        starsPrevious: args.starsPrevious,
        openIssues: args.openIssues,
        openPullRequests: args.openPullRequests,
        daysSinceRelease: args.daysSinceRelease,
      })
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_factor_neutralize',
    description:
      'Neutralize a factor: strip group or style exposures and z-score standardize (mean 0, std 1). ' +
      'Method is inferred from inputs — styleFactors → ols regression residual, groups → within-group z-score ' +
      '(simple industry neutralization), otherwise plain cross-sectional z-score. ' +
      'groups/styleFactors must align with the factor array. This plugin ships methods, not data.',
    parameters: {
      factorValues: { type: 'array', items: { type: 'number' }, required: true, description: 'Factor values over time or cross-section' },
      groups: {
        type: 'array', items: { oneOf: [{ type: 'string' }, { type: 'number' }] },
        description: 'Optional group labels (e.g. industry codes) aligned with factorValues',
      },
      styleFactors: {
        type: 'array', items: { type: 'array', items: { type: 'number' } },
        description: 'Optional style factors (e.g. market cap) to regress out; each aligned with factorValues',
      },
      method: { type: 'string', enum: ['group', 'ols', 'zscore'], description: 'Optional explicit method; inferred when omitted' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          values: { type: 'array', items: { type: 'number' }, required: true },
          method: { type: 'string', enum: ['group', 'ols', 'zscore'], required: true },
          groupCount: { type: 'integer', required: true },
          styleCount: { type: 'integer', required: true },
          rSquared: { oneOf: [{ type: 'number' }, { type: 'null' }], required: true },
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `factor neutralized (${value.method}): ${value.values.length} values` +
          `${value.rSquared !== null ? `, ols R2 ${value.rSquared.toFixed(4)}` : ''}`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return factorNeutralize(args.factorValues, {
        groups: args.groups,
        styleFactors: args.styleFactors,
        method: args.method,
      })
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_walk_forward',
    description:
      'Walk-forward training and evaluation: rolling linear regression (intercept + features) trained only on ' +
      'past data, predicting the next-period return out-of-sample. features[t] predicts returns[t+1]. ' +
      'Returns out-of-sample predictions (null in train regions), OOS IC/RankIC and per-window model weights — ' +
      'the minimal honest ML workflow (no look-ahead). This plugin ships methods, not data.',
    parameters: {
      returns: { type: 'array', items: { type: 'number' }, required: true, description: 'Period returns, oldest first' },
      features: {
        type: 'array', items: { type: 'array', items: { type: 'number' } },
        required: true,
        description: 'Feature series, each equal to returns length; features[t] predicts returns[t+1]',
      },
      trainWindow: { type: 'integer', required: true, description: 'Training window length (>= 2)' },
      testWindow: { type: 'integer', required: true, description: 'Out-of-sample window length (>= 1)' },
      step: { type: 'integer', description: 'Advance per walk step, default = testWindow' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          predictions: { type: 'array', items: { oneOf: [{ type: 'number' }, { type: 'null' }] }, required: true },
          oosIc: { type: 'number', required: true },
          oosRankIc: { type: 'number', required: true },
          oosCount: { type: 'integer', required: true },
          windows: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                trainStart: { type: 'integer', required: true },
                trainEnd: { type: 'integer', required: true },
                testStart: { type: 'integer', required: true },
                testEnd: { type: 'integer', required: true },
                intercept: { type: 'number', required: true },
                weights: { type: 'array', items: { type: 'number' }, required: true },
                trainR2: { type: 'number', required: true },
              },
              additionalProperties: false,
            },
            required: true,
          },
          trainR2Mean: { type: 'number', required: true },
        },
        additionalProperties: false,
      },
      render: (_args, value) => [{
        type: 'text',
        text: `walk-forward: ${value.windows.length} windows, ${value.oosCount} OOS predictions, ` +
          `OOS IC ${value.oosIc.toFixed(4)}, OOS RankIC ${value.oosRankIc.toFixed(4)}, mean train R2 ${value.trainR2Mean.toFixed(4)}`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return walkForward(args.returns, args.features, args.trainWindow, args.testWindow, args.step)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_drawdown',
    description:
      'Drawdown analysis of an equity curve: underwater series (aligned, 0 at new highs, negative in drawdown), ' +
      'max drawdown, current drawdown, and one period per new high (peak, trough, recovery, depth, duration). ' +
      'Recovery means the curve returns to the previous high. Feed backtest equity curves or fund NAV series.',
    parameters: {
      equity: { type: 'array', items: { type: 'number' }, required: true, description: 'Positive equity/NAV series, oldest first' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          underwater: { type: 'array', items: { type: 'number' }, required: true },
          maxDrawdownPct: { type: 'number', required: true },
          currentDrawdownPct: { type: 'number', required: true },
          periods: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                peakIndex: { type: 'integer', required: true },
                troughIndex: { type: 'integer', required: true },
                recoveryIndex: { oneOf: [{ type: 'integer' }, { type: 'null' }], required: true },
                depthPct: { type: 'number', required: true },
                durationBars: { type: 'integer', required: true },
                recoveryBars: { oneOf: [{ type: 'integer' }, { type: 'null' }], required: true },
              },
              additionalProperties: false,
            },
            required: true,
          },
          ongoing: {
            oneOf: [
              {
                type: 'object',
                properties: {
                  peakIndex: { type: 'integer', required: true },
                  troughIndex: { type: 'integer', required: true },
                  recoveryIndex: { oneOf: [{ type: 'integer' }, { type: 'null' }], required: true },
                  depthPct: { type: 'number', required: true },
                  durationBars: { type: 'integer', required: true },
                  recoveryBars: { oneOf: [{ type: 'integer' }, { type: 'null' }], required: true },
                },
                additionalProperties: false,
              },
              { type: 'null' },
            ],
            required: true,
          },
        },
        additionalProperties: false,
      },
      render: (_args, value) => [{
        type: 'text',
        text: `drawdown: max ${value.maxDrawdownPct.toFixed(2)}%, current ${value.currentDrawdownPct.toFixed(2)}%, ` +
          `${value.periods.length} periods (${value.ongoing === null ? 'recovered' : 'in drawdown'})`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return drawdownAnalysis(args.equity)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_execute_sim',
    description:
      'Simulate order execution on a close series (no live trading): orders fill at the close of the bar after ' +
      'the signal (plus optional latency), with optional slippage (bps) and per-side fee rate. Long-only spot ' +
      'semantics — sells are capped by current position. Sizing by quantity or by fraction of current equity. ' +
      'Returns fills, normalized equity curve, total fees and slippage cost. Feed backtest signals to add realism.',
    parameters: {
      close: { type: 'array', items: { type: 'number' }, required: true, description: 'Close prices, oldest first' },
      orders: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            index: { type: 'integer', required: true },
            side: { type: 'string', enum: ['buy', 'sell'], required: true },
            quantity: { type: 'number', description: 'Exact quantity (alternative to valueFraction)' },
            valueFraction: { type: 'number', description: 'Fraction of current equity (0-1) (alternative to quantity)' },
          },
          additionalProperties: false,
        },
        required: true,
        description: 'Orders with signal bar index; fills happen at index+1+latencyBars close',
      },
      initialCash: { type: 'number', description: 'Initial cash, default 1' },
      feeRate: { type: 'number', description: 'Fee rate per side, default 0.001' },
      slippageBps: { type: 'number', description: 'Slippage in basis points, default 0' },
      latencyBars: { type: 'integer', description: 'Fill latency in bars, default 0' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          fills: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                orderIndex: { type: 'integer', required: true },
                side: { type: 'string', enum: ['buy', 'sell'], required: true },
                fillIndex: { type: 'integer', required: true },
                fillPrice: { type: 'number', required: true },
                quantity: { type: 'number', required: true },
                value: { type: 'number', required: true },
                fee: { type: 'number', required: true },
                slippageCost: { type: 'number', required: true },
                cashAfter: { type: 'number', required: true },
                positionAfter: { type: 'number', required: true },
                equityAfter: { type: 'number', required: true },
              },
              additionalProperties: false,
            },
            required: true,
          },
          equityCurve: { type: 'array', items: { type: 'number' }, required: true },
          finalEquity: { type: 'number', required: true },
          totalReturnPct: { type: 'number', required: true },
          totalFee: { type: 'number', required: true },
          totalSlippageCost: { type: 'number', required: true },
          tradeCount: { type: 'integer', required: true },
          unfilledCount: { type: 'integer', required: true },
          cash: { type: 'number', required: true },
          position: { type: 'number', required: true },
        },
        additionalProperties: false,
      },
      render: (_args, value) => [{
        type: 'text',
        text: `execution sim: ${value.tradeCount} fills, ${value.unfilledCount} unfilled, ` +
          `return ${value.totalReturnPct.toFixed(2)}%, fees ${value.totalFee.toFixed(4)}, slippage ${value.totalSlippageCost.toFixed(4)}`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return executeSimulate(args.close, args.orders, {
        initialCash: args.initialCash,
        feeRate: args.feeRate,
        slippageBps: args.slippageBps,
        latencyBars: args.latencyBars,
      })
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_trade_quality',
    description:
      'Trade quality analysis on execution fills (from quant_execute_sim): fill rate, total/average slippage (bps), ' +
      'buy/sell counts, average fill value, and optional holding-period bars. Answers "did the execution behave " + ' +
      'realistically" — the bridge from simulation to live expectations.',
    parameters: {
      fills: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            orderIndex: { type: 'integer', required: true },
            side: { type: 'string', enum: ['buy', 'sell'], required: true },
            fillIndex: { type: 'integer', required: true },
            fillPrice: { type: 'number', required: true },
            quantity: { type: 'number', required: true },
            value: { type: 'number', required: true },
            fee: { type: 'number', required: true },
            slippageCost: { type: 'number', required: true },
            cashAfter: { type: 'number', required: true },
            positionAfter: { type: 'number', required: true },
            equityAfter: { type: 'number', required: true },
          },
          additionalProperties: false,
        },
        required: true,
        description: 'Fills from quant_execute_sim result',
      },
      unfilledOrders: { type: 'integer', description: 'Count of unfilled orders (default 0)' },
      holdingPeriodBars: {
        type: 'array', items: { type: 'integer' },
        description: 'Optional per-trade holding periods in bars',
      },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          orders: { type: 'integer', required: true },
          fills: { type: 'integer', required: true },
          fillRate: { type: 'number', required: true },
          totalSlippageCost: { type: 'number', required: true },
          avgSlippageBps: { type: 'number', required: true },
          avgHoldingBars: { type: 'number', required: true },
          buys: { type: 'integer', required: true },
          sells: { type: 'integer', required: true },
          avgFillValue: { type: 'number', required: true },
          notes: { type: 'array', items: { type: 'string' }, required: true },
        },
        additionalProperties: false,
      },
      render: (args, value) => [{
        type: 'text',
        text: `trade quality: ${value.fills}/${value.orders} fills (${(value.fillRate * 100).toFixed(0)}%), ` +
          `slippage ${value.avgSlippageBps.toFixed(0)} bps, ` +
          (value.avgHoldingBars > 0 ? `hold ${value.avgHoldingBars.toFixed(0)} bars, ` : '') +
          `${value.buys} buys / ${value.sells} sells`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return tradeQuality(args.fills, args.unfilledOrders, args.holdingPeriodBars)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_bond',
    description:
      'Fixed-income analytics (FICC methods, no positions): bond pricing from yield (or yield from price via ' +
      'bisection), Macaulay duration, modified duration, convexity and DV01. Textbook cash-flow discounting at ' +
      'paymentsPerYear periods — day-count and curve conventions are out of scope. ' +
      'Provide exactly one of ytm or price. Public methods only; positions and execution support stay internal.',
    parameters: {
      faceValue: { type: 'number', description: 'Face value, default 100' },
      couponRate: { type: 'number', required: true, description: 'Annual coupon rate as a decimal, e.g. 0.03' },
      periodsToMaturity: { type: 'number', required: true, description: 'Years to maturity (> 0)' },
      paymentsPerYear: { type: 'integer', description: 'Coupon payments per year 1/2/4/12, default 2' },
      ytm: { type: 'number', description: 'Yield to maturity as a decimal (alternative to price)' },
      price: { type: 'number', description: 'Full price (alternative to ytm)' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          faceValue: { type: 'number', required: true },
          couponRate: { type: 'number', required: true },
          periodsToMaturity: { type: 'number', required: true },
          paymentsPerYear: { type: 'integer', required: true },
          price: { type: 'number', required: true },
          yieldToMaturity: { type: 'number', required: true },
          macaulayDuration: { type: 'number', required: true },
          modifiedDuration: { type: 'number', required: true },
          convexity: { type: 'number', required: true },
          dv01: { type: 'number', required: true },
        },
        additionalProperties: false,
      },
      render: (_args, value) => [{
        type: 'text',
        text: `bond: price ${value.price.toFixed(4)}, YTM ${(value.yieldToMaturity * 100).toFixed(4)}%, ` +
          `Macaulay ${value.macaulayDuration.toFixed(4)}y, modified ${value.modifiedDuration.toFixed(4)}y, ` +
          `convexity ${value.convexity.toFixed(4)}, DV01 ${value.dv01.toFixed(6)}`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return bondAnalytics({
        faceValue: args.faceValue,
        couponRate: args.couponRate,
        periodsToMaturity: args.periodsToMaturity,
        paymentsPerYear: args.paymentsPerYear,
        ytm: args.ytm,
        price: args.price,
      })
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_option',
    description:
      'European option analytics inspired by Optiver-style pricing practice: Black-Scholes price from volatility ' +
      '(or implied volatility from market price via bisection) plus the five greeks — delta, gamma, vega (per 1% vol), ' +
      'theta (per year), rho (per 1% rate). Provide exactly one of volatility or price. ' +
      'Public pricing methods only; market-making execution and inventory stay internal.',
    parameters: {
      spot: { type: 'number', required: true, description: 'Underlying spot price (> 0)' },
      strike: { type: 'number', required: true, description: 'Strike price (> 0)' },
      timeToMaturity: { type: 'number', required: true, description: 'Years to expiry (> 0)' },
      riskFreeRate: { type: 'number', required: true, description: 'Annual risk-free rate as a decimal (>= 0)' },
      volatility: { type: 'number', description: 'Annual volatility as a decimal (alternative to price)' },
      price: { type: 'number', description: 'Market option price (alternative to volatility, solves IV)' },
      type: { type: 'string', enum: ['call', 'put'], required: true, description: 'Option type' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          spot: { type: 'number', required: true },
          strike: { type: 'number', required: true },
          timeToMaturity: { type: 'number', required: true },
          riskFreeRate: { type: 'number', required: true },
          type: { type: 'string', enum: ['call', 'put'], required: true },
          price: { type: 'number', required: true },
          impliedVolatility: { type: 'number', required: true },
          delta: { type: 'number', required: true },
          gamma: { type: 'number', required: true },
          vega: { type: 'number', required: true },
          theta: { type: 'number', required: true },
          rho: { type: 'number', required: true },
        },
        additionalProperties: false,
      },
      render: (_args, value) => [{
        type: 'text',
        text: `${value.type} option: price ${value.price.toFixed(4)}, IV ${(value.impliedVolatility * 100).toFixed(2)}%, ` +
          `Δ ${value.delta.toFixed(4)}, Γ ${value.gamma.toFixed(4)}, ν ${value.vega.toFixed(4)}, Θ ${value.theta.toFixed(4)}, ρ ${value.rho.toFixed(4)}`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return optionAnalytics({
        spot: args.spot,
        strike: args.strike,
        timeToMaturity: args.timeToMaturity,
        riskFreeRate: args.riskFreeRate,
        volatility: args.volatility,
        price: args.price,
        type: args.type,
      })
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_volatility',
    description:
      'Realized volatility of a close series: population standard deviation of log returns, annualized ' +
      '(default 252 trading days). Complements quant_option implied volatility — the RV-vs-IV gap is the ' +
      'volatility-risk-premium research entry. Returns the aligned log-return series too.',
    parameters: {
      close: { type: 'array', items: { type: 'number' }, required: true, description: 'Positive close prices, oldest first' },
      annualization: { type: 'integer', description: 'Annualization factor, default 252' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          annualized: { type: 'number', required: true },
          perPeriod: { type: 'number', required: true },
          annualization: { type: 'integer', required: true },
          n: { type: 'integer', required: true },
          logReturns: { type: 'array', items: { oneOf: [{ type: 'number' }, { type: 'null' }] }, required: true },
        },
        additionalProperties: false,
      },
      render: (_args, value) => [{
        type: 'text',
        text: `realized vol: ${(value.annualized * 100).toFixed(2)}% annualized (${value.perPeriod.toFixed(6)} per period, n=${value.n})`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return realizedVolatility(args.close, args.annualization)
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_linear_model',
    description:
      'Fit a linear model (OLS, or Ridge with lambda > 0 penalizing feature weights) on samples × features: ' +
      'y ≈ intercept + Σ w·x. Returns coefficients, train R2, and — when predictX is passed — out-of-sample ' +
      'predictions plus test R2/IC against optional yTest. The minimal explainable ML building block; ' +
      'use quant_walk_forward for rolling out-of-sample validation. This plugin ships methods, not data.',
    parameters: {
      X: {
        type: 'array', items: { type: 'array', items: { type: 'number' } },
        required: true,
        description: 'Training samples × features (each row is one sample)',
      },
      y: { type: 'array', items: { type: 'number' }, required: true, description: 'Training targets, aligned with X' },
      lambda: { type: 'number', description: 'Ridge penalty on feature weights, default 0 (OLS)' },
      predictX: { type: 'array', items: { type: 'array', items: { type: 'number' } }, description: 'Optional samples to predict' },
      yTest: { type: 'array', items: { type: 'number' }, description: 'Optional actual values for predictX (enables test R2/IC)' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          intercept: { type: 'number', required: true },
          weights: { type: 'array', items: { type: 'number' }, required: true },
          lambda: { type: 'number', required: true },
          trainR2: { type: 'number', required: true },
          n: { type: 'integer', required: true },
          predictions: { oneOf: [{ type: 'array', items: { type: 'number' } }, { type: 'null' }], required: true },
          testR2: { oneOf: [{ type: 'number' }, { type: 'null' }], required: true },
          testIc: { oneOf: [{ type: 'number' }, { type: 'null' }], required: true },
        },
        additionalProperties: false,
      },
      render: (_args, value) => [{
        type: 'text',
        text: `linear model: n=${value.n}, lambda=${value.lambda}, train R2 ${value.trainR2.toFixed(4)}, ` +
          `intercept ${value.intercept.toFixed(4)}, weights [${value.weights.map((w: number) => w.toFixed(4)).join(', ')}]` +
          `${value.testR2 !== null ? ` | test R2 ${value.testR2.toFixed(4)}, test IC ${(value.testIc ?? 0).toFixed(4)}` : ''}`,
      }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const fit = fitLinearModel(args.X, args.y, args.lambda ?? 0)
      const predictions = args.predictX !== undefined ? predictLinearModel(fit, args.predictX) : null
      const test = predictions !== null && args.yTest !== undefined
        ? evaluatePredictions(predictions, args.yTest)
        : { r2: null, ic: 0 }
      return {
        intercept: fit.intercept,
        weights: fit.weights,
        lambda: fit.lambda,
        trainR2: fit.trainR2,
        n: fit.n,
        predictions,
        testR2: test.r2,
        testIc: test.ic,
      }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'quant_research_pipeline',
    description:
      'Run the full PDAT→PET research chain in one call: fetch candles (or pass them) → data quality → ' +
      'stats → SMA overlay → dual-MA backtest → performance metrics → risk metrics → drawdown → fund ' +
      'simulation (1e8 capital, NAV 1.00, 2% mgmt + 20% HWM performance fee) → momentum factor evaluation ' +
      '→ Markdown report → chart data. Crypto symbols like BTCUSDT; A-share codes like sh600000 (sina/tencent). ' +
      'Returns one bundle ready for research notes or UI rendering.',
    parameters: {
      symbol: { type: 'string', description: 'Symbol, default BTCUSDT' },
      interval: { type: 'string', enum: INTERVALS, description: 'Candle interval, default 1d' },
      limit: { type: 'integer', description: 'Candles to fetch (>= 30), default 120' },
      provider: { type: 'string', enum: MARKET_PROVIDERS, description: 'Provider, default binance (crypto falls back across binance/okx/bybit)' },
      candles: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            openTime: { type: 'integer', required: true },
            open: { type: 'number', required: true },
            high: { type: 'number', required: true },
            low: { type: 'number', required: true },
            close: { type: 'number', required: true },
            volume: { type: 'number', required: true },
          },
          additionalProperties: false,
        },
        description: 'Optional candle array (>= 30) to skip network fetch',
      },
      fast: { type: 'integer', description: 'Fast MA, default 5' },
      slow: { type: 'integer', description: 'Slow MA, default 20' },
      feeRate: { type: 'number', description: 'Backtest fee rate per side, default 0.001' },
      stopLoss: { type: 'number', description: 'Optional stop-loss fraction (e.g. 0.05)' },
      takeProfit: { type: 'number', description: 'Optional take-profit fraction (e.g. 0.15)' },
      factorWindow: { type: 'integer', description: 'Factor-eval rolling window, default 20' },
      initialCapital: { type: 'number', description: 'Fund initial capital, default 100000000' },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          symbol: { type: 'string', required: true },
          provider: { type: 'string', required: true },
          interval: { type: 'string', required: true },
          candles: {
            type: 'object',
            properties: {
              count: { type: 'integer', required: true },
              from: { type: 'integer', required: true },
              to: { type: 'integer', required: true },
            },
            additionalProperties: false,
            required: true,
          },
          quality: { type: 'object', additionalProperties: true, required: true },
          stats: { type: 'object', additionalProperties: true, required: true },
          metrics: { type: 'object', additionalProperties: true, required: true },
          risk: { type: 'object', additionalProperties: true, required: true },
          drawdown: { type: 'object', additionalProperties: true, required: true },
          fund: { type: 'object', additionalProperties: true, required: true },
          factor: { type: 'object', additionalProperties: true, required: true },
          report: { type: 'string', required: true },
          charts: { type: 'object', additionalProperties: true, required: true },
        },
        additionalProperties: false,
      },
      render: (args, value) => {
        const m = value.metrics as Record<string, number | null>
        return [{
          type: 'text',
          text: `${value.symbol} ${value.interval} pipeline: ${value.candles.count} candles, ` +
            `return ${m.totalReturnPct?.toFixed(2) ?? 'n/a'}%, maxDD ${m.maxDrawdownPct?.toFixed(2) ?? 'n/a'}% — ` +
            `report below:\n\n${value.report}`,
        }]
      },
    },
    isConcurrencySafe: () => true,
    async execute(args, exec) {
      const signal = AbortSignal.any([exec.signal, AbortSignal.timeout(20_000)])
      return researchPipeline({
        symbol: args.symbol,
        interval: args.interval,
        limit: args.limit,
        provider: args.provider,
        candles: args.candles,
        fast: args.fast,
        slow: args.slow,
        feeRate: args.feeRate,
        stopLoss: args.stopLoss,
        takeProfit: args.takeProfit,
        factorWindow: args.factorWindow,
        initialCapital: args.initialCapital,
      }, signal) as never
    },
  }))
}
