# P-Curve Global Macro Coverage — AMER / EMEA / APAC
**Timestamp:** 2026-11-11 16:48 Asia/Shanghai
**Version:** architecture v1.0
**State:** DESIGN_ONLY / RESEARCH_ONLY / OWNER_NOT_REVIEWED / NO_LIVE_FEED
**P-DD source:** https://github.com/pengpengyi92/p-dd/blob/main/cases/industries/2026-11-11_GLOBAL_MARKETS_REGIONAL_TAXONOMY_DD/v0_1_0/REPORT.md

## Architecture decision
Geographical primary coverage: AMER (Americas), EMEA (Europe, Middle East, Africa), APAC (Asia-Pacific). Market overlays: DM, EM, FM, G7, G10 FX, LATAM, CEEMEA, MENA, GCC, ASEAN, EAFE, Global ex-US. USA is a standalone country/anchor module, while EM is a development/benchmark classification. EMEA != EM. Region assignments vary by organization and benchmark; maintain dated provider-specific mappings. Japan=APAC+DM; India=APAC+EM; Brazil=AMER+LATAM+EM. No double counting in aggregates.

## Shared data architecture
Canonical keys: country_iso, region_tags, development_tags, asset_class, instrument_id, issuer, currency, tenor, coupon_type, quote_type, observation_timestamp, publication_timestamp, ingestion_timestamp, provider, source_url, license, data_quality, revision.
Curve families: central-bank expectations, overnight/OIS, sovereign, swap, inflation-linked, corporate credit, FX spot/forward/basis, repo/funding, equity valuations. Local and hard-currency debt are distinct. DR001/DR007 overnight fixings do not constitute a full term curve.

## Global P-Curve screens
1. Global Overview: AMER/EMEA/APAC tiles, macro surprises and freshness.
2. Rates: UST/SOFR, EUR OIS/Bund, Gilt/SONIA, JGB/TONA, CGB/DR007 plus local government curves.
3. FX & Funding: USD, EUR, GBP, JPY, CNH, EM FX, FX forwards, basis, collateral.
4. Sovereign & Credit: DM/EM/FM spreads, EMBI/GBI-EM/CEMBI index families where licensed.
5. Equity & Commodities: valuation, earnings, equity risk premia, oil/metals cross-region transmission.
6. Risk & Scenario: DV01/KRDV01/CS01, carry/roll-down, FX delta, funding and cash stress.
7. Research Evidence: sources, timestamps, confidence, claim log and falsification.

## EADB
**Evidence:** P-DD taxonomy is the source baseline. No live market snapshots, benchmark membership or bank proprietary holdings independently verified in this commit.
**Assumptions:** USD base reporting currency unless overridden; regions nonexclusive with benchmark classifications; missing inputs displayed as missing; synthetic scenarios labeled SYNTHETIC.
**Decisions:** AMER/EMEA/APAC primary navigation; retain USA, ASIA, EM and provisional EM-EA research modules as filtered views; share one canonical instrument/curve registry; scenario-first P&L with explicit fixed/floating structure, long/short, maturity, base currency, hedge and financing.
**Boundaries:** No trading, client recommendation, licensed data claim, production integration, completed dashboard or tested analytics asserted. Bank data and confidential information excluded.

## Engineering acceptance gates
A. Country mapping tests: JP APAC+DM; IN APAC+EM; BR AMER+LATAM+EM; DE EMEA+DM+Euro Area.
B. One instrument counted once in aggregate regardless of overlapping tags.
C. Yield units bp/% and FX quote direction explicit; timestamps and staleness surfaced.
D. Shock sign: long fixed-rate bond loses on upward yield shock; verify DV01 conventions.
E. Synthetic USD local-bond return identity (1+r_local)(1+r_fx)-1.
F. Funding, hedge costs and missing quotes never silently set to zero.
G. Point-in-time and OOS gates required before any research alpha claim.

## Roadmap
Phase 0: schema/region registry and unit tests.
Phase 1: synthetic curve overlay and scenario engine.
Phase 2: approved public/licensed data adapters and source freshness.
Phase 3: multi-screen P-Terminal interactive visualization, cross-region drilldown, research notes.
All phases NOT_STARTED as of this specification.

## PFSC / PFSCC Research Cycle
Research claim -> evidence/PIT -> curve calculation -> shock exposure -> falsification -> OOS -> review. Do not weaken validation to increase throughput.
