/**
 * dsh-quant-infra · OMS 订单生命周期状态机（核心新能力）
 * =====================================================
 * 纯函数、零依赖、不可逆流转——继承 dsh-quant 哲学。
 *
 * 状态机（每步记录 audit 事件——赤诚/可审计）：
 *   NEW → VALIDATED → PENDING → PARTIALLY_FILLED → FILLED
 *           ↓            ↓            ↓
 *        REJECTED    PENDING_CANCEL  PENDING_CANCEL
 *                        ↓
 *                     CANCELLED
 */
export type OrderStatus =
  | 'NEW' | 'VALIDATED' | 'PENDING' | 'PARTIALLY_FILLED'
  | 'FILLED' | 'CANCELLED' | 'REJECTED' | 'PENDING_CANCEL'

export type OrderSide = 'buy' | 'sell'
export type OrderType = 'market' | 'limit' | 'post_only' | 'ioc' | 'fok'

export interface Order {
  id: string
  symbol: string
  side: OrderSide
  type: OrderType
  quantity: number
  price?: number        // limit 类需要
  status: OrderStatus
  filledQty: number
  avgFillPrice?: number
  createdAt: number
  meta?: Record<string, unknown>
}

export interface LifecycleEvent {
  ts: number
  orderId: string
  from: OrderStatus | null
  to: OrderStatus
  reason: string
  meta?: Record<string, unknown>
}

/** 合法流转表（不可逆）——status → 允许的下一状态 */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NEW:              ['VALIDATED', 'REJECTED'],
  VALIDATED:        ['PENDING', 'REJECTED'],
  PENDING:          ['PARTIALLY_FILLED', 'FILLED', 'PENDING_CANCEL', 'REJECTED'],
  PARTIALLY_FILLED: ['FILLED', 'PENDING_CANCEL'],
  FILLED:           [],               // 终态
  CANCELLED:        [],               // 终态
  REJECTED:         [],               // 终态
  PENDING_CANCEL:   ['CANCELLED', 'FILLED'],  // 撤单竞态：可能已成交
}

export function createOrder(
  id: string, symbol: string, side: OrderSide, type: OrderType,
  quantity: number, price?: number,
): Order {
  return {
    id, symbol, side, type, quantity, price,
    status: 'NEW', filledQty: 0,
    createdAt: Date.now(),
  }
}

/** 状态流转：返回 [新订单, 事件]；非法流转抛错（防错） */
export function transition(
  order: Order, to: OrderStatus, reason: string, meta?: Record<string, unknown>,
): [Order, LifecycleEvent] {
  const allowed = TRANSITIONS[order.status]
  if (!allowed.includes(to)) {
    throw new Error(
      `非法状态流转: ${order.status} → ${to}（允许: ${allowed.join('/') || '终态'}）`)
  }
  const next: Order = { ...order, status: to }
  const ev: LifecycleEvent = {
    ts: Date.now(), orderId: order.id,
    from: order.status, to, reason, meta,
  }
  return [next, ev]
}

/** 成交：更新 filledQty + 均价；自动推进状态 */
export function fill(
  order: Order, fillQty: number, fillPrice: number,
): [Order, LifecycleEvent] {
  if (fillQty <= 0) throw new Error('fillQty 必须 > 0')
  const nextQty = order.filledQty + fillQty
  if (nextQty > order.quantity) throw new Error('成交超量')
  const avg = order.avgFillPrice == null
    ? fillPrice
    : (order.avgFillPrice * order.filledQty + fillPrice * fillQty) / nextQty
  const next: Order = {
    ...order,
    filledQty: nextQty,
    avgFillPrice: avg,
  }
  const to: OrderStatus = nextQty >= order.quantity ? 'FILLED' : 'PARTIALLY_FILLED'
  const [finalOrder, ev] = transition(next, to, 'fill', { fillQty, fillPrice })
  return [finalOrder, ev]
}

/** 回放审计（从事件流重建——赤诚/可验证） */
export function replay(events: LifecycleEvent[]): OrderStatus[] {
  return events.map(e => e.to)
}
