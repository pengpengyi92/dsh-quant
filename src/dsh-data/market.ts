/**
 * 行情数据获取（零依赖：node 原生 fetch，Binance 公共 REST API，无需凭据）。
 *
 * 拆分纯函数与网络层：
 * - parseKlines：纯函数（离线可测）
 * - fetchKlines：网络（集成验证）
 *
 * Binance klines 响应行（数组，字段为字符串数字）：
 * [openTime, open, high, low, close, volume, closeTime, quoteVolume, trades, takerBase, takerQuote, ignore]
 */

/** K 线间隔枚举（Binance 支持集）。 */
export const INTERVALS = [
  '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M',
] as const
export type Interval = (typeof INTERVALS)[number]

export interface Candle {
  /** 开盘时间（Unix 毫秒） */
  openTime: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export const BINANCE_KLINE_URL = 'https://api.binance.com/api/v3/klines'

/** 支持的行情 provider。 */
export type MarketProvider = 'binance' | 'okx' | 'bybit' | 'sina' | 'tencent' | 'yahoo'
export const MARKET_PROVIDERS = ['binance', 'okx', 'bybit', 'sina', 'tencent', 'yahoo'] as const

const OKX_KLINE_URL = 'https://www.okx.com/api/v5/market/candles'
const BYBIT_KLINE_URL = 'https://api.bybit.com/v5/market/kline'
/** 新浪财经免费 K 线（A 股，无需凭据）。 */
const SINA_KLINE_URL = 'https://quotes.sina.cn/cn/api/json_v2.php/CN_MarketDataService.getKLineData'
/** 腾讯财经免费 K 线（A 股/港股/美股，无需凭据）。 */
const TENCENT_KLINE_URL = 'https://web.ifzq.gtimg.cn/appstock/app/fqkline/get'
/** Yahoo Finance 免费 K 线（美股/全球标的，无需凭据）。 */
const YAHOO_KLINE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart'

/** A 股代码格式：sh600000 / sz000001 / bj430047。 */
const A_SHARE_SYMBOL = /^(sh|sz|bj)\d{6}$/
/** Yahoo 支持：美股 ticker（AAPL）、指数（^GSPC）、港股（0700.HK）等（至少含一个字母）。 */
const YAHOO_SYMBOL = /^(?=.*[A-Z])[A-Z0-9.^=-]+$/

/** 新浪 interval → scale 映射（仅支持这些周期）。 */
const SINA_SCALE: Record<string, string> = { '5m': '5', '15m': '15', '30m': '30', '1h': '60', '1d': '240' }

/** Yahoo limit → range 映射（range 决定返回历史长度，再截取最后 limit 根）。 */
const YAHOO_RANGE: { max: number; range: string }[] = [
  { max: 90, range: '3mo' },
  { max: 180, range: '6mo' },
  { max: 365, range: '1y' },
  { max: 730, range: '2y' },
  { max: 1825, range: '5y' },
]

/** Binance interval → OKX bar 映射（相同则省略）。 */
const OKX_INTERVAL: Record<string, string> = {
  '1d': '1D', '3d': '3D', '1w': '1W', '1M': '1M',
}
/** Binance interval → Bybit interval 映射。 */
const BYBIT_INTERVAL: Record<string, string> = {
  '1m': '1', '3m': '3', '5m': '5', '15m': '15', '30m': '30',
  '1h': '60', '2h': '120', '4h': '240', '6h': '360', '8h': '480', '12h': '720',
  '1d': 'D', '3d': '', '1w': 'W', '1M': 'M',
}

/** 解析 Binance klines 响应行（纯函数）。非法行抛错。 */
export function parseKlines(rows: readonly (readonly unknown[])[]): Candle[] {
  return rows.map((row, i) => {
    if (row.length < 6) throw new Error(`klines row ${i}: expected >= 6 fields, got ${row.length}`)
    const num = (v: unknown, field: string): number => {
      const n = Number(v)
      if (!Number.isFinite(n)) throw new Error(`klines row ${i}: ${field} is not a finite number (${String(v)})`)
      return n
    }
    return {
      openTime: num(row[0], 'openTime'),
      open: num(row[1], 'open'),
      high: num(row[2], 'high'),
      low: num(row[3], 'low'),
      close: num(row[4], 'close'),
      volume: num(row[5], 'volume'),
    }
  })
}

/** 拉取 K 线。超时由调用方 signal 控制（建议 AbortSignal.any([exec.signal, AbortSignal.timeout(ms)])）。 */
export async function fetchKlines(
  symbol: string,
  interval: Interval,
  limit: number,
  signal: AbortSignal,
  provider: MarketProvider = 'binance',
): Promise<Candle[]> {
  if (provider === 'okx') return fetchOkxKlines(symbol, interval, limit, signal)
  if (provider === 'bybit') return fetchBybitKlines(symbol, interval, limit, signal)
  if (provider === 'sina') return fetchSinaKlines(symbol, interval, limit, signal)
  if (provider === 'tencent') return fetchTencentKlines(symbol, interval, limit, signal)
  if (provider === 'yahoo') return fetchYahooKlines(symbol, interval, limit, signal)
  const url = new URL(BINANCE_KLINE_URL)
  url.searchParams.set('symbol', symbol)
  url.searchParams.set('interval', interval)
  url.searchParams.set('limit', String(limit))
  let res: Response
  try {
    res = await fetch(url, { signal })
  } catch (err) {
    throw new Error(`market fetch failed for ${symbol} ${interval}: ${(err as Error).message}`)
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`market fetch failed for ${symbol} ${interval}: HTTP ${res.status} ${body.slice(0, 200)}`)
  }
  const json = (await res.json()) as unknown
  if (!Array.isArray(json)) throw new Error(`market fetch: unexpected response shape for ${symbol}`)
  return parseKlines(json)
}

/** OKX 符号转换：BTCUSDT → BTC-USDT（仅 USDT 计价）。 */
function okxInstId(symbol: string): string {
  if (symbol.endsWith('USDT')) return `${symbol.slice(0, -4)}-USDT`
  if (symbol.endsWith('USD')) return `${symbol.slice(0, -3)}-USD`
  throw new Error(`okx provider supports USDT/USD-quoted symbols only, got ${symbol}`)
}

/** 解析 OKX candles（倒序 → 正序，映射到统一 Candle）。 */
export function parseOkxKlines(rows: readonly (readonly unknown[])[]): Candle[] {
  return rows.slice().reverse().map((row, i) => {
    if (row.length < 6) throw new Error(`okx row ${i}: expected >= 6 fields, got ${row.length}`)
    const num = (v: unknown, field: string): number => {
      const n = Number(v)
      if (!Number.isFinite(n)) throw new Error(`okx row ${i}: ${field} is not a finite number (${String(v)})`)
      return n
    }
    return {
      openTime: num(row[0], 'openTime'),
      open: num(row[1], 'open'),
      high: num(row[2], 'high'),
      low: num(row[3], 'low'),
      close: num(row[4], 'close'),
      volume: num(row[5], 'volume'),
    }
  })
}

/** 解析 Bybit klines（倒序 → 正序，映射到统一 Candle）。 */
export function parseBybitKlines(rows: readonly (readonly unknown[])[]): Candle[] {
  return rows.slice().reverse().map((row, i) => {
    if (row.length < 6) throw new Error(`bybit row ${i}: expected >= 6 fields, got ${row.length}`)
    const num = (v: unknown, field: string): number => {
      const n = Number(v)
      if (!Number.isFinite(n)) throw new Error(`bybit row ${i}: ${field} is not a finite number (${String(v)})`)
      return n
    }
    return {
      openTime: num(row[0], 'openTime'),
      open: num(row[1], 'open'),
      high: num(row[2], 'high'),
      low: num(row[3], 'low'),
      close: num(row[4], 'close'),
      volume: num(row[5], 'volume'),
    }
  })
}

async function fetchOkxKlines(
  symbol: string,
  interval: Interval,
  limit: number,
  signal: AbortSignal,
): Promise<Candle[]> {
  const bar = OKX_INTERVAL[interval] ?? interval
  const url = new URL(OKX_KLINE_URL)
  url.searchParams.set('instId', okxInstId(symbol))
  url.searchParams.set('bar', bar)
  url.searchParams.set('limit', String(Math.min(limit, 300)))
  const res = await safeFetch(url, signal, `${symbol} ${interval} okx`)
  const json = (await res.json()) as { code?: string; data?: unknown }
  if (json.code !== '0' || !Array.isArray(json.data)) {
    throw new Error(`okx fetch failed for ${symbol} ${interval}: code ${String(json.code)}`)
  }
  return parseOkxKlines(json.data as readonly (readonly unknown[])[])
}

async function fetchBybitKlines(
  symbol: string,
  interval: Interval,
  limit: number,
  signal: AbortSignal,
): Promise<Candle[]> {
  const bybitInterval = BYBIT_INTERVAL[interval]
  if (bybitInterval === undefined || bybitInterval === '') {
    throw new Error(`bybit provider does not support interval ${interval}`)
  }
  const url = new URL(BYBIT_KLINE_URL)
  url.searchParams.set('category', 'spot')
  url.searchParams.set('symbol', symbol)
  url.searchParams.set('interval', bybitInterval)
  url.searchParams.set('limit', String(Math.min(limit, 200)))
  const res = await safeFetch(url, signal, `${symbol} ${interval} bybit`)
  const json = (await res.json()) as { retCode?: number; result?: { list?: unknown } }
  if (json.retCode !== 0 || !Array.isArray(json.result?.list)) {
    throw new Error(`bybit fetch failed for ${symbol} ${interval}: retCode ${String(json.retCode)}`)
  }
  return parseBybitKlines(json.result!.list as readonly (readonly unknown[])[])
}

/** 共享 fetch 错误处理：网络失败与 HTTP 非 2xx 转成统一错误。 */
async function safeFetch(
  url: URL,
  signal: AbortSignal,
  label: string,
  headers?: Record<string, string>,
): Promise<Response> {
  let res: Response
  try {
    res = await fetch(url, { signal, headers })
  } catch (err) {
    throw new Error(`market fetch failed for ${label}: ${(err as Error).message}`)
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`market fetch failed for ${label}: HTTP ${res.status} ${body.slice(0, 200)}`)
  }
  return res
}

/** A 股代码校验：sh/sz/bj + 6 位数字。 */
export function assertAShareSymbol(symbol: string): void {
  if (!A_SHARE_SYMBOL.test(symbol)) {
    throw new Error(`invalid A-share symbol "${symbol}": expected sh/sz/bj + 6 digits, e.g. sh600000`)
  }
}

/** Yahoo 代码校验：美股 ticker / 指数 ^GSPC / 港股 0700.HK 等。 */
export function assertYahooSymbol(symbol: string): void {
  if (!YAHOO_SYMBOL.test(symbol)) {
    throw new Error(`invalid yahoo symbol "${symbol}": expected uppercase tickers like AAPL, ^GSPC or 0700.HK`)
  }
}

/** 解析新浪 K 线（对象行：day/open/high/low/close/volume，价格为字符串）。 */
export function parseSinaKlines(rows: readonly Record<string, unknown>[]): Candle[] {
  return rows.map((row, i) => {
    const num = (v: unknown, field: string): number => {
      const n = Number(v)
      if (!Number.isFinite(n)) throw new Error(`sina row ${i}: ${field} is not a finite number (${String(v)})`)
      return n
    }
    const day = row.day === undefined ? undefined : String(row.day)
    if (day === undefined) throw new Error(`sina row ${i}: missing day field`)
    const iso = day.includes(' ') ? day.replace(' ', 'T') + '+08:00' : day + 'T00:00:00+08:00'
    const openTime = Date.parse(iso)
    if (!Number.isFinite(openTime)) throw new Error(`sina row ${i}: unparsable day ${day}`)
    return {
      openTime,
      open: num(row.open, 'open'),
      high: num(row.high, 'high'),
      low: num(row.low, 'low'),
      close: num(row.close, 'close'),
      volume: num(row.volume, 'volume'),
    }
  })
}

/** 解析腾讯 K 线（qfqday/day 行：[date, open, close, high, low, volume]）。 */
export function parseTencentKlines(symbol: string, json: { code?: number; data?: Record<string, { qfqday?: readonly (readonly unknown[])[]; day?: readonly (readonly unknown[])[] }> }): Candle[] {
  if (json.code !== 0 || json.data === undefined) {
    throw new Error(`tencent fetch failed for ${symbol}: code ${String(json.code)}`)
  }
  const bucket = json.data[symbol]
  const rows = bucket?.qfqday ?? bucket?.day
  if (rows === undefined) throw new Error(`tencent fetch: no kline data for ${symbol}`)
  return rows.map((row, i) => {
    if (row.length < 6) throw new Error(`tencent row ${i}: expected >= 6 fields, got ${row.length}`)
    const num = (v: unknown, field: string): number => {
      const n = Number(v)
      if (!Number.isFinite(n)) throw new Error(`tencent row ${i}: ${field} is not a finite number (${String(v)})`)
      return n
    }
    const day = String(row[0])
    const openTime = Date.parse(day + 'T00:00:00+08:00')
    if (!Number.isFinite(openTime)) throw new Error(`tencent row ${i}: unparsable date ${day}`)
    return {
      openTime,
      open: num(row[1], 'open'),
      high: num(row[3], 'high'),
      low: num(row[4], 'low'),
      close: num(row[2], 'close'),
      volume: num(row[5], 'volume'),
    }
  })
}

async function fetchSinaKlines(
  symbol: string,
  interval: Interval,
  limit: number,
  signal: AbortSignal,
): Promise<Candle[]> {
  assertAShareSymbol(symbol)
  const scale = SINA_SCALE[interval]
  if (scale === undefined) {
    throw new Error(`sina provider supports intervals 5m/15m/30m/1h/1d only, got ${interval}`)
  }
  const url = new URL(SINA_KLINE_URL)
  url.searchParams.set('symbol', symbol)
  url.searchParams.set('scale', scale)
  url.searchParams.set('ma', 'no')
  url.searchParams.set('datalen', String(Math.min(limit, 1000)))
  const res = await safeFetch(url, signal, `${symbol} ${interval} sina`, {
    Referer: 'https://finance.sina.com.cn',
  })
  const json = (await res.json()) as unknown
  if (!Array.isArray(json)) throw new Error(`sina fetch: unexpected response for ${symbol}`)
  if (json.length === 0) throw new Error(`sina fetch: empty klines for ${symbol} ${interval}`)
  return parseSinaKlines(json as readonly Record<string, unknown>[])
}

async function fetchTencentKlines(
  symbol: string,
  interval: Interval,
  limit: number,
  signal: AbortSignal,
): Promise<Candle[]> {
  assertAShareSymbol(symbol)
  if (interval !== '1d') {
    throw new Error(`tencent provider supports interval 1d only (adjusted daily klines), got ${interval}`)
  }
  const url = new URL(TENCENT_KLINE_URL)
  url.searchParams.set('param', `${symbol},day,,,${Math.min(limit, 1000)},qfq`)
  const res = await safeFetch(url, signal, `${symbol} ${interval} tencent`)
  const json = (await res.json()) as Parameters<typeof parseTencentKlines>[1]
  const candles = parseTencentKlines(symbol, json)
  if (candles.length === 0) throw new Error(`tencent fetch: empty klines for ${symbol} ${interval}`)
  // 部分市场（美股）忽略 count 参数返回全历史 → 统一截取最后 limit 根
  return candles.slice(-Math.min(limit, candles.length))
}

/** 解析 Yahoo chart 响应（纯函数）：时间戳 + 引用的并列数组，过滤 null 行。 */
export function parseYahooChart(
  symbol: string,
  json: { chart?: { result?: { timestamp?: readonly number[]; indicators?: { quote?: readonly { open?: readonly (number | null)[]; high?: readonly (number | null)[]; low?: readonly (number | null)[]; close?: readonly (number | null)[]; volume?: readonly (number | null)[] }[] } }[]; error?: unknown } },
): Candle[] {
  const result = json.chart?.result?.[0]
  const timestamps = result?.timestamp
  const quote = result?.indicators?.quote?.[0]
  if (result === undefined || timestamps === undefined || quote === undefined) {
    throw new Error(`yahoo fetch: no chart data for ${symbol}${json.chart?.error != null ? ` (${String(json.chart.error).slice(0, 80)})` : ''}`)
  }
  const candles: Candle[] = []
  for (let i = 0; i < timestamps.length; i++) {
    const open = quote.open?.[i]
    const high = quote.high?.[i]
    const low = quote.low?.[i]
    const close = quote.close?.[i]
    const volume = quote.volume?.[i]
    if (open === null || open === undefined || high === null || high === undefined
      || low === null || low === undefined || close === null || close === undefined) continue
    candles.push({
      openTime: timestamps[i]! * 1000,
      open,
      high,
      low,
      close,
      volume: volume ?? 0,
    })
  }
  if (candles.length === 0) throw new Error(`yahoo fetch: empty klines for ${symbol}`)
  return candles
}

async function fetchYahooKlines(
  symbol: string,
  interval: Interval,
  limit: number,
  signal: AbortSignal,
): Promise<Candle[]> {
  assertYahooSymbol(symbol)
  if (interval !== '1d') {
    throw new Error(`yahoo provider supports interval 1d only, got ${interval}`)
  }
  const range = YAHOO_RANGE.find(r => limit <= r.max)?.range ?? 'max'
  const url = new URL(YAHOO_KLINE_URL)
  url.pathname += `/${encodeURIComponent(symbol)}`
  url.searchParams.set('range', range)
  url.searchParams.set('interval', '1d')
  const res = await safeFetch(url, signal, `${symbol} ${interval} yahoo`, {
    'User-Agent': 'Mozilla/5.0 (compatible; dsh-quant)',
  })
  const json = (await res.json()) as Parameters<typeof parseYahooChart>[1]
  const candles = parseYahooChart(symbol, json)
  return candles.slice(-Math.min(limit, candles.length))
}
