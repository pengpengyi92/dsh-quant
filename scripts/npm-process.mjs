import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'

export function registryDependencyVersion(target) {
  return target?.match(/^dsh-quant@(\d+\.\d+\.\d+)$/)?.[1]
}

export function consumerExpectedVersion(target, releaseVersion, harnessVersion) {
  if (releaseVersion !== undefined && !/^\d+\.\d+\.\d+$/.test(releaseVersion)) {
    throw new Error('Expected an exact stable release version')
  }
  const registryVersion = registryDependencyVersion(target)
  if (registryVersion && releaseVersion && registryVersion !== releaseVersion) {
    throw new Error('Registry target and selected release disagree')
  }
  return registryVersion ?? releaseVersion ?? harnessVersion
}

// Launch npm's JS entry directly on Windows; .cmd files are not native executables.
export function npmCommand(args, platform = process.platform,
  cli = process.env.npm_execpath || join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js')) {
  return platform === 'win32'
    ? { command: process.execPath, args: [cli, ...args] }
    : { command: 'npm', args: [...args] }
}

export function runNpm(args, options = {}) {
  const invocation = npmCommand(args)
  return spawnSync(invocation.command, invocation.args, { ...options, shell: false })
}
