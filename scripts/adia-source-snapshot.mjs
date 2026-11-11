import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
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
const api = (path) => JSON.parse(execFileSync('gh', ['api', path], {
  encoding: 'utf8', timeout: 30000, maxBuffer: 4 * 1024 * 1024,
}))
const records = targets.map(([repo, relationship]) => {
  const metadata = api(`repos/${repo}`)
  const commit = api(`repos/${repo}/commits/${metadata.default_branch}`)
  const files = api(`repos/${repo}/contents?ref=${commit.sha}`)
  const licenseFiles = files.filter((f) => /^(licen[cs]e|copying|notice)(\.|$)/i.test(f.name))
  const readme = files.find((f) => /^readme\.md$/i.test(f.name))
  return {
    repo, relationship, url: metadata.html_url,
    default_branch: metadata.default_branch, commit: commit.sha,
    commit_url: commit.html_url, pushed_at: metadata.pushed_at,
    stars: metadata.stargazers_count, archived: metadata.archived,
    license_spdx: metadata.license?.spdx_id ?? null,
    license_files: licenseFiles.map((f) => ({ name: f.name, blob_sha: f.sha })),
    readme_blob_sha: readme?.sha ?? null,
    reuse_gate: metadata.license?.spdx_id === 'Apache-2.0'
      ? 'LICENSE_IDENTIFIED_NOT_INTEGRATED' : 'REVIEW_REQUIRED_NOT_INTEGRATED',
    runtime_execution: 'NOT_RUN', incorporation: 'LINK_ONLY',
  }
})
const now = new Date()
const localTimestamp = new Date(now.getTime() + 8 * 3600000).toISOString().replace('Z', '+08:00')
const snapshot = {
  title: 'ADIA public-code ecosystem source snapshot',
  retrieved_at_utc: now.toISOString(),
  retrieved_at_shanghai: localTimestamp,
  institution_repository_status: 'NOT_VERIFIED_IN_BOUNDED_SEARCH',
  search_scope: [
    'ADIA and ADIA Lab official sites and source links',
    'GitHub search/repositories: exact phrase ADIA Lab, first 30 results',
    'GitHub search/users: ADIA type:org, first 30 results; not exhaustive',
    'All current public crunchdao org repositories via paginated API',
  ],
  absence_is_not_proof: true,
  records,
}
const output = fileURLToPath(new URL(`../quant-repo/evidence/${localTimestamp.slice(0, 10)}-adia-github.json`, import.meta.url))
mkdirSync(fileURLToPath(new URL('../quant-repo/evidence/', import.meta.url)), { recursive: true })
writeFileSync(output, `${JSON.stringify(snapshot, null, 2)}\n`)
console.log(`Saved ${records.length} link-only source records: ${output}`)
