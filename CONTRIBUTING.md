# Contributing to dsh-quant

Thanks for your interest! dsh-quant is an agent-native quantitative R&D toolkit
for DeepSeek Harness — 46 tools across 6 domains, methods open, secrets
internal. We welcome issues, PRs, discussions, and data-provider partnerships.

## Development loop

```sh
npm install          # real npm deps (no workspace symlinks needed)
npm run build        # tsc → lib/
npm test             # 174 unit cases + 4 real-Loader composition cases
npm run test:verify  # live integration (public market/GitHub/npm APIs — needs network)
npm run gen:tools    # regenerate mcp/tools.json after tool changes
```

## Design rules (non-negotiable)

1. **Canonical outputs**: every tool returns structured JSON declared by
   `output.schema`; `output.render` produces the model-facing prose.
2. **Null alignment**: outputs are input-length aligned with leading `null`s —
   no padding, no truncated arrays; empty series are legal results, not errors.
3. **Pure core**: domain math stays free of dsh imports (testable standalone).
   Every new numerical function ships hand-computed baselines in `tests/`.
4. **Schema DSL limits**: `type` is a single string (use `oneOf` for unions);
   output object fields need `required: true`; no `minimum`/`maximum` — check
   ranges in `execute`.
5. **No look-ahead**: factor[i] predicts returns[i+1]; backtests confirm on bar
   i and fill on bar i+1.
6. **No secrets, no paid data**: providers are key-free public APIs by default;
   optional tokens read from the environment (e.g. `GITHUB_TOKEN`). Paid data
   sources are documented in the channel guide, never proxied.

## Pull requests

- One concern per PR (a tool, a fix, a doc update).
- New tools: register in `src/index.ts`, update the Loader tool list
  (`tests/loader-composition.spec.ts`), regenerate `mcp/tools.json`, and add
  the tool row to the README table — four places, always together.
- Numerical changes MUST add hand-computed unit cases.
- Run `npm run build && npm test` before pushing; CI runs the same. For
  network-layer changes also run `npm run test:verify`. See the
  `quant-release-cycle` skill (`skill/quant-release-cycle/SKILL.md`) for the
  full pre-push checklist.
- Releases are automatic: a `vX.Y.Z` tag triggers CI → npm publish. Maintainers
  cut tags after merge.

## Ecosystem conventions (learned from the dsh ecosystem)

- The repo carries the `dsh-plugin` GitHub topic and declares the
  `dsh.bundle` manifest (installable via `dsh plugin add`).
- Official `@deepseek-ai/*` packages are `peerDependencies`, never bundled.
- Ecosystem maps live in `docs/QUANT_ECOSYSTEM.md` (directory) and Discussion
  #11 (community thread) — add new quant-related dsh projects there.
- Community operation follows `docs/ECOSYSTEM_PLAYBOOK.md` (channels, cadence,
  boundary language).
