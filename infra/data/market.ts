/**
 * dsh-quant-infra · data 模块接口（行情/历史/归一化）
 * =====================================================
 * 定义数据怎么"进"——多源可插拔（OKX/Binance/文件）。
 * 真实 adapter 复用 dsh-quant 已验证逻辑 + PTFT/scripts/okx_cli.py。
 */
export interface Bar { t: number; o: number; h: number; l: number; c: number; v: number }
export interface Ticker { last: number; bid: number; ask: number; ts: number }
export interface OrderBookLevel { price: number; size: number }
export interface OrderBook { bids: OrderBookLevel[]; asks: OrderBookLevel[] }

/** 数据源抽象：任何源（OKX/Binance/文件/回放）实现此接口 */
export interface DataSource {
  ticker(symbol: string): Promise<Ticker>
  bars(symbol: string, timeframe: string, limit?: number): Promise<Bar[]>
  orderbook?(symbol: string, depth?: number): Promise<OrderBook>
}

/** 归一化：时间戳统一毫秒（Gate 秒级 ×1000——复用修复经验） */
export function normalizeTs(ts: number): number {
  return ts < 1e11 ? ts * 1000 : ts  // 秒 → 毫秒
}

/** 数据质量检查（复用 dsh-data/quality 思路） */
export function qualityChecks(bars: Bar[]): { ok: boolean; issues: string[] } {
  const issues: string[] = []
  for (let i = 1; i < bars.length; i++) {
    if (bars[i].t <= bars[i - 1].t) { issues.push(`时间戳非递增 @${i}`); break }
    if (bars[i].h < bars[i].l) { issues.push(`high<low @${i}`); break }
  }
  return { ok: issues.length === 0, issues }
}

/** 重采样：1m → N 分钟（OKX 无 2m bar 的聚合——PMMT 经验） */
export function resample(bars: Bar[], agg: number): Bar[] {
  const out: Bar[] = []
  for (let i = agg - 1; i < bars.length; i += agg) {
    const group = bars.slice(i - agg + 1, i + 1)
    out.push({
      t: group[0].t, o: group[0].o,
      h: Math.max(...group.map(b => b.h)),
      l: Math.min(...group.map(b => b.l)),
      c: group[group.length - 1].c,
      v: group.reduce((s, b) => s + b.v, 0),
    })
  }
  return out
}
