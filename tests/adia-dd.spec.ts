import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const root = new URL('../', import.meta.url)
const read = (path: string) => readFileSync(new URL(path, root), 'utf8')
const snapshot = JSON.parse(read('quant-repo/evidence/2026-11-12-adia-github.json'))

test('ADIA snapshot pins six link-only partner/community sources, not institutional ownership', () => {
  assert.equal(snapshot.institution_repository_status, 'NOT_VERIFIED_IN_BOUNDED_SEARCH')
  assert.equal(snapshot.absence_is_not_proof, true)
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
    if (r.license_spdx === null) assert.equal(r.reuse_gate, 'REVIEW_REQUIRED_NOT_INTEGRATED')
  }
  const licensed = snapshot.records.find((r: { repo: string }) => r.repo === 'szukiyu40/adia-structural-break-realtime')
  assert.equal(licensed.license_spdx, 'Apache-2.0')
  assert.equal(licensed.reuse_gate, 'LICENSE_IDENTIFIED_NOT_INTEGRATED')
  assert.deepEqual(licensed.license_files.map((f: { name: string }) => f.name).sort(), ['LICENSE', 'NOTICE'])
  for (const f of licensed.license_files) assert.match(f.blob_sha, /^[a-f0-9]{40}$/)
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
