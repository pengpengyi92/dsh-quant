import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const root = new URL('../', import.meta.url)
const read = (path: string) => readFileSync(new URL(path, root), 'utf8')
const snapshot = JSON.parse(read('quant-repo/evidence/2026-11-12-adia-github.json'))
const { createSnapshot } = await import(new URL('../scripts/adia-source-snapshot.mjs', import.meta.url).href)

const pinnedCommit = 'a'.repeat(40)
const licenseSha = 'b'.repeat(40)
const licenseFile = { name: 'LICENSE', path: 'LICENSE', type: 'file', sha: licenseSha }
const detectedLicense = { path: 'LICENSE', sha: licenseSha, license: { spdx_id: 'Apache-2.0' } }

function refreshFixture({
  files = [licenseFile],
  repositorySpdx = 'Apache-2.0',
  pinnedLicense = detectedLicense,
}: {
  files?: typeof licenseFile[]
  repositorySpdx?: string | null
  pinnedLicense?: typeof detectedLicense | null
} = {}) {
  const requests: string[] = []
  const refreshed = createSnapshot((path: string) => {
    requests.push(path)
    if (path.endsWith('/commits/main')) {
      return { sha: pinnedCommit, html_url: `https://github.com/example/repo/commit/${pinnedCommit}` }
    }
    if (path.endsWith(`/contents?ref=${pinnedCommit}`)) return files
    if (path.endsWith(`/license?ref=${pinnedCommit}`)) return pinnedLicense
    assert.match(path, /^repos\/[^/]+\/[^/]+$/)
    return {
      html_url: `https://github.com/${path.slice('repos/'.length)}`,
      default_branch: 'main', pushed_at: '2026-11-11T00:00:00Z',
      stargazers_count: 1, archived: false, license: { spdx_id: repositorySpdx },
    }
  }, new Date('2026-12-01T23:59:00Z'))
  return { refreshed, requests }
}

test('ADIA snapshot pins six link-only partner/community sources, not institutional ownership', () => {
  assert.equal(snapshot.metadata_scope, 'SIX_KNOWN_REPOSITORIES_ONLY')
  assert.equal(snapshot.discovery_search_performed, false)
  assert.equal('search_scope' in snapshot, false)
  assert.equal(snapshot.records.length, 6)
  assert.equal(new Set(snapshot.records.map((r: { repo: string }) => r.repo)).size, 6)
  assert.match(snapshot.retrieved_at_shanghai, /^2026-11-12T.+\+08:00$/)
  for (const r of snapshot.records) {
    assert.ok(['PARTNER', 'COMMUNITY'].includes(r.relationship))
    assert.equal(r.url, `https://github.com/${r.repo}`)
    assert.match(r.commit, /^[a-f0-9]{40}$/)
    assert.equal(r.commit_url, `${r.url}/commit/${r.commit}`)
    assert.ok(Number.isInteger(r.stars) && r.stars >= 0)
    assert.ok(Date.parse(r.pushed_at) <= Date.parse(snapshot.retrieved_at_utc))
    assert.equal(r.runtime_execution, 'NOT_RUN')
    assert.equal(r.incorporation, 'LINK_ONLY')
  }
})

test('unknown licenses remain review-gated and the Apache source records NOTICE', () => {
  for (const r of snapshot.records) {
    if (r.license_spdx === null) {
      assert.equal(r.reuse_gate, 'REVIEW_REQUIRED_NOT_INTEGRATED')
      assert.equal(r.license_evidence, null)
    } else {
      assert.equal(r.license_evidence.commit, r.commit)
      assert.ok(r.license_files.some((f: { name: string; blob_sha: string }) =>
        /^(licen[cs]e|copying)(\.|$)/i.test(f.name) &&
        f.name === r.license_evidence.path && f.blob_sha === r.license_evidence.blob_sha))
    }
  }
  const licensed = snapshot.records.find((r: { repo: string }) => r.repo === 'szukiyu40/adia-structural-break-realtime')
  assert.equal(licensed.license_spdx, 'Apache-2.0')
  assert.equal(licensed.reuse_gate, 'LICENSE_IDENTIFIED_NOT_INTEGRATED')
  assert.deepEqual(licensed.license_files.map((f: { name: string }) => f.name).sort(), ['LICENSE', 'NOTICE'])
  for (const f of licensed.license_files) assert.match(f.blob_sha, /^[a-f0-9]{40}$/)
  assert.equal(licensed.license_evidence.method, 'PINNED_LICENSE_CONTENT_REVIEW')
})

test('manual discovery stays dated and a later metadata refresh claims no new searches', () => {
  const manualPath = new URL(snapshot.historical_manual_search_evidence,
    new URL('quant-repo/evidence/2026-11-12-adia-github.json', root))
  const manual = JSON.parse(readFileSync(manualPath, 'utf8'))
  assert.equal(manual.recorded_at_shanghai, '2026-11-12T00:42:04+08:00')
  assert.equal(manual.method, 'MANUAL_RESEARCH_REPORTED_IN_DD')
  assert.equal(manual.institution_repository_status, 'NOT_VERIFIED_IN_BOUNDED_SEARCH')
  assert.equal(manual.absence_is_not_proof, true)
  assert.equal(manual.automatically_replayed, false)
  assert.equal(manual.search_scope.length, 4)
  assert.ok(existsSync(new URL(manual.source_report, manualPath)))
  const { refreshed, requests } = refreshFixture()
  assert.equal(refreshed.retrieved_at_shanghai, '2026-12-02T07:59:00.000+08:00')
  assert.equal(refreshed.historical_manual_search_evidence, snapshot.historical_manual_search_evidence)
  assert.equal(refreshed.metadata_scope, 'SIX_KNOWN_REPOSITORIES_ONLY')
  assert.equal(refreshed.discovery_search_performed, false)
  for (const field of ['search_scope', 'institution_repository_status', 'absence_is_not_proof']) {
    assert.equal(field in refreshed, false)
  }
  assert.deepEqual(refreshed.records.map((r: { repo: string }) => r.repo),
    snapshot.records.map((r: { repo: string }) => r.repo))
  assert.equal(requests.length, 24)
  assert.ok(requests.every(path => /^repos\/[^/]+\/[^/]+(?:\/commits\/main|\/contents\?ref=[a-f0-9]{40}|\/license\?ref=[a-f0-9]{40})?$/.test(path)))
})

test('live license labels never identify missing pinned root license files', () => {
  for (const files of [[], [{ ...licenseFile, type: 'dir' }], [{ ...licenseFile, name: 'NOTICE', path: 'NOTICE' }]]) {
    const { refreshed, requests } = refreshFixture({ files })
    assert.equal(requests.length, 18)
    assert.ok(requests.every(path => !path.includes('/license?')))
    for (const r of refreshed.records) {
      assert.equal(r.repository_license_spdx, 'Apache-2.0')
      assert.equal(r.license_spdx, null)
      assert.equal(r.license_evidence, null)
      assert.equal(r.reuse_gate, 'REVIEW_REQUIRED_NOT_INTEGRATED')
    }
  }
})

test('mismatched, absent and unidentified pinned license responses remain review-gated', () => {
  for (const pinnedLicense of [
    { ...detectedLicense, sha: 'c'.repeat(40) },
    { ...detectedLicense, path: 'NOTICE' },
    { ...detectedLicense, path: 'other/LICENSE' },
    { ...detectedLicense, license: { spdx_id: 'NOASSERTION' } },
    { ...detectedLicense, license: { spdx_id: 'NONE' } },
    { ...detectedLicense, license: { spdx_id: '' } },
    null,
  ]) {
    const { refreshed } = refreshFixture({ pinnedLicense })
    for (const r of refreshed.records) {
      assert.equal(r.license_files.length, 1)
      assert.equal(r.license_spdx, null)
      assert.equal(r.license_evidence, null)
      assert.equal(r.reuse_gate, 'REVIEW_REQUIRED_NOT_INTEGRATED')
    }
  }
})

test('identified licenses require matching pinned path and blob, not the live SPDX label', () => {
  for (const repositorySpdx of ['Apache-2.0', null]) {
    const { refreshed, requests } = refreshFixture({
      repositorySpdx, pinnedLicense: { ...detectedLicense, license: { spdx_id: 'MIT' } },
    })
    assert.equal(requests.filter(path => path.endsWith(`/license?ref=${pinnedCommit}`)).length, 6)
    for (const r of refreshed.records) {
      assert.equal(r.repository_license_spdx, repositorySpdx)
      assert.equal(r.license_spdx, 'MIT')
      assert.equal(r.reuse_gate, 'LICENSE_IDENTIFIED_NOT_INTEGRATED')
      assert.deepEqual(r.license_evidence, {
        method: 'GITHUB_LICENSE_API_AT_COMMIT', commit: pinnedCommit,
        path: 'LICENSE', blob_sha: licenseSha,
      })
    }
  }
})

test('Deep DD keeps all nine standard sections and concrete research boundaries', () => {
  const dd = read('quant-history/adia.md')
  assert.equal([...dd.matchAll(/^## [1-9]\. /gm)].length, 9)
  for (const required of ['Data Curation', '3+ 年', '5+ 年', 'TS-AUC', 'UNMEASURED', '待核']) {
    assert.ok(dd.includes(required), `missing ${required}`)
  }
  assert.ok(dd.includes('https://www.adialab.ae/relationship-with-adia'))
  assert.ok(dd.includes('https://apply.workable.com/adia/jobs/view/F18DA76604.md'))
  assert.ok(dd.includes('https://www.adia.ae/en/pr/2025a/letter-from-the-md.html'))
})

test('new research pages have valid local links and appear in both existing indexes', () => {
  const pages = ['quant-history/adia.md', 'quant-repo/adia.md', 'ann/2026-11-12_adia_deep_dd.md']
  for (const page of pages) {
    for (const [, href] of read(page).matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      if (/^https?:\/\//.test(href) || href.startsWith('#')) continue
      assert.ok(existsSync(new URL(href.split('#')[0], new URL(page, root))), `${page}: ${href}`)
    }
  }
  assert.ok(read('quant-history/README.md').includes('(adia.md)'))
  assert.ok(read('quant-repo/README.md').includes('(adia.md)'))
  assert.ok(read('README.md').includes('(quant-history/adia.md)'))
})

test('code map retains all source credits, license discrepancy and reproduction limits', () => {
  const codeMap = read('quant-repo/adia.md')
  for (const r of snapshot.records) {
    assert.ok(codeMap.includes(r.url))
    assert.ok(codeMap.includes(r.commit.slice(0, 8)))
  }
  for (const boundary of ['README 声明 MIT', 'NOT_RUN', 'UNMEASURED', '已截止', '权重', '不是全行 pooled AUC']) {
    assert.ok(codeMap.includes(boundary), `missing ${boundary}`)
  }
})
