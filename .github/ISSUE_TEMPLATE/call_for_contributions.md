---
name: Call for contributions (征集 PR)
about: Invite community PRs for a tool, dimension, data source, or research area
title: "[cfc] "
labels: ["good first issue", "help wanted"]
---

## What we're inviting

One paragraph: what capability / dimension / data source / research area we want
contributors to build, and why it matters to dsh-quant users.

## Existing state

What already exists (link tools/files), so contributors don't rebuild:

- `quant_*` tools covering: ...
- Related issue: #...

## Suggested scope (pick any)

- [ ] Option A (small, ~half day): ...
- [ ] Option B (medium, ~1 day): ...
- [ ] Option C (larger, ~1 week): ...

## Contract expectations

- Pure functions + `node:test` unit tests (repo convention)
- Canonical output shape documented in the tool's JSDoc
- `npm test` green + typecheck clean + coverage ≥85% on new code
- PR message: `closes #<this issue number>`

## Reference

- Infra contract: `DESIGN.md` · `CONTRIBUTING.md`
- Existing patterns: `src/dsh-*/` modules

感谢贡献 🐳 — every PR is reviewed and merged; contributors are credited
in release notes and the README author section.
