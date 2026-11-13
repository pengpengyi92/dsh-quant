import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'

export function registryDependencyVersion(target) {
  return target?.match(/^dsh-quant@(\d+\.\d+\.\d+)$/)?.[1]
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
