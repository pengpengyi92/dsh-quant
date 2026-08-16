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
): Promise<Candle[]> {
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
