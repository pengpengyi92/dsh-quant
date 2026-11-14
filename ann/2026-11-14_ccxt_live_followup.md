## From links to a working example: CCXT + Kraken -> dsh-quant

Thanks to everyone sharing data sources and practical integration ideas. We
have now taken one of the11 candidates beyond listing: a working, optional
CCXT public-data example, merged in [PR #165](https://github.com/pengpengyi92/dsh-quant/pull/165).
Thanks to the upstream CCXT and Kraken maintainers for their libraries/docs.

**Code:** [example and install guide](https://github.com/pengpengyi92/dsh-quant/tree/master/demos/ccxt-public)
and [strict Candle bridge](https://github.com/pengpengyi92/dsh-quant/blob/master/src/dsh-data/ccxt.ts).
The actual path is `CCXT fetchOHLCV -> Candle -> registered quant_data_quality + quant_sma`.
It is not just a download script, but it is also **not** a new provider option
for `quant_market_fetch`, a hosted service or a new npm release.

### Run from a source checkout

Use a maintained Node24 release. Review Kraken's terms first, then from the
repository root:

```sh
npm ci
npm ci --prefix demos/ccxt-public --ignore-scripts
node --import tsx demos/ccxt-public/run.ts --live --personal-research
```

No account, API key, paid endpoint, model inference or trade is used. Optional
CCXT dependencies are isolated; ordinary dsh-quant installs do not gain them.
Raw responses/candles/tool results stay under ignored `.data-local/ccxt/`;
public benchmark receipts contain counts, timings and hashes, not raw prices.

### Actual benchmark, not a speedup claim

Accepted live run:2026-11-14 15:47:34–15:47:44, Asia/Shanghai.

| Check | Measured result |
|---|---|
| Public HTTP | 8 requests, all200, within12/run budget; no retries |
| Data | 60 closed hourly BTC/USD candles per path;6 paths across3 rounds |
| Control | Native REST vs CCXT, same window, exact full-Candle equality in every round |
| dsh tools | 12 quality/SMA calls PASS; SMA agrees with pure-function oracle |
| Latency | CCXT4.13s first load,1.57/1.87s warm; REST0.54/1.12/0.89s |
| Offline | 240 synthetic bars;50 warmups +1000 samples/path; strict mapping median0.0153ms |
| Checks | 358 source tests,15 scoped tests and all7 final CI jobs PASS |

Latency includes scheduled rate limiting, response hashing and initial market
metadata; n=3 is descriptive, not p95/SLA or proof CCXT is faster. The negative
control catches null volume being silently turned into0 by unchecked mapping.
We also found/fixed optional undici advisories and nested-dependency packaging;
failed checks and earlier diagnostic runs were retained, not erased.

[Protocol, comparisons and limitations](https://github.com/pengpengyi92/dsh-quant/blob/master/docs/data-sources/CCXT-KRAKEN-2026-11-14.md)
· [accepted machine receipt](https://github.com/pengpengyi92/dsh-quant/blob/master/benchmark/ccxt/evidence/2026-11-14T07-47-34-088Z.json)
· [timestamped work log](https://github.com/pengpengyi92/dsh-quant/blob/master/log/2026-11-14_ccxt-first-live-data.md).

### License and use boundary

CCXT4.5.92 is MIT code; **that does not license Kraken's market data**. Public
endpoints need no key, but [Kraken's API notices](https://docs-legacy.kraken.com/api/docs/guides/global-intro/#notices)
and [terms](https://www.kraken.com/legal/global-terms) still apply. This example
is personal non-commercial research only. Commercial/non-personal use needs
separate permission; raw-data redistribution is not approved here. Closed-bar
filtering does not establish historical PIT availability, trading returns,
production readiness or cross-exchange correctness. Stop on access/rate denials;
do not bypass them or post keys/full secret MCP URLs.

### Keep building data plugins together

Please share a source/plugin/MCP/SDK, one concrete use, access/fee limits, code
license versus data rights, timestamps/units, actual command/result or `NOT_RUN`,
and a failure/negative control. Small normalization, quality, persistence,
source-governance and visualization examples are welcome. Follow-up implementation
tracking remains in [Issue #2](https://github.com/pengpengyi92/dsh-quant/issues/2).

Thanks for the collaboration. We welcome newcomers and continued PRs, give
specific review feedback and preserve upstream/contributor credit. Keep going;
rights, privacy, reproducibility and CI still gate accepted work.
