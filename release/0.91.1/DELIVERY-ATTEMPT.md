# Authenticated release attempt - 2026-10-18

This supplements, rather than replaces, the earlier candidate evidence.
**npm publication and registry acceptance are still pending.**
Raw GitHub failure and Windows test output: [delivery-logs.zip](delivery-logs.zip).

## Observed state

- Verified source/tag: `v0.91.1` -> `ca4dd35df6b06e87ba3ff40e1a90a6e2ca2106e4`.
- The existing September `v0.91.0` tag and Release were not changed.
- Original hufeide commit `633ba45fa96063d0cc746c6618b28dfadba59908`
  is still an ancestor (`git merge-base --is-ancestor` exits 0).
- Both the release PR CI and post-merge CI passed all five jobs:
  [39111166845](https://github.com/pengpengyi92/dsh-quant/actions/runs/39111166845),
  [39111280423](https://github.com/pengpengyi92/dsh-quant/actions/runs/39111280423).
- At the 08:49 UTC registry check, `latest` was still `0.90.0` and an exact
  lookup of `0.91.1` returned E404.

## Actual publishing result

Pushing the new tag started the existing publisher:
[39112770145](https://github.com/pengpengyi92/dsh-quant/actions/runs/39112770145).
Install, build, 298 tests and tag/version equality all passed. The package
had 480 files and SHA-1 `e2c147f2c3c76851578d6fa8fb5d6474a741dfa9`,
matching the previously reviewed candidate.

The final `npm publish --access public` failed at 08:47:19 UTC:

```text
npm error code E404
npm error 404 Not Found - PUT https://registry.npmjs.org/dsh-quant - Not found
npm error 404 The requested resource 'dsh-quant@0.91.1' could not be found or you do not have permission to access it.
```

The workflow used the existing `NPM_TOKEN` secret. Its value was not read,
printed, copied or changed. E404 does not establish whether that token is
expired, insufficiently scoped, or otherwise rejected. Local `npm whoami`
also returned ENEEDAUTH. An npm official web-login handoff was opened for
the maintainer; credentials and login-session URLs are not archived here.

## Independent Windows checks

Node 24.18.0 / npm 11.16.0:

- Standard `npm test`: **298 passed, 0 failed** (including build and types).
- `npm run typecheck:scripts`: passed.
- `npm run test:compat`: 59 registrations, 56 passed, 3 live APIs unverified.
- `npm pack --dry-run --json --ignore-scripts`: no `.env`, `.npmrc`, private
  keys, dependency directories or release evidence in the payload.
- Windows expands the tracked `CLAUDE.md` symlink as a nine-byte plain file;
  its local package consequently has 481 files. It was **not published**.
  The Linux release job produced the expected 480-file package instead.

## Reusable delivery gate

The manually dispatched `release acceptance` workflow has no publishing
credentials or publishing step. It checks out the immutable version tag.
YAML parsing, four-cohort/read-only/no-publish invariants and every shell
block's `bash -n` syntax passed locally. Git Bash initialization required
execution outside the local sandbox. Actual workflow execution is a separate
gate; static checks are not reported as a successful consumer run.

- `source=candidate`: builds Linux tarballs, verifies the recorded integrity,
  installs each in four clean pinned DSH consumers, and retains the tarball
  and logs as workflow artifacts.
- `source=registry`: fetches the exact published npm version, checks integrity
  against candidate evidence, and performs the same real-Loader and 56-call
  checks. Missing versions and integrity mismatches fail closed.

No GitHub Release success announcement or Issue closure is justified until
the registry workflow passes. Keep #139 and #140 open while publication is
blocked. Do not move the tag or invent another version merely to retry auth.

Three live API tools, full desktop UI and model-driven sessions remain
unverified, as in the original compatibility audit.
