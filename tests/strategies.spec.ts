/**
 * 策略回测手算测试（0.3.0：布林带突破 / RSI 反转 / 止损止盈）。
 * 运行：cd deepseek-harness && pnpm exec tsx --test ../quant-indicators/tests/strategies.spec.ts
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { backtestBollingerBreakout, backtestMaCross, backtestRsiReversion } from '../src/backtest.ts'

test('bollinger breakout: 平稳后跳涨 → 突破上轨买入持有', () => {
  const close = [10, 10, 10, 10, 10, 15, 15, 15]
  const out = backtestBollingerBreakout(close, 3, 1, 0)
  // crossUp at i=5（close[5]=15 > upper[5]=14.02）→ i=6 收盘价 15 买入
  assert.equal(out.trades.length, 1)
  assert.equal(out.trades[0].entryIndex, 6)
  assert.equal(out.trades[0].entryPrice, 15)
  assert.equal(out.trades[0].exitIndex, null) // 中轨=15 不破，持仓到末尾
  assert.deepEqual(out.position, [0, 0, 0, 0, 0, 0, 1, 1])
})

test('bollinger breakout: 单调平稳无突破 → 无交易', () => {
  const out = backtestBollingerBreakout([10, 10, 10, 10, 10], 3, 2, 0)
  assert.equal(out.trades.length, 0)
  assert.equal(out.totalReturnPct, 0)
})

test('ma-cross stop-loss: 买入后急跌触发止损', () => {
  // 买入 i=8 @8（V 形交叉）；stopLoss=0.3 → 阈值 5.6；close[10]=5 触发
  const close = [10, 9, 8, 7, 6, 5, 6, 7, 8, 9, 5, 5, 5]
  const out = backtestMaCross(close, 2, 3, 0.001, 0.3)
  assert.equal(out.trades.length, 1)
  assert.equal(out.trades[0].entryIndex, 8)
  assert.equal(out.trades[0].exitReason, 'stop_loss')
  assert.equal(out.trades[0].exitPrice, 5)
  assert.equal(out.position[10], 0)
})

test('ma-cross take-profit: 买入后上涨触发止盈（早于信号卖出）', () => {
  // 原 V 形序列无止损时 signal 卖出在 i=13 @7；takeProfit=0.25 → 阈值 10 → i=10 止盈
  const close = [10, 9, 8, 7, 6, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4]
  const out = backtestMaCross(close, 2, 3, 0.001, undefined, 0.25)
  assert.equal(out.trades.length, 1)
  assert.equal(out.trades[0].entryIndex, 8)
  assert.equal(out.trades[0].exitReason, 'take_profit')
  assert.ok(Math.abs(out.trades[0].exitPrice! - 10) < 1e-9)
})

test('rsi reversion: 超卖反弹上穿 30 买入持有（持续上涨无卖出）', () => {
  const close = [10, 9, 8, 7, 6, 5, 6, 7, 8, 9, 10]
  const out = backtestRsiReversion(close, 3, 30, 70, 0)
  // RSI[6]=33.3 上穿 30（prev RSI[5]=0）→ i=7 收盘价 7 买入
  assert.equal(out.trades.length, 1)
  assert.equal(out.trades[0].entryIndex, 7)
  assert.equal(out.trades[0].entryPrice, 7)
  assert.equal(out.trades[0].exitIndex, null) // 一路涨 RSI→100，无下穿 70
})

test('rsi reversion: 前置条件', () => {
  assert.throws(() => backtestRsiReversion([1, 2, 3], 2, 30, 30, 0), /sellAbove/)
  assert.throws(() => backtestRsiReversion([1, 2, 3], 2, 0, 70, 0), /buyBelow/)
  assert.throws(() => backtestBollingerBreakout([1, 2, 3], 2, 0, 0), /multiplier/)
  assert.throws(() => backtestMaCross([1, 2, 3], 2, 3, 0, 1.5), /stopLoss/)
})
