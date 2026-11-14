# Newcomer Discussion and data-source collaboration review

Timestamp: 2026-11-14T15:24:55+08:00 (Asia/Shanghai).
Base: `5ba1ba5cfab63b08a7ff13744f07fa5975caca11`.

## Authorized Work and Public Posts

The Human requested: publish the three scoped newcomer tasks in Discussion;
research data-related repositories and private PDAT candidates; selectively
share safe material; check existing LLMQuant listing/access; publish a report
and strengthen data contribution intake; retain thanks/collaboration and review.

- Rechecked #107/#159/#160: OPEN, unassigned, no contributor claim at inspection.
- Paginated the full Discussion inventory:111 existing threads, no duplicate
  scoped newcomer announcement. Existing ecosystem/data/FICC hubs retained.
- Published [Discussion162](https://github.com/pengpengyi92/dsh-quant/discussions/162)
  in Announcements with links, claim steps, file-specific acceptance commands,
  negative controls, privacy/CI requirements, constructive review and thanks.
- No auto-assignment, merge guarantee, group requirement or implementation of
  the newcomer tasks. New data discussion is prepared for publication after
  linked source/report files exist on master; reuse Issue2 for tracking.

## Bounded Public Discovery

Search covered financial-data/MCP/SDK and source-governance tooling across
CN/US markets, crypto, macro revisions, filings and storage/ingestion. This is
not an exhaustive internet search or a quality ranking.

- Eleven selected repositories collected with canonical repo, fixed commit,
  root-license path/blob checks and explicit role. All LINK_ONLY/NOT_RUN.
- Source snapshot: `docs/data-sources/evidence/2026-11-14-data-repos.json`.
- OpenBB old owner URL resolves to openbq-org/OpenBB. GitHub detects the pinned
  license as NOASSERTION; direct pinned LICENSE header states Apache2.0. Kept
  that manual observation separate instead of overwriting automated evidence
  or applying it to older versions. Data rights are never granted by SDK code.
- First collection attempt aborted on a transient GitHub connection failure;
  no incomplete snapshot was written. One bounded retry completed all11.
- A guessed private adapter-document path was absent; actual tracked tree was
  then inspected and the existing architecture document read. No absent file
  was represented as evidence.

## PDAT Disclosure Gate

PDAT was independently checked PRIVATE. Local checkout was older than remote
main; fetched metadata and read current version/release/Agent instructions and
relevant governance documents without changing its worktree.

Selected public output is an independently written generic source-receipt/PIT/
rights checklist plus new invented DEMO vintage/rights fixtures. It is labelled
**PDAT proprietary/private origin**, not an internal-source mirror or relicensing.
No private runtime implementation, registry, real data, strategy, credentials,
customer record, private teaching/career context or commercial plan was copied.
Future code selection requires its own ownership/leakage review and approval.
No private code hashes, private URLs or internal operational paths are needed
for the public reference artifact.

## LLMQuant Listing and Access Correction

- Already listed in Issue2, ecosystem/plugin pages and the16-channel guide.
  Did not add a duplicate channel or pretend it was a new discovery.
- Pinned public MCP revision3ecdeaf; npm metadata agrees on0.7.1, MIT and Node>=20.
- Public docs describe account credentials and beta credits, not anonymous
  unlimited service. MCP client license and data permissions are separate.
- Official site/pricing returned403 in web reader and ordinary browser; docs
  host was unavailable. Current cash prices, live signup flow and actual quota
  remain UNVERIFIED. No bypass, account creation, payment, MCP install or
  authenticated data/personal-holdings access was attempted.
- Updated only the existing channel description/category/access prerequisites;
  missing credentials now block readiness. A claimed credential flag still
  does not establish actual authentication, quota, quality or redistribution.
- New fail-before tests:17 targeted guide tests,15 pass/2 fail on the old
  description and incorrect missing-key ready=true. Third negative-control
  test already passed. After correction17/17 PASS.

## Actual Engineering Verification

- `node --import tsx --test tests/data-guide.spec.ts tests/data-sources.spec.ts`:
  20/20 PASS (three new guide and three new discovery/fixture tests).
- `npm test`: build + source typecheck +343/343 PASS, no failures/skips.
- `npm run typecheck:scripts` and `npm run typecheck:market-tests`: PASS.
- `npm run test:compat`:59 registered,56 deterministic calls PASS,0 failed,
  three live APIs UNVERIFIED. No change to numerical methods or tool count.
- `git diff --check`: PASS. No dependency or package-version change.
- No provider service latency/cost/coverage/PIT benchmark was executed.
  Config correctness and synthetic fixture tests are not production evidence.

Report: `docs/data-sources/DATA-SOURCING-2026-11-14.md`.
Access workflow: `docs/data-sources/LLMQUANT.md`.
Selected public reference: `plugin/data/source-contract/README.md`.
Public-post read-back, privacy/link scans, CI and merge receipts follow once run.

- Discussion162 read-back matched the versioned announcement after newline
  normalization, including Announcements category and all requested task links.
- Read-only doc validation passed42 links (local existence/HTTPS syntax),
  balanced code fences, explicit proprietary/private boundary and a bounded
  common-secret-pattern scan. This is not a claim that every external URL was
  fetched successfully; pricing/docs access failures remain recorded above.
- Manual public-diff review contains no private PDAT implementation or data;
  PDAT worktree status remains clean. No broad private-directory copying.
- `git diff --exit-code 5ba1ba5 -- src/dsh-data/market.ts benchmark/smoke.ts AGENTS.md mcp/AGENT_GUIDE.md CONTRIBUTING.md package.json package-lock.json .github/workflows`: PASS. Existing newcomer tasks, dependency/runtime registration and publishing workflow were not silently replaced.
- `node --check scripts/data-source-snapshot.mjs`: PASS.
