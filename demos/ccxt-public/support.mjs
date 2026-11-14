import { createHash } from 'node:crypto'
import { setTimeout as sleep } from 'node:timers/promises'

export const sha256 = text => createHash('sha256').update(text).digest('hex')
const paths = new Set(['/0/public/Assets', '/0/public/AssetPairs', '/0/public/OHLC'])

/** A demo-only egress boundary, not a sandbox for arbitrary third-party code. */
export function publicTransport({ fetchImpl = fetch, maxRequests = 12, gapMs = 1100, timeoutMs = 10_000 } = {}) {
  const requests = []
  const rawOhlc = []
  let nextStart = 0
  const run = async (input, init = {}) => {
    const url = new URL(String(input))
    if (url.origin !== 'https://api.kraken.com' || !paths.has(url.pathname)
      || url.username || url.password || url.hash || (init.method ?? 'GET').toUpperCase() !== 'GET' || init.body != null) {
      throw new Error('public GET allowlist rejected request')
    }
    for (const [key] of new Headers(init.headers)) {
      if (/authorization|api-key|api-sign|cookie/i.test(key)) throw new Error('credential header rejected')
    }
    const allowedQuery = url.pathname.endsWith('/OHLC') ? new Set(['pair', 'interval', 'since']) : new Set()
    for (const [key] of url.searchParams) if (!allowedQuery.has(key)) throw new Error('query allowlist rejected request')
    if (requests.length >= maxRequests) throw new Error('public request budget exhausted')
    const receipt = { path: url.pathname, status: null, elapsed_ms: null, bytes: null, sha256: null }
    requests.push(receipt)
    const wait = Math.max(0, nextStart - performance.now())
    nextStart = performance.now() + wait + gapMs
    await sleep(wait)
    const started = performance.now()
    try {
      const timeout = AbortSignal.timeout(timeoutMs)
      const signal = init.signal ? AbortSignal.any([init.signal, timeout]) : timeout
      const response = await fetchImpl(url.href, { ...init, signal, redirect: 'error' })
      receipt.status = response.status
      const text = await response.clone().text()
      receipt.bytes = Buffer.byteLength(text)
      receipt.sha256 = sha256(text)
      if (receipt.bytes > 2_000_000) throw new Error('public response exceeds demo size budget')
      if (url.pathname.endsWith('/OHLC')) rawOhlc.push(text)
      if (!response.ok) throw new Error(`public HTTP ${response.status}; no retry or endpoint bypass`)
      return response
    } finally { receipt.elapsed_ms = performance.now() - started }
  }
  return { fetch: run, requests, rawOhlc }
}

/** Independent REST baseline: Kraken uses seconds and volume column 6, not VWAP column 5. */
export function krakenRestRows(payload) {
  if (!payload || !Array.isArray(payload.error) || payload.error.length || !payload.result || typeof payload.result !== 'object') {
    throw new Error('Kraken REST error or malformed envelope')
  }
  const keys = Object.keys(payload.result).filter(key => key !== 'last')
  if (keys.length !== 1 || !Array.isArray(payload.result[keys[0]])) throw new Error('expected one Kraken pair')
  const number = value => {
    if ((typeof value !== 'number' && !(typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value)))
      || !Number.isFinite(Number(value))) throw new Error('invalid Kraken numeric field')
    return Number(value)
  }
  return payload.result[keys[0]].map(row => {
    if (!Array.isArray(row) || row.length < 8) throw new Error('invalid Kraken row')
    return [number(row[0]) * 1000, ...[1, 2, 3, 4, 6].map(i => number(row[i]))]
  })
}
