## Parent and verified problem

Scoped from the data-quality request #1 on 2026-11-14. Suitable for a first
TypeScript fix: one parser, focused offline tests, no finance-model changes.
No assignee or competing implementation PR was present at the audit; comment
here with a short plan before starting.

At `c323eb7`, `parseKlines` in `src/dsh-data/market.ts` calls Number(v) before
checking finiteness. JavaScript converts null, an empty string and whitespace
to 0, fabricating a value from a missing numeric field.

Maintainer reproduced this with synthetic input, not a live exchange claim:

```js
import { parseKlines } from './src/dsh-data/market.ts'
parseKlines([[1700000000000, null, '2', '0.5', '1.5', '10']])[0].open
// Current: 0. Required: throw an error naming the row and the open field.
```

Changing null to `''` or `'   '` produces the same incorrect zero. A deliberate
`assert.throws` regression probe fails with "Missing expected exception".
The existing suite is green: it does not yet pin these missing-field cases.

## Bounded change

Only adjust `parseKlines` and focused tests in `tests/market.spec.ts`.
Reject missing raw numeric values before coercion. Do not change other
providers, provider routing, OHLC trading rules, tool schemas or dependencies.
Do not replace missing values with zeros or silently drop rows.

## Acceptance checklist

- [ ] null, `''` and whitespace-only strings are rejected in each of the first six numeric fields: openTime/open/high/low/close/volume.
- [ ] Undefined, non-finite numbers, invalid numeric text and short rows still reject; preserve existing row/field diagnostics.
- [ ] Valid finite numeric strings and numeric values still parse to the same Candle shape; inputs are not mutated.
- [ ] Legitimate zero volume, as 0 and `'0'`, remains valid. Do not use a blanket falsy check.
- [ ] Empty input still returns `[]`; valid row ordering is unchanged.
- [ ] Add synthetic regression cases that fail before the fix and pass after it. Keep the existing known-answer tests.
- [ ] Source diff stays limited to the numeric-field guard; no broad parser refactor or new financial validation policy.

## Commands and review

```sh
npm ci
node --import tsx --test tests/market.spec.ts
npm run typecheck:market-tests
npm test
```

Record actual commands/results in the PR, including the before/after regression.
No live API verification is required for this pure-parser change. Close this
scoped issue when accepted; **do not close parent #1**, which is an ongoing
data-quality intake. Maintainers will review the zero-volume counterexample,
unchanged valid-input behavior and CI before merge, and credit the contributor.
