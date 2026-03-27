BUILT WITH AI

# Portugal IT Nearshoring Guide

> Data-driven analysis of Portugal's best cities for IT nearshoring, featuring an AI-powered advisor that generates structured recommendations from verified databases.

[![Live Site](https://img.shields.io/badge/Live-al--gharb.github.io-blue)](https://al-gharb.github.io/nearshoring-cities-portugal/)
[![Version](https://img.shields.io/badge/version-0.9.0-orange)](package.json)
[![Build](https://img.shields.io/badge/build-Vite-646cff)](https://vitejs.dev/)

---

## View Content on Website

**Live Site:** https://al-gharb.github.io/nearshoring-cities-portugal/

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

## License
Creative Commons Attribution-NonCommercial-ShareAlike	CC BY-NC-SA	