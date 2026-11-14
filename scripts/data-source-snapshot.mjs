import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const targets = [
  ['LLMQuant/data-mcp', 'mcp-client'],
  ['akfamily/akshare', 'data-library'],
  ['akfamily/aktools', 'http-mcp-bridge'],
  ['OpenBB-finance/OpenBB', 'integration-platform'],
  ['ccxt/ccxt', 'exchange-library'],
  ['waditu/tushare', 'data-sdk'],
  ['ranaroussi/yfinance', 'unofficial-data-library'],
  ['mortada/fredapi', 'macro-vintage-client'],
  ['dgunning/edgartools', 'filings-library'],
  ['duckdb/duckdb', 'storage-query-engine'],
  ['dlt-hub/dlt', 'ingestion-framework'],
]

const gh = path => JSON.parse(execFileSync('gh', ['api', path], {
  encoding: 'utf8', timeout: 30000, maxBuffer: 4 * 1024 * 1024,
}))

// Collect public metadata and pinned license identity only; never install/run upstream code.
export function collectDataSources(api = gh, now = new Date()) {
  const records = targets.map(([requested_repo, role]) => {
    const meta = api(`repos/${requested_repo}`)
    const repo = meta.full_name
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error('Invalid canonical repository')
    const commit = api(`repos/${repo}/commits/${encodeURIComponent(meta.default_branch)}`)
    if (!/^[a-f0-9]{40}$/.test(commit.sha)) throw new Error('Invalid commit identity')
    const files = api(`repos/${repo}/contents?ref=${commit.sha}`)
    const licenses = files.filter(f => f.type === 'file' && /^(licen[cs]e|copying)(\.|$)/i.test(f.name))
    const license = licenses.length ? api(`repos/${repo}/license?ref=${commit.sha}`) : null
    const matched = licenses.find(f => f.path === f.name && f.path === license?.path &&
      /^[a-f0-9]{40}$/.test(f.sha) && f.sha === license?.sha)
    const spdx = license?.license?.spdx_id
    const identified = matched && typeof spdx === 'string' && spdx.length > 0 &&
      !['NOASSERTION', 'NONE'].includes(spdx)
    const readme = files.find(f => f.type === 'file' && /^readme(\.md|\.rst)?$/i.test(f.name))
    return {
      requested_repo, repo, role, url: `https://github.com/${repo}`,
      commit: commit.sha, commit_url: commit.html_url,
      readme_url: readme ? `https://github.com/${repo}/blob/${commit.sha}/${readme.path}` : null,
      repository_license_observation: meta.license?.spdx_id ?? null,
      code_license: identified ? spdx : null,
      license_evidence: identified ? {
        path: matched.path, blob_sha: matched.sha,
        url: `https://github.com/${repo}/blob/${commit.sha}/${matched.path}`,
      } : null,
      archived: meta.archived,
      integration: 'LINK_ONLY', runtime: 'NOT_RUN',
      data_redistribution: 'NOT_GRANTED_BY_CODE_LICENSE',
    }
  })
  return {
    title: 'Bounded data-source and infrastructure repository discovery',
    retrieved_at_utc: now.toISOString(),
    retrieved_at_shanghai: new Date(now.getTime() + 8 * 3600000).toISOString().replace('Z', '+08:00'),
    scope: 'ELEVEN_KNOWN_REPOSITORIES_AFTER_PRIMARY_SOURCE_DISCOVERY',
    exhaustive_internet_search: false,
    records,
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const snapshot = collectDataSources()
  const directory = new URL('../docs/data-sources/evidence/', import.meta.url)
  mkdirSync(directory, { recursive: true })
  const filename = `${snapshot.retrieved_at_shanghai.slice(0, 10)}-data-repos.json`
  writeFileSync(new URL(filename, directory), `${JSON.stringify(snapshot, null, 2)}\n`)
  console.log(`Saved ${snapshot.records.length} public, link-only records: ${filename}`)
}
