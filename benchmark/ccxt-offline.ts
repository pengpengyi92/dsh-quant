import assert from 'node:assert/strict'
import { performance } from 'node:perf_hooks'
import { pathToFileURL } from 'node:url'
import { ccxtHourlyCandles, CCXT_HOUR_MS as H } from '../src/dsh-data/ccxt.ts'
import { candlesCheck } from '../src/dsh-data/stats.ts'
import { sma } from '../src/dsh-alpha/indicators.ts'

export function offlineCcxtBenchmark() {
  const start = Date.UTC(2026, 0, 1)
  const rows = Array.from({ length: 240 }, (_, i) => [start + i * H, 100 + i, 102 + i, 99 + i, 101 + i, i])
  const baseline = (input: unknown[][]) => input.map(r => ({
    openTime: Number(r[0]), open: Number(r[1]), high: Number(r[2]),
    low: Number(r[3]), close: Number(r[4]), volume: Number(r[5]),
  }))
  const checked = () => ccxtHourlyCandles(rows, start, start + rows.length * H)
  assert.deepEqual(checked(), baseline(rows))
  assert.equal(candlesCheck(checked()).healthy, true)
  assert.equal(sma(checked().map(c => c.close), 5).at(-1), 338)
  const invalid = structuredClone(rows) as unknown[][]
  invalid[0]![5] = null
  assert.equal(baseline(invalid)[0]!.volume, 0)
  assert.throws(() => ccxtHourlyCandles(invalid, start, start + rows.length * H))
  const measure = (fn: () => unknown) => {
    for (let i = 0; i < 50; i++) fn()
    const samples: number[] = []
    for (let i = 0; i < 1000; i++) {
      const t = performance.now()
      fn()
      samples.push(performance.now() - t)
    }
    const sorted = samples.slice().sort((a, b) => a - b)
    return { iterations: samples.length, median_ms: sorted[500]!, max_ms: sorted.at(-1)!, total_ms: samples.reduce((a, b) => a + b, 0) }
  }
  return {
    fixture: '240 independently synthetic hourly candles; fixed UTC start; no RNG',
    protocol: '50 warmups, 1000 samples per path; assertions outside timing; same valid input; single process',
    unsafe_mapping_baseline: measure(() => baseline(rows)),
    checked_mapping: measure(checked),
    checked_quality_sma_pipeline: measure(() => {
      const candles = checked()
      candlesCheck(candles)
      return sma(candles.map(c => c.close), 5)
    }),
    negative_control: 'unsafe baseline accepts null volume as zero; checked bridge rejects it',
    caveat: 'Safety adds work; not an equivalent-work speed contest, latency SLA, OOS/alpha or production benchmark',
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(offlineCcxtBenchmark(), null, 2))
}
