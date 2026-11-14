import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const { collectDataSources } = await import(new URL('../scripts/data-source-snapshot.mjs', import.meta.url).href)
const read = (path: string) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'))

test('Data discovery pins eleven link-only sources and separates code from data rights', () => {
  const snapshot = read('docs/data-sources/evidence/2026-11-14-data-repos.json')
  assert.equal(snapshot.exhaustive_internet_search, false)
  assert.equal(snapshot.records.length, 11)
  assert.equal(new Set(snapshot.records.map((r: { repo: string }) => r.repo.toLowerCase())).size, 11)
  for (const r of snapshot.records) {
    assert.match(r.commit, /^[a-f0-9]{40}$/)
    assert.equal(r.url, `https://github.com/${r.repo}`)
    assert.equal(r.commit_url, `${r.url}/commit/${r.commit}`)
    assert.equal(r.runtime, 'NOT_RUN')
    assert.equal(r.integration, 'LINK_ONLY')
    assert.equal(r.data_redistribution, 'NOT_GRANTED_BY_CODE_LICENSE')
    if (r.code_license) {
      assert.match(r.license_evidence.blob_sha, /^[a-f0-9]{40}$/)
      assert.equal(r.license_evidence.url, `${r.url}/blob/${r.commit}/${r.license_evidence.path}`)
    } else assert.equal(r.license_evidence, null)
  }
  assert.equal(snapshot.records.find((r: { repo: string }) => r.repo === 'duckdb/duckdb').role, 'storage-query-engine')
  assert.equal(snapshot.records.find((r: { repo: string }) => r.repo === 'dlt-hub/dlt').role, 'ingestion-framework')
  const openbb = snapshot.records.find((r: { requested_repo: string }) => r.requested_repo === 'OpenBB-finance/OpenBB')
  const manual = read('docs/data-sources/evidence/2026-11-14-manual-reviews.json').openbb
  assert.equal(openbb.repo, manual.repo)
  assert.equal(openbb.commit, manual.commit)
  assert.equal(openbb.code_license, null) // GitHub did not identify it; manual header review is separate.
  assert.equal(manual.github_detected_license, 'NOASSERTION')
})

function fixtureApi(mode: 'identified' | 'missing' | 'mismatch') {
  return (path: string) => {
    if (path.includes('/commits/')) return { sha: 'a'.repeat(40), html_url: `https://github.com/${path.slice(6).split('/commits/')[0]}/commit/${'a'.repeat(40)}` }
    if (path.includes('/contents?')) return mode === 'missing' ? [] : [{ name: 'LICENSE', path: 'LICENSE', type: 'file', sha: 'b'.repeat(40) }]
    if (path.includes('/license?')) return { path: 'LICENSE', sha: (mode === 'mismatch' ? 'c' : 'b').repeat(40), license: { spdx_id: 'MIT' } }
    return { full_name: path.slice(6), default_branch: 'main', license: { spdx_id: 'MIT' }, archived: false }
  }
}

test('Snapshot collection never promotes a live license label without matching pinned evidence', () => {
  for (const mode of ['identified', 'missing', 'mismatch'] as const) {
    const snapshot = collectDataSources(fixtureApi(mode), new Date('2026-11-14T00:00:00Z'))
    assert.equal(snapshot.records.length, 11)
    for (const r of snapshot.records) assert.equal(r.code_license, mode === 'identified' ? 'MIT' : null)
    assert.equal(snapshot.retrieved_at_shanghai, '2026-11-14T08:00:00.000+08:00')
  }
  assert.throws(() => collectDataSources(() => { throw new Error('source unavailable') }), /source unavailable/)
})

test('Selected public fixture contains no market data and preserves both knowledge clocks', () => {
  const fixture = read('plugin/data/source-contract/synthetic-vintages.json')
  assert.equal(fixture.synthetic, true)
  assert.equal(fixture.source_id, 'synthetic-demo')
  for (const row of fixture.observations) {
    assert.equal(row.symbol, 'DEMO')
    assert.ok(Number.isFinite(row.value))
    assert.ok(Date.parse(row.event_at) <= Date.parse(row.published_at))
    assert.ok(Date.parse(row.published_at) <= Date.parse(row.observed_at))
  }
  // Fixture-level illustration only, not a public ingestion or authorization implementation.
  for (const cutoff of fixture.cutoffs) {
    const visible = fixture.observations.filter((r: { published_at: string; observed_at: string }) =>
      Date.parse(r.published_at) <= Date.parse(cutoff.as_of) && Date.parse(r.observed_at) <= Date.parse(cutoff.as_of))
    assert.equal(visible.at(-1)?.revision ?? null, cutoff.expected_revision)
  }
  const delayed = fixture.cutoffs[2]
  assert.equal(fixture.observations.filter((r: { published_at: string }) => Date.parse(r.published_at) <= Date.parse(delayed.as_of)).at(-1).revision, 2)
  assert.equal(delayed.expected_revision, 1) // Publication-only selection would leak a not-yet-observed revision.
  for (const r of fixture.rights_cases) {
    assert.equal(r.may_redistribute, r.status === 'SYNTHETIC_OWNED' && r.explicit_external_permission === true)
  }
})
