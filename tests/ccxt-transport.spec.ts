import assert from 'node:assert/strict'
import { test } from 'node:test'
import { publicTransport, krakenRestRows } from '../demos/ccxt-public/support.mjs'

test('CCXT transport: only bounded, credential-free public GET requests; no redirects', async () => {
  let calls = 0
  const transport = publicTransport({ gapMs: 0, maxRequests: 1, fetchImpl: async (_url, init = {}) => {
    calls++
    assert.equal(init.redirect, 'error')
    assert(init.signal instanceof AbortSignal)
    return new Response('{"error":[],"result":{}}')
  } })
  for (const [url, init] of [
    ['https://api.kraken.com/0/private/Balance', {}],
    ['https://other.invalid/0/public/OHLC', {}],
    ['https://api.kraken.com/0/public/OHLC', { method: 'POST' }],
    ['https://api.kraken.com/0/public/OHLC', { headers: { 'API-Key': 'synthetic-not-a-key' } }],
    ['https://api.kraken.com/0/public/OHLC?apiKey=synthetic', {}],
  ] as const) await assert.rejects(transport.fetch(url, init))
  assert.equal(calls, 0)
  await transport.fetch('https://api.kraken.com/0/public/OHLC?pair=XBTUSD&interval=60&since=1')
  await assert.rejects(transport.fetch('https://api.kraken.com/0/public/OHLC'), /budget/)
  assert.equal(calls, 1)
  assert.equal(transport.requests.length, 1)
  assert.match(transport.requests[0]!.sha256!, /^[a-f0-9]{64}$/)
})

test('CCXT transport: HTTP failure is recorded once, not retried', async () => {
  const transport = publicTransport({ gapMs: 0, fetchImpl: async () => new Response('denied', { status: 403 }) })
  await assert.rejects(transport.fetch('https://api.kraken.com/0/public/OHLC'), /HTTP 403/)
  assert.equal(transport.requests.length, 1)
  assert.equal(transport.requests[0]!.status, 403)
})

test('CCXT REST baseline: seconds -> ms, base volume != VWAP, API errors/missing values rejected', () => {
  const payload = { error: [], result: { XXBTZUSD: [[1767225600, '10', '13', '9', '12', '11.5', '2', 5]], last: 1767229200 } }
  assert.deepEqual(krakenRestRows(payload), [[1767225600000, 10, 13, 9, 12, 2]])
  for (const bad of [null, {}, { error: ['denied'], result: {} }, { error: [], result: { last: 1 } }]) {
    assert.throws(() => krakenRestRows(bad))
  }
  payload.result.XXBTZUSD[0]![1] = ''
  assert.throws(() => krakenRestRows(payload), /numeric/)
})
