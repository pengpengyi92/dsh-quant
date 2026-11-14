import assert from 'node:assert/strict'
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { performance } from 'node:perf_hooks'
import { Context } from '@deepseek-ai/cordis'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import { kraken, version as ccxtVersion } from 'ccxt'
import { fetch as patchedFetch } from 'undici'
import { apply, ccxtHourlyCandles, CCXT_HOUR_MS as H, sma } from '../../src/index.ts'
import { offlineCcxtBenchmark } from '../../benchmark/ccxt-offline.ts'
import { publicTransport, krakenRestRows, sha256 } from './support.mjs'

if (process.argv.slice(2).join(' ') !== '--live --personal-research') {
  throw new Error('Opt in with --live --personal-research after reviewing Kraken terms; no paid/private API or data redistribution.')
}
const installedCcxt = JSON.parse(readFileSync(new URL('./node_modules/ccxt/package.json', import.meta.url), 'utf8')) as { version: string }
assert.equal(installedCcxt.version, '4.5.92')
const installedUndici = JSON.parse(readFileSync(new URL('./node_modules/undici/package.json', import.meta.url), 'utf8')) as { version: string }
assert.equal(installedUndici.version, '7.30.1')
// Published 4.5.92 retains 4.5.91 in its JS export; record both, never relabel the install.
assert.equal(ccxtVersion, '4.5.91')
const root = fileURLToPath(new URL('../../', import.meta.url))
const started = new Date()
const id = started.toISOString().replace(/[:.]/g, '-')
const privateDir = resolve(root, '.data-local', 'ccxt', id)
const evidenceDir = resolve(root, 'benchmark', 'ccxt', 'evidence')
mkdirSync(privateDir, { recursive: true })
mkdirSync(evidenceDir, { recursive: true })
const receiptPath = resolve(evidenceDir, `${id}.json`)
// Both paths use the same patched transport; Node's separately bundled version is not upgraded by npm overrides.
const transport = publicTransport({ fetchImpl: patchedFetch as unknown as typeof fetch })
const client = new kraken({ enableRateLimit: true, timeout: 10_000, maxRetriesOnFailure: 0 })
client.fetchImplementation = transport.fetch
// Leave a full additional closed hour as a guard; this is not historical PIT availability proof.
const untilMs = Math.floor(started.getTime() / H) * H - H
const sinceMs = untilMs - 60 * H
const sources = [
  'src/dsh-data/ccxt.ts', 'src/index.ts', 'demos/ccxt-public/run.ts',
  'demos/ccxt-public/support.mjs', 'demos/ccxt-public/package-lock.json', 'benchmark/ccxt-offline.ts',
]
const receipt = {
  status: 'RUNNING',
  started_at_utc: started.toISOString(),
  started_at_shanghai: new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', dateStyle: 'short', timeStyle: 'medium' }).format(started),
  finished_at_utc: '',
  source_commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  source_worktree: execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim() ? 'DIRTY; use file hashes' : 'CLEAN',
  source_sha256: Object.fromEntries(sources.map(p => [p, sha256(readFileSync(resolve(root, p)))])),
  environment: { node: process.version, platform: process.platform, arch: process.arch, ccxt_npm: installedCcxt.version, ccxt_exported_version: ccxtVersion, undici: installedUndici.version, node_bundled_undici_unused: process.versions.undici, transport: 'guarded npm undici 7.30.1 fetch for both paths; no custom TLS/proxy' },
  scope: { exchange: 'kraken', symbol: 'BTC/USD', timeframe: '1h', since_ms: sinceMs, until_ms_exclusive: untilMs, required_closed_bars: 60 },
  protocol: {
    rounds_per_path: 3, order: ['rest,ccxt-cold', 'ccxt-warm,rest', 'rest,ccxt-warm'],
    request_budget: 12, request_gap_ms: 1100, per_request_timeout_ms: 10_000, retries: 0,
    latency: 'fetch path includes response hashing, rate limiting and cold market metadata where applicable; excludes SDK import, tool processing, installation',
    acceptance: 'all rounds >=60 closed valid consecutive bars, same-window exact REST/CCXT parity, registered quality+SMA match pure oracle',
    statistical_limit: 'n=3, descriptive samples only; no p95/SLA/speedup conclusion',
  },
  rights: {
    sdk: 'CCXT 4.5.92 MIT; source e6fd82900c9f2b71fa0fa7524d95dd788e2803fc',
    data: 'Kraken terms, personal non-commercial research only; commercial/non-personal use requires separate permission',
    raw_data_published: false, keys_accounts_payment_orders: 'NOT_USED',
    local_outputs: '.data-local/ccxt/<run-id>/ (git-ignored, excluded from package)',
  },
  observations: [] as { path: string; round: number; latency_ms: number; bars: number; outside_window: number; candle_sha256: string; runtime_calls: string[] }[],
  network: transport.requests,
  offline: offlineCcxtBenchmark(),
  failure: null as null | { name: string; detail: string },
  caveats: 'No historical publication/observation vintages, multi-source price validation, survivorship proof, trading return or production-readiness claim.',
}

const ctx = new Context()
const signal = AbortSignal.timeout(120_000)
let calls = 0
try {
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(ToolRuntime)
  await ctx.plugin({ name: 'dsh-quant', inject: ['tools'], apply })
  const call = async (name: string, args: Record<string, unknown>) => {
    const r = await ctx.tools.execute({ callId: `ccxt-${++calls}` as Parameters<typeof ctx.tools.execute>[0]['callId'], name, arguments: args, signal })
    if (r.isError) throw new Error(`registered tool ${name} failed`)
    return r.value
  }
  const results = new Map<string, ReturnType<typeof ccxtHourlyCandles>>()
  for (let round = 0; round < 3; round++) {
    for (const path of round === 1 ? ['ccxt', 'rest'] : ['rest', 'ccxt']) {
      const t = performance.now()
      const rows = path === 'ccxt'
        ? await client.fetchOHLCV('BTC/USD', '1h', sinceMs, 64)
        : krakenRestRows(await (await transport.fetch(`https://api.kraken.com/0/public/OHLC?pair=XBTUSD&interval=60&since=${sinceMs / 1000}`)).json())
      const latency = performance.now() - t
      const candles = ccxtHourlyCandles(rows, sinceMs, untilMs)
      const closes = candles.map(c => c.close)
      const quality = await call('quant_data_quality', { candles })
      const moving = await call('quant_sma', { values: closes, window: 5 })
      assert.equal((quality as { healthy: boolean }).healthy, true)
      assert.deepEqual((moving as { values: unknown }).values, sma(closes, 5))
      results.set(`${round}-${path}`, candles)
      writeFileSync(resolve(privateDir, `${round}-${path}.json`), JSON.stringify({ rows, candles, quality, moving }, null, 2))
      receipt.observations.push({ path, round, latency_ms: latency, bars: candles.length,
        outside_window: rows.length - candles.length, candle_sha256: sha256(JSON.stringify(candles)),
        runtime_calls: ['quant_data_quality:PASS', 'quant_sma:PASS'] })
    }
    assert.deepEqual(results.get(`${round}-rest`), results.get(`${round}-ccxt`), `round ${round}: REST/CCXT same-window mismatch`)
  }
  for (const candles of results.values()) assert.deepEqual(candles, results.get('0-rest'), 'closed window changed between repeats')
  receipt.status = 'PASS'
} catch (err) {
  receipt.status = 'FAIL'
  // Vendor error strings can contain response data; keep detailed errors local only.
  receipt.failure = { name: err instanceof Error ? err.name : 'UnknownError', detail: 'See private failure.txt; no retry/fallback. Failed samples are retained, not converted to PASS.' }
  writeFileSync(resolve(privateDir, 'failure.txt'), err instanceof Error ? err.stack ?? err.message : String(err))
  process.exitCode = 1
} finally {
  await ctx.fiber.dispose()
  await client.close()
  receipt.finished_at_utc = new Date().toISOString()
  writeFileSync(resolve(privateDir, 'raw-ohlc-responses.json'), JSON.stringify(transport.rawOhlc))
  writeFileSync(resolve(privateDir, 'receipt.json'), JSON.stringify(receipt, null, 2))
  if (existsSync(receiptPath)) throw new Error('Refusing to overwrite an existing evidence run')
  writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`)
  console.log(JSON.stringify({ status: receipt.status, receipt: receiptPath, local_data: privateDir, public_requests: transport.requests.length, completed_paths: receipt.observations.length }, null, 2))
}
