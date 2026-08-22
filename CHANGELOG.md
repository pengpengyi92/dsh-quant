# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.85.0] - 2026-08-22

### Added
- `quant_ic_decay` tool: IC decay analysis across horizons — per-horizon IC,
  half-life (signal shelf-life), best horizon, signal type (short/medium/long)
- `quant_portfolio_optimize` tool: weight optimizer — maxSharpe (mean-variance),
  minVar, riskParity (equal risk contribution), with portfolio stats and
  concentration (48 → 50 tools)
- `tests/decay-optimizer.spec.ts`: 7 hand-computed baselines (short/long decay
  via alternating & AR(1) constructions, minVar/maxSharpe/riskParity weights,
  preconditions) — unit suite 186 → 193

## [0.84.0] - 2026-08-22

### Added
- `quant_data_pit` tool: AI-infra level data quality report — point-in-time
  look-ahead step detection, survivorship (silent gaps + tail truncation),
  channel reliability ranking, composite health score (46 → 48 tools)
- `quant_channel_guide` tool: agent-ready channel access guide (setup steps,
  prerequisites, example call, fallback) + optional access readiness check
- CLI: `dsh-quant quality <csv>` (quality report) and `dsh-quant channel
  <name> [--check]` (access guide) commands
- `tests/quality.spec.ts`: 7 hand-computed baselines (PIT steps, survivorship
  gaps/tail, channel ranking, health score) — unit suite 179 → 186
- quant-upstream README: industry-chain loop section (P-Research: we are
  both data consumers and producers, closed loop)

## [0.83.0] - 2026-08-22

### Fixed
- `quant_factor_neutralize`: repaired broken import wiring — the tool was
  registered (46-tool set) but its `factorNeutralize` import was missing,
  so execution could never resolve. Now imported, re-exported and fully
  tested end-to-end (group z-score / OLS residual / zscore control).

### Added
- `tests/factor-neutralize.spec.ts`: 5 hand-computed baselines (zscore
  standardization, within-group z-score, OLS residual with R², residual
  direction retention, precondition errors) — unit suite 174 → 179.

## [0.82.0] - 2026-08-22

### Added
- TYO_QUANT.md — the Tokyo yen-rates-center census: ~9 firms
  (Capula stronghold / Two Sigma / Balyasny / Millennium /
  Squarepoint / ExodusPoint / Dimensional / Jump / AQR), the
  2025 $30M yen-rates talent war (Ron Choy → Balyasny, Harimoto
  → Modular, Capula/Dymon bank hires), the structural analysis
  (why only ~9 firms but deep positioning), the Asia-three-city
  division (HK China / SG crypto / TYO yen-rates), and the
  depth-over-breadth lesson

## [0.81.0] - 2026-08-20

### Added
- CHI_QUANT.md — the Chicago market-making city census:
  ~14 firms (7 HQs: Citadel/Jump/DRW/CTC/Wolverine/Balyasny/
  Akuna), the exchange-gene (CME/CBOT/CBOE + Black-Scholes 1973
  + trading-pit heritage), the UChicago MSFM talent pipeline,
  the crypto second curve (Jump/Cumberland), the Citadel 2022
  exit narrative, and the Chicago/NY/London three-city division

## [0.80.0] - 2026-08-20

### Added
- QUANT_PEOPLE_CN.md + QUANT_PEOPLE_GLOBAL.md — the 101st-release
  quant headcount estimates: China (~30,000-50,000 broad quant
  workers, top-60 firms ~9,000, structure analysis) and the
  four-city version (London ~8-12k / New York ~10-15k /
  Singapore ~3-5k / Hong Kong ~3.5-6k, ~25-38k combined,
  global ~80-120k), with the CN-vs-four-city single-firm scale
  comparison and the density findings

## [0.79.0] - 2026-08-20

### Added
- QUANT_WORLD_MAP.md — the 100th-release special: the global
  quant world map synthesizing 14 firm deep-dives + 4 city
  censuses (HK/SG/LDN/NYC) + the office network into one map:
  five-city axis (London-NY-Chicago triangle + HK-SG twins),
  nine success paths (black-box/cradle/mother/factory/ML/data/
  scale/per-capita/type), the global talent tree (mother →
  spawn → China branches), the four-city census summary table,
  and five map laws distilled from 94 firm archives

## [0.78.0] - 2026-08-20

### Added
- NYC_FOREIGN_QUANT.md — the New York hedge-fund-universe census:
  ~28 firms, the 12-HQ old-money core (Millennium / Point72 /
  Schonfeld / Squarepoint / ExodusPoint / PDT + DE Shaw /
  Two Sigma / Jane Street / HRT / Tower / Virtu / Renaissance),
  the ~16 US-firm branch layer (Citadel / Balyasny / BH / XTX /
  QRT etc.), the Connecticut suburb dark core (Greenwich /
  Stamford / East Setauket), the NY-vs-London twin-city
  comparison (multi-strat home vs fixed-income/macro port),
  and the five rules of New York dominance

## [0.77.0] - 2026-08-20

### Added
- LDN_FOREIGN_QUANT.md — the London global-quant-hub census:
  ~30 firms (world #1 city), the 12-HQ core (Man Group /
  Brevan Howard / Winton / Aspect / Marshall Wace / XTX / QRT /
  GSA / Capula / Rokos / Eisler / Wintermute), the ~20 US-firm
  Europe-hub layer (Citadel Tower move, Point72 £650k avg pay
  on 300+ staff, Millennium/JS Europe hubs), the FT/Hedgeweek
  2025 "London = global quant hub" verdict, the four-city
  comparison (London/New York/HK/SG), and the five rules of
  London dominance

## [0.76.0] - 2026-08-20

### Added
- SG_FOREIGN_QUANT.md — the Singapore foreign-quant census:
  ~20 foreign quant/hedge-fund offices in five categories
  (multi-strat / systematic / market-making / macro / crypto),
  the 2024-2026 expansion wave (Wintermute Asia new SG HQ with
  doubled APAC headcount, Jane Street relocation, Citadel hub,
  Balyasny PM hires), the crypto/market-making/family-office
  edge, the Modular reverse flow (SG-born → HK), and the
  HK-vs-SG "Asian twins" comparison table

## [0.75.0] - 2026-08-20

### Added
- HK_FOREIGN_QUANT.md — the Hong Kong foreign-quant census:
  ~26 foreign quant/hedge-fund offices in five categories
  (multi-strat / systematic / market-making / macro / crypto),
  each with establishment, scale, role-in-system and approximate
  headcount (marked 待核 where unverified), the 2025-2026
  expansion wave (Jane Street / QRT / Citadel Securities /
  Point72 / Jain Global), the hub-vs-branch structure analysis,
  and the GSR/QRT-as-HQ samples

## [0.74.0] - 2026-08-20

### Added
- QRT_SPECIAL.md — the data-king deep-dive: how the Credit Suisse
  systematic team's management buyout became the most successful
  bank-spinoff (MBO 2015-2016 → $42B in 2025, 40× in ten years),
  the data-and-engineering platform (one platform, four asset
  classes), the extreme-low-profile culture, the Dao China fund
  10×/98% breakout as the foreign-quant China comeback flagbearer,
  and the nine-path showdown with Two Sigma/WorldQuant/Citadel/
  XTX/RenTec/SIG/DE Shaw/JS

## [0.73.0] - 2026-08-20

### Added
- TWOSIGMA_SPECIAL.md — the ML-pioneer deep-dive: the DE Shaw
  spawn flagship (Overdeck math + Siegel engineering), science-
  method-as-brand (Two Sigma = two standard deviations),
  data-infrastructure-first strategy, tech-company culture,
  BeakerX/Flint open source, Venn productization, the China
  talent branch (Yanfu/Zhixingtongda), the dual-founder
  governance rise and 2024-2025 arbitration crisis, and the
  eight-path showdown with DE Shaw/RenTec/SIG/WorldQuant/
  Citadel/XTX/JS

## [0.72.0] - 2026-08-20

### Added
- DESHAW_SPECIAL.md — the cradle-king deep-dive: how Columbia
  professor David Shaw brought computation into finance (1988),
  the DE Shaw Mafia talent tree (Bezos → Amazon, Overdeck/Siegel
  → Two Sigma), the Anton supercomputer scientist turn (DESRES
  molecular dynamics, COVID-19 simulations), institutionalized
  governance after the founder, and the seven-path showdown with
  RenTec/SIG/WorldQuant/Citadel/XTX/JS

## [0.71.0] - 2026-08-20

### Added
- RENAISSANCE_SPECIAL.md — the black-box-king deep-dive: Jim
  Simons' three turns (mathematician → NSA code-breaker → quant
  king), the Medallion myth (66% pre-fee annualized for 30 years,
  ~$100B+ cumulative profits, +80% in 2008, size-capped on
  purpose), the scientist-culture secret (IBM speech-recognition
  transplant, no-finance-hiring), the external-funds cautionary
  tale, the philanthropic legacy, and the six-path showdown with
  SIG/WorldQuant/Citadel/XTX/JS

## [0.70.0] - 2026-08-20

### Added
- WORLDQUANT_SPECIAL.md — the alpha-factory deep-dive: why
  WorldQuant industrializes alpha production (BRAIN/WebSim
  crowdsourced pipeline, ~100M simulated alphas, the IQC
  competition-as-recruitment funnel, 101 Formulaic Alphas as the
  industry's public textbook, LLM-accelerated research, the
  China talent-tree mother role, and the factory-vs-mother-vs-
  scale-vs-per-capita four-path showdown)

## [0.69.0] - 2026-08-20

### Added
- SIG_SPECIAL.md — the poker-mother deep-dive: why Susquehanna is
  the industry's mother firm (probability-as-operating-system,
  the 1987 poker-table founding, 7-round poker-flavored interviews,
  the talent tree root for Jane Street/HRT/Five Rings, the hidden
  ByteDance angel round with ~15,000× return, $572B→$868B 13F
  options-heavy portfolio, and the four-path showdown with
  Jane Street/Citadel/XTX)

## [0.68.0] - 2026-08-20

### Added
- CITADEL_SPECIAL.md — the scale-king deep-dive: dual-engine
  (multi-strategy fund + world's largest market maker) how the two
  engines feed each other, $16B peak profit year (2022, all-time
  high), $97B→$120B Citadel Securities trading revenue (2024-2025),
  the 2008 self-rescue, Miami HQ relocation, and the per-capita-king
  (XTX) vs scale-king (Citadel) showdown

## [0.67.0] - 2026-08-19

### Added
- XTX_SPECIAL.md — the per-capita-productivity king deep-dive:
  £1.28B profit on ~200 people (£14M per head), the six secrets
  (zero human traders, single-business focus, pure prop, ML-first
  H100 arsenal, flat partnership, mathematician founder), the
  biggest-taxpayer and AI-chip-buyer stories, and the lean-scale
  philosophy parallel to dsh-quant

## [0.66.0] - 2026-08-19

### Added
- SHOWDOWN_CN_GLOBAL.md — the six-dimension China-vs-global quant
  showdown: pay (converging at $300-400k for grads), AUM (5-15x gap),
  strategy spectrum (8 lines vs 3), market access (bidirectional
  asymmetry), age (242 vs 22 years), capital style — plus the
  transparency inversion discovery (Chinese privates must disclose
  while foreign prop shops disclose nothing)

## [0.65.0] - 2026-08-19

### Added
- LISTED_QUANT.md — the listed-quant census: Virtu is not alone
  (Man Group LSE 1994, Virtu NASDAQ 2015, Flow Traders Euronext 2015,
  the 2015 market-maker IPO year), the Knight Capital death chain
  (45-minute $440M bug → KCG → Virtu 2017), five reasons listing is
  rare, the Citadel Securities rumor, and China's zero listed quant
  firms

## [0.64.0] - 2026-08-19

### Added
- CAPITAL_MODEL.md — the capital-structure census of all 42 foreign
  archives: prop (Jane Street/Optiver/IMC/SIG/Jump/HRT/XTX/crypto
  makers), hedge-fund (pod shops, macro, quant funds), hybrid
  (RenTec's internalized Medallion, DE Shaw's Oculus, Citadel's dual
  engine, Point72's family-office-to-fundraise transition), plus the
  China contrast and the open-source-prop positioning of dsh-quant

## [0.63.0] - 2026-08-19

### Added
- POD_PLATFORM.md — the pod-shop capstone: how platform-structure
  firms operate across five angles (organization/fundraising/prop
  capital/multi-office/product), the risk-and-rebuild lessons, and the
  isomorphism with dsh-quant's five-slot free-fill / unified-contract
  architecture

## [0.62.0] - 2026-08-19

### Added
- BALYASNY_SPECIAL.md — the sixth firm deep-dive: the 2001 Chicago
  three-founder origin (Balyasny/Schroeder/O'Malley), the Schonfeld
  broker lineage, the 2018 AUM halving and rebuild, the 2024
  'trading too much, not investing enough' self-critique, and the pod
  shop's office chronicle

## [0.61.0] - 2026-08-19

### Added
- MILLENNIUM_SPECIAL.md — the fifth firm deep-dive: 1989 Belzberg-seeded
  origin, the pod federated structure, all 14 offices (NYC HQ → London/
  HK/Singapore/Tokyo/Dublin/Geneva/Zug/Tel Aviv/Paris/Miami/Bengaluru/
  Dubai), the risk-hating track record, the $10B-cap-vs-$20B-demand
  discipline, and the China talent-tree grandparent thesis

## [0.60.0] - 2026-08-19

### Added
- POINT72_SPECIAL.md — the fourth firm deep-dive: the 72 Cummings
  Point Road name, the SAC rebirth story (18亿美元 plea → family
  office → 2018 reopening), all 14 offices from the official locations
  page (incl. the Taipei systematic-research office and the Warsaw/
  Bengaluru talent hubs), Cubist Systematic Strategies, and Steve
  Cohen the Mets owner/art collector

## [0.59.0] - 2026-08-19

### Added
- OPTIVER_SPECIAL.md — the third firm deep-dive: the Dutch name
  (optie verhandelaar), 1986 Amsterdam origin (Johann Kaemingk), office
  chronicle (Amsterdam → Chicago/Sydney → London/Singapore/Shanghai →
  Austin/Mumbai), the 2007-08 CFTC crude-oil case, Ready Trader Go,
  Pyth data provider — and the tool-level lineage to dsh-quant's
  options/volatility board

## [0.58.0] - 2026-08-19

### Added
- JANE_STREET_SPECIAL.md — the second firm deep-dive: the SIG ETF-trio
  origin (Reynolds/Granieri/Gerstein + Jenkins), the Greenwich Village
  street-name, office chronicle (NYC 2000 → London/HK/Singapore/
  Amsterdam), full-stack OCaml culture with the Dune build system, and
  the type-safety-as-contract parallel to dsh-quant's schema DSL

## [0.57.0] - 2026-08-19

### Added
- IMC_SPECIAL.md — the first firm deep-dive special: full name
  (International Marketmakers Combination), 1989 Amsterdam origin,
  office chronicle (establishment/scale/positioning per office), the
  Prosperity competition series, the 2016 CSRC investigation event,
  Rob Defares the art collector, and the R&D takeaways

## [0.56.0] - 2026-08-19

### Added
- QUANT_VENDORS_CN.md — China's picks-and-shovels layer: data vendors
  (Wind/iFinD/Choice/DataYes/聚源/朝阳永续/排排网), trading systems
  (Hundsun/QMT/A5/ATP/Esunny), FPGA low-latency (Shengli/AcceleCom),
  execution algos (Kafang Tech as the flagship sample, JoinQuant
  Alpha-T), platforms (JoinQuant/RiceQuant's open-source RQAlpha/
  MyQuant/UQER/BigQuant), alt-data — with the 94-archive linkage and
  the two open-source milestones (RQAlpha + jqdatasdk)

## [0.55.0] - 2026-08-19

### Added
- FOREIGN_CN_MAP_V2.md — fully verified foreign-in-China map: 7 WFOE
  PFM entities all in Shanghai (adding DE Shaw 2019, QRT 宽立 2024-12,
  Optiver 澳帝桦), tech/service entities (Akuna 奥可纳, Citadel 城堡
  咨询, Marshall Wace 马歇尔伟世), HRT Xuhui office, the 2024-2026
  second wave (CFM Paris 2026-05, AXQ Capital 安贤 breaking 100亿),
  Schonfeld demoted to unverified

## [0.54.0] - 2026-08-19

### Added
- SHANGHAI_GRAVITY.md (why Shanghai holds 55% of Chinese quant HQ —
  five engines: exchange infrastructure incl. CFFEX, capital/channel
  density, Fudan/SJTU talent, path dependence, policy) and
  FOREIGN_CN_MAP.md (all foreign quant footprints in China: 4 WFOE PFM
  entities all in Shanghai, WorldQuant/Millennium Beijing offices, and
  a to-verify branch list)

## [0.53.0] - 2026-08-19

### Added
- Quant maps (city-centric, two files): QUANT_MAP_GLOBAL.md (London/
  New York/Chicago/Greenwich/HK/Singapore/Amsterdam and more, every
  city with its full firm list) and QUANT_MAP_CN.md (Shanghai ~26 HQ,
  Shenzhen retention concern, Beijing academia, city-university binding,
  the register-office split phenomenon)

## [0.52.0] - 2026-08-19

### Added
- Office maps (two files): OFFICE_GLOBAL.md (42 firms' office networks,
  city ranking — London the global No.1 with ~30) and OFFICE_CN.md
  (Shanghai hegemony ~25/47, overseas-office rate below 10%, HK as the
  sole outbound bridgehead)

## [0.51.0] - 2026-08-19

### Added
- Signature encyclopedias (two files): SIGNATURES_GLOBAL.md (naming
  science — Optiver = Dutch for options market maker, Wintermute from
  Neuromancer — OCaml culture, pod structures, lore) and
  SIGNATURES_CN.md (Chinese naming art — Banyang/Luoshu/Jiukun's
  I Ching — the compute camp vs factor camp, quirks as memory points)

## [0.50.0] - 2026-08-19

### Added
- Age chronicles (two files): AGE_CN.md (Chinese firms 2004-2022, four
  eras, the 2013-2015 burst window = 57% of the archive) and
  AGE_GLOBAL.md (global firms 1783-2018, six eras, tool-revolution
  cycles, China-global generational mapping)

## [0.49.0] - 2026-08-19

### Added
- D-tier research reports (four): REGULATION.md (2015-2026 penalty &
  rule timeline), TALENT_MAP.md (eight foreign mothership lineages +
  academic motherships + split events), STAR_PRODUCTS.md (Golden Bull ×
  fate four-quadrant cross table), QUANT_AI.md (three phases, nine firm
  samples, the quant-to-AI spillover spectrum)

## [0.48.0] - 2026-08-19

### Added
- Five cross-border/foreign Lite archives (94 firms total): Tengsheng
  (Two Sigma's official China entity), Inshiman (Man Group China),
  Yuansheng (Winton China), GSR (ex-Goldman crypto market maker,
  SC Ventures-backed), Eisler Capital (the Goldman prodigy's London
  multi-strategy)

## [0.47.0] - 2026-08-19

### Added
- Eight more Chinese Lite archives (89 firms total), the Golden Bull
  evergreen tier: Kaifeng (macro decade), Honghu (first-award survivor),
  Egret (Zhejiang multi-strategy), Zhuoshi (low-frequency pure alpha),
  Hande (Millennium/WorldQuant Tsinghua trio), Niankong (quant assembly
  line, NeurIPS paper), Mengxi (full-spectrum alpha), Xinhong Tianhe
  (relative-value three-peat)

## [0.46.0] - 2026-08-19

### Added
- Seven more Chinese Lite archives (81 firms total), the 'storied'
  tier: Shenyi (2004, ex-Goldman pioneer), Jasper Dayan (Wang Yiping's
  boom-and-bust decade), Liyi (2008, vanished relative-value champion),
  Bodao (Mo Taishan's private-to-public-fund transition), Zunjia (2009,
  Chengqi's former employer, Fintech pivot), Qianyi (Minghong's second
  platform, 50:50 governance), Pingfanghe (PKU founder's 100亿 and the
  invoice-fraud fine)

## [0.45.0] - 2026-08-19

### Added
- Three more Chinese Lite archives (74 firms total): Tianyan (2014,
  the 2023 power-struggle case), Aifang (2012, Shanghai state-capital
  arbitrage veteran), Maoyuan (2013, founder Guo Xuewen — entered
  Tsinghua at 14; the first foreign-hiring penalty case)

## [0.44.0] - 2026-08-19

### Added
- Ten more Chinese Lite archives (71 firms total): Zhicheng Zhuoyuan
  (the Kunming-based 'Four King', bank-data crossover), Qianxiang
  (CTA evergreen), Blackwing (Stanford twins), Inno AM (multi-PM),
  LongQi (BGI lineage, α+β+Σ logo), JoinQuant (open-community-driven,
  GitHub jqdatasdk), Evolution (hand-written logic factors), Sixie
  (the 勰 trio), Bridgewater China (foreign sole Golden Bull regular),
  Beyang (Zhou Zhihua disciple, all-AI team)

## [0.43.0] - 2026-08-19

### Added
- Golden Bull special report (`quant-history/GOLDEN_BULL.md`): every
  quant-category winner of the China Private Fund Golden Bull Awards
  2014-2025, listed year by year regardless of count — plus cross-analysis
  with the 61 archives (12 in-archive winners, ten fun facts incl. Huanfang
  winning as 'Zhejiang Jiuzhang', Minghong's 2022 double award, the 2025
  'quant coming-of-age' categories, and Qiaoshui's macro triple)

## [0.42.0] - 2026-08-19

### Added
- Five new Lite archives (61 firms total): Hongxi (Guangdong quant CTA,
  Golden Bull 2025), Mingshi (founded 2010 — earliest quant privates,
  the 2021 power struggle), Wenbo (Zheng Yao's high-frequency 'Sisyphus'),
  Luoshu (Xie Dong's CTA ten-year trailblazer), Pansong (Wu Que's
  low-frequency star, fastest to 100亿, 2024 rumor rebuttal)
- Founding dates verified and backfilled: ChaoQuanZi 2015-06, YanSheng
  2014 (ex-Goldman lineage confirmed), Banyang 2021-09-03

## [0.41.0] - 2026-08-19

### Added
- Two-mode DD system: Deep (nine-section) vs Lite (six-section quick
  sketch with fun facts / data-analysis hooks / lineage front and center)
- Three new Lite archives: ChaoQuanZi (CUHK professor Zhang Xiaoquan),
  YanSheng (Tsinghua's Zhang You, options & multi-strategy), Banyang
  (named after the semimartingale — mid-high frequency newcomer)

## [0.40.0] - 2026-08-19

### Changed
- Due-diligence standard v1 (`quant-history/DD_STANDARD.md`): nine-section
  checklist (all founders with backgrounds, founding dates, negative-event
  timelines, AUM evolution with source attribution, strategies, lineage,
  open-source posture, directional analysis, per-fact sources + to-verify
  list) — now mandatory for new and revised archives
- China batch 1 re-due-diligenced to the standard: High-Flyer (DeepSeek
  dual engine, 1000亿 peak, 老鼠仓 suspicion), Ubiquant (Wang Chen / Yao
  Qicong WorldQuant lineage, -39.13% USD fund, IQuest-Coder open source),
  Minghong (first 1000亿 quant, 暂停备案三个月 penalty), Yanfu (the
  Ruitian split, two voluntary closes, 800-900亿), Century Frontier (Chen
  Jiaxin & Wu Di CUHK co-founders verified, model-failure 2024-02)
- Preserved the original R&D-insight sections and fun facts alongside the
  new detail set

## [0.39.0] - 2026-08-19

### Added
- China batch 2 (53 firms total) — six detailed archives: Zhixing Tongda
  (Citadel APAC chief Han Jiarui), Chengqi (Millennium/WorldQuant), Ruitian
  (the 2019 split that spawned Yanfu + the Huanfang lawsuit), WizardQuant
  (SAC lineage), Lingjun (the 2·19 penalty → 2025 champion V-shape),
  Xiaoyong (native self-built, Liang Jie joined 2025)
- Each archive now carries the full detail set: founders with backgrounds,
  founding date, event timeline, AUM evolution table, strategies, lineage,
  open-source posture, directional analysis, and sources
- Cross-batch finding: the WorldQuant China lineage (Ubiquant/Chengqi/
  Lingjun/Xiaoyong) is the strongest talent tree in Chinese quant

## [0.38.0] - 2026-08-17

### Added
- Bank/brokerage lineage report (`quant-history/BANK_LINEAGE.md`): 13 firms
  tracing to big-bank desks or broker prop — two founding waves (1988-2005,
  2012-2018 Volcker spinoffs), three-generation propagation tree
  (AQR/BH/GSA/Capula/PDT/Squarepoint/QRT → XTX/Rokos/Balyasny →
  ExodusPoint), asset-class genes (London fixed income vs NY equities), and
  the zero-open-source finding for the whole bank line

## [0.23.0] - 2026-08-17

### Added
- quant-history + quant-repo columns (Citadel/Optiver/Jane Street)

## [0.24.0] - 2026-08-17

### Added
- Millennium/WorldQuant/Jump batch (6 firms)

## [0.25.0] - 2026-08-17

### Added
- HRT/Point72/Squarepoint batch (9 firms)

## [0.26.0] - 2026-08-17

### Added
- Two Sigma/Virtu/DE Shaw/Renaissance batch (13 firms)

## [0.27.0] - 2026-08-17

### Added
- Man Group/AQR/GSA/Bridgewater batch (17 firms)

## [0.28.0] - 2026-08-17

### Added
- Balyasny/IMC/XTX/Five Rings + DE Shaw boost (21 firms)

## [0.29.0] - 2026-08-17

### Added
- SIG + quant chronicle timeline (22 firms)

## [0.30.0] - 2026-08-17

### Added
- QRT/Capula/Winton/DRW/Tower batch (27 firms)

## [0.31.0] - 2026-08-17

### Added
- Market-making & crypto batch incl. Alameda failure case (32 firms)

## [0.32.0] - 2026-08-17

### Added
- Systematic Europe batch (37 firms)

## [0.33.0] - 2026-08-17

### Added
- Macro legends batch (42 firms) + first data analysis report

## [0.34.0] - 2026-08-17

### Added
- Quant lineage report (five motherships)

## [0.35.0] - 2026-08-17

### Added
- Core UX: PDAT→PET onboarding (BTC example) + mcp/AGENT_GUIDE

## [0.35.1] - 2026-08-17

### Added
- Full English README (all content translated, counts refreshed)

## [0.35.2] - 2026-08-17

### Added
- Brand line: 🐳 dsh-quant — The Everything-Plugin Quant OS

## [0.36.0] - 2026-08-17

### Added
- plugin/ five-slot external plugin library (22 repos & MCPs)

## [0.36.1] - 2026-08-17

### Added
- Five-slot closed-loop case study + 10 supplyable plugin candidates

## [0.36.2] - 2026-08-17

### Added
- AGENTS.md + CLAUDE.md agent onboarding

## [0.36.3] - 2026-08-17

### Added
- AGENTS.md engagement loop — full vision (#36) + ask-your-human CTA

## [0.37.0] - 2026-08-17

### Added
- China batch 1 — High-Flyer, Ubiquant, Minghong, Yanfu, Century Frontier
  (47 firms, lineage closes)

## [0.22.0] - 2026-08-17

### Added
- Options & volatility board, inspired by Optiver's public practice (Ready
  Trader Go market making, optibook simulation, options pricing challenges):
  - `quant_option`: Black-Scholes price from volatility (or implied volatility
    from market price via bisection) plus the five greeks (delta, gamma, vega
    per 1% vol, theta per year, rho per 1% rate)
  - `quant_volatility`: realized volatility from log returns, annualized
    (default 252), with the aligned log-return series — the RV-vs-IV gap is
    the volatility-risk-premium research entry
- 7 hand-computed cases (ATM call, put-call parity, IV roundtrip, deep
  ITM/OTM deltas, RV, preconditions); 46 tools, 174 unit tests

### Notes
- Public pricing and volatility methods only; market-making execution and
  inventory management stay internal

## [0.21.0] - 2026-08-17

### Added
- `quant_bond`: fixed-income analytics (FICC link with the internal PFIC line) —
  price ⇄ yield (bisection), Macaulay/modified duration, convexity, DV01 with
  payments-per-year support (44 tools total)
- `quant_data_guide` knowledge base 13 → 15 channels: ChinaBond (chinabond)
  and CFETS (cfets) bond data sources
- 6 hand-computed bond cases (annual coupon, zero-coupon, semi-annual par,
  price-yield roundtrip, preconditions)

### Notes
- Public side ships methods only: day-count, curve construction and
  continuous-compounding conventions stay internal (PFIC)

## [0.20.0] - 2026-08-16

### Added
- `quant_market_fetch` gains the `yahoo` provider: free US/global daily klines
  (AAPL, ^GSPC, 0700.HK) with null-row filtering and limit → range mapping —
  the "free data-source interfaces" promise now spans crypto, A-shares and US
- `researchMultiAsset`: parallel multi-symbol full-chain research (per-symbol
  failure isolation) + `demos/multi-asset-research.ts` runnable demo; the dsh
  scaling path (one subagent per symbol) is documented in the demo notes
- `quant_data_guide` knowledge base expanded 8 → 13 channels: tencent/yahoo
  free interfaces + dsh ecosystem data plugins (capital-generation,
  dsh-us-stocks, llmquant data-mcp)
- 162 unit tests (+ market yahoo parsing, multi-asset isolation, guide counts)

### Notes
- Stooq rejected (JS proof-of-work bot wall); tencent US klines return only
  first/last rows for US symbols → tencent stays A-share only, yahoo owns US

## [0.19.0] - 2026-08-16

### Added
- `quant_linear_model`: standalone OLS/Ridge fit (lambda penalizes feature
  weights only) with out-of-sample predictions and test R2/IC — the minimal
  explainable ML building block (43 tools total)
- `docs/ML_GUIDE.md`: quant ML/DL architecture knowledge map — research
  pipeline architecture, model ladder (linear → trees → DL → RL), out-of-sample
  validation gold standards (walk-forward / no random K-fold / deflated
  Sharpe), overfitting checklist, RL problem formalization
- `demos/ml-workflow.ts`: executable ML demo (live data → features →
  neutralization → linear model → walk-forward → conclusions)
- dsh-ml domain README rewritten: ML framework status + DL/RL knowledge layer
  (fulfills the public PCPT promise of "demos + ML/DL knowledge + frameworks")
- 7 hand-computed linear-model cases (156 unit tests total)

## [0.18.0] - 2026-08-16

### Added
- `quant_market_fetch` A-share providers: `sina` (free daily/minute klines,
  no credentials) and `tencent` (qfq forward-adjusted daily klines) —
  fulfills the "simple free data-source interfaces" positioning
- `quant_factor_evaluate` gains `rankIc` (Spearman) and `icDecay` (horizon
  1..N IC decay curve) — backward compatible
- `quant_factor_neutralize`: group z-score (industry-style) / OLS style
  residual / plain z-score, all hand-testable
- `quant_walk_forward`: rolling OLS train → out-of-sample predict with OOS
  IC/RankIC and per-window weights — the minimal honest ML workflow
- `quant_drawdown`: underwater series, max/current drawdown, per-peak
  periods with recovery tracking
- `quant_execute_sim`: order execution simulation (slippage, latency,
  two-sided fees, long-only position cap) — the no-live-trading execution
  framework
- `quant_research_pipeline`: one-call PDAT→PET chain (data → quality →
  stats → indicators → backtest → metrics → risk → drawdown → fund → factor
  → report → charts)
- 149 unit tests (+36) + 4 loader composition + live verification incl.
  sina/tencent A-share klines

## [0.17.0] - 2026-08-16

### Added
- New domain `dsh-community` (open-source ecosystem domain, unique to the
  open side — no internal team counterpart): eat your own dog food
- `quant_repo_stats`: live GitHub ecosystem stats via the public API (stars,
  forks, watchers, open issues/PRs, topics, license, latest release)
- `quant_npm_stats`: live npm ecosystem stats (latest version, last-week and
  last-month downloads)
- `quant_oss_pulse`: 0-100 open-source influence score with A/B/C/D grade and
  concrete action suggestions (stars base 20%, downloads 15%, star momentum
  25%, community health 20%, release freshness 20%; missing optionals score
  neutral 50) — pure, hand-computable, fully unit-tested

## [0.16.0] - 2026-08-16

### Changed
- Domain-driven src layout: dsh-data (PDAT) / dsh-alpha (PAAT) / dsh-ml (PCPT) /
  dsh-risk (PRT) / dsh-execution (PET), each with a domain README; package-level
  API unchanged (backward compatible)
- verify.ts provider fallback chain (binance → okx → bybit) after live outage:
  Binance 451 region block + Bybit CloudFront block; OKX remains available


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.15.0] - 2026-08-16

### Added
- `quant_var_backtest`: Kupiec POF test (failure count vs expected, LR
  statistic, approximate p-value, 95% pass decision)
- `quant_resample`: OHLCV weekly/monthly aggregation (7/30-bar buckets for
  24/7 markets)
- `quant_report`: Markdown research-report assembly from metrics/risk/factor/
  fund outputs
- 100 unit tests milestone


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.14.0] - 2026-08-16

### Added
- `quant_risk`: historical VaR/CVaR (configurable confidence), downside
  deviation, max drawdown, Beta, Jensen alpha, information ratio and
  tracking error against an optional benchmark
- 6 hand-computed risk cases (VaR quantile, beta=2 linear benchmark,
  beta=1 identical benchmark, preconditions); live BTC verification


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.13.2] - 2026-08-16

### Changed
- Ship demos/ in the npm package (R&D workflow, Jane Street-style UI demo,
  standalone HTML, demo data + generator, UI preview PNG)


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.13.1] - 2026-08-16

### Fixed
- UI demo: self-contained standalone HTML (embedded data) so it opens
  directly from file:// (fetch of local JSON is blocked by browsers);
  CDN fallback for Lightweight Charts


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.13.0] - 2026-08-16

### Added
- `quant_fund`: quant hedge-fund simulation (default ¥100M capital, NAV 1.00,
  daily management fee 2%/yr, high-water-mark performance fee 20%) with
  final NAV/AUM, peak AUM, gross/net returns, total fees, net-NAV series
- UI demo Fund block (8 cards + net-vs-gross NAV chart)
- 4 hand-computed fund cases; live verification


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.12.0] - 2026-08-16

### Added
- `quant_metrics`: full backtest metric suite (9 equity metrics + trade-level
  metrics) with required trio return/drawdown/sharpe
- METRIC_CATALOG metric directory for UI metric pickers
- Jane Street-inspired UI demo (demos/ui-demo.html + gen-ui-demo-data.ts):
  candlestick + overlays + trade markers, equity curve, metric selector
- 7 hand-computed metric cases; Discussion #7 for metric-system PRs

### Fixed
- profitFactor semantics: null (not Infinity) when there are no losses
  (Infinity is not lossless JSON)


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.11.0] - 2026-08-16

### Added
- `quant_chart`: renderer-neutral chart data (dsh-chart protocol) — candles
  (with overlays and trade markers), series, and annotation views
- Pure chart builders (chartCandles / chartSeries / chartBacktest /
  chartAnnotate); 4 hand-computed cases; live verification


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.10.1] - 2026-08-16

### Added
- `demos/rd-workflow.ts`: executable end-to-end R&D demo on live data
  (fetch → stats → quality → indicators → factor eval → backtest → conclusion)
- RD-assistance log (three modes: research / development / data governance;
  ecosystem positioning vs RD-Agent, LLMQuant, inalpha, alphalens)


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.10.0] - 2026-08-16

### Added
- `quant_factor_evaluate`: alphalens-methodology factor evaluation (IC/ICIR/
  quantile returns/long-short/turnover/autocorrelation), pure functions
- `quant_factor_combine`: multi-factor z-score weighting + cross-sectional
  rank normalization
- Ecosystem research log (alphalens/qlib/RD-Agent landscape + differentiation)
- 6 hand-computed factor cases; live BTC ROC-factor verification


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.9.1] - 2026-08-16

### Added
- `quant_series_quality`: missing / z-outlier / jump / frozen-run detection
- `quant_data_annotate`: point-level data labeling (5 label kinds, 3 severity
  levels) — Scale AI-inspired labeling philosophy
- Seven dimension folders (skill/tool-use/memory/rag/benchmark/eval/plan)
  referencing the internal PAT dimension system (private repo, method-level
  reference only)
- 4 hand-computed unit cases


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.9.0] - 2026-08-16

### Added
- `quant_series_stats`: descriptive statistics (skew/kurtosis/autocorr/annVol)
- `quant_data_quality`: OHLCV health check with healthy flag
- 5 hand-computed unit cases; live BTC verification

### Fixed
- candlesCheck now inspects the first candle too (high<low / non-positive)


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.8.0] - 2026-08-16

### Added
- `quant_data_compare`: per-data-type channel comparison (coverage, cost tier, best-for; covering channels first)
- `quant_data_advice`: decision-tree recommendations by budget (free/low/institutional) and purpose (research/backtest/official) with reasons
- 5 decision-tree unit cases


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.7.0] - 2026-08-16

### Added
- `log/` per-version records; `mcp/` integration guide + runtime-generated
  `tools.json` (19 tool schemas); `docs/ENVIRONMENT.md` dependency matrix
- Pure-function re-exports from the package entry (`sma`, `backtestMaCross`,
  `searchChannels`, …) usable without any harness
- README quick-start, PR welcome note, R&D positioning


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.6.0] - 2026-08-16

### Added
- `quant_data_guide`: built-in A-share data channel knowledge base (8 channels: akshare, baostock, tushare, Wind, iFinD, SSE, SZSE, CSI) queryable by channel name or data type — channel navigation, not data APIs
- 6 knowledge-base unit cases

### Changed
- **Package renamed to `dsh-quant`** (DeepQuant Harness). Tool prefix `quant_*` and all tool schemas stay unchanged; previous name keeps serving 0.1-0.5.


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.5.0] - 2026-08-16

### Added
- `provider` parameter on `quant_market_fetch`: `binance` (default) / `okx` /
  `bybit` — native zero-dependency REST adapters with unified Candle output
- 4 adapter parse unit cases (real response samples); live cross-exchange
  consistency check (OKX vs Bybit same-day close within 0.005%)


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.4.0] - 2026-08-16

### Added
- `quant_backtest_portfolio`: multi-asset allocation with optional periodic
  rebalancing, two-sided fees, final weights and rebalance count
- 3 hand-computed portfolio cases; live BTC+ETH 60/40 verification
  (3 rebalances, weights return to target)

### Fixed
- Initial allocation and rebalance fee accounting (fees pre-deducted on
  initial buy; two-pass rebalance so order does not matter)


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.3.0] - 2026-08-16

### Added
- Strategy family: `quant_backtest_bollinger` (band-breakout) and
  `quant_backtest_rsi` (mean-reversion), same canonical output as
  `quant_backtest` (trades/position/equity/drawdown/Sharpe)
- Money management: optional `stopLoss` / `takeProfit` fractions on all three
  strategy tools; trades now carry `exitReason` (`signal`/`stop_loss`/
  `take_profit`)
- 6 hand-computed strategy unit cases (breakout entry, stop-loss, take-profit
  precedence, RSI reversion, preconditions); live BTC verification


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.2.0] - 2026-08-16

### Added
- Six common technical indicators: `quant_kdj` (RSV method), `quant_williams_r`,
  `quant_cci`, `quant_obv`, `quant_adx` (+DI/-DI, Wilder), `quant_roc`
- 6 hand-computed unit cases for the new indicators; live verification on real
  BTC candles (KDJ/CCI/OBV/ADX)


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.1.1] - 2026-08-16

### Added
- Open-source collaboration loop: CONTRIBUTING.md, issue/PR templates,
  GitHub Actions CI (build + 30 tests + typecheck), tag-triggered release
  workflow, README badges
- Clean package-lock.json; local development no longer requires the
  deepseek-harness checkout (real npm dependencies)
- `prepublishOnly` gate: build + full tests before any publish


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.1.0] - 2026-08-16

### Added
- `quant_market_fetch` — OHLCV candles from the Binance public REST API
  (anonymous, zero-dependency `fetch`)
- Six technical indicators with length-aligned null-padded outputs:
  `quant_sma`, `quant_ema`, `quant_rsi` (Wilder), `quant_macd`,
  `quant_bollinger`, `quant_atr` (Wilder)
- `quant_backtest` — dual-MA crossover backtest (signal on bar `i`, execution
  at bar `i+1` close, two-sided fees, drawdown/Sharpe)
- `quant_backtest_grid` — fast/slow parameter grid search sorted by total
  return
- Bundle manifest (`dsh.bundle` → `cordis.patch.yml`): installable via
  `dsh plugin add dsh-quant-indicators`
- TypeScript build chain (NodeNext ESM, `lib/` with declarations)
- Test suite: 30 hand-computed unit cases + 4 real-Loader composition cases +
  live integration + consumer simulation (built `lib/` loaded through real
  node_modules resolution)

[0.1.0]: https://github.com/pengpengyi92/dsh-quant-indicators/releases/tag/v0.1.0
