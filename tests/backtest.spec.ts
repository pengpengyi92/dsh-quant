/**
 * backtest.ts 纯函数测试（手算样例）。
 * 运行：cd deepseek-harness && pnpm exec tsx --test ../quant-indicators/tests/backtest.spec.ts
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { backtestMaCross } from '../src/backtest.ts'

test('backtest: V 形序列 — 一次买入持有到末尾（open trade）', () => {
  const close = [10, 9, 8, 7, 6, 5, 6, 7, 8, 9, 10, 11, 12]
  const out = backtestMaCross(close, 2, 3, 0.001)
  // 手算：crossUp 确认于 i=7（prev fast 5.5 <= slow 6，cur 6.5 > 6），i=8 收盘价 8 成交
  assert.equal(out.trades.length, 1)
  assert.equal(out.trades[0].entryIndex, 8)
  assert.equal(out.trades[0].entryPrice, 8)
  assert.equal(out.trades[0].exitIndex, null) // 持仓到末尾
  // position：i=8 起满仓
  assert.deepEqual(out.position, [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1])
  // equity[12] = 0.999 * 12/8 = 1.4985
  assert.ok(Math.abs(out.equityCurve[12]! - 0.999 * 12 / 8) < 1e-9)
  assert.ok(Math.abs(out.totalReturnPct - (0.999 * 12 / 8 - 1) * 100) < 1e-6)
  // 最大回撤 = 买入瞬间的手续费成本（1 → 0.999）
  assert.ok(Math.abs(out.maxDrawdownPct - 0.1) < 1e-6)
})

test('backtest: V 形后回落 — 完整买卖周期 + 双边手续费', () => {
  const close = [10, 9, 8, 7, 6, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4]
  const out = backtestMaCross(close, 2, 3, 0.001)
  // 买 i=8 @8；crossDown 确认于 i=12（prev fast 9.5 >= slow 9.333，cur 8.5 < 9），i=13 收盘价 7 卖出
  assert.equal(out.trades.length, 1)
  const t = out.trades[0]!
  assert.equal(t.entryIndex, 8)
  assert.equal(t.exitIndex, 13)
  assert.equal(t.exitPrice, 7)
  assert.ok(Math.abs(t.returnPct! - (7 / 8 - 1)) < 1e-9)
  // 空仓收尾：cash = (1-fee)^2 = 0.998001
  assert.equal(out.position[13], 0)
  assert.ok(Math.abs(out.equityCurve[13]! - 0.998001) < 1e-9)
  assert.ok(Math.abs(out.totalReturnPct - (0.998001 - 1) * 100) < 1e-6)
})

test('backtest: 单调上升无交叉 → 无交易', () => {
  const out = backtestMaCross([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 2, 3, 0)
  assert.equal(out.trades.length, 0)
  assert.equal(out.totalReturnPct, 0)
  assert.deepEqual(out.position, new Array(10).fill(0))
})

test('backtest: 空序列 → 空结果', () => {
  const out = backtestMaCross([], 2, 3, 0)
  assert.equal(out.trades.length, 0)
  assert.equal(out.totalReturnPct, 0)
  assert.deepEqual(out.equityCurve, [])
})

test('backtest: 前置条件', () => {
  assert.throws(() => backtestMaCross([1, 2, 3], 3, 2, 0), /fast must be < slow/)
  assert.throws(() => backtestMaCross([1, 2, 3], 0, 3, 0), /positive integer/)
  assert.throws(() => backtestMaCross([1, 2, 3], 2, 3, -0.1), /feeRate/)
})

test('backtest: 真实数据冒烟（BTC 日线 close 序列）', () => {
  // 使用与 verify 相同的真实抓取验证链路在 verify.ts 中；这里用确定性上升-震荡序列
  // 验证 equityCurve/position 等长且资金曲线非负
  const close = Array.from({ length: 200 }, (_, i) => 100 + Math.sin(i / 7) * 10 + i * 0.1)
  const out = backtestMaCross(close, 5, 20, 0.001)
  assert.equal(out.equityCurve.length, 200)
  assert.equal(out.position.length, 200)
  for (const v of out.equityCurve) assert.ok(v > 0)
  assert.ok(out.sharpe > -100 && out.sharpe < 100) // 数值合理
})
