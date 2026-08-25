#!/usr/bin/env bash
# Consumer test: verify the PACKED dsh-quant works for real npm consumers.
# Runs in CI after build. Packs the tarball, installs it into a scratch
# consumer dir, and imports core re-exports (the "pure function" promise).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCRATCH="$(mktemp -d)"
trap 'rm -rf "$SCRATCH"' EXIT

echo "==> packing dsh-quant"
TARBALL="$(npm pack --pack-destination "$SCRATCH" --silent 2>/dev/null)"
echo "    tarball: $TARBALL"

echo "==> installing into scratch consumer dir"
cd "$SCRATCH"
npm init -y >/dev/null 2>&1
npm install "./$TARBALL" >/dev/null 2>&1

echo "==> verifying consumer usage"
node -e "
const dq = require('dsh-quant');
const { sma, ema, rsi } = dq;
const s = sma([1,2,3,4,5], 3);
if (JSON.stringify(s) !== '[null,null,2,3,4]') {
  console.error('sma mismatch:', JSON.stringify(s));
  process.exit(1);
}
if (typeof ema !== 'function' || typeof rsi !== 'function') {
  console.error('core exports missing');
  process.exit(1);
}
const keys = Object.keys(dq).length;
if (keys < 50) {
  console.error('suspiciously few exports:', keys);
  process.exit(1);
}
console.log('sma([1,2,3,4,5],3) =', JSON.stringify(s));
console.log('export count:', keys);
console.log('consumer test: OK');
"
