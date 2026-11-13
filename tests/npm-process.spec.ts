import { test } from 'node:test'
import assert from 'node:assert/strict'
// @ts-expect-error maintenance runner is plain ESM JavaScript
import { npmCommand, registryDependencyVersion } from '../scripts/npm-process.mjs'

test('Windows npm uses a JS entry and preserves paths/arguments without a shell', () => {
  const cli = 'C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js'
  const result = npmCommand(['install', 'file:C:/work tree/a.tgz'], 'win32', cli)
  assert.equal(result.command, process.execPath)
  assert.deepEqual(result.args, [cli, 'install', 'file:C:/work tree/a.tgz'])
})

test('Unix npm retains the normal executable and exact argument boundaries', () => {
  const args = ['pack', '--json', '--ignore-scripts']
  const result = npmCommand(args, 'linux')
  assert.equal(result.command, 'npm')
  assert.deepEqual(result.args, args)
  assert.notEqual(result.args, args)
})

test('Registry dependency values are versions, not a repeated package name', () => {
  assert.equal(registryDependencyVersion('dsh-quant@0.92.0'), '0.92.0')
  for (const value of ['dsh-quant@latest', 'dsh-quant@^0.92.0', 'other@0.92.0', undefined]) {
    assert.equal(registryDependencyVersion(value), undefined)
  }
})
