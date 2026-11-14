import type { Candle } from './market.js'

export const CCXT_HOUR_MS = 3_600_000

/** A deliberately bounded, spot-hourly CCXT input bridge; no SDK/network dependency. */
export function ccxtHourlyCandles(rows: unknown, sinceMs: number, untilMs: number): Candle[] {
  if (![sinceMs, untilMs].every(t => Number.isSafeInteger(t) && t >= 1_000_000_000_000 && t % CCXT_HOUR_MS === 0)
    || untilMs <= sinceMs || untilMs - sinceMs > 700 * CCXT_HOUR_MS) {
    throw new RangeError('expected an aligned UTC millisecond window, 1..700 hours, after 2001')
  }
  if (!Array.isArray(rows)) throw new TypeError('CCXT OHLCV must be an array')
  const candles: Candle[] = []
  let previous = -1
  for (const [i, row] of rows.entries()) {
    if (!Array.isArray(row) || row.length !== 6
      || Array.from(row).some(value => typeof value !== 'number' || !Number.isFinite(value))) {
      throw new TypeError(`CCXT row ${i}: expected six finite numbers; missing values are not zero`)
    }
    const [openTime, open, high, low, close, volume] = row as number[]
    if (!Number.isSafeInteger(openTime) || openTime! < 1_000_000_000_000 || openTime! % CCXT_HOUR_MS !== 0
      || openTime! <= previous) throw new RangeError(`CCXT row ${i}: timestamps must be UTC milliseconds, aligned and strictly increasing`)
    if (Math.min(open!, high!, low!, close!) <= 0 || volume! < 0
      || low! > Math.min(open!, close!) || high! < Math.max(open!, close!)) {
      throw new RangeError(`CCXT row ${i}: invalid OHLC envelope or volume`)
    }
    previous = openTime!
    // The window end is exclusive: an unclosed/future bar never reaches research tools.
    if (openTime! < sinceMs || openTime! + CCXT_HOUR_MS > untilMs) continue
    candles.push({ openTime: openTime!, open: open!, high: high!, low: low!, close: close!, volume: volume! })
  }
  const expected = (untilMs - sinceMs) / CCXT_HOUR_MS
  if (candles.length !== expected || candles.some((c, i) => c.openTime !== sinceMs + i * CCXT_HOUR_MS)) {
    throw new RangeError(`CCXT window incomplete: expected ${expected} consecutive closed hours, got ${candles.length}; no fill-forward`)
  }
  return candles
}
