import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const targets = [
  ['matplotlib/matplotlib', 'static-scientific', ['lib/matplotlib/pyplot.py']],
  ['plotly/plotly.py', 'interactive-statistical', ['plotly/express/_chart_types.py']],
  ['vega/altair', 'declarative-grammar', ['altair/vegalite/v6/api.py', 'altair/vegalite/v5/api.py']],
  ['holoviz/holoviews', 'linked-data-views', ['holoviews/plotting/plot.py']],
  ['holoviz/datashader', 'large-data-rasterization', ['datashader/core.py']],
  ['finos/perspective', 'streaming-pivot-ui', ['rust/perspective-viewer/src/rust/lib.rs', 'packages/perspective-viewer/src/js/viewer.js']],
  ['tradingview/lightweight-charts', 'financial-canvas', ['src/api/create-chart.ts']],
  ['matplotlib/mplfinance', 'ohlcv-static', ['src/mplfinance/plotting.py']],
  ['bokeh/bokeh', 'interactive-browser', ['src/bokeh/plotting/_figure.py']],
  ['ranaroussi/quantstats', 'performance-tearsheet', ['quantstats/plots.py']],
  ['stefan-jansen/pyfolio-reloaded', 'performance-risk-analysis', ['src/pyfolio/tears.py', 'pyfolio/tears.py']],
  ['kernc/backtesting.py', 'backtest-engine-and-plot', ['backtesting/backtesting.py']],
]
const gh = path => JSON.parse(execFileSync('gh', ['api', path], { encoding: 'utf8', timeout: 30000, maxBuffer: 12_000_000, stdio: ['ignore', 'pipe', 'pipe'] }))
function optional(api, path) {
  try { return api(path) } catch (error) {
    if (String(error.stderr).includes('HTTP 404')) return null
    throw error
  }
}

export function collectVisualizationSources(api = gh, now = new Date()) {
  const records = targets.map(([requested_repo, role, entries]) => {
    const meta = api(`repos/${requested_repo}`)
    const repo = meta.full_name
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error('invalid canonical repo')
    const { sha } = api(`repos/${repo}/commits/${encodeURIComponent(meta.default_branch)}`)
    if (!/^[a-f0-9]{40}$/.test(sha)) throw new Error('invalid commit')
    const root = api(`repos/${repo}/contents?ref=${sha}`)
    const readme = root.find(f => f.type === 'file' && /^readme(\.md|\.rst)?$/i.test(f.name))
    let entry = null
    for (const path of entries) {
      const file = optional(api, `repos/${repo}/contents/${path}?ref=${sha}`)
      if (file?.type === 'file') { entry = file; break }
    }
    if (!entry) throw new Error(`No verified source entry for ${repo}; inspect actual tree before expanding candidates`)
    const observed = optional(api, `repos/${repo}/license?ref=${sha}`)
    const license = observed?.path ? api(`repos/${repo}/contents/${observed.path}?ref=${sha}`) : null
    const matched = license?.type === 'file' && license.sha === observed.sha
    const spdx = observed?.license?.spdx_id
    const identified = matched && typeof spdx === 'string' && !['NONE', 'NOASSERTION'].includes(spdx)
    const notice = root.find(f => f.type === 'file' && /^NOTICE(\.|$)/i.test(f.name))
    const link = path => `https://github.com/${repo}/blob/${sha}/${path}`
    return {
      requested_repo, repo, role, commit: sha, url: `https://github.com/${repo}`, archived: meta.archived,
      readme_url: readme ? link(readme.path) : null,
      entry: { path: entry.path, blob_sha: entry.sha, url: link(entry.path) },
      code_license: identified ? spdx : null,
      license_evidence: matched ? { path: license.path, blob_sha: license.sha, url: link(license.path), github_spdx: spdx ?? null } : null,
      notice: notice ? { path: notice.path, blob_sha: notice.sha, url: link(notice.path) } : null,
      integration: 'REFERENCE_ONLY', runtime: 'NOT_RUN', data_redistribution: 'NOT_GRANTED_BY_CODE_LICENSE',
    }
  })
  return {
    title: 'Visualization and backtest-reporting references',
    reviewed_at: new Date(now.getTime() + 8 * 3600000).toISOString().replace('Z', '+08:00'),
    scope: '12 selected primary repositories; not exhaustive or a performance ranking',
    records,
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = collectVisualizationSources()
  const directory = new URL('../docs/data-visualization/', import.meta.url)
  mkdirSync(directory, { recursive: true })
  writeFileSync(new URL('sources-2026-11-14.json', directory), `${JSON.stringify(result, null, 2)}\n`)
  console.log(JSON.stringify({ records: result.records.length, reviewed_at: result.reviewed_at, licenses: result.records.map(r => [r.repo, r.code_license]) }))
}
