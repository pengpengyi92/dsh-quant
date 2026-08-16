/**
 * GitHub 生态数据（零依赖：node 原生 fetch，公共 REST API，无需凭据）。
 *
 * 拆分纯函数与网络层：
 * - parseRepoStats：纯函数（离线可测）
 * - fetchRepoStats：网络（集成验证）
 *
 * 域：dsh-community（开源生态域）——dsh-quant 独有的「自我造血」域，
 * 内部五队（PDAT/PAAT/PCPT/PRT/PET）没有对应物：开源侧用自己的工具
 * 度量自己的生态影响力。
 */

export interface RepoStats {
  owner: string
  repo: string
  /** 星标数 */
  stars: number
  forks: number
  watchers: number
  /** 打开的 issue 数（不含 PR） */
  openIssues: number
  /** 打开的 PR 数 */
  openPullRequests: number
  language: string | null
  topics: string[]
  license: string | null
  description: string | null
  createdAt: string
  pushedAt: string
  latestRelease: string | null
  latestReleaseAt: string | null
  url: string
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type Json = any
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * 解析 GitHub repo / pulls / releases 响应为统一的 RepoStats（纯函数）。
 * - repoJson：GET /repos/{owner}/{repo} 响应体
 * - pullsJson：GET /repos/{owner}/{repo}/pulls?state=open 响应数组
 * - releasesJson：GET /repos/{owner}/{repo}/releases/latest 响应体（可能为 { message: 'Not Found' }）
 */
export function parseRepoStats(
  owner: string,
  repo: string,
  repoJson: Json,
  pullsJson: readonly Json[],
  releasesJson: Json | null,
): RepoStats {
  const num = (v: unknown, field: string): number => {
    const n = Number(v)
    if (!Number.isFinite(n)) throw new Error(`repo ${owner}/${repo}: ${field} is not a finite number (${String(v)})`)
    return n
  }
  const str = (v: unknown, field: string): string | null => {
    if (v === null || v === undefined) return null
    return String(v)
  }
  const topics: string[] = Array.isArray(repoJson.topics)
    ? repoJson.topics.map((t: unknown) => String(t))
    : []
  const license = repoJson.license?.spdx_id != null ? String(repoJson.license.spdx_id) : null
  const releasesOk = releasesJson !== null && releasesJson !== undefined
    && releasesJson.tag_name != null
  return {
    owner,
    repo,
    stars: num(repoJson.stargazers_count, 'stargazers_count'),
    forks: num(repoJson.forks_count, 'forks_count'),
    watchers: num(repoJson.subscribers_count, 'subscribers_count'),
    openIssues: num(repoJson.open_issues_count, 'open_issues_count'),
    openPullRequests: pullsJson.length,
    language: str(repoJson.language, 'language'),
    topics,
    license,
    description: str(repoJson.description, 'description'),
    createdAt: String(repoJson.created_at),
    pushedAt: String(repoJson.pushed_at),
    latestRelease: releasesOk ? String(releasesJson.tag_name) : null,
    latestReleaseAt: releasesOk ? String(releasesJson.published_at) : null,
    url: `https://github.com/${owner}/${repo}`,
  }
}

const GH_HEADERS = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'dsh-quant',
}

/** 拉取仓库生态数据（公共 API，无凭据；有 GITHUB_TOKEN 环境变量时自动走认证通道，限额高得多）。超时由调用方 signal 控制。 */
export async function fetchRepoStats(
  owner: string,
  repo: string,
  signal: AbortSignal,
): Promise<RepoStats> {
  const base = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
  const headers: Record<string, string> = { ...GH_HEADERS }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  const [repoRes, pullsRes, releasesRes] = await Promise.all([
    fetch(base, { signal, headers }),
    fetch(`${base}/pulls?state=open&per_page=100`, { signal, headers }),
    fetch(`${base}/releases/latest`, { signal, headers }),
  ])
  if (!repoRes.ok) {
    const body = await repoRes.text().catch(() => '')
    throw new Error(`GitHub repo ${owner}/${repo}: HTTP ${repoRes.status} ${body.slice(0, 200)}`)
  }
  const repoJson = await repoRes.json() as Json
  // pulls / releases 失败不致命：降级为 0 / null
  const pullsJson = (pullsRes.ok ? await pullsRes.json() as Json[] : []) as readonly Json[]
  let releasesJson: Json | null = null
  if (releasesRes.ok) {
    const rj = await releasesRes.json() as Json
    releasesJson = rj?.message === 'Not Found' ? null : rj
  }
  return parseRepoStats(owner, repo, repoJson, pullsJson, releasesJson)
}
