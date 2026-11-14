# CCXT -> dsh-quant: optional public-data example

This is a working **source-checkout** example, not a new provider argument for
`quant_market_fetch`. It fetches Kraken BTC/USD spot hourly OHLCV through the
real CCXT SDK, converts it to dsh-quant `Candle` values and calls registered
`quant_data_quality` and `quant_sma` tools in a real Cordis/dsh-tools runtime.
It does not connect an account or trade. No model API/LLM tokens are used.

## Install and run

Use a maintained Node24 release; the isolated example requires Node>=22.12.
From the **repository root**, after reviewing the source/data terms:

```sh
npm ci
npm ci --prefix demos/ccxt-public --ignore-scripts
node --import tsx demos/ccxt-public/run.ts --live --personal-research
```

No registration, API key or paid endpoint is needed. This does not mean
unrestricted data rights: the example is for personal non-commercial research.
Review [Kraken's API notices](https://docs-legacy.kraken.com/api/docs/guides/global-intro/#notices)
and [current terms](https://www.kraken.com/legal/global-terms) before use;
commercial/non-personal use needs separate permission. Do not bypass regional,
authorization or rate-limit denials. The demo refuses redirects/unknown endpoints.

The root runtime has **no CCXT dependency**. Only this opt-in folder installs
CCXT4.5.92 (MIT, approximately70.5MB unpacked) and patched undici7.30.1 (MIT).
The lock pins the transitive override, too. CCXT's published npm version is
4.5.92 but its exported JS version is4.5.91; both observations are recorded.
Do not silently equate the string with a different package installation.

## Outputs and limits

- `.data-local/ccxt/<run-id>/`: raw responses, canonical candles and tool results;
  ignored by Git and outside package inclusions. Private research copies only.
- `benchmark/ccxt/evidence/<run-id>.json`: public-safe counts, request paths,
  timings, hashes, code/lock fingerprints and explicit failure state. No quotes,
  credentials or raw OHLC arrays. Refuses to overwrite an existing run receipt.
- Each run: max12 public GETs,1.1s scheduled spacing,10s/request timeout,
  three rounds/path, no retries/fallback. Measured accepted run used8 requests.
- Fixed60-hour window with an extra completed-hour guard; incomplete/outside
  bars discarded, missing buckets rejected rather than filled. Explicit UTC ms.
- Kraken REST returns only the latest720 bars; this is not an all-history downloader.
- API retrieval now does **not** establish when a past researcher could have
  observed a bar. This is not historical point-in-time/vintage certification.

## Tests and benchmark

```sh
node --import tsx --test tests/ccxt*.spec.ts
node --import tsx benchmark/ccxt-offline.ts
npm test
npm audit --prefix demos/ccxt-public --omit=dev
node scripts/check-ccxt-pack.mjs
```

All automated tests use synthetic input or archived receipts; CI does not hit
Kraken. The optional CI job installs/audits the locked example and typechecks it.
Live requests run only after explicit CLI consent. Review the
[experiment and measured results](../../docs/data-sources/CCXT-KRAKEN-2026-11-14.md).

Future PRs should preserve source attribution, clear data rights, closed-bar
rules and deterministic negative controls. Thanks for helping turn source
discovery into reproducible integrations; continued collaboration is welcome.
