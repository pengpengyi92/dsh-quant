/**
 * 数据质量层（point-in-time / 幸存者偏差 / 渠道可靠性）。
 *
 * AI-infra 视角的数据模块：不只是"序列统计"，而是回答
 * "这个数据能不能信、什么时候能用、会不会骗我"三类问题。
 * 纯函数、零依赖；对齐 dsh-quant 契约（等长 null 对齐）。
 */

/**
 * Point-in-time 校验结果。
 *
 * 核心问题：数据在"决策时点"是否可用？（避免未来函数/前视偏差）
 * - values 按时间排序（t=0 最旧）
 * - 每次决策 t 只能用到 values[0..t] 的信息
 * - 若 values[i] 的值在 i 时刻之后才被修订，则 i 时刻用它就是前视
 */
export interface PitCheckResult {
  /** 是否通过 PIT 校验 */
  pass: boolean
  /** 发现的潜在前视点数量（索引） */
  lookAheadIndices: number[]
  /** 说明 */
  notes: string[]
}

/**
 * Point-in-time 校验：检测"未来才知道的值"在序列中出现的位置。
 *
 * 简化模型：如果某值比其前值发生"异常跳变"且之后不再回落
 * （单调台阶），可能是修订/幸存导致的断点。更严格的做法需要
 * 数据源的修订历史；此处提供可用的启发式。
 */
export function pitCheck(values: readonly number[]): PitCheckResult {
  const n = values.length
  if (n < 3) return { pass: true, lookAheadIndices: [], notes: ['序列过短，跳过 PIT 校验'] }
  const lookAheadIndices: number[] = []
  const notes: string[] = []
  // 检测单调台阶：值跳变后不再回到跳变前的水平（可能被"事后修正"）
  for (let i = 2; i < n; i++) {
    const prev = values[i - 1]!
    const cur = values[i]!
    const before = values[i - 2]!
    const jump = Math.abs(cur - prev)
    const relJump = Math.abs(prev) > 1e-12 ? jump / Math.abs(prev) : jump
    const stepUp = cur > prev && prev >= before
    const stepDown = cur < prev && prev <= before
    if (relJump > 0.5 && (stepUp || stepDown)) {
      lookAheadIndices.push(i)
    }
  }
  if (lookAheadIndices.length > 0) {
    notes.push(`检测到 ${lookAheadIndices.length} 个疑似台阶断点（可能为事后修订/幸存偏差）`)
  } else {
    notes.push('未检测到明显台阶断点')
  }
  return { pass: lookAheadIndices.length === 0, lookAheadIndices, notes }
}

/** 幸存者偏差检查结果。 */
export interface SurvivorshipCheckResult {
  /** 序列是否完整（无静默缺失段） */
  continuous: boolean
  /** 缺失段（[start, end) 索引对） */
  gaps: Array<{ start: number; end: number }>
  /** 尾部是否可能截断（最后一段缺失） */
  tailTruncated: boolean
  /** 说明 */
  notes: string[]
}

/**
 * 幸存者偏差检查：检测序列中的静默缺失段。
 *
 * 幸存者偏差 = "现在还在的标的才出现在数据里"。缺失段常由
 * 退市/停牌导致；若缺失发生在尾部，可能是"活下来的才记录"。
 */
export function survivorshipCheck(
  values: readonly (number | null)[],
  maxGapRatio = 0.05,
): SurvivorshipCheckResult {
  const n = values.length
  const gaps: Array<{ start: number; end: number }> = []
  let i = 0
  while (i < n) {
    if (values[i] === null || values[i] === undefined || !Number.isFinite(values[i] as number)) {
      let j = i
      while (j < n && (values[j] === null || values[j] === undefined || !Number.isFinite(values[j] as number))) j++
      gaps.push({ start: i, end: j })
      i = j
    } else {
      i++
    }
  }
  const gapLen = gaps.reduce((a, g) => a + (g.end - g.start), 0)
  const continuous = gapLen === 0
  const tailTruncated = gaps.length > 0 && gaps[gaps.length - 1]!.end === n
  const notes: string[] = []
  if (continuous) {
    notes.push('序列连续，无缺失段')
  } else {
    notes.push(`共 ${gaps.length} 段缺失，合计 ${gapLen} 个位置（占比 ${(gapLen / n * 100).toFixed(1)}%）`)
    if (gapLen / n > maxGapRatio) notes.push(`缺失占比超过阈值 ${maxGapRatio * 100}%，需关注退市/停牌影响`)
    if (tailTruncated) notes.push('尾部存在缺失，疑似幸存者偏差（"活下来的才记录"）')
  }
  return { continuous, gaps, tailTruncated, notes }
}

/** 渠道可靠性对比条目。 */
export interface ChannelReliability {
  channel: string
  /** 0-1，越高越可靠 */
  reliability: number
  /** 免费/付费 */
  cost: 'free' | 'paid' | 'freemium'
  /** 已知风险 */
  risks: string[]
}

/**
 * 渠道可靠性评估：基于公开常识的启发式评分。
 *
 * 维度：数据源权威性、更新频率、是否官方、历史稳定性。
 * 纯启发式，非实测；用于给 agent 一个"先信谁"的排序。
 */
export function channelReliability(channels: readonly string[]): ChannelReliability[] {
  const known: Record<string, ChannelReliability> = {
    binance: { channel: 'binance', reliability: 0.95, cost: 'free', risks: ['地区封锁（451），需 fallback'] },
    okx: { channel: 'okx', reliability: 0.93, cost: 'free', risks: ['部分地区限制'] },
    bybit: { channel: 'bybit', reliability: 0.92, cost: 'free', risks: ['CloudFront 偶发'] },
    yahoo: { channel: 'yahoo', reliability: 0.85, cost: 'free', risks: ['美股/全球为主，A股覆盖有限'] },
    sina: { channel: 'sina', reliability: 0.8, cost: 'free', risks: ['A股实时行情，前复权需自行处理'] },
    tencent: { channel: 'tencent', reliability: 0.8, cost: 'free', risks: ['A股实时行情'] },
    akshare: { channel: 'akshare', reliability: 0.7, cost: 'free', risks: ['爬虫类接口，稳定性依赖上游'] },
    tushare: { channel: 'tushare', reliability: 0.75, cost: 'freemium', risks: ['积分制，部分接口需付费'] },
    baostock: { channel: 'baostock', reliability: 0.72, cost: 'free', risks: ['A股，更新有延迟'] },
    wind: { channel: 'wind', reliability: 0.98, cost: 'paid', risks: ['商业终端，贵'] },
    ifind: { channel: 'ifind', reliability: 0.97, cost: 'paid', risks: ['同花顺商业终端'] },
  }
  const out: ChannelReliability[] = []
  for (const c of channels) {
    const k = c.toLowerCase()
    if (known[k]) out.push(known[k])
    else out.push({ channel: c, reliability: 0.5, cost: 'freemium', risks: ['未知渠道，需实测'] })
  }
  return out.sort((a, b) => b.reliability - a.reliability)
}

/** 数据质量总报告：串起 PIT / 幸存者 / 渠道。 */
export interface DataQualityReport {
  pit: PitCheckResult
  survivorship: SurvivorshipCheckResult
  channels: ChannelReliability[]
  /** 综合健康度 0-1 */
  healthScore: number
}

/** 数据质量总报告。 */
export function dataQualityReport(
  values: readonly (number | null)[],
  channelNames: readonly string[] = [],
): DataQualityReport {
  const finite = values.filter(x => x !== null && x !== undefined && Number.isFinite(x as number)) as number[]
  const pit = pitCheck(finite)
  const survivorship = survivorshipCheck(values)
  const channels = channelReliability(channelNames)
  // 综合健康度：PIT 通过 50% + 连续 30% + 渠道平均可靠性 20%
  const pitScore = pit.pass ? 1 : 0.3
  const survScore = survivorship.continuous ? 1 : survivorship.tailTruncated ? 0.3 : 0.6
  const chanScore = channels.length > 0
    ? channels.reduce((a, c) => a + c.reliability, 0) / channels.length
    : 0.5
  const healthScore = 0.5 * pitScore + 0.3 * survScore + 0.2 * chanScore
  return { pit, survivorship, channels, healthScore }
}
