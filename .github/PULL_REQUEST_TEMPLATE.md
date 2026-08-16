## Summary

What this PR changes and why (one paragraph).

## Contract checklist

- [ ] Canonical output schema declared with `required: true` on all fields
- [ ] `output.render` produces model-facing prose; no prose in the value
- [ ] Numerical logic lives in `src/*.ts` pure functions with zero dsh imports
- [ ] Hand-computed unit cases added in `tests/` (baseline numbers, not self-referential)
- [ ] `npm run build && npm test` passes locally
- [ ] CHANGELOG.md entry added (user-visible changes)
- [ ] No credentials / no key-requiring code paths

## Test evidence

Paste the test summary (`ℹ tests / pass / fail`) and any live verification output.
