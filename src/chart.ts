/**
 * Chart 数据面（纯函数、零依赖）—— dsh-chart 协议的实现侧。
 *
 * 输出结构化的 ChartData（判别联合），供任何前端渲染器消费：
 * - dsh-quant-ui（Lightweight Charts 渲染，路线 A）
 * - dsh-chart 通用协议节点（平台级，路线 B）
 *
 * 设计文档：log/2026-08-16_ui_chart_design.md
 */

/** 本地 JSON 值（与 lossless JSON 语义一致，零依赖）。 */
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

export interface ChartSeries {
  name: string
  /** 与主数据等长；null 表示该位置无值（对齐约定） */
  values: (number | null)[]
  [key: string]: JsonValue
}

export interface ChartMarker {
  index: number
  kind: 'entry' | 'exit' | 'stop' | 'target'
  [key: string]: JsonValue
}

export interface ChartAnnotation {
  index: number
  label: string
  severity: 1 | 2 | 3
  [key: string]: JsonValue
}

export interface ChartCandle {
  openTime: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  [key: string]: JsonValue
}

export type ChartData =
  | { kind: 'candles'; title: string; candles: ChartCandle[]; overlays: ChartSeries[]; markers: ChartMarker[] }
  | { kind: 'series'; title: string; series: ChartSeries[] }
  | { kind: 'annotations'; title: string; values: (number | null)[]; annotations: ChartAnnotation[] }

/** K 线图 + 叠加线（均线/布林带等）+ 买卖点标记。 */
export function chartCandles(
  candles: readonly ChartCandle[],
  overlays: readonly ChartSeries[] = [],
  markers: readonly ChartMarker[] = [],
  title = 'candles',
): ChartData {
  return { kind: 'candles', title, candles: [...candles], overlays: [...overlays], markers: [...markers] }
}

/** 多序列线图（净值曲线、因子 IC 序列等）。 */
export function chartSeries(series: readonly ChartSeries[], title = 'series'): ChartData {
  return { kind: 'series', title, series: [...series] }
}

/** 标注可视化：序列 + 点级标注（severity 由渲染器映射为黄/橙/红）。 */
export function chartAnnotations(
  values: readonly (number | null)[],
  annotations: readonly ChartAnnotation[],
  title = 'annotations',
): ChartData {
  return { kind: 'annotations', title, values: [...values], annotations: [...annotations] }
}

/** 从回测结果构建净值曲线图（含买卖点与止损止盈标记）。 */
export function chartBacktest(
  equityCurve: readonly number[],
  trades: readonly { entryIndex: number; exitIndex: number | null; exitReason?: string }[],
  title = 'backtest equity',
): ChartData {
  const markers: ChartMarker[] = []
  for (const t of trades) {
    markers.push({ index: t.entryIndex, kind: 'entry' })
    if (t.exitIndex !== null) {
      const kind = t.exitReason === 'stop_loss' ? 'stop' : t.exitReason === 'take_profit' ? 'target' : 'exit'
      markers.push({ index: t.exitIndex, kind })
    }
  }
  return {
    kind: 'series',
    title,
    series: [{ name: 'equity', values: [...equityCurve] }],
  }
}

/** 把数据标注（quant_data_annotate 输出）转换为标注图数据。 */
export function chartAnnotate(
  values: readonly (number | null)[],
  annotations: readonly { index: number; label: string; severity: 1 | 2 | 3 }[],
  title = 'data annotations',
): ChartData {
  return chartAnnotations(values, annotations.map(a => ({ index: a.index, label: a.label, severity: a.severity })), title)
}
