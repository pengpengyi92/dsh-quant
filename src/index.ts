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
import { atr, bollinger, ema, macd, rsi, sma } from './indicators.js'
import { backtestGrid, backtestMaCross } from './backtest.js'
import { INTERVALS, fetchKlines } from './market.js'

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
      const signal = AbortSignal.any([exec.signal, AbortSignal.timeout(15_000)])
      const candles = await fetchKlines(args.symbol, interval, limit, signal)
      if (candles.length === 0) throw new Error(`no candles returned for ${args.symbol} ${interval}`)
      return { symbol: args.symbol, interval, provider: 'binance', candles }
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
      return backtestMaCross(args.close, fast, slow, feeRate)
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
}
