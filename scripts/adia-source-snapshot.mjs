import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Read public metadata only. Never install or execute an upstream repository.
const targets = [
  ['crunchdao/competitions', 'PARTNER'],
  ['crunchdao/quickstarters-adialab', 'PARTNER'],
  ['crunchdao/crunch-cli', 'PARTNER'],
  ['Ori-Replication/ADIA-Lab-Causal-Discovery', 'COMMUNITY'],
  ['BoNing-Gu/ADIA-Lab-Structural-Break', 'COMMUNITY'],
  ['szukiyu40/adia-structural-break-realtime', 'COMMUNITY'],
]
const readPublicMetadata = (path) => JSON.parse(execFileSync('gh', ['api', path], {
  encoding: 'utf8', timeout: 30000, maxBuffer: 4 * 1024 * 1024,
}))

export function createSnapshot(api = readPublicMetadata, retrievedAt) {
  const records = targets.map(([repo, relationship]) => {
    const metadata = api(`repos/${repo}`)
    const commit = api(`repos/${repo}/commits/${encodeURIComponent(metadata.default_branch)}`)
    const files = api(`repos/${repo}/contents?ref=${commit.sha}`)
    const licenseFiles = files.filter((f) => f.type === 'file' && /^(licen[cs]e|copying|notice)(\.|$)/i.test(f.name))
    const rootLicenses = licenseFiles.filter((f) => /^(licen[cs]e|copying)(\.|$)/i.test(f.name))
    const readme = files.find((f) => f.type === 'file' && /^readme\.md$/i.test(f.name))

    // A live repository label cannot identify the license of a pinned revision.
    const license = rootLicenses.length ? api(`repos/${repo}/license?ref=${commit.sha}`) : null
    const matchedLicense = rootLicenses.find((f) => f.path === f.name && f.path === license?.path &&
      /^[a-f0-9]{40}$/.test(f.sha) && f.sha === license?.sha)
    const spdx = license?.license?.spdx_id
    const identified = matchedLicense && typeof spdx === 'string' && spdx.length > 0 &&
      !['NOASSERTION', 'NONE'].includes(spdx)

    return {
      repo, relationship, url: metadata.html_url,
      default_branch: metadata.default_branch, commit: commit.sha,
      commit_url: commit.html_url, pushed_at: metadata.pushed_at,
      stars: metadata.stargazers_count, archived: metadata.archived,
      repository_license_spdx: metadata.license?.spdx_id ?? null,
      license_spdx: identified ? spdx : null,
      license_evidence: identified ? {
        method: 'GITHUB_LICENSE_API_AT_COMMIT', commit: commit.sha,
        path: matchedLicense.path, blob_sha: matchedLicense.sha,
      } : null,
      license_files: licenseFiles.map((f) => ({ name: f.name, blob_sha: f.sha })),
      readme_blob_sha: readme?.sha ?? null,
      reuse_gate: identified ? 'LICENSE_IDENTIFIED_NOT_INTEGRATED' : 'REVIEW_REQUIRED_NOT_INTEGRATED',
      runtime_execution: 'NOT_RUN', incorporation: 'LINK_ONLY',
    }
  })
  const now = retrievedAt ?? new Date()
  const localTimestamp = new Date(now.getTime() + 8 * 3600000).toISOString().replace('Z', '+08:00')
  return {
    title: 'ADIA public-code ecosystem source snapshot',
    retrieved_at_utc: now.toISOString(),
    retrieved_at_shanghai: localTimestamp,
    metadata_scope: 'SIX_KNOWN_REPOSITORIES_ONLY',
    discovery_search_performed: false,
    historical_manual_search_evidence: '2026-11-12-adia-manual-search.json',
    records,
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const snapshot = createSnapshot()
  const output = fileURLToPath(new URL(`../quant-repo/evidence/${snapshot.retrieved_at_shanghai.slice(0, 10)}-adia-github.json`, import.meta.url))
  mkdirSync(fileURLToPath(new URL('../quant-repo/evidence/', import.meta.url)), { recursive: true })
  writeFileSync(output, `${JSON.stringify(snapshot, null, 2)}\n`)
  console.log(`Saved ${snapshot.records.length} link-only source records: ${output}`)
}
