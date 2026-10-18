# dsh-quant 0.91.1 release delivery

Prepared 2026-10-18 (Asia/Shanghai). **Candidate prepared; npm publication is
blocked.** The [authenticated delivery attempt](../../release/0.91.1/DELIVERY-ATTEMPT.md)
records the new tag, actual publisher E404 and maintainer login handoff.
This is not a published-version claim.

## Three separate acceptance states

| State | Evidence / result |
| --- | --- |
| Compatibility source merged | [#142](https://github.com/pengpengyi92/dsh-quant/pull/142), `4d7e92371968941998bb6540c713d556a7dc7502` |
| New npm version published | Not yet verified; registry still has only `latest: 0.90.0` at inspection |
| Registry package installs, loads and executes | Pending publication; local candidate tarball checks are a separate result |

The inspection snapshot and final candidate validation logs are versioned in
[`release/0.91.1/`](https://github.com/pengpengyi92/dsh-quant/tree/release/0.91.1/release/0.91.1).
That directory is deliberately outside the npm `files` allowlist so storing
tarball checksums cannot change the tarball being measured.

## Version decision and existing release failure

- npm registry was last published as **0.90.0** on 2026-08-23; no alternate
  dist-tag or 0.91.1 registry version was found.
- GitHub **v0.91.0** already identifies `613a8633aaf53319afd86c8793b4ac4410e7682a`
  and a [2026-09-18 Release](https://github.com/pengpengyi92/dsh-quant/releases/tag/v0.91.0).
  It does not identify today's compatibility merge. Preserve that tag and Release.
- Its [publish run 35351425247](https://github.com/pengpengyi92/dsh-quant/actions/runs/35351425247)
  passed build/tests but failed on `npm publish` with **E404** for the registry
  PUT (package not found or no permission). This is historical evidence, not
  proof that the repository's current publishing credentials remain invalid.
- Choose the unused stable patch **0.91.1** for backwards-compatible fixes.
  Update both package manifests consistently. No major-version compatibility
  promise is added; existing bounded peer/engine ranges remain unchanged.

## Release contents and attribution

The original 0.2.x compatibility work is **hufeide's #136**, including original
head `633ba45fa96063d0cc746c6618b28dfadba59908`. That commit is an ancestor of
the merged source and this release candidate. No contributor history is
rewritten. **ziladan** reported the rc.2 request in #139 and #140.

Maintainer integration in #142 adds the explicit host engine declaration,
historical-runtime-safe call-ID typing, bounded dependencies, coherent RC lock,
four pinned host cohorts and real Loader consumer checks.

This candidate also ships the independently merged metrics JSON correction
(#135/#138) and Kupiec POF correction (#137/#141). They remain separate credited
changes. The package includes accumulated research/documentation updates since
npm 0.90.0, including the previous 0.91.0 documentation. This release preparation
does not modify `src/`, the 59-tool API, or numerical implementations.

## Verification and limits

The merged source passed all five jobs in
[PR CI 39095096509](https://github.com/pengpengyi92/dsh-quant/actions/runs/39095096509)
and [post-merge CI 39095170375](https://github.com/pengpengyi92/dsh-quant/actions/runs/39095170375).
Each pinned cohort ran 298 tests, 59 registrations and 56 deterministic calls.
See the [compatibility audit](DSH-0.2.1-RC.2-2026-10-18.md) for original evidence.

Candidate validation uses Node 24.19.0 / npm 11.9.0, the committed lockfile,
and one recorded npm tarball for all four consumers. The consumer script now
accepts either a `.tgz` file or an exact `dsh-quant@X.Y.Z` registry specifier,
checks the installed version and shared peers, boots the real Loader, verifies
the SMA known answer, and executes all 56 deterministic tools from the
**installed compiled package**. It logs source, resolved URL and integrity.

Local `npm test` reaches build/typecheck but its `tsx` CLI cannot create an IPC
socket (`EPERM`) in this environment. `node --import tsx --test tests/*.spec.ts`
runs the same suite successfully; the literal local command is not reported as
passing. The release PR's GitHub CI is the independent standard-command gate.

Three live API tools (`quant_market_fetch`, `quant_repo_stats`,
`quant_npm_stats`) and full desktop UI/model-driven sessions are not certified.
No `--force` or `--legacy-peer-deps` is used to hide compatibility conflicts.

## Actual blocker

`npm whoami --registry=https://registry.npmjs.org` returns **ENEEDAUTH**.
No local npm token/login is configured. An HTTPS Git push dry-run also lacks
authentication, so this environment cannot push the release tag directly.
The existing tag-triggered workflow uses `secrets.NPM_TOKEN`; its current
validity has not been established. The connected GitHub interface supports
source/PR/Issue updates, but does not expose release-tag creation.

The later authenticated delivery attempt created `v0.91.1` at the reviewed
merge commit. Its publisher failed with E404; no new GitHub Release or npm
publication has been claimed. The older local-access observations above are
the preparation-time snapshot, not the current GitHub tag state.
Keep #139 and linked #140 open until registry delivery is actually verified.

## Completion procedure for an authenticated maintainer

1. Re-check `npm view dsh-quant version dist-tags --json`, registry 0.91.1,
   GitHub tags/Releases and any concurrent release PR. Never overwrite a version
   or move an existing tag. If 0.91.1 now exists, inspect it and verify its package
   instead of publishing again.
2. Confirm the release PR's five CI jobs pass and merge it while retaining the
   original #136 ancestry. Check that package.json and package-lock.json both
   say 0.91.1 and the existing release tag points to the reviewed commit.
3. Establish publishing access on the maintainer's machine or restore the
   existing repository publisher credential through GitHub's secret settings.
   Do not put a token in an Issue, commit or chat. The old E404 alone does not
   identify which current credential/account setting needs repair.
4. After restoring authentication, rerun the failed **v0.91.1** publisher,
   or publish its verified Linux candidate with an authorized npm identity.
   Do not move/recreate the existing tag. Avoid two concurrent publishing paths.
   The existing workflow
   validates tag/version equality and runs build/tests before publication.
5. Verify registry metadata and install the registry package into clean pinned
   consumers. The commands below must succeed before announcing availability.

```sh
npm view dsh-quant@0.91.1 version dist.tarball dist.integrity --json --registry=https://registry.npmjs.org
npm view dsh-quant dist-tags --json --registry=https://registry.npmjs.org
node scripts/consumer-runtime.mjs 0.2.1-rc.2 dsh-quant@0.91.1
node scripts/consumer-runtime.mjs 0.1.0-rc.6 dsh-quant@0.91.1
node scripts/consumer-runtime.mjs 0.2.0-rc.2 dsh-quant@0.91.1
node scripts/consumer-runtime.mjs 0.2.1-alpha.3 dsh-quant@0.91.1
```

Record the registry tarball hash, publish timestamp, tag commit, workflow URL
and consumer results. Compare the installed runtime/manifest with the reviewed
candidate. Create the GitHub Release using the same tag and credit hufeide.
Update the candidate-status text in README/NEWS/CHANGELOG and this delivery
record after actual verification.

Then tell ziladan in #139 (English) and #140 (Chinese) to install
`npm install dsh-quant@0.91.1` **in the existing DSH environment**, retain its
host dependencies and Loader configuration, and restart/reload the plugin.
For marketplace users, select the verified version after registry refresh.
Close #139 as completed and #140 as duplicate only when the package-level
acceptance criteria pass; retain an invitation to report environment-specific
problems. Until then, the exact-version command is a planned instruction,
not an available npm update.

## Engineering outcome

The verifiable chain is external report → preserved external contribution →
maintainer review and integration → four-host CI → package/Loader verification
→ publication → registry-consumer verification → user response. The last three
delivery steps remain open. This record intentionally exposes that gap rather
than presenting a source merge as a completed release.
