## Parent and confirmed gap

Scoped from contribution/onboarding hub #109 on 2026-11-14. Documentation-only
first PR; no quantitative expertise, API key or paid service needed. Comment
here with your intended scope before starting; no assignee/competing PR was
present at the audit.

At `c323eb7`, `AGENTS.md`, `mcp/AGENT_GUIDE.md` and `CONTRIBUTING.md` still
describe 46 tools; some also pin 174 tests plus four Loader cases. Current
runtime verification registers 59 tools and the source suite passes 337 tests.
`CONTRIBUTING.md` says releases are automatic, but the verified delivery record
states that the failed automated publishing authentication has not been repaired
or revalidated by the successful manual publication.
These are misleading instructions for a new contributor, not cosmetic wording.

## Bounded change and acceptance

Limit the PR to those three documentation files:

- [ ] Replace stale current-state counts with accurate dated observations or references to executable checks. Prefer not to hardcode a changing test total.
- [ ] Use package.json scripts and current repo-root commands; do not require a separate historical Harness workspace.
- [ ] Distinguish `npm test` (offline tests) from `npm run test:verify` (live APIs/network). Do not run live checks just to fix documentation.
- [ ] Explain that a tag starts the publishing workflow, but successful authentication, npm registry visibility/integrity and clean installation determine delivery. Do not claim the old GitHub secret is repaired.
- [ ] Reference `release/0.92.0/DELIVERY.md` and current compatibility evidence; do not fabricate broader Desktop/model support.
- [ ] Preserve design contracts, relative links and privacy boundaries. Do not regenerate schemas, alter workflows, bump the package or edit historical release logs.
- [ ] Record evidence for any retained count and the actual verification commands. A search/replace from 46 to 59 alone is insufficient.

Sources of truth: `package.json`, `consumer-test/boot.ts`,
`scripts/review-136-smoke.ts`, current test output and
`release/0.92.0/DELIVERY.md`. Check links from each document's own directory.

## Local verification

```sh
npm ci
npm test
git diff --check
```

In the PR, list the edited instructions and their source evidence. Review
checks accuracy and contributor usability as well as CI. An accepted PR closes
this scoped issue, **not the ongoing hub #109**. No support or merge-time SLA
is implied; we will acknowledge the work and preserve contributor credit.
