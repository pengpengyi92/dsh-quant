import assert from 'node:assert/strict'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { runNpm } from './npm-process.mjs'

export function checkCcxtPack(pack) {
  assert(pack && Array.isArray(pack.files), 'expected npm pack JSON files')
  const paths = pack.files.map(file => file.path)
  assert(paths.every(p => typeof p === 'string' && !p.includes('\\')), 'expected canonical package paths')
  const forbidden = paths.filter(p => /(^|\/)(\.data-local|node_modules)(\/|$)/.test(p))
  assert.equal(forbidden.length, 0, `forbidden package entries: ${forbidden.slice(0, 3).join(', ')}`)
  for (const path of ['lib/dsh-data/ccxt.js', 'demos/ccxt-public/run.ts', 'demos/ccxt-public/package-lock.json']) {
    assert(paths.includes(path), `missing packaged example: ${path}`)
  }
  return { files: paths.length, forbidden: 0, bridge_and_locked_example: true }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const run = runNpm(['pack', '--dry-run', '--json', '--ignore-scripts'], {
    cwd: fileURLToPath(new URL('../', import.meta.url)), encoding: 'utf8', timeout: 60_000, maxBuffer: 8_388_608,
  })
  assert.equal(run.status, 0, run.stderr || String(run.error))
  console.log(JSON.stringify(checkCcxtPack(JSON.parse(run.stdout)[0])))
}
