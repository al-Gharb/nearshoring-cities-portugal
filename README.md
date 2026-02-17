BUILT WITH AI

# Portugal IT Nearshoring Guide

> Data-driven analysis of Portugal's best cities for IT nearshoring, featuring an AI-powered advisor that generates structured recommendations from verified databases.

[![Live Site](https://img.shields.io/badge/Live-al--gharb.github.io-blue)](https://al-gharb.github.io/nearshoring-cities-portugal/)
[![Version](https://img.shields.io/badge/version-0.9.0-orange)](package.json)
[![Build](https://img.shields.io/badge/build-Vite-646cff)](https://vitejs.dev/)

---

## Demo

**Live Site:** https://al-gharb.github.io/nearshoring-cities-portugal/

---

## Features

- **20 Portuguese Cities** — 10 featured with full profiles, 10 secondary with key metrics
- **Interactive D3.js Bubble Chart** — Visualize talent pool vs. cost trade-offs
- **AI Nearshoring Simulator** — Generate custom nearshoring deep prompts for simulation
- **Fact-Check System (Experimental v3)** — Dynamic claim generation from source databases
- **Light/Dark Mode** — Full theme support
- **Print-Ready** — City profiles styled for PDF export

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Requirements:** Node.js 20+

---

## Project Structure

```
├── src/                          # Source code
│   ├── index.html                # Main document
│   ├── scripts/
│   │   ├── main.js               # Entry point
│   │   └── modules/              # JS modules
│   │       ├── database.js       # Data loading from JSON
│   │       ├── cityTable.js      # City database table
│   │       ├── bubbleChart.js    # D3.js visualization
│   │       ├── cityProfiles.js   # City profile sections
│   │       ├── simulatorEngine.js # Experimental v3 deterministic computation
│   │       ├── promptGenerator.js # AI Simulator
│   │       ├── promptTemplate.js  # Experimental v3 prompt template (narrative)
│   │       ├── contentRenderer.js # Dynamic content
│   │       ├── calculations.js    # Salary/ICT calculations
│   │       └── themeToggle.js     # Dark mode
│   └── styles/
│       ├── tokens.css            # Design tokens (colors, spacing)
│       ├── reset.css             # CSS reset
│       ├── base.css              # Base styles
│       ├── components.css        # UI components
│       ├── sections.css          # Page sections
│       └── print.css             # Print styles
│
├── public/                       # Static assets (copied to dist)
│   ├── assets/                   # Images
│   └── data/
│       ├── normalized/           # JSON databases
│       │   ├── MASTER.json       # City metrics (graduates, costs, indices)
│       │   ├── CITY_PROFILES.json # Rich city context (ecosystem, culture)
│       │   ├── WEBSITE_CONTENT.json # Section content (macroeconomic, infra)
│       │   ├── COMPENSATION_DATA.json # Salary bands & multipliers
│       │   └── FACTCHECK_CLAIMS_v2.json # Verification methodology only
│       └── rendered/             # Pre-computed chart data
│           ├── bubble_chart.json
│           └── city_table.json
│
├── dist/                         # Production build output
├── scripts/                      # Python maintenance utilities
├── tests/                        # Playwright visual tests
├── .github/
│   └── copilot-instructions.md   # AI coding assistant context
├── vite.config.js                # Build configuration
└── package.json
```

---

## Data Architecture

### JSON Databases

| File | Purpose | Key Fields |
|------|---------|------------|
| `MASTER.json` | City metrics | `graduates.digitalStemPlus`, `costs.officeRent`, `costs.salaryIndex` |
| `CITY_PROFILES.json` | Rich context | `ecosystem.majorCompanies`, `culture.climate`, `infrastructure.airport` |
| `WEBSITE_CONTENT.json` | Section content | `macroeconomic.heroMetrics`, `digitalInfra.connectivity`, `laborMarket.damiaBenchmark` |
| `COMPENSATION_DATA.json` | Compensation + INE baseline inputs | `baseBands`, `seniorityMultipliers`, `techStackPremiums`, `ineRegionalEarnings` |
| `FACTCHECK_CLAIMS_v2.json` | Verification | `verificationMethodology` (status codes, output format) |

### Debug Tool — Claim Source Highlighting

The site includes a debug mode that visually highlights every data-bound element on the page, showing which JSON database each value originates from:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  CLAIM SOURCE DEBUG MODE                                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Every .db-value span is color-coded by source database:                     │
│                                                                              │
│  ┌─ Blue border ─────┐   MASTER.json (city metrics)                          │
│  │   3,660 grads     │                                                       │
│  └───────────────────┘                                                       │
│                                                                              │
│  ┌─ Green border ────┐   CITY_PROFILES.json (ecosystem data)                 │
│  │   Microsoft, ...  │                                                       │
│  └───────────────────┘                                                       │
│                                                                              │
│  ┌─ Orange border ───┐   WEBSITE_CONTENT.json (section data)                 │
│  │   €289B GDP       │                                                       │
│  └───────────────────┘                                                       │
│                                                                              │
│  ┌─ Purple border ───┐   COMPENSATION_DATA.json (salary bands)               │
│  │   €35-55k         │                                                       │
│  └───────────────────┘                                                       │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

This ensures every fact claim displayed on the website can be traced back to its authoritative JSON source, enabling:
- **Data Integrity Audits** — Verify all displayed values have database backing
- **Source Mapping** — Know exactly which file to update when data changes
- **Dynamic Fact-Check** — Claims are generated from source DBs automatically

### Internal Calculations (Not Verifiable Externally)

These metrics are derived from official data using our methodology:

| Metric | Description | See |
|--------|-------------|-----|
| **Digital STEM+** | Custom CNAEF code grouping beyond ICT | [Methodology](#methodology) |
| **Salary Index** | INE regional wages normalized to Lisbon=100 | [Methodology](#methodology) |
| **ICT %** | Core ICT graduates ÷ Digital STEM+ | [Methodology](#methodology) |

---

## Fact-Check System (Experimental v3)

The fact-check system ensures data accuracy through **multi-source AI verification**. Claims are generated dynamically from source databases — no separate claims file to maintain.

### Key Principles

1. **Dynamic Claim Generation** — Claims extracted directly from `CITY_PROFILES.json`, `WEBSITE_CONTENT.json`, `MASTER.json`
2. **Source-Free Prompts** — Prompt instructions never prescribe named sources; verifiers must discover independent evidence
3. **5-6 Source Verification** — Run same prompt through Perplexity, Gemini, ChatGPT, DeepSeek, Claude, Grok
4. **Consensus Matrix** — Compare all results, implement only where 4+ sources agree
5. **HITL Gate** — Human must say "GO" before any database changes
6. **Tolerance ±5%** — Values within 5% of claimed = SUPPORTED
7. **Structured JSONL contract** — Prompts require source_url/source_ref/data_period + confidence and practical_confidence_pct per claim

### Source Strategy

Prompt policy note: the generated fact-check prompts are source-free and do not provide named-source lists. Categories below indicate internal data anchors only.

| Category | Data File | Primary Source |
|----------|-----------|---------------|
| Macroeconomic | `WEBSITE_CONTENT.json` | EC Autumn Forecast |
| Digital Infrastructure | `WEBSITE_CONTENT.json` | ANACOM |
| Office Rent | `MASTER.json` | Live market listings + plausibility checks (good-quality central non-prime offices) |
| Residential Rent | `MASTER.json` | Live market listings + plausibility checks (central T1 practical relocation range) |
| Workforce / Salary Benchmark | `WEBSITE_CONTENT.json` | Eurostat + Damia Group Portugal (salary benchmark) |
| Tax Incentives | `WEBSITE_CONTENT.json` | ANI (SIFIDE II) |
| Graduates | `WEBSITE_CONTENT.json` | DGEEC InfoCursos |
| City Profiles | `CITY_PROFILES.json` + `MASTER.json` | Company/university sites |

**Rent methodology scope (Idealista only):**
- **Office rent:** quality offices in central locations, 60-300 m2
- **Residential rent:** 1-bedroom modern apartments in central areas, 40-60 m2
- **Process:** Semi-automated extraction from live listings with human-in-the-loop (HITL) review before publication

### Verification Workflow

1. **Generate prompt** — Site → Verification Archive → Select category → Generate Fact-Check Prompt
2. **Run 5-6 verifications** — Same prompt → Perplexity, Gemini, ChatGPT, DeepSeek, Claude
3. **Build matrix** — Compile JSONL results, count SUPPORTED/NEEDS_UPDATE/CONTRADICTED per claim
4. **Present suggestions** — Show consolidated table with current vs. suggested values
5. **⚠️ WAIT FOR "GO"** — Agent does NOT implement until human explicitly says "GO"
6. **Implement corrections** — Update source database only → next fact-check uses corrected values
7. **Rebuild** — `npm run build`

---

## AI Nearshoring Simulator (Experimental v3)

**Problem observed:** General-purpose models can use stale/unreliable sources, introduce math mistakes, and default to familiar city shortcuts instead of evaluating all 20 cities.

**Experimental idea:** Compute financials and ranking logic deterministically in JavaScript from normalized databases, then pass the computed package to the LLM for advisory interpretation.

**Assumptions:**
- Database values are authoritative at generation time.
- Financial math and ranking logic run before LLM interpretation.
- The LLM is used for reasoning/trade-off narrative, not core arithmetic.
- Final operational decisions require independent validation.

**How it works:**
1. User inputs project data (team, budget, roles, work model, constraints, priorities).
2. JavaScript loads normalized city/cost/talent/compensation data.
3. JavaScript computes deterministic financials, weighted scores, penalties, and feasibility.
4. Prompt is generated by merging inputs, computed outputs, database facts, and advisor instructions.
5. LLM interprets the package and returns recommendations plus trade-offs.
6. User iterates with follow-up scenarios and budget sensitivity checks.
7. Team validates decisions independently before execution.

### Key Components

- **simulatorEngine.js** — All financial math, scoring rubrics, ranking logic (deterministic)
- **promptTemplate.js** — Builds narrative prompt with pre-computed results (zero formulas)
- **promptGenerator.js** — Collects inputs, runs engine, generates final prompt

### Prompt Architecture (Experimental v3)

```
Phase A: Pre-computed results (read-only tables)
Phase B: Client request + advisory task
Phase C: Output template (7 sections)
```

Design intent: LLM focuses on reasoning and narrative interpretation, while numeric computation is performed in JavaScript before prompt generation.

### Prompt Guardrails (Experimental v3)

- **Output-style aware:** `executive` and `detailed` modes set explicit word targets in prompt rules.
- **Data boundary rule:** prompt data remains authoritative; optional external context must be clearly labeled as `[External context]` and must not replace prompt financials.
- **Compliance checklist:** model is instructed to self-validate section order, table-only blocks, deep-dive count limits, and valid JSON syntax before finalizing.
- **UI error transparency:** simulator generation uses explicit runtime checks and displays actionable errors in the output panel instead of failing silently.

### Simulator Troubleshooting

- If **Generate Simulation Deep Prompt** appears unresponsive, check the output panel for a diagnostic message.
- Common causes: databases not finished loading, stale browser state, or partial script execution after hot reload.
- Fast recovery: refresh page, wait for full initialization, then generate again.

### Form Input Hardening

- **Locale-safe numeric parsing:** budgets accept `55000`, `55,000`, `55.000`, `€55 000` and normalize to integer values.
- **Input sanitization:** key free-text fields normalize whitespace and strip control/high-risk delimiter characters.
- **Select normalization:** out-of-range/tampered select values are forced to safe defaults.
- **Role sync from compensation DB:** simulator role options are generated from `COMPENSATION_DATA.json` bands, reducing drift after salary-role updates.

### Feasibility Methodology (Simulator)

- **All-city deterministic pass:** every city is scored before recommendations are produced.
- **Objective-specific weights:**
  - `cost`: strategic 15% / financial 60% / talent 25%
  - `quality`: strategic 40% / financial 20% / talent 40%
  - `speed`: strategic 20% / financial 35% / talent 45%
  - `balanced`: strategic 25% / financial 40% / talent 35%
- **Dealbreaker penalties (heavy, deterministic):** airport constraints, talent-pool depth constraints, coastal/warm constraints, low-cost constraints, and office/work-model constraint conflicts reduce weighted scores.
- **Feasibility band per city:** `HIGH`, `MEDIUM`, or `LOW` based on verdict, constraint pressure, and weighted score.
```

---

## Development

### Scripts

```bash
npm run dev          # Start dev server (HMR)
npm run build        # Production build → dist/
npm run preview      # Preview production build
npm run test         # Run unit tests
npm run test:visual  # Run Playwright visual tests
```

### CSS Architecture

Uses design tokens with CSS custom properties:

```css
/* tokens.css */
:root {
  --accent-color: #3b82f6;
  --sp-md: 1rem;
  --radius-md: 0.5rem;
}

[data-theme="dark"] {
  --bg-color: #0f172a;
  --card-bg: #1e293b;
}
```

### Adding a New City

1. Add to `MASTER.json` with metrics
2. Add to `CITY_PROFILES.json` with ecosystem data
3. Add profile section in `index.html`
4. Add to `cityConfig` in `bubbleChart.js`
5. Rebuild: `npm run build`

---

## Credits

- **Authors:** Claude AI (Opus 4.5)
- **Research:** Perplexity AI, Gemini Deep Research, GPT-5
- **Data Sources:** DGEEC/InfoCursos, ANACOM, Eurostat, CFP, Idealista (rent data), and other official datasets documented in `src/index.html`.

---

## License
Creative Commons Attribution-NonCommercial-ShareAlike	CC BY-NC-SA	