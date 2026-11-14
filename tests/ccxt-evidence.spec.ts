import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { checkCcxtPack } from '../scripts/check-ccxt-pack.mjs'

const json = (path: string) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'))

test('CCXT pack gate: nested dependencies/private data must not ship; compiled bridge and lock must', () => {
  const files = ['lib/dsh-data/ccxt.js', 'demos/ccxt-public/run.ts', 'demos/ccxt-public/package-lock.json'].map(path => ({ path }))
  assert.equal(checkCcxtPack({ files }).forbidden, 0)
  for (const path of ['demos/ccxt-public/node_modules/ccxt/package.json', '.data-local/ccxt/raw.json']) {
    assert.throws(() => checkCcxtPack({ files: [...files, { path }] }), /forbidden/)
  }
  assert.throws(() => checkCcxtPack({ files: files.slice(0, 1) }), /missing/)
})

test('CCXT archived live receipt: six paths, bounded public requests and exact closed-window parity', () => {
  const r = json('benchmark/ccxt/evidence/2026-11-14T07-47-34-088Z.json')
  assert.equal(r.status, 'PASS')
  assert.equal(r.observations.length, 6)
  assert.equal(r.network.length, 8)
  assert(r.network.length <= r.protocol.request_budget)
  const hashes = new Set(r.observations.map((o: { candle_sha256: string }) => o.candle_sha256))
  assert.equal(hashes.size, 1)
  assert.equal(r.scope.until_ms_exclusive - r.scope.since_ms, 60 * 3_600_000)
  assert(r.observations.every((o: { bars: number; runtime_calls: string[] }) => o.bars === 60 && o.runtime_calls.length === 2))
  assert(r.network.every((n: { path: string; status: number; sha256: string }) => /^\/0\/public\/(OHLC|Assets|AssetPairs)$/.test(n.path)
    && n.status === 200 && /^[a-f0-9]{64}$/.test(n.sha256)))
  assert.equal(r.rights.raw_data_published, false)
  assert.equal(r.rights.keys_accounts_payment_orders, 'NOT_USED')
  assert.equal(r.environment.undici, '7.30.1')
  assert(r.environment.transport.includes('npm undici 7.30.1'))
})

test('CCXT optional lock: pinned SDK/patched transport; core package has neither dependency', () => {
  const root = json('package.json')
  const demo = json('demos/ccxt-public/package.json')
  const lock = json('demos/ccxt-public/package-lock.json')
  assert.equal(root.dependencies?.ccxt, undefined)
  assert.equal(root.devDependencies?.ccxt, undefined)
  assert.equal(demo.private, true)
  assert.equal(demo.dependencies.ccxt, '4.5.92')
  assert.equal(demo.dependencies.undici, '7.30.1')
  assert.equal(demo.overrides.ccxt.undici, '7.30.1')
  assert.equal(lock.packages['node_modules/ccxt'].version, '4.5.92')
  assert.equal(lock.packages['node_modules/undici'].version, '7.30.1')
  assert.match(lock.packages['node_modules/ccxt'].integrity, /^sha512-/)
})

test('CCXT raw downloads stay ignored; archived evidence contains no raw OHLC arrays', () => {
  assert(readFileSync(new URL('../.gitignore', import.meta.url), 'utf8').includes('/.data-local/'))
  const receipt = json('benchmark/ccxt/evidence/2026-11-14T07-47-34-088Z.json')
  const forbidden = new Set(['rows', 'candles', 'rawOhlc', 'apiKey', 'secret', 'open', 'high', 'low', 'close', 'volume'])
  const visit = (value: unknown) => {
    if (!value || typeof value !== 'object') return
    for (const [key, child] of Object.entries(value)) { assert(!forbidden.has(key), key); visit(child) }
  }
  visit(receipt)
})
