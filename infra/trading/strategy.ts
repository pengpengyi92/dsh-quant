/**
 * dsh-quant-infra · trading 模块 · 策略接口（信号层）
 * =====================================================
 * 上层策略（dsh-quant alpha/combo、PMMT/PTFT）实现 Strategy 接口——
 * 只管"看数据 → 出信号"，不管 OMS/券商（基建由 infra 管）。
 *
 * 信号流（闭环）：
 *   onBar/onTick → Signal → signalToOrder() → Order(NEW)
 *   → trading/risk 风控门（VALIDATED/REJECTED）→ oms/broker（PENDING→FILLED）
 */
import { createOrder } from '../oms/lifecycle.ts'
import type { Order, OrderSide, OrderType } from '../oms/lifecycle.ts'
import type { Bar, Ticker } from '../data/market.ts'

/** 策略信号——方向 + 目标仓位（0..1 资金比例），纯数据 */
export interface Signal {
  /** 方向 */
  side: OrderSide
  /** 目标仓位：0..1（占 equity 比例）；0 = 平仓/不交易 */
  size: number
  /** 信号时间（毫秒） */
  ts: number
  /** 信号来源/理由（审计留痕） */
  reason?: string
  meta?: Record<string, unknown>
}

/** 策略运行上下文（只读快照——策略不持有全局状态，便于回放/审计） */
export interface StrategyContext {
  /** 当前标的 */
  symbol: string
  /** 当前持仓（正=多 负=空） */
  position: number
  /** 当前资金（仓位计算用） */
  equity: number
  /** 当前市价（下单参考价） */
  markPrice: number
}

/** 策略接口——策略只实现"数据 → 信号" */
export interface Strategy {
  readonly name: string
  /** 每根 K 线收盘后调用 */
  onBar(bar: Bar, ctx: StrategyContext): Signal | null
  /** 实时 tick（可选：非 bar 驱动策略用） */
  onTick?(ticker: Ticker, ctx: StrategyContext): Signal | null
}

/**
 * 信号 → 订单草稿（NEW 状态，未过风控）。
 * 数量 = equity × size ÷ 价格（市价用 markPrice，限价用 limitPrice）。
 * 无法定价 / 仓位为 0 → 不下单（返回 null——防错）。
 */
export function signalToOrder(
  symbol: string,
  signal: Signal,
  opts: {
    equity: number
    markPrice: number
    type?: OrderType
    limitPrice?: number
    id?: string
  },
): Order | null {
  if (signal.size <= 0) return null
  const px = opts.limitPrice ?? opts.markPrice
  if (px <= 0) return null
  const qty = (opts.equity * signal.size) / px
  if (qty <= 0) return null
  return createOrder(
    opts.id ?? `${symbol}-${signal.ts}`,
    symbol, signal.side,
    opts.type ?? 'market', qty,
    opts.limitPrice,
  )
}
