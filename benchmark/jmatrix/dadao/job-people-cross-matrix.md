# Dadao JMatrix — Job Matrix × People Matrix

**Version:** v0.1  
**Timestamp:** 2026-09-29  
**Company:** 大道投资 / Deep Data Investments  
**Location:** Shenzhen · Shekou / Sea World

## JMatrix protocol update

JMatrix is formally split into two coupled tables:

1. **Job Matrix** — reconstructs what the organization is hiring for and how work is divided.
2. **People Matrix** — reconstructs who actually occupies / founded / shaped those functions.

The key rule is:

> **Do not analyze jobs and people independently. Cross them.**

Only the cross-view can recover the likely real organization:

```text
People lineage
   ×
Job architecture
   ×
Research / engineering ownership
   ×
Production boundaries
   =
Organization reconstruction
```

---

## 1. Job Matrix

| ID | Job Family | Role | Core Scope | Key Signals |
|---|---|---|---|---|
| J1 | Research | Quant Researcher | Financial data, factor research, predictive models, Equity StatArb / CTA / HFT, portfolio optimization, execution algorithms, live strategy ownership | Python / MATLAB / R, statistics, ML, basic C++/Java |
| J2 | Research | Machine Learning Researcher | Financial time-series DL, nonlinear signals, architecture, objective/loss design, regularization, overfitting control, training→backtest→deployment | ML/DL, time series, experimentation, deployment |
| J3 | Engineering | Quant Developer | Market-data systems, high-performance backtest, low-latency live trading, production operations | C++, Linux, TCP/IP, multithreading, memory, event-driven systems, Python |
| J4 | Operations | Fund Operations | Product setup, registration, disclosure, clearing, custodian coordination, cash transfer, systems integration | Fund operations, compliance, custodian coordination |

### Job-side implication

大道公开岗位呈现的是一个 **small-team / wide-ownership** organization：

```text
Data
 ↓
Research / Feature / Model
 ↓
Portfolio Construction
 ↓
Execution
 ↓
Backtest / Simulation
 ↓
Live Trading
 ↓
Monitoring
```

---

## 2. People Matrix

### Confirmed core public people

| Person | Public Role / Function | Background | Likely organizational function | Confidence |
|---|---|---|---|---|
| 朱明强 | Founder, Chairman, GM, investment / PM leadership | Tsinghua; UCLA Applied Mathematics PhD; Credit Suisse; Two Sigma | Quant Research / Alpha / Portfolio / Firm leadership | High |
| 刘小康 | Core co-founding member; compliance/risk lead; early technical leader | Tsinghua CS BS+MS; Tencent; Haitong International | Quant Engineering / Backtest / Automated Trading / Risk / Compliance | High |
| 任海燕 | Shareholder | Public professional history currently limited | Ownership layer; daily operating role not inferred without stronger evidence | Medium for ownership, low for operating function |

### Team-level public structure

| Team bucket | Publicly observable direction |
|---|---|
| Quant Research | Statistics / ML / Alpha / StatArb / CTA / portfolio research |
| ML Research | Financial time-series / DL / nonlinear modelling |
| Quant Systems | C++ / data / backtest / automated trading / production |
| Market + Middle/Back Office | Fund operations / IR / compliance / support |

### Founder architecture

```text
                  Deep Data Investments
                           │
         ┌─────────────────┴─────────────────┐
         │                                   │
      朱明强                              刘小康
 Math / Quant Research               CS / Engineering
 UCLA Applied Math PhD               Tsinghua CS BS+MS
 Credit Suisse                       Tencent
 Two Sigma                           Haitong International
         │                                   │
 Alpha / CTA / StatArb               Backtest
 Portfolio / PM                      Automated Trading
 Investment Research                 Risk / Compliance
         └─────────────────┬─────────────────┘
                           │
                    Systematic Fund
```

---

## 3. Cross Matrix: People × Jobs

| People / lineage | QR | ML Research | QD / Infra | Risk / Compliance | Fund Ops |
|---|---:|---:|---:|---:|---:|
| 朱明强 lineage | Primary | Strong adjacency | Interface | Portfolio-risk adjacency | Low |
| 刘小康 lineage | Interface | Interface | Primary | Primary | Systems/compliance interface |
| Research team | Primary | Primary | Research-production interface | Model risk | Low |
| Systems team | Support | Deployment | Primary | Production risk | Support |
| Middle/back office | Low | Low | Systems interface | Compliance | Primary |

### Interpretation

The organization is best described as a **dual-core founder architecture**:

- **Research / PM core:** 朱明强
- **Engineering / systems / risk core:** 刘小康

This maps directly to the current hiring architecture:

- QR / ML Research ↔ research lineage
- QD / infra ↔ systems lineage
- Fund Ops / compliance ↔ institutionalization layer

The useful DD insight is not simply “大道 hires QR and QD.” It is:

> **The present Job Matrix appears structurally consistent with the firm's founding People Matrix.**

---

## 4. JMatrix standard going forward

Every company JMatrix should contain both tables.

### A. Job Matrix dimensions
- Job family
- Role
- Research ownership
- Engineering depth
- Production ownership
- Data
- ML / DL
- Execution
- Client exposure
- Entry point
- Interview
- Compensation evidence

### B. People Matrix dimensions
- Person
- Current role
- Prior firms
- Education
- Technical / investment lineage
- Function
- Seniority
- Public evidence quality
- Network / alumni links
- Hiring / mentorship relevance

### C. Cross-table dimensions
- Which people lineage owns each job family?
- Which job family is founder-led vs delegated?
- Where are research ↔ engineering interfaces?
- Who owns production?
- Who owns risk?
- Which functions appeared later as the firm institutionalized?
- Does hiring architecture match historical organizational DNA?
- Where is the best entry point for a candidate?

## Principle

**Job Matrix tells us what the company says it needs.  
People Matrix tells us what the company actually grew from.  
The cross tells us how the organization likely works.**

This dual-table form is now the default JMatrix reference implementation.
