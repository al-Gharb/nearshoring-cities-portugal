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

### Internal Calculations (Not Verifiable Externally)

These metrics are derived from official data using our methodology:

| Metric | Description | See |
|--------|-------------|-----|
| **Tech STEM+** | Custom CNAEF code grouping beyond ICT | [Methodology](#methodology) |
| **Salary Index** | INE regional wages normalized to Lisbon=100 | [Methodology](#methodology) |
| **ICT %** | Core ICT graduates ÷ Tech STEM+ | [Methodology](#methodology) |

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


---

## AI Nearshoring Simulator (Experimental v3)

**Problem observed:** General-purpose models can use stale/unreliable sources, introduce math mistakes, and default to familiar city shortcuts instead of evaluating all 20 cities.

**Assumptions & Idea:** Large language models generate outputs through next-token prediction, allocating attention across the prompt based on structure and salience. By deterministically computing financials and rankings from cross-validated datasets and injecting structured outputs (e.g., JSON metrics) into the prompt, we anchor context and steer attention. This reduces problem-space entropy, limits hallucinated substitutions, and shifts the model from open-ended generation toward disciplined, data-constrained comparative analysis grounded in validated inputs.

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


### Feasibility Methodology (Simulator)

- **All-city deterministic pass:** every city is scored before recommendations are produced.
- **Objective-specific weights:**
  - `cost`: strategic 15% / financial 60% / talent 25%
  - `quality`: strategic 40% / financial 20% / talent 40%
  - `speed`: strategic 20% / financial 35% / talent 45%
  - `balanced`: strategic 25% / financial 40% / talent 35%
- **Dealbreaker penalties (heavy, deterministic):** airport constraints, talent-pool depth constraints, coastal/warm constraints, low-cost constraints, and office/work-model constraint conflicts reduce weighted scores.
- **Feasibility band per city:** `HIGH`, `MEDIUM`, or `LOW` based on verdict, constraint pressure, and weighted score.


- **Authors:** Claude AI (Opus 4.5)
- **Research:** Perplexity AI, Gemini Deep Research, GPT-5
- **Data Sources:** DGEEC/InfoCursos, ANACOM, Eurostat, CFP, Idealista (rent data), and other official datasets documented in `src/index.html`.

---

## License
Creative Commons Attribution-NonCommercial-ShareAlike	CC BY-NC-SA	