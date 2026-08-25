/**
 * Benchmark smoke — 性能冒烟基准
 *
 * 记录核心函数的执行耗时，作为性能回归的"冒烟防线"。
 * 第一阶段：不设硬阈值，只输出数字（CI 记录，人工观察趋势）。
 * 后续：有基线后可在 CI 设"超过 X 倍则失败"门禁。
 *
 * 运行：npm run bench
 */
import { performance } from 'node:perf_hooks';
import { sma, ema, rsi, macd } from '../src/dsh-alpha/indicators.js';

interface BenchCase {
  name: string;
  fn: () => unknown;
}

function time(fn: () => unknown, iterations = 100): number {
  // warmup
  fn();
  const start = performance.now();
  for (let i = 0; i < iterations; i += 1) {
    fn();
  }
  return (performance.now() - start) / iterations;
}

function genSeries(n: number): number[] {
  const out = new Array<number>(n);
  let v = 100;
  for (let i = 0; i < n; i += 1) {
    v += Math.sin(i * 0.1) * 0.5 + Math.random() * 0.1 - 0.05;
    out[i] = v;
  }
  return out;
}

const series1k = genSeries(1000);
const series10k = genSeries(10_000);

const cases: BenchCase[] = [
  {
    name: 'sma(1000, 20) x100',
    fn: () => sma(series1k, 20),
  },
  {
    name: 'sma(10000, 20) x100',
    fn: () => sma(series10k, 20),
  },
  {
    name: 'ema(10000, 20) x100',
    fn: () => ema(series10k, 20),
  },
  {
    name: 'rsi(10000, 14) x100',
    fn: () => rsi(series10k, 14),
  },
  {
    name: 'macd(10000, 12/26/9) x100',
    fn: () => macd(series10k, 12, 26, 9),
  },
];

let slowest = 0;
for (const c of cases) {
  const ms = time(c.fn);
  slowest = Math.max(slowest, ms);
  console.log(`${c.name.padEnd(28)} ${ms.toFixed(3).padStart(9)} ms`);
}

console.log('---');
console.log(`slowest case: ${slowest.toFixed(3)} ms`);

// 冒烟门禁：单例最慢超过 2 秒视为异常（正常量级应 <100ms）
if (slowest > 2000) {
  console.error(`BENCH FAIL: slowest ${slowest.toFixed(0)}ms exceeds 2000ms smoke ceiling`);
  process.exit(1);
}
console.log('bench smoke: OK');
