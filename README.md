BUILT WITH AI

# Portugal IT Nearshoring Guide

> Data-driven analysis of Portugal's best cities for IT nearshoring, featuring a deterministic simulator and source-free fact-check workflow built on normalized JSON databases.

[![Live Site](https://img.shields.io/badge/Live-al--gharb.github.io-blue)](https://al-gharb.github.io/nearshoring-cities-portugal/)
[![Version](https://img.shields.io/badge/version-0.95.0-orange)](package.json)
[![Build](https://img.shields.io/badge/build-Vite-646cff)](https://vitejs.dev/)

---

## Baseline Status

**Current baseline:** v0.95.0 (pre-launch baseline)  
**Scope:** launch-ready documentation and process consistency, with minor refinements tracked separately.

## View Website

**Live Site:** https://al-gharb.github.io/nearshoring-cities-portugal/

## Documentation Map

- [Documentation Index](docs/INDEX.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Release Checklist](RELEASE_CHECKLIST.md)
- [Changelog](CHANGELOG.md)
- [Copilot Instructions](.github/copilot-instructions.md)
- [Data Flow Map](public/data/DATA_FLOW.md)
- [Fact-Check Workflow](factchecks/README.md)
- [Image Attributions](IMAGE_ATTRIBUTIONS.md)

## Data Freshness Indicator

The header freshness bar represents how recent the underlying site data is.

- Source date: `public/data/normalized/WEBSITE_CONTENT.json` → `_meta.lastUpdated`
- Decay rule: loses 25 basis points per day (`0,25%`) since that date
- Display: two-decimal percentage format (`99,xx%` style)
- Tooltip explains the calculation and reminds users this is recency, not fact-check confidence

## Quick Start

Prerequisite: Node.js `>= 20`.

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run static checks
npm run lint

# Regenerate icon CSS subset (after icon class changes)
npm run gen:fa-subset

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test:all
```

## Quality Tooling

- JavaScript lint configuration: [eslint.config.js](eslint.config.js)
- CSS lint configuration: [stylelint.config.cjs](stylelint.config.cjs)
- Build configuration: [vite.config.js](vite.config.js)

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
│   │       ├── promptGenerator.js # AI simulator + fact-check prompt generation
│   │       ├── promptTemplate.js  # V5.0 narrative prompt template
│   │       ├── contentRenderer.js # Dynamic content
│   │       ├── dataFreshness.js   # Header freshness bar (0.25% daily decay)
│   │       ├── calculations.js    # Salary/ICT calculations
│   │       └── themeToggle.js     # Dark mode
│   └── styles/
│       ├── tokens.css            # Design tokens (colors, spacing)
│       ├── reset.css             # CSS reset
│       ├── base.css              # Base styles
│       ├── components.css        # UI components
│       ├── freshness.css         # Freshness bar styling
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
├── docs/                         # Documentation index and supporting docs
├── CHANGELOG.md                  # Baseline and release history
├── CONTRIBUTING.md               # Contribution workflow
├── RELEASE_CHECKLIST.md          # Pre-release verification gate
├── dist/                         # Production build output
├── scripts/                      # Python maintenance utilities
├── tests/                        # Playwright visual tests
├── .github/
│   └── copilot-instructions.md   # AI coding assistant context
├── vite.config.js                # Build configuration
└── package.json
```





---

## License
Creative Commons Attribution-NonCommercial-ShareAlike (CC BY-NC-SA)

