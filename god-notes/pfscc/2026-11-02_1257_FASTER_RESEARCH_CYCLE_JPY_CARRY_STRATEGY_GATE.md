# PFSCC GOD Note — Faster Research Cycles, Not Weaker Validation

**Timestamp:** 2026-11-02 12:57 Asia/Shanghai
**Research anchor:** PFICC-Research-001 JPY_CROSS_CURRENCY_CARRY; PMAB-004 Fed Reaction Function; QUBIST Macro
**Scope:** Public-data research only; additive note, no change to earlier research files.

## Principle
Build strong provenance/PIT/validation infrastructure to increase the number of hypotheses tested per limited unit of time, **without weakening validation**. Cycle speed is not measured by alpha claims or trading frequency.

## Strategy gate
Hypothesis -> Measurable Shock -> Risk Exposure (DV01/KRDV01/CS01/funding/FX) -> Candidate Tradable Strategy -> Data PIT -> Falsification -> Chronological OOS -> Cost/Liquidity/Capacity/Risk -> Paper monitoring -> authorized production only after separate review.

Output gates: PASS / REJECT / INSUFFICIENT_DATA. Never equate a synthetic unit test with a validated strategy.

## Five-channel baseline
1. US Policy: implemented policy vs market-implied expectations, UST curve, releases and surprises.
2. FX Transmission: USD/CNY fixing separated from spot; same-time CNY/CNH only for basis.
3. RMB Money Market: overnight PBoC operations vs DR001/DR007/R007/Shibor; publication and observation timestamps.
4. RMB Fixed Income: CGB curve, slope, DV01 and KRDV01; no invented holdings.
5. Credit Spread: same-tenor/same-convention credit curves or MISSING.

## Two candidate studies
**RMB 1Y-10Y:** Test whether an overnight funding-regime change affects short-end relative to long-end. Slope = 10Y yield - 1Y yield. DV01-match a candidate steepener; negative control: a rally led by long-end produces flattening. Do not assert a signal without comparable PIT market observations.

**JPY-funded USD carry:** Borrow JPY -> spot convert -> USD asset -> FX hedged/unhedged repayment. In unhedged form, FX appreciation of JPY can overwhelm USD asset return. For hedged analysis, use actual borrowing rates and executable matched-tenor spot/forward bid-ask; account for basis exactly once, transaction costs, collateral, margin and asset DV01. Compare 1M/3M/6M/1Y; **do not assume 1Y is optimal**. Missing quotes -> MISSING / NO_EXECUTABLE_FUNDING_ESTIMATE.

## SmartShift Live View proposed KPIs
- median elapsed minutes idea -> PIT-valid first reproducible test
- number of hypotheses with explicit falsification checks per week
- percentage of tests with source and publication/observation timestamps
- OOS + cost/liquidity acceptance completion rate
- reproducibility on clean environment
- negative-results preservation rate

## External public benchmark
Michael (Xin) Qian's publicly visible LLMQuant AI + Quant roundtable remarks concern digital, traceable, repeatable decision processes and institutional memory in FICC. This is not proof of any collaboration or personal contact.
Source: https://www.linkedin.com/company/llmquant ; profile: https://cn.linkedin.com/in/michael-x-qian

## EADB
Provenance: user discussion, public profile/post references; assumptions: hypothetical strategies and tenors; units: bp, %, JPY per USD; PIT: gate on actual information availability; methods: curve DV01 matching and cross-currency cash-flow accounting; tests: positive and negative cases; negative results: no complete executable funding data, no demonstrated alpha.
**RESEARCH_ONLY / NO_OOS / NO_LIVE_P&L / NOT_PRODUCTION / NO_TRADE**
