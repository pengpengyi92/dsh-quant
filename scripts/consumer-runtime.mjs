// Install the actual packed plugin beside an exact host family, then boot the
// existing real-Loader consumer fixture using Node's normal package resolution.
import { mkdtempSync, readFileSync, writeFileSync, copyFileSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { consumerExpectedVersion, registryDependencyVersion, runNpm } from './npm-process.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const version = process.argv[2]
// Optional exact registry version or local release tarball. With no argument,
// retain the existing CI behavior of packing the current checkout.
const target = process.argv[3]
const registryTarget = registryDependencyVersion(target)
if (target && !registryTarget && !(target.endsWith('.tgz') && existsSync(target))) {
  throw new Error('Use dsh-quant@<exact stable version> or an existing .tgz path')
}
const expectedVersion = consumerExpectedVersion(target, process.argv[4],
  JSON.parse(readFileSync(join(root, 'package.json'))).version)
const supported = ['0.1.0-rc.6', '0.2.0-rc.2', '0.2.1-alpha.3', '0.2.1-rc.2', '0.2.1-rc.5']
if (!supported.includes(version)) throw new Error(`Unknown DSH cohort: ${version}`)
const pins = JSON.parse(readFileSync(new URL(`../tests/fixtures/dsh-cohorts/${version}.json`, import.meta.url)))
const temp = mkdtempSync(join(tmpdir(), 'dsh-quant-consumer-'))
function run(command, args, cwd, capture = false) {
  const options = { cwd, encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit' }
  const result = command === 'npm' ? runNpm(args, options) : spawnSync(command, args, options)
  if (result.status !== 0) throw new Error(`${command} failed (${result.status}): ${result.stderr ?? ''}`)
  return result.stdout
}
try {
  let spec = registryTarget || (target ? `file:${resolve(target)}` : undefined)
  if (!spec) {
    const packed = JSON.parse(run('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', temp], root, true))[0]
    spec = `file:${resolve(temp, packed.filename)}`
  }
  writeFileSync(join(temp, 'package.json'), JSON.stringify({
    name: 'dsh-quant-compat-consumer', version: '0.0.0', private: true, type: 'module',
    dependencies: { ...pins, tsx: '4.23.15', 'dsh-quant': spec },
  }, null, 2))
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--registry=https://registry.npmjs.org'], temp)
  const installed = JSON.parse(readFileSync(join(temp, 'node_modules/dsh-quant/package.json')))
  if (installed.name !== 'dsh-quant' || installed.version !== expectedVersion) {
    throw new Error(`Wrong package installed: ${installed.name}@${installed.version}`)
  }
  const locked = JSON.parse(readFileSync(join(temp, 'package-lock.json'))).packages['node_modules/dsh-quant']
  console.log(JSON.stringify({ source: registryTarget ? 'npm-registry' : 'local-tarball',
    package: `${installed.name}@${installed.version}`, cohort: version,
    resolved: locked.resolved, integrity: locked.integrity }))
  // Invalid/duplicate peers must fail rather than silently testing two runtimes.
  run('npm', ['ls', '@deepseek-ai/cordis', '@deepseek-ai/dsh-tools', '@deepseek-ai/dsh-system-prompt'], temp)
  for (const name of ['boot.ts', 'cordis.yml']) copyFileSync(join(root, 'consumer-test', name), join(temp, name))
  run(process.execPath, ['--import', 'tsx', 'boot.ts'], temp)
  // Exercise the compiled installed package, never the checkout's src/ tree.
  const smoke = readFileSync(join(root, 'scripts/review-136-smoke.ts'), 'utf8')
  const sourceImport = "from '../src/index.js'"
  if (!smoke.includes(sourceImport)) throw new Error('Smoke import changed; update package smoke wiring')
  writeFileSync(join(temp, 'package-smoke.ts'), smoke.replace(sourceImport, "from 'dsh-quant'"))
  run(process.execPath, ['--import', 'tsx', 'package-smoke.ts'], temp)
} finally {
  if (dirname(resolve(temp)) !== resolve(tmpdir()) || !basename(temp).startsWith('dsh-quant-consumer-')) {
    throw new Error('Refusing cleanup outside the generated consumer directory')
  }
  rmSync(temp, { recursive: true, force: true })
}
