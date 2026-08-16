/**
 * npm 生态数据（零依赖：node 原生 fetch，registry + downloads 公共 API）。
 *
 * 拆分纯函数与网络层：
 * - parseNpmStats：纯函数（离线可测）
 * - fetchNpmStats：网络（集成验证）
 */

export interface NpmStats {
  pkg: string
  /** dist-tags.latest */
  latest: string
  /** 最近 7 天下载量 */
  weeklyDownloads: number
  /** 最近 30 天下载量（API 不可用时为 null） */
  monthlyDownloads: number | null
  description: string | null
  homepage: string | null
  updatedAt: string
  url: string
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type Json = any
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * 解析 npm registry / downloads 响应为统一的 NpmStats（纯函数）。
 * - registryJson：GET https://registry.npmjs.org/{pkg} 响应体
 * - weekJson：GET https://api.npmjs.org/downloads/point/last-week/{pkg} 响应体（404 时传 null）
 * - monthJson：GET https://api.npmjs.org/downloads/point/last-month/{pkg} 响应体（404 时传 null）
 */
export function parseNpmStats(
  pkg: string,
  registryJson: Json,
  weekJson: Json | null,
  monthJson: Json | null,
): NpmStats {
  const downloads = (v: unknown, field: string): number | null => {
    if (v === null || v === undefined) return null
    const n = Number(v)
    if (!Number.isFinite(n)) throw new Error(`npm ${pkg}: ${field} is not a finite number (${String(v)})`)
    return n
  }
  const str = (v: unknown): string | null => (v === null || v === undefined ? null : String(v))
  return {
    pkg,
    latest: String(registryJson['dist-tags'].latest),
    weeklyDownloads: downloads(weekJson?.downloads, 'weekly downloads') ?? 0,
    monthlyDownloads: downloads(monthJson?.downloads, 'monthly downloads'),
    description: str(registryJson.description),
    homepage: str(registryJson.homepage),
    updatedAt: String(registryJson.time?.modified ?? ''),
    url: `https://www.npmjs.com/package/${pkg}`,
  }
}

/** 拉取 npm 包生态数据（公共 API，无凭据）。超时由调用方 signal 控制。 */
export async function fetchNpmStats(pkg: string, signal: AbortSignal): Promise<NpmStats> {
  const enc = encodeURIComponent(pkg)
  const [regRes, weekRes, monthRes] = await Promise.all([
    fetch(`https://registry.npmjs.org/${enc}`, { signal }),
    fetch(`https://api.npmjs.org/downloads/point/last-week/${enc}`, { signal }),
    fetch(`https://api.npmjs.org/downloads/point/last-month/${enc}`, { signal }),
  ])
  if (!regRes.ok) {
    const body = await regRes.text().catch(() => '')
    throw new Error(`npm package ${pkg}: HTTP ${regRes.status} ${body.slice(0, 200)}`)
  }
  const registryJson = await regRes.json()
  // downloads 404（新包无数据）不致命：降级为 0 / null
  const weekJson = weekRes.ok ? await weekRes.json() : null
  const monthJson = monthRes.ok ? await monthRes.json() : null
  return parseNpmStats(pkg, registryJson, weekJson, monthJson)
}
