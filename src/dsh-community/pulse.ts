/**
 * 开源生态影响力评分（纯函数、零依赖）—— dsh-community 域。
 *
 * 「影响力」不是一个数字能说清的，但一个 0-100 的 pulse 分数 + 分项 + 建议，
 * 足够让 agent（和人）每天早上知道生态哪里好、哪里该发力：
 * - stars      星标基数（对数级分档，20%）
 * - downloads  npm 周下载（分档，15%）
 * - momentum   星标增速（相对上一期，25%）
 * - health     社区响应健康度（积压 issue/PR 占比，20%）
 * - freshness  发布新鲜度（距上次 release 天数，20%）
 *
 * 缺失的可选项取中性值 50（不惩罚信息不足），保证分数可解释、可手算、可测试。
 */

export interface OssPulseInput {
  /** 当前星标数（必填） */
  stars: number
  /** 最近 7 天 npm 下载量 */
  downloadsWeekly?: number
  /** 上一期星标数（如 7 天前），用于计算增速 */
  starsPrevious?: number
  /** 打开的 issue 数（不含 PR） */
  openIssues?: number
  /** 打开的 PR 数 */
  openPullRequests?: number
  /** 距上次 release 的天数 */
  daysSinceRelease?: number
}

export interface OssPulseOutput {
  /** 0-100 综合分（四舍五入取整） */
  score: number
  grade: 'A' | 'B' | 'C' | 'D'
  components: {
    stars: number
    downloads: number
    momentum: number
    health: number
    freshness: number
  }
  suggestions: string[]
  summary: string
}

function starsBand(stars: number): number {
  if (stars < 10) return 10
  if (stars < 100) return 30
  if (stars < 500) return 50
  if (stars < 1000) return 70
  if (stars < 5000) return 85
  return 100
}

function downloadsBand(weekly: number): number {
  if (weekly < 100) return 10
  if (weekly < 1000) return 30
  if (weekly < 10000) return 50
  if (weekly < 100000) return 70
  return 100
}

function momentumScore(stars: number, starsPrevious: number | undefined): number {
  if (starsPrevious === undefined) return 50
  const growthPct = ((stars - starsPrevious) / Math.max(1, starsPrevious)) * 100
  if (growthPct >= 10) return 100
  if (growthPct >= 3) return 70
  if (growthPct > 0) return 50
  if (growthPct === 0) return 40
  return 25
}

function healthScore(stars: number, openIssues: number | undefined, openPullRequests: number | undefined): number {
  if (openIssues === undefined && openPullRequests === undefined) return 50
  const opens = Math.max(0, openIssues ?? 0) + Math.max(0, openPullRequests ?? 0)
  const ratio = opens / Math.max(1, stars)
  if (ratio <= 0.05) return 100
  if (ratio <= 0.2) return 70
  if (ratio <= 0.5) return 40
  return 20
}

function freshnessScore(days: number | undefined): number {
  if (days === undefined) return 50
  if (days <= 7) return 100
  if (days <= 30) return 70
  if (days <= 90) return 40
  return 15
}

/**
 * 计算开源生态影响力 pulse（0-100）+ 等级 + 行动建议。
 * 输入全部可手算验证；非法输入（负数等）抛 RangeError。
 */
export function ossPulse(input: OssPulseInput): OssPulseOutput {
  const { stars } = input
  if (!Number.isFinite(stars) || stars < 0) throw new RangeError(`stars must be a finite number >= 0, got ${stars}`)
  const check = (v: number | undefined, name: string): void => {
    if (v !== undefined && (!Number.isFinite(v) || v < 0)) {
      throw new RangeError(`${name} must be a finite number >= 0, got ${v}`)
    }
  }
  check(input.downloadsWeekly, 'downloadsWeekly')
  check(input.starsPrevious, 'starsPrevious')
  check(input.openIssues, 'openIssues')
  check(input.openPullRequests, 'openPullRequests')
  check(input.daysSinceRelease, 'daysSinceRelease')

  const s = starsBand(stars)
  const d = input.downloadsWeekly === undefined ? 50 : downloadsBand(input.downloadsWeekly)
  const m = momentumScore(stars, input.starsPrevious)
  const h = healthScore(stars, input.openIssues, input.openPullRequests)
  const f = freshnessScore(input.daysSinceRelease)

  const score = Math.round(0.2 * s + 0.15 * d + 0.25 * m + 0.2 * h + 0.2 * f)
  const grade = score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D'

  const suggestions: string[] = []
  if (m < 40) suggestions.push('星标增长放缓：加大内容分发（X / 知乎 / HN）+ 保持每周发版节奏')
  if (f <= 40) suggestions.push('发布节奏偏慢：保持每周一个小版本，让生态始终有新话题')
  if (h <= 40) suggestions.push('积压 issue/PR 偏多：加速响应，社区活跃是星标的复利')
  if (s <= 30) suggestions.push('星标基数还小：优先挂 awesome 列表与官方讨论区曝光')
  if (d <= 30) suggestions.push('npm 下载偏低：多写「npm i 三步上手」实操文章')
  if (suggestions.length === 0) suggestions.push('各项指标健康，保持节奏 🐋')

  const summary = `${grade} 级（${score}/100）——${suggestions[0]}`
  return { score, grade, components: { stars: s, downloads: d, momentum: m, health: h, freshness: f }, suggestions, summary }
}
