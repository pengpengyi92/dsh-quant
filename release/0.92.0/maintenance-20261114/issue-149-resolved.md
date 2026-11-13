Hi @lomig-qwen, thanks again for the clear report and your patience. I reproduced the same rejection with the official DSH 0.2.1-rc.5 CLI and published dsh-quant@0.90.0. The old published peer ranges were the problem; a source-only merge had not delivered the fix to npm.

**0.92.0 is now actually published, and npm latest is 0.92.0.** Please use your intended profile:

```sh
dsh plugin --profile web add dsh-quant@0.92.0
```

That exact rc.5 CLI command now succeeds in my isolated Windows/Node24 profile, without allow-version or force. The actual npm tarball also passed [five clean Linux consumers](https://github.com/pengpengyi92/dsh-quant/actions/runs/43503675329), including rc.5: one shared host dependency set, real Loader, 59 tool registrations, known-answer SMA and 56 deterministic calls per cohort. Its integrity matches the reviewed Linux candidate; no release tag was moved.

This resolves the stale-published-manifest/install gate reported here, not certification of every Hub/Desktop/model session. The standalone profile peer check warns when host peers are absent from that directory; the Loader consumers validate a complete shared host separately. Three live APIs and your exact Linux/Node26/Hub environment remain unverified. If installation or loading still fails there, please reopen with a redacted version/error log; do not post credentials.

Thanks for helping us close the gap between a merged fix and an installable release. Keep the feedback coming; we'd be glad to keep improving this together.
