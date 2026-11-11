import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const catalog = JSON.parse(readFileSync(new URL('../ficc/resources.json', import.meta.url), 'utf8'))
const { validateCatalog, renderDirectory, renderDiscussion } = await import(new URL('../scripts/ficc-catalog.mjs', import.meta.url).href)
const community = JSON.parse(readFileSync(new URL('../ficc/community.json', import.meta.url), 'utf8'))

test('FICC directory includes every reviewed record and keeps generated surfaces in sync', () => {
  assert.equal(validateCatalog(catalog), catalog)
  const directory = renderDirectory(catalog, community)
  const discussion = renderDiscussion(catalog, community)
  assert.equal(readFileSync(new URL('../ficc/README.md', import.meta.url), 'utf8').replaceAll('\r\n', '\n'), directory)
  assert.equal(readFileSync(new URL('../ficc/DISCUSSION.md', import.meta.url), 'utf8').replaceAll('\r\n', '\n'), discussion)
  for (const record of catalog.resources) {
    assert.ok(directory.includes(record.url), `directory missing ${record.repo}`)
    assert.ok(discussion.includes(record.url), `Discussion missing ${record.repo}`)
  }
})

test('FICC catalog rejects duplicates and undeclared verification claims', () => {
  const duplicate = structuredClone(catalog)
  duplicate.resources.push({ ...duplicate.resources[0], id: 'different-id' })
  assert.throws(() => validateCatalog(duplicate), /duplicate repository/)
  const wrongState = structuredClone(catalog)
  wrongState.resources[0].validation = 'PRODUCTION_VALIDATED'
  assert.throws(() => validateCatalog(wrongState))
})

test('restricted licenses stay separate and canonical sources cannot drift to another repo', () => {
  const restricted = structuredClone(catalog)
  const rateslib = restricted.resources.find((record: { id: string }) => record.id === 'rateslib')
  rateslib.section = 'rates-credit'
  assert.throws(() => validateCatalog(restricted), /restricted license/)
  const wrongSource = structuredClone(catalog)
  wrongSource.resources[0].source_url = 'https://example.com/unrelated'
  assert.throws(() => validateCatalog(wrongSource), /primary source/)
  for (const suffix of ['/../../evil/other-repo/blob/main/README.md', '/%2e%2e/%2e%2e/evil/other-repo']) {
    wrongSource.resources[0].source_url = `${wrongSource.resources[0].url}${suffix}`
    assert.throws(() => validateCatalog(wrongSource), /primary source/)
  }
  assert.throws(() => renderDirectory(catalog, { ...community, discussion_url: 'javascript:alert(1)' }))
})
