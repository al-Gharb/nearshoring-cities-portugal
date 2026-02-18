# Data Flow Architecture

> Which database feeds what — a complete map of data → JavaScript → HTML rendering.

---

## Database → Module → HTML Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  NORMALIZED JSON DATABASES (public/data/normalized/)                            │
│                                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐  ┌───────────┐ │
│  │   MASTER.json    │  │ CITY_PROFILES.json│  │WEBSITE_CONTENT │  │COMPENSATION│ │
│  │                  │  │                  │  │   .json        │  │ _DATA.json │ │
│  │ • 20 cities      │  │ • 10 featured    │  │ • National     │  │ • Salary   │ │
│  │ • costs (rent,   │  │   city profiles  │  │   statistics   │  │   bands    │ │
│  │   COL, salary)   │  │ • ecosystem      │  │ • Macroeconomic│  │ • Tech     │ │
│  │ • graduates      │  │ • universities   │  │   scorecard    │  │   premiums │ │
│  │ • regional totals│  │ • culture/QoL    │  │ • Digital infra│  │ • Employer │ │
│  │ • chart config   │  │ • infrastructure │  │ • EU context   │  │   costs    │ │
│  │ • display order  │  │ • verification   │  │ • Workforce    │  │ • INE wages│ │
│  └────────┬─────────┘  └────────┬─────────┘  └───────┬────────┘  └─────┬─────┘ │
│           │                     │                     │                 │        │
└───────────┼─────────────────────┼─────────────────────┼─────────────────┼────────┘
            │                     │                     │                 │
            ▼                     ▼                     ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  database.js — Central data loader (loadDatabases → frozen store)               │
│                                                                                 │
│  Exports: getCity() getCityProfile() getNationalData() getCompensationData()    │
│           getStore() getCityDisplayOrder() getRegionalTotals() getChartConfig() │
└─────────────────────────────────────────────────────────────────────────────────┘
            │
            ├──────────────────────────────────────────────────────────────┐
            │                                                              │
            ▼                                                              ▼
┌───────────────────────────┐                              ┌──────────────────────┐
│  contentRenderer.js       │                              │  promptGenerator.js   │
│  (DB → DOM binding)       │                              │  (DB → prompt text)   │
└───────────────────────────┘                              └──────────────────────┘
```

---

## MASTER.json → HTML Rendering

```
MASTER.json
│
├── cities[id].costs.officeRent ──────────► .db-value[data-field="office-rent"]
├── cities[id].costs.residentialRent ─────► .db-value[data-field="residential-rent"]
├── cities[id].costs.colIndex ────────────► .db-value[data-field="col-index"]
├── cities[id].costs.salaryIndex ─────────► .db-value[data-field="salary-index"]
│                                             (auto-computed by calculations.js)
├── cities[id].talent.graduates
│   ├── digitalStemPlus ──────────────────► .db-value[data-field="stem-grads"]
│   ├── officialStem ─────────────────────► .db-value[data-field="official-stem"]
│   └── coreICT ──────────────────────────► .db-value[data-field="ict-grads"]
│       └── pctOfOfficialStem ────────────► .db-value[data-field="ict-pct"]
│
├── config.displayOrder ──────────────────► cityTable.js (row order)
├── config.chartConfig ───────────────────► bubbleChart.js (D3 scatter plot)
├── config.regionOrder ───────────────────► cityTable.js (group headers)
│
├── nationalTotals ───────────────────────► #meth-intro-stem, #meth-card-stem,
│                                           #meth-card-ict, #meth-total-stem
│
└── regionalTotals ───────────────────────► promptGenerator.js (regional claims)
```

**Module:** `contentRenderer.js → populateDbValues()`
**Module:** `cityTable.js` renders the full city comparison table
**Module:** `bubbleChart.js` renders the D3 talent-vs-cost scatter plot
**Module:** `calculations.js → computeAllSalaryIndices()` auto-computes salary indices at startup

---

## CITY_PROFILES.json → HTML Rendering

```
CITY_PROFILES.json
│
├── cities[id].ecosystem
│   ├── techCompanies ────────────────────► City profile cards (companies list)
│   ├── domains ──────────────────────────► .city-tags-container (cover page tags)
│   ├── coworking ────────────────────────► City profile cards (coworking section)
│   └── clusters ─────────────────────────► City profile cards (cluster context)
│
├── cities[id].universityDetail
│   ├── institutions ─────────────────────► City profile cards (universities)
│   └── talentProfile ───────────────────► City profile cards (talent narrative)
│
├── cities[id].culture
│   ├── climate ──────────────────────────► City profile cards (climate section)
│   ├── qualityOfLife ────────────────────► City profile cards (QoL section)
│   └── retention ────────────────────────► City profile cards (retention section)
│
├── cities[id].infrastructure
│   ├── airport ──────────────────────────► City profile cards (airport info)
│   ├── commuteTimes ─────────────────────► City profile cards (commute times)
│   └── connectivity ─────────────────────► City profile cards (fiber/latency)
│
├── cities[id].verification
│   ├── checkScore ───────────────────────► #fact-check-cards (confidence bars)
│   └── checkDate ────────────────────────► #fact-check-cards (check dates)
│
└── cities[id]._meta
    ├── tagline ──────────────────────────► City profile headers
    └── coverTags ────────────────────────► Cover page city specializations
```

**Module:** `contentRenderer.js → renderFactCheckCards(), populateCityTags()`
**Module:** `cityProfiles.js` renders expand/collapse city profile sections
**Module:** `promptGenerator.js → generateCityClaimsFromSource()` extracts all fields as fact-check claims

---

## WEBSITE_CONTENT.json → HTML Rendering

```
WEBSITE_CONTENT.json → national
│
├── macroeconomicScorecard
│   ├── heroMetrics ──────────────────────► #macro-hero-gdp, #macro-hero-pop, etc.
│   │                                       ✅ DYNAMIC via contentRenderer.js → populateMacroHeroes()
│   ├── economicActivity ─────────────────► #macro-ea-list (GDP growth, GFCF, etc.)
│   │                                       ✅ DYNAMIC via contentRenderer.js → populateMacroScorecard()
│   ├── labourAndCosts ───────────────────► #macro-lc-list (unemployment, employment)
│   │                                       ✅ DYNAMIC via contentRenderer.js → populateMacroScorecard()
│   └── fiscalPricesMarkets ──────────────► #macro-fpm-list (inflation, debt, yields)
│                                           ✅ DYNAMIC via contentRenderer.js → populateMacroScorecard()
│
├── digitalInfrastructure
│   ├── heroDisplay ──────────────────────► #digi-hero-latency, #digi-hero-4g, etc.
│   │                                       ✅ DYNAMIC via contentRenderer.js → populateDigitalInfraHeroes()
│   ├── fiveGCoverage ────────────────────► Digital infra cards
│   ├── latency ──────────────────────────► Latency comparison cards
│   ├── subseaCables ─────────────────────► Subsea cable section
│   └── dataCenters ──────────────────────► Data center cards
│
├── euContext
│   ├── portugalsPosition ────────────────► EU Context: ICT Specialists card
│   │   ├── ictSpecialistsPctEmployment ──► "5.2% (2024) — EU avg 5.0%"
│   │   ├── femaleIctSpecialists ─────────► "22.7% — EU avg 19.4%"
│   │   └── trend ────────────────────────► "+12% since 2020"
│   │                                       ✅ DYNAMIC via contentRenderer.js → populateEUContext()
│   └── competitiveBenchmarks ────────────► Competitive Benchmarks card
│
├── workforceStatistics
│   ├── ictEmployment ────────────────────► promptGenerator.js (fact-check claims)
│   ├── techWorkforceTotal ───────────────► promptGenerator.js (fact-check claims)
│   ├── cityBreakdown ────────────────────► promptGenerator.js (fact-check claims)
│   ├── femaleGrowth ─────────────────────► promptGenerator.js (fact-check claims)
│   └── tertiaryEducation ────────────────► promptGenerator.js (fact-check claims)
│       ✅ Stat-heroes (#wf-hero-total, #wf-hero-concentration, #wf-hero-growth)
│          DYNAMIC via contentRenderer.js → populateWorkforceHeroes()
│       ✅ Bar chart (#workforce-bar-chart) DYNAMIC via populateWorkforceBarChart()
│
├── hiringInsights
│   ├── timeToHire ───────────────────────► Hiring insight cards
│   ├── educationLevel ───────────────────► Hiring insight cards
│   ├── ageDistribution ──────────────────► Hiring insight cards
│   └── retention ────────────────────────► #hiring-retention
│                                           ✅ DYNAMIC via contentRenderer.js → populateHiringInsights()
│
├── sectionScores ────────────────────────► Section confidence bars (TOC + section headers)
│                                           ✅ DYNAMIC via contentRenderer.js
│
├── taxIncentives ────────────────────────► #tax-sifide-body, #tax-techvisa-body, etc.
│                                           ✅ DYNAMIC via contentRenderer.js → populateTaxIncentives()
│
├── costOfLiving ─────────────────────────► #col-hero-essentials, #col-hero-utilities, etc.
│                                           ✅ DYNAMIC via contentRenderer.js → populateCostOfLiving()
│
└── qualityOfLife ────────────────────────► #qol-healthcare-public, #qol-healthcare-private, #qol-healthcare-ehci
                                            #qol-safety-gpi, #qol-safety-crime, #qol-safety-political
                                            ✅ DYNAMIC via contentRenderer.js → populateQualityOfLife()
```

**Module:** `contentRenderer.js → populateSectionConfidence(), populateTocConfidence(), renderSectionScoreCards()`
**Module:** `promptGenerator.js` — all generators read from this DB for fact-check claims
- Workforce claims use `linkedin` fields (matches website display, NOT `official`)
- Strategic claims read `qualityOfLife.*` (healthcare, safety, political — no hardcoded strings)
- Macro claims include `tradeSurplus.absoluteValue` and `tradeBalance` series

---

## COMPENSATION_DATA.json → HTML Rendering

```
COMPENSATION_DATA.json
│
├── baseBands / seniorityMultipliers / techStackPremiums
│                                           ✅ USED by simulator computation input mapping in promptGenerator.js
│                                           (role midpoint, tier multiplier, stack premium resolution)
│
├── ineRegionalEarnings ──────────────────► #ine-table-body (INE Regional Earnings table)
│   └── regions[key] × displayOrder       ✅ DYNAMIC via contentRenderer.js
│
└── methodology ──────────────────────────► Salary methodology section
    ├── salaryIndexFormula ───────────────► calculations.js (auto-compute)
    ├── seniorityMultipliers ─────────────► promptTemplate.js (AI prompt Section C)
    └── baseBands + seniorityMultipliers ──► promptTemplate.js (Section B + B2 tables)
```

**Module:** `contentRenderer.js → populateINETable()`
**Module:** `calculations.js` reads INE baselines + MASTER COL indices to auto-compute salary indices

---

## WEBSITE_CONTENT.json → Strategic Salary Table (Damia)

```
WEBSITE_CONTENT.json → national.laborMarket.damiaBenchmark
│
├── roleSeniorityTable ───────────────────► #salary-table-body
│                                           ✅ DYNAMIC via contentRenderer.js → populateSalaryTable()
│
├── methodology (window/sample/seniority) ─► #damia-salary-note
│                                           ✅ Static section copy + DB-backed table rows
│
└── techStackSignals ─────────────────────► promptGenerator.js workforce claims
                                            ✅ Included in dynamic fact-check claims
```

---

## Fact-Check System Data Flow

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│  WEBSITE_CONTENT     │     │  MASTER.json          │     │  COMPENSATION_DATA   │
│  .json               │     │                       │     │  .json               │
└──────────┬──────────┘     └──────────┬────────────┘     └──────────┬──────────┘
           │                           │                              │
           ▼                           ▼                              ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  promptGenerator.js — Dynamic Claim Generators                               │
│                                                                              │
│  Category              Generator Function              Source DB             │
│  ─────────             ──────────────────              ─────────             │
│  macroeconomic     →   generateMacroeconomicClaims()   WEBSITE_CONTENT      │
│  digitalInfra      →   generateDigitalInfraClaims()    WEBSITE_CONTENT      │
│  officeRent        →   generateOfficeRentClaims()      MASTER               │
│  residentialRent   →   generateResidentialRentClaims() MASTER               │
│  workforce         →   generateWorkforceClaims()       WEBSITE_CONTENT +    │
│                                                        COMPENSATION_DATA    │
│  taxIncentives     →   generateStrategicClaims()       WEBSITE_CONTENT      │
│  graduates         →   generateUniversityTalentClaims()WEBSITE_CONTENT      │
│  cityDatabase      →   generateCityDatabaseClaims()    MASTER               │
│  city:{id}         →   generateCityClaimsFromSource()  CITY_PROFILES +      │
│                                                        MASTER               │
└──────────────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  FACTCHECK_CLAIMS_v2.json — Verification methodology only                    │
│  (status codes, output format — NO claim data stored here)                   │
└──────────────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  Generated Prompt → User copies to AI engines → JSONL results               │
│  → factchecks/*.md verification archive → HITL gate → DB corrections        │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Dynamic vs Hardcoded Summary

| Rendering Target | Source DB | Injection Method | Status |
|-----------------|-----------|-----------------|--------|
| City database table | MASTER | `cityTable.js` | ✅ Dynamic |
| Bubble chart | MASTER | `bubbleChart.js` | ✅ Dynamic |
| `.db-value` spans | MASTER | `contentRenderer.js` | ✅ Dynamic |
| Salary ranges table | WEBSITE_CONTENT (`laborMarket.damiaBenchmark`) | `contentRenderer.js` | ✅ Dynamic |
| INE earnings table | COMPENSATION_DATA | `contentRenderer.js` | ✅ Dynamic |
| Section confidence bars | WEBSITE_CONTENT | `contentRenderer.js` | ✅ Dynamic |
| City fact-check cards | CITY_PROFILES | `contentRenderer.js` | ✅ Dynamic |
| Methodology totals | MASTER | `contentRenderer.js` | ✅ Dynamic |
| Cover page city tags | CITY_PROFILES | `contentRenderer.js` | ✅ Dynamic |
| Macroeconomic scorecard | WEBSITE_CONTENT | `contentRenderer.js` | ✅ Dynamic |
| Digital infra heroes | WEBSITE_CONTENT | `contentRenderer.js` | ✅ Dynamic |
| EU Context: ICT card | WEBSITE_CONTENT | `contentRenderer.js` | ✅ Dynamic |
| Workforce stat-heroes | WEBSITE_CONTENT | `contentRenderer.js` | ✅ Dynamic |
| Workforce bar chart | WEBSITE_CONTENT | `contentRenderer.js` | ✅ Dynamic |
| Hiring insight cards | WEBSITE_CONTENT | `contentRenderer.js` | ✅ Dynamic |
| Tax incentives | WEBSITE_CONTENT | `contentRenderer.js` | ✅ Dynamic |
| Cost of living heroes | WEBSITE_CONTENT | `contentRenderer.js` | ✅ Dynamic |
| Quality of Life cards | WEBSITE_CONTENT | `contentRenderer.js` | ✅ Dynamic |
| Employer costs footer (legacy block) | — | — | Removed from Strategic salary section |

---

## Simulator Deterministic Flow (All-City)

```
Form inputs (index.html)
    └─► promptGenerator.js
             ├─ role band / seniority / stack resolution (COMPENSATION_DATA)
             ├─ city payload prep (MASTER + CITY_PROFILES)
             └─► simulatorEngine.computeAnalysis()
                         ├─ EMC math per city (20/20 cities)
                         ├─ objective-specific weights (cost/quality/speed/balanced)
                         ├─ deterministic dealbreaker penalties
                         ├─ feasibility band assignment (HIGH/MEDIUM/LOW)
                         └─ ranked all-city output + weighted_order_all_cities
```

Prompt template then instructs advisor to consider all cities and return final Top 5 recommendations with deep-dives for best 2-3.

Prompt template guardrails also enforce:
- output-style specific word targets (`executive` vs `detailed`),
- strict section contract (1→7, table-only blocks where required),
- data boundary behavior (prompt figures are authoritative; optional external context must be explicitly labeled),
- JSON integrity requirement (valid syntax and unchanged numeric values).

**All data is now dynamically rendered from JSON databases.** Update the source database and rebuild — all HTML values will update automatically.
