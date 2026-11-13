// CI/test checkout only: replace development dependencies with a coherent,
// pinned historical host family. Production peer/engine ranges stay intact.
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runNpm } from './npm-process.mjs'

const version = process.argv[2]
const supported = ['0.1.0-rc.6', '0.2.0-rc.2', '0.2.1-alpha.3', '0.2.1-rc.2', '0.2.1-rc.5']
if (!supported.includes(version)) throw new Error(`Choose a cohort: ${supported.join(', ')}`)
const pins = JSON.parse(readFileSync(new URL(`../tests/fixtures/dsh-cohorts/${version}.json`, import.meta.url)))
const pkg = JSON.parse(readFileSync('package.json'))
const root = resolve(fileURLToPath(new URL('../', import.meta.url)))
const modules = resolve(root, 'node_modules')
if (resolve(process.cwd()) !== root || dirname(modules) !== root) {
  throw new Error('Run from this repository root; refusing an unbounded dependency cleanup')
}
pkg.devDependencies = {
  ...Object.fromEntries(Object.entries(pkg.devDependencies).filter(([name]) => !name.startsWith('@deepseek-ai/'))),
  ...pins,
}
writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n')
rmSync('package-lock.json', { force: true })
rmSync(modules, { recursive: true, force: true })
const install = runNpm(['install', '--ignore-scripts', '--no-audit', '--no-fund'], { stdio: 'inherit' })
if (install.status !== 0) process.exit(install.status ?? 1)
for (const [name, expected] of Object.entries(pins)) {
  const actual = JSON.parse(readFileSync(`node_modules/${name}/package.json`)).version
  if (actual !== expected) throw new Error(`${name}: expected ${expected}, found ${actual}`)
}
console.log(`Verified ${Object.keys(pins).length} pinned DeepSeek packages for DSH ${version}`)
