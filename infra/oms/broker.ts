/**
 * dsh-quant-infra · OMS Broker 抽象（模拟/纸面/实盘可插拔）
 * =====================================================
 * 继承 POKX 边界哲学：infra 定义订单状态机与 broker 接口，
 * 实盘 adapter 由外部（POKX 类）实现——infra 本身不接实盘。
 *
 * 订单生命周期（broker 视角）：
 *   NEW ──submit──▶ PENDING ──fill──▶ FILLED
 *    │                │  └─cancel─▶ PENDING_CANCEL → CANCELLED
 *    └─(外部风控门)──▶ VALIDATED ──submit──▶ PENDING
 *
 * submit 接受 NEW（内部校验）或 VALIDATED（已过外部风控门）两种入口；
 * cancel 走 PENDING_CANCEL 中间态（撤单竞态可被 fill 覆盖）。
 */
import { createOrder, transition, fill } from './lifecycle.ts'
import type { Order, OrderSide, OrderType, LifecycleEvent } from './lifecycle.ts'

export interface BrokerAdapter {
  /** 送单（模拟/纸面/实盘各自实现） */
  submit(order: Order): Promise<Order>
  /** 撤单 */
  cancel(orderId: string): Promise<Order>
}

export class SimBroker implements BrokerAdapter {
  private orders = new Map<string, Order>()
  private events: LifecycleEvent[] = []
  private seq = 0

  private fillProb: number
  /** 默认成交概率（可覆盖：0=永不成交 1=必成交） */
  constructor(fillProb = 0.8) { this.fillProb = fillProb }

  async submit(o: Order): Promise<Order> {
    const pending = this.promote(o)
    this.orders.set(pending.id, pending)
    // 模拟撮合：按概率立即成交
    const filled = Math.random() < this.fillProb
    if (filled) {
      const px = o.price ?? 100.0  // 模拟价（真实行情由 data 模块给）
      const [filledOrder, ev] = fill(pending, o.quantity, px)
      this.orders.set(o.id, filledOrder)
      this.events.push(ev)
      return filledOrder
    }
    return pending
  }

  async cancel(orderId: string): Promise<Order> {
    const o = this.orders.get(orderId)
    if (!o) throw new Error('订单不存在: ' + orderId)
    if (o.status === 'PENDING_CANCEL') return o
    if (o.status === 'PENDING' || o.status === 'PARTIALLY_FILLED') {
      const [pc, ev1] = transition(o, 'PENDING_CANCEL', 'user-cancel')
      const [c, ev2] = transition(pc, 'CANCELLED', 'broker-confirmed-cancel')
      this.orders.set(orderId, c)
      this.events.push(ev1, ev2)
      return c
    }
    throw new Error('当前状态不可撤: ' + o.status)
  }

  /** 审计事件（可回放） */
  get audit(): LifecycleEvent[] { return this.events }

  /** 把订单推进到 PENDING：NEW 内部校验；VALIDATED（已过风控门）直接送 */
  private promote(o: Order): Order {
    if (o.status === 'NEW') {
      const [validated, ev] = transition(o, 'VALIDATED', 'validation-passed')
      const [pending, ev2] = transition(validated, 'PENDING', 'submitted-to-broker')
      this.events.push(ev, ev2)
      return pending
    }
    if (o.status === 'VALIDATED') {
      const [pending, ev] = transition(o, 'PENDING', 'submitted-to-broker')
      this.events.push(ev)
      return pending
    }
    throw new Error('submit 只接受 NEW/VALIDATED: ' + o.status)
  }

  static newOrder(id: string, symbol: string, side: OrderSide, type: OrderType,
                  qty: number, price?: number): Order {
    return createOrder(id, symbol, side, type, qty, price)
  }
}
