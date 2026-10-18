import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const evidence = fileURLToPath(new URL('./', import.meta.url))
const directory = resolve(process.argv[2] ?? join(evidence, 'linux-candidate'))
const json = path => JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''))
const expected = json(join(evidence, 'pack.json'))
const validation = json(join(evidence, 'validation.json'))
const [packed] = json(join(directory, 'pack.json'))
const body = readFileSync(join(directory, 'dsh-quant-0.91.1.tgz'))
const digest = algorithm => createHash(algorithm).update(body).digest('hex')
const integrity = `sha512-${createHash('sha512').update(body).digest('base64')}`
const commit = readFileSync(join(directory, 'source-commit.txt'), 'utf8').trim()
assert.equal(commit, 'ca4dd35df6b06e87ba3ff40e1a90a6e2ca2106e4')
assert.equal(integrity, expected.integrity)
assert.equal(integrity, packed.integrity)
assert.equal(digest('sha256'), validation.sha256)
assert.equal(digest('sha1'), expected.shasum)
assert.equal(body.length, expected.size)
assert.equal(packed.entryCount, expected.entryCount)
assert.equal(packed.version, '0.91.1')
const log = readFileSync(join(directory, 'consumer.log'), 'utf8')
assert(log.includes('Loader booted'))
assert(log.includes('consumer simulation passed'))
const summary = JSON.parse(log.split(/\r?\n/).find(line => line.startsWith('{"registered":')))
assert.deepEqual(summary, { registered: 59, passed: 56, failed: 0, unverified: 3 })
console.log(JSON.stringify({
  checked_at: new Date().toISOString(),
  source: 'candidate-not-registry',
  source_commit: commit,
  tag: 'v0.91.1',
  workflow: 'https://github.com/pengpengyi92/dsh-quant/actions/runs/39113283541',
  sha256: digest('sha256'),
  integrity,
  bytes: body.length,
  entries: packed.entryCount,
  original_evidence_matches: true,
  registry_acceptance: 'NOT_EVALUATED_BY_THIS_CANDIDATE_CHECK',
}, null, 2))
