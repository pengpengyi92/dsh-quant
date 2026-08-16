# Contributing to dsh-quant-indicators

Thanks for your interest! This plugin follows the DeepSeek Harness tool
contract ([`defineTool`](https://github.com/deepseek-ai/deepseek-harness/blob/main/docs/cookbook/adding-a-tool.md)) and welcomes issues, PRs, and new ideas.

## Development loop

```sh
npm install          # real npm deps (no workspace symlinks needed)
npm run build        # tsc → lib/
npm test             # 30 unit cases + 4 real-Loader composition cases
npm run test:verify  # live integration (fetches Binance public data — needs network)
```

## Design rules (non-negotiable)

1. **Canonical outputs**: every tool returns structured JSON declared by
   `output.schema`; `output.render` produces the model-facing prose. Never
   return prose as the value.
2. **Null alignment**: indicator outputs are input-length aligned with leading
   `null`s — no padding, no truncated arrays.
3. **Pure core**: `src/indicators.ts` / `src/backtest.ts` / `src/market.ts`
   (parsing part) stay free of dsh imports so numerical correctness is testable
   standalone. Hand-computed baselines are required for every new numerical
   function (see `tests/`).
4. **Schema DSL limits**: `type` is a single string (use `oneOf` for unions);
   output object fields need `required: true`; no `minimum`/`maximum` — check
   ranges in `execute`.
5. **Bundle shape**: new tools register in `src/index.ts`; the bundle manifest
   (`dsh.bundle` → `cordis.patch.yml`) stays a single `insert` row.
6. **No secrets, no credentials**: the only network call is the Binance public
   REST API (anonymous). Never add a key-requiring provider without making it
   optional and key-free by default.

## Pull requests

- One concern per PR (a tool, a fix, a doc update).
- Numerical changes MUST add hand-computed unit cases.
- Run `npm run build && npm test` before pushing; CI runs the same.
- PRs are merged by maintainers with a `git tag vX.Y.Z`, which triggers the
  npm release workflow automatically (semver: major = breaking, minor = new
  tools, patch = fixes/docs).

## Releases (maintainers)

```sh
npm version <major|minor|patch>   # bumps version, tags, commits CHANGELOG entry
git push --follow-tags            # CI publishes to npm on tag
```

CHANGELOG.md is updated in the same PR as any user-visible change.
