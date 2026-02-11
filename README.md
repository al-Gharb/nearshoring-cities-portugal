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
- **Fact-Check System v3.2** — Dynamic claim generation from source databases
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
│   │       ├── simulatorEngine.js # V5.0 deterministic computation
│   │       ├── promptGenerator.js # AI Simulator
│   │       ├── promptTemplate.js  # V5.0 prompt template (narrative)
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
| `WEBSITE_CONTENT.json` | Section content | `macroeconomic.heroMetrics`, `digitalInfra.connectivity` |
| `COMPENSATION_DATA.json` | Salary math | `salaryBands`, `tierMultipliers`, `stackPremiums` |
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

## Fact-Check System v3.1 (Dynamic + HITL Gate)

The fact-check system ensures data accuracy through **multi-source AI verification**. Claims are generated dynamically from source databases — no separate claims file to maintain.

### Key Principles

1. **Dynamic Claim Generation** — Claims extracted directly from `CITY_PROFILES.json`, `WEBSITE_CONTENT.json`, `MASTER.json`
2. **5-6 Source Verification** — Run same prompt through Perplexity, Gemini, ChatGPT, DeepSeek, Claude, Grok
3. **Consensus Matrix** — Compare all results, implement only where 4+ sources agree
4. **HITL Gate** — Human must say "GO" before any database changes
5. **Tolerance ±5%** — Values within 5% of claimed = SUPPORTED

### Source Strategy

| Category | Data File | Primary Source |
|----------|-----------|---------------|
| Macroeconomic | `WEBSITE_CONTENT.json` | EC Autumn Forecast |
| Digital Infrastructure | `WEBSITE_CONTENT.json` | ANACOM |
| Office Rent | `MASTER.json` | JLL Portugal / C&W |
| Residential Rent | `MASTER.json` | Idealista / Numbeo |
| Workforce | `WEBSITE_CONTENT.json` | Eurostat |
| Tax Incentives | `WEBSITE_CONTENT.json` | ANI (SIFIDE II) |
| Graduates | `WEBSITE_CONTENT.json` | DGEEC InfoCursos |
| City Profiles | `CITY_PROFILES.json` + `MASTER.json` | Company/university sites |

### Verification Workflow

1. **Generate prompt** — Site → Verification Archive → Select category → Generate Fact-Check Prompt
2. **Run 5-6 verifications** — Same prompt → Perplexity, Gemini, ChatGPT, DeepSeek, Claude
3. **Build matrix** — Compile JSONL results, count SUPPORTED/NEEDS_UPDATE/CONTRADICTED per claim
4. **Present suggestions** — Show consolidated table with current vs. suggested values
5. **⚠️ WAIT FOR "GO"** — Agent does NOT implement until human explicitly says "GO"
6. **Implement corrections** — Update source database only → next fact-check uses corrected values
7. **Rebuild** — `npm run build`

---

## AI Nearshoring Simulator (V5.0)

**Architecture:** Separation of concerns — JavaScript handles all financial computation, AI handles narrative reasoning.

The simulator:

1. **Runs deterministic analysis** (JavaScript) — Computes EMC, scores 20 cities, ranks by feasibility
2. **Generates ~7,000-token prompt** — Pre-computed tables + client context
3. **AI consumes results** — Reviews Top 5, selects 2-3 best fits, writes deep-dives

### Key Components

- **simulatorEngine.js** — All financial math, scoring rubrics, ranking logic (deterministic)
- **promptTemplate.js** — Builds narrative prompt with pre-computed results (zero formulas)
- **promptGenerator.js** — Collects inputs, runs engine, generates final prompt

### Prompt Architecture (V5.0)

```
Phase A: Pre-computed results (read-only tables)
Phase B: Client request + advisory task
Phase C: Output template (7 sections)

AI performs ZERO arithmetic — only strategic reasoning and narrative analysis.
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
- **Data Sources:** DGEEC/InfoCursos, ANACOM, Eurostat, CFP, JLL Portugal, Cushman & Wakefield,   idealista and more. See html.

---

## License
Creative Commons Attribution-NonCommercial-ShareAlike	CC BY-NC-SA	