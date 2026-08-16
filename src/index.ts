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
import { adx, atr, bollinger, cci, ema, kdj, macd, obv, roc, rsi, sma, williamsR } from './indicators.js'
import { backtestBollingerBreakout, backtestGrid, backtestMaCross, backtestPortfolio, backtestRsiReversion } from './backtest.js'
import { INTERVALS, MARKET_PROVIDERS, fetchKlines } from './market.js'

export const name = 'quant-indicators'
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
      'Fetch OHLCV candles for a symbol from the Binance public API (no credentials). ' +
      'Returns structured candles (openTime in Unix ms, open/high/low/close/volume). ' +
      'Feed the close values into quant_sma / quant_ema / quant_rsi / quant_macd / ' +
      'quant_bollinger / quant_atr for indicators. Symbols use exchange format (e.g. BTCUSDT).',
    parameters: {
      symbol: {
        type: 'string', required: true,
        description: 'Trading pair in exchange format, uppercase letters and digits (e.g. BTCUSDT, ETHUSDT)',
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
        description: 'Exchange provider: binance (default) / okx / bybit',
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
      if (!/^[A-Z0-9]+$/.test(args.symbol)) {
        throw new Error(`invalid symbol "${args.symbol}": expected uppercase letters and digits, e.g. BTCUSDT`)
      }
      const interval = args.interval ?? '1d'
      const limit = args.limit ?? 100
      if (!Number.isInteger(limit) || limit < 1 || limit > 1000) {
        throw new Error(`limit must be an integer in [1, 1000], got ${limit}`)
      }
      const provider = args.provider ?? 'binance'
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
}
