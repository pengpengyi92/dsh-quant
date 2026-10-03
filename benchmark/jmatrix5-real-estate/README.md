# JMatrix5 — Real Estate

**Type:** Reusable P-Benchmark framework  
**Domain:** Real Estate / Housing / Property / Location Economics

## Purpose

JMatrix5 turns a place, station, district, building or property market into a reusable real-estate comparison protocol.

It is designed to work across:
- **PACT** — organizations, employee housing, corporate real estate, compensation, hosting, location strategy;
- **PBCT** — data, pricing, yield, affordability, geospatial analysis, optimization, forecasting;
- **PCCT** — neighborhood culture, resident mix, lifestyle, communication environment, social / hosting fit;
- **PMap** — physical nodes, transit, buildings, walkability and repeatable field DD;
- **Personal decisions** — renting, buying, relocation, commute, investment and housing selection.

## Core Matrix

| Dimension | Questions / Metrics |
|---|---|
| Location | station, district, walking time, CBD access, border / airport access |
| Property | building, age, unit type, gross / saleable area, layout |
| Rent | room, studio, 1BR, 2BR, 3BR+, furnished / serviced |
| Buy | asking price, recent transactions, HK$/sq ft |
| Affordability | rent-to-income, mortgage burden, household income reference |
| Ownership economics | yield, financing, management fee, rates / taxes, maintenance |
| Mobility | commute time, interchange count, walkability |
| Organization | housing allowance, dormitory, corporate lease, relocation package |
| Hosting | guest accommodation, meeting / dinner proximity, visitor convenience |
| PBCT layer | pricing model, geospatial features, time series, comps, scenario model |
| PCCT layer | neighborhood culture, resident profile, lifestyle, night/day behavior |
| Risk | vacancy, liquidity, rate risk, regulation, concentration, building quality |
| Decision | rent / buy / wait / shortlist / employee benefit / investment |

## Standard Output

Every JMatrix5 case should produce:

1. **Node definition**
2. **Representative building sample**
3. **Rent ladder**
4. **Purchase-price ladder**
5. **Income / affordability model**
6. **Rent-vs-buy or ownership economics**
7. **Transit / commute graph**
8. **PACT / PBCT / PCCT interpretation**
9. **Risks / missing data**
10. **Decision / next DD**

## Reuse examples

- Wan Chai Station → immediate residential towers
- Central Station → CBD-adjacent housing
- HKU / Sai Ying Pun → student / RA / professional housing
- Shenzhen station / office clusters → employee housing
- Company office location → nearby corporate housing
- Investment target → rent / yield / financing / liquidity model

## Principle

**Do not analyze a property as an isolated unit. Analyze Property × Location × Income × Organization × Mobility × Culture × Time.**

## v1.1 Mandatory Housing-Affordability Metrics (2026-10-04)

Every residential JMatrix5 case must now calculate the following **mandatory outputs** for each representative rent tier:

1. **Monthly Rent** — HK$/month
2. **Annual Rent** — 12 × monthly rent
3. **Housing Burden Target** — default **30% of disposable net salary**
4. **Required Net Monthly Salary** — monthly rent / 30%
5. **Required Net Annual Salary** — annual rent / 30%
6. **Required Gross Monthly Salary** — back-solved under the case tax model
7. **Required Gross Annual Salary** — back-solved under the case tax model
8. **Representative Buy Price** — building / unit-type purchase-price range
9. **Income-to-Rent Interpretation** — who can plausibly carry the housing cost
10. **Rent-vs-Buy / Ownership Layer** — where data are available

### Default Hong Kong salary model — 2026/27

For Hong Kong cases, default **disposable net salary** is defined as:

```text
Gross cash salary
- Hong Kong salaries tax
- employee mandatory MPF contribution
= disposable net salary
```

Default assumptions for a standardized comparable case:
- single taxpayer;
- no dependants;
- no special deductions beyond mandatory MPF;
- 2026/27 basic allowance: **HK$145,000**;
- progressive salaries-tax bands: first HK$50k @2%, next @6%, next @10%, next @14%, remainder @17%;
- compare against two-tier standard rates where applicable: first HK$5m @15%, remainder @16%;
- employee mandatory MPF: 5% of relevant income, capped at **HK$1,500/month / HK$18,000/year** for income above the statutory ceiling.

This is a **benchmark assumption**, not individual tax advice. Actual tax varies with deductions, housing benefits, bonuses, marital / dependant status and other circumstances.

### Why 30%

JMatrix5 fixes the default housing-budget benchmark at **30% of disposable net salary** so cases remain comparable across stations and cities.

Optional stress bands may be added later, but **30% is the primary reported benchmark**.

### Required Case Table

Each case should include:

| Unit / Rent Tier | Monthly Rent | Annual Rent | Required Net Monthly | Required Net Annual | Required Gross Monthly | Required Gross Annual | Buy Price |
|---|---:|---:|---:|---:|---:|---:|---:|
| ... | ... | ... | ... | ... | ... | ... | ... |

## Interpretation Rule

JMatrix5 should answer not just “what does this apartment cost?” but:

> **What income profile, employer housing package, or household structure makes this housing product economically plausible?**

That makes Real Estate directly reusable by PACT, PBCT, PCCT, PMap and personal relocation decisions.
