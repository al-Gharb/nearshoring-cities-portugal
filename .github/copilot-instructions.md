# Nearshoring Cities Portugal — Copilot Instructions

> v3.2 — Vite-based modular architecture with normalized JSON databases
> and AI fact-check system v3.2 (source-free claims, dynamic generation, HITL gate).

---

## Core Editorial Principles

**🎯 Factual Integrity — No Hyperbole**

This is a **data-driven business analysis**, not marketing material.

1. **Verifiable Claims Only** — Use specific numbers, not adjectives
2. **No Marketing Language** — Avoid "boasts," "robust," "seamless," "world-class"
3. **Precision Over Persuasion** — State what IS, include caveats when relevant
4. **Citations Required** — All stats reference their source

| ❌ Hyperbole | ✅ Factual |
|-------------|-----------|
| "Portugal boasts world-class infrastructure" | "Portugal ranks 8th in the EU for fixed broadband take-up" |
| "Seamless connectivity" | "Average latency to Frankfurt is under 25ms" |

---

## Project Overview

**Live Site:** https://al-gharb.github.io/nearshoring-cities-portugal/  
**Build System:** Vite 5.4  
**Version:** 0.95.0  
**Release State:** Pre-launch baseline with minor refinements pending.

**Features:**
- 20 Portuguese cities (10 featured + 10 secondary)
- Interactive D3.js bubble chart
- AI Nearshoring Simulator (V5.0 — deterministic engine + narrative prompt)
- Fact-Check System v3.2
- Light/dark mode

### Documentation Entry Points

- `README.md` — Project overview + quick start
- `docs/INDEX.md` — Documentation map
- `CONTRIBUTING.md` — Contribution workflow
- `RELEASE_CHECKLIST.md` — Pre-release and consistency verification
- `factchecks/README.md` — Fact-check workflow and archive index
- `public/data/DATA_FLOW.md` — Database to JS to HTML rendering map

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  VITE BUILD FLOW                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  src/                        → Vite transforms →     dist/                  │
│    index.html                                          index.html           │
│    scripts/main.js           → bundled →               main-[hash].js       │
│    styles/*.css              → bundled →               main-[hash].css      │
│                                                                              │
│  public/                     → copied as-is →         dist/                 │
│    data/normalized/*.json                              data/normalized/     │
│    data/rendered/*.json                                data/rendered/       │
│    assets/images/                                      assets/              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  DATA ARCHITECTURE — Normalized JSON Databases                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  public/data/normalized/                                                    │
│                                                                             │
│    MASTER.json              ← Core city metrics (20 cities)                 │
│      ├── cities[id].basic   (name, region, featured)                        │
│      ├── cities[id].graduates (digitalStemPlus, coreIct, ictPct)            │
│      └── cities[id].costs   (officeRent, residentialRent, salaryIndex)      │
│                                                                             │
│    CITY_PROFILES.json       ← Rich context (10 featured cities)             │
│      ├── cities[id].ecosystem (majorCompanies, domains, coworking)          │
│      ├── cities[id].education (universities, specializations)               │
│      ├── cities[id].culture   (climate, retention, qualityOfLife)           │
│      └── cities[id].infrastructure (airport, connectivity)                  │
│                                                                             │
│    WEBSITE_CONTENT.json     ← Section content                               │
│      ├── macroeconomic      (heroMetrics, economicActivity, labour)         │
│      ├── digitalInfra       (connectivity, subseaCables, dataCenters)       │
│      ├── strategic          (taxIncentives, laborMarket, costOfLiving)      │
│      ├── qualityOfLife      (healthcare/EHCI, safety/GPI, political)        │
│      └── workforce          (ictSpecialists, hiringInsights)                │
│                                                                             │
│    COMPENSATION_DATA.json   ← Salary bands + employer costs                 │
│      ├── baseBands{}        (min, midpoint, max by role; htmlAuthoritative)  │
│      ├── seniorityMultipliers (junior 0.85, mid 1.0, senior 1.25, lead 1.40)│
│      ├── techStackPremiums  (ml-mlops +25%, blockchain +40%, etc.)           │
│      └── employerCosts      (SS 23.75%, meal allowance, 14× salaries)       │
│                                                                             │
│    FACTCHECK_CLAIMS_v2.json ← Verification methodology only                 │
│      ├── verificationMethodology (status codes, output format)              │
│      └── internalMethods    (describes which metrics are internal)          │
│      NOTE: Claims are now generated dynamically from source DBs above       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  JAVASCRIPT MODULES — src/scripts/modules/                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  main.js                    Entry point, initializes all modules            │
│      │                                                                      │
│      ├── database.js        Load/access JSON data (getCity, getStore, etc.) │
│      ├── cityTable.js       Render city database table from MASTER.json    │
│      ├── bubbleChart.js     D3.js scatter plot (talent vs cost)             │
│      ├── cityProfiles.js    City profile expand/collapse, printing          │
│      ├── contentRenderer.js Populate .db-value spans from JSON              │
│      ├── dataFreshness.js   Header freshness bar (0.25% daily decay)        │
│      ├── calculations.js    Auto-compute salary indices, ICT %              │
│      ├── themeToggle.js     Light/dark mode toggle                          │
│      ├── simulatorEngine.js V5.0 deterministic computation (all math)       │
│      ├── promptGenerator.js AI Simulator + Fact-check generator             │
│      ├── promptTemplate.js  V5.0 prompt template (narrative only)           │
│      └── coverCityList.js   Cover page city list                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
.
├── src/
│   ├── index.html            # Main document (~3250 lines)
│   ├── scripts/
│   │   ├── main.js           # Entry point
│   │   └── modules/          # ES modules
│   │       ├── database.js
│   │       ├── cityTable.js
│   │       ├── bubbleChart.js
│   │       ├── cityProfiles.js
│   │       ├── contentRenderer.js
│   │       ├── dataFreshness.js
│   │       ├── calculations.js
│   │       ├── themeToggle.js
│   │       ├── simulatorEngine.js
│   │       ├── promptGenerator.js
│   │       ├── promptTemplate.js
│   │       └── coverCityList.js
│   │   └── utils/
│   │       └── confidenceBar.js  # Shared confidence bar builder
│   └── styles/
│       ├── tokens.css        # Design tokens (CSS variables)
│       ├── reset.css         # CSS reset
│       ├── base.css          # Base styles
│       ├── components.css    # UI components
│       ├── freshness.css     # Header freshness bar styles
│       ├── sections.css      # Page sections
│       └── print.css         # Print styles
│
├── public/
│   ├── assets/images/        # Static images
│   └── data/
│       ├── normalized/       # JSON databases
│       │   ├── MASTER.json
│       │   ├── CITY_PROFILES.json
│       │   ├── WEBSITE_CONTENT.json
│       │   ├── COMPENSATION_DATA.json
│       │   └── FACTCHECK_CLAIMS_v2.json
│       ├── rendered/
│       │   ├── bubble_chart.json
│       │   └── city_table.json
│       └── sources.json      # Machine-readable source registry
│
├── factchecks/               # Fact-check verification archive
│   ├── README.md             # Process overview, category index
│   ├── macroeconomic.md      # 01 — Macroeconomic Scorecard
│   ├── digital-infra.md      # 02 — Digital Infrastructure
│   ├── office-rent.md        # 03 — Office Rent (per-city)
│   ├── residential-rent.md   # 04 — Residential Rent (per-city)
│   ├── workforce.md          # 05 — Workforce + Compensation
│   ├── strategic-tax.md      # 06 — Strategic & Tax + COL + QoL
│   ├── university-talent.md  # 07 — University Talent
│   ├── city-database.md      # 08 — City Database (all metrics)
│   └── city-{name}.md        # C1–C10 — Featured city profiles
│
├── dist/                     # Production build (git-ignored)
├── scripts/                  # Python maintenance utilities
├── tests/visual/             # Playwright screenshots
├── docs/                     # Documentation index and launch docs
├── CHANGELOG.md              # Release history (baseline and updates)
├── CONTRIBUTING.md           # Contribution process
├── RELEASE_CHECKLIST.md      # Launch/readiness gates
├── vite.config.js            # Build config
├── package.json
└── .github/
    └── copilot-instructions.md  # This file
```

---

## Fact-Check System v3.2 (Dynamic, Source-Free)

### Key Changes from v3.1

1. **Source-Free Claims** — Claim text no longer includes source attributions (no Numbeo, DGEEC, INE, Eurostat, salary-board labels, etc. in claim strings). The 3rd-party AI must find its own sources independently.
2. **Dynamic Claim Generation** — Claims are extracted directly from source databases at runtime
3. **Single Source of Truth** — No separate claims file to sync; update source DB → claims auto-update
4. **Internal Calculations Excluded** — Tech STEM+, Salary Index flagged as internal (not sent to AI)
5. **Comprehensive Extraction** — All displayable data is converted to verifiable claims

> **ℹ️ Data Flow Reference:** See `public/data/DATA_FLOW.md` for the complete database → JS → HTML rendering map.

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DYNAMIC CLAIM GENERATION — How it works                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  USER SELECTS CATEGORY                                                      │
│         ↓                                                                   │
│  promptGenerator.js dispatches to appropriate generator:                    │
│                                                                             │
│  ┌─ Data Categories ─────────────────────────────────────────────────────┐  │
│  │  macroeconomic    → generateMacroeconomicClaims(content)              │  │
│  │  digitalInfra     → generateDigitalInfraClaims(content)               │  │
│  │  officeRent       → generateOfficeRentClaims(master)                  │  │
│  │  residentialRent  → generateResidentialRentClaims(master)             │  │
│  │  workforce        → generateWorkforceClaims(content, compensation)    │  │
│  │  taxIncentives    → generateStrategicClaims(content)                  │  │
│  │  graduates        → generateUniversityTalentClaims(content)           │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─ City Profiles ───────────────────────────────────────────────────────┐  │
│  │  city:lisbon      → generateCityClaimsFromSource('lisbon')            │  │
│  │  city:porto       → generateCityClaimsFromSource('porto')             │  │
│  │  ... (10 featured cities)                                             │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│         ↓                                                                   │
│  Generator walks the source database and extracts ALL fields as claims     │
│         ↓                                                                   │
│  Claims formatted into verification prompt with methodology                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Source Strategy

| Category | Primary Source | Data File |
|----------|---------------|-----------|
| Macroeconomic | EC Autumn Forecast | `WEBSITE_CONTENT.json` |
| Digital Infrastructure | ANACOM | `WEBSITE_CONTENT.json` |
| Office Rent | Live market listings + plausibility verification | `MASTER.json` |
| Residential Rent | Live market listings + plausibility verification | `MASTER.json` |
| Workforce + Compensation | Eurostat, compensation benchmark datasets | `WEBSITE_CONTENT.json` + `COMPENSATION_DATA.json` |
| Tax Incentives + COL + QoL | ANI, Numbeo, EHCI, GPI | `WEBSITE_CONTENT.json` |
| Graduates | DGEEC InfoCursos | `WEBSITE_CONTENT.json` |
| City Profiles | Company/university sites | `CITY_PROFILES.json` + `MASTER.json` |

### Internal Calculations (NOT for External Verification)

| Metric | Description | Methodology |
|--------|-------------|-------------|
| Tech STEM+ | Internal tiered model (ICT + engineering subset + math/stats subset + CTeSP + vocational) | `index.html#methodology-graduates` |
| Salary Index | INE regional wages ÷ Lisbon | `index.html#methodology-salaries` |
| ICT % | coreIct ÷ officialStem | Derived |
| Cost Comparisons | COL index differences | Derived |

### Fact-Check Workflow (5-Source Verification)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  FACT-CHECK CORRECTION WORKFLOW v3.2                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. GENERATE PROMPT                                                         │
│     └── Website → Verification Archive → Select Category → Generate        │
│         (Claims extracted dynamically from source databases)                │
│                                                                             │
│  2. RUN 5-6 INDEPENDENT VERIFICATIONS                                       │
│     └── Run the SAME prompt through multiple AI engines:                    │
│         • Perplexity AI (web-grounded)                                      │
│         • Gemini Deep Research                                              │
│         • ChatGPT-4/5 (with web search)                                     │
│         • DeepSeek R1                                                       │
│         • Claude (with web search)                                          │
│         • Grok / other engines                                              │
│                                                                             │
│  3. BUILD VERIFICATION MATRIX                                               │
│     └── Compile JSONL results from all sources into comparison table        │
│         • Count: SUPPORTED / NEEDS_UPDATE / CONTRADICTED per claim          │
│         • Flag discrepancies between sources                                │
│         • Calculate consensus (e.g., 4/5 agree = implement)                 │
│                                                                             │
│  4. PRESENT SUGGESTIONS (NO IMPLEMENTATION!)                                │
│     └── Show consolidated table to HITL with:                               │
│         • Current values vs. suggested corrections                          │
│         • Source agreement counts                                           │
│         • Recommended final score                                           │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  ⚠️  HITL GATE: NEVER IMPLEMENT WITHOUT EXPLICIT "GO" APPROVAL         ││
│  │  Agent must WAIT for human to review matrix and say "GO" before any    ││
│  │  database changes. This is a blocking requirement.                     ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  5. IMPLEMENT CORRECTIONS (only after "GO")                                 │
│     └── Update SOURCE database directly:                                    │
│         • City data → CITY_PROFILES.json or MASTER.json                     │
│         • National data → WEBSITE_CONTENT.json                              │
│         ✓ Next fact-check will automatically use corrected values           │
│                                                                             │
│  6. REBUILD & VERIFY                                                        │
│     └── npm run build → Verify changes on site                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key Improvements v3.2:**
- **Source-free claims** — No source attributions in claim text; AI engines verify independently
- **Multi-source verification** — Run 5-6 AI engines for consensus-based accuracy
- **Verification matrix** — Compare results before deciding what to change
- **HITL gate** — Human must approve ("GO") before any database modifications
- **Single-source updates** — Update source DB once; claims regenerate automatically

### Verification Archive (`factchecks/` folder)

Each category has a dedicated markdown file in `factchecks/` with:

1. **Verification Runs** — Raw JSONL output from each AI engine
2. **Consensus Matrix** — Side-by-side comparison table:
   ```
   | Claim ID | Claim | Perplexity | Gemini | GPT | DeepSeek | Claude | Consensus | Action |
   ```
3. **Summary & Suggested Corrections** — Agent-generated recommendations
4. **HITL Decision Log** — Record of approvals/rejections with dates

**Consensus rules:**
- 4/5+ SUPPORTED → Keep current value
- 3/5+ NEEDS_UPDATE → Propose correction (HITL decides)
- Mixed → Flag for manual research
- All UNVERIFIABLE → Keep, lower confidence score

**Process:** User pastes 5 JSONL outputs → Agent builds matrix → Agent writes summary with
suggested corrections → HITL reviews and says "GO" for approved items → Agent updates
source DB(s) and logs decision.

### File Roles

| Database | Purpose | Fact-Check Role |
|----------|---------|-----------------|
| `CITY_PROFILES.json` | City ecosystem data | **Correction target** (cities) |
| `WEBSITE_CONTENT.json` | National data | **Correction target** (macro, infra) |
| `MASTER.json` | City metrics | **Correction target** (costs, grads) |
| `FACTCHECK_CLAIMS_v2.json` | Verification methodology | Status codes, output format only |

---

## Common Tasks

### Run Development Server

```bash
npm run dev     # http://localhost:3000/nearshoring-cities-portugal/
```

### Build for Production

```bash
npm run check:rendered # Verify rendered snapshots are in sync
npm run build   # Output in dist/
npm run preview # Preview build at localhost:4173
```

### Update City Data

1. Edit `public/data/normalized/MASTER.json` for metrics
2. Edit `public/data/normalized/CITY_PROFILES.json` for ecosystem
3. If `MASTER.json` or `COMPENSATION_DATA.json` changed, regenerate rendered snapshots:
  - `npm run gen:rendered`
  - `npm run check:rendered`
4. **Check `public/data/DATA_FLOW.md`** for dynamic vs generated export surfaces
5. Rebuild: `npm run build`

### Rendered Snapshot Policy (Agents + Contributors)

- Source of truth remains `public/data/normalized/*.json`.
- `public/data/rendered/city_table.json` and `public/data/rendered/bubble_chart.json` are generated derivatives.
- Do not hand-edit rendered snapshots unless performing emergency recovery; run `npm run gen:rendered` immediately afterward.
- For deterministic exports, `_meta.generatedAt` in rendered snapshots follows `MASTER.json` freshness metadata.
- Any PR touching `MASTER.json`/`COMPENSATION_DATA.json` must include rendered snapshot updates and a passing `npm run check:rendered`.

### Add New City

1. Add to `MASTER.json` → `cities[newCityId]`
2. Add to `CITY_PROFILES.json` if featured
3. Add HTML profile section in `index.html`
4. Add to `cityConfig` in `bubbleChart.js`
5. Rebuild

### Modify Dark Mode

1. Edit `src/styles/tokens.css` for `[data-theme="dark"]` variables
2. Or add component-specific dark styles in relevant CSS file

### Generate AI Prompt

**Method 1: Website**
1. Go to AI Nearshoring Simulator section
2. Fill form, click Generate Prompt
3. Copy to ChatGPT, Claude, etc.

**Method 2: Fact-Check**
1. Go to Verification Archive section
2. Select category, click Generate Fact-Check Prompt
3. Run same prompt through 5–6 AI engines (Perplexity, Gemini, GPT, DeepSeek, Claude)
4. Paste all JSONL outputs into the matching `factchecks/{category}.md`
5. Agent builds consensus matrix and proposes corrections
6. HITL reviews and approves ("GO") specific corrections
7. Agent implements approved changes → `npm run build`

---

## CSS Architecture

### Design Tokens (tokens.css)

```css
:root {
  /* Colors */
  --accent-color: #3b82f6;
  --stem-color: #ef4444;
  --ict-color: #22c55e;
  --stemplus-color: #3b82f6;
  
  /* Spacing */
  --sp-sm: 0.5rem;
  --sp-md: 1rem;
  --sp-lg: 1.5rem;
  --sp-xl: 2rem;
  
  /* Radii */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
}

[data-theme="dark"] {
  --bg-color: #0f172a;
  --card-bg: #1e293b;
  --text-color: #f1f5f9;
}
```

### Graduate Metrics Icon Schema

| Metric | Color | Icon |
|--------|-------|------|
| Official STEM | Red (`--stem-color`) | `fa-user-graduate` |
| Core ICT | Green (`--ict-color`) | `fa-user-graduate` |
| Tech STEM+ | Blue (`--stemplus-color`) | `fa-user-graduate` + `fa-user` |
| ICT % | Green | `fa-chart-pie` |

### Inline CSS Policy

**⚠️ No inline `style=""` except:**

| Allowed | Reason |
|---------|--------|
| SVG `stop-color`, `stop-opacity` | SVG gradient attributes (required) |
| SVG `animation-delay`, `animation-duration` | Per-path animation timing |
| Map marker `top`/`left` positioning | Per-element coordinate data |
| `confidence-bar-pointer` `left` | Dynamically computed by JS |
| Debug legend elements | Debug-only UI |

Use utility classes instead:
- `.grid-equal-height` → `align-items: stretch`
- `.card-flex` → `display: flex; flex-direction: column`
- `.flex-fill` → `flex: 1`

---

## JavaScript Patterns

### Database Access (database.js)

```javascript
import { getCity, getCityProfile, getStore } from './database.js';

// Get city metrics
const lisbon = getCity('lisbon');
console.log(lisbon.graduates.digitalStemPlus); // 3660

// Get city profile (ecosystem, culture)
const profile = getCityProfile('lisbon');
console.log(profile.ecosystem.majorCompanies); // ['Microsoft', ...]

// Get full store
const store = getStore();
console.log(store.nationalTotals);
```

### Data Binding (contentRenderer.js)

```html
<!-- HTML -->
<span class="db-value" data-city="porto" data-field="stem-grads"></span>

<!-- JS populates from MASTER.json -->
```

### Navigation — Anchors Inside `<details>`

The TOC and many sections are inside `<details>` elements. Clicking an anchor
that points inside a closed `<details>` won't scroll — the browser can't reach
hidden content. **All internal anchor navigation must open parent `<details>`
first.** This pattern is used in both `handleInitialHash()` and the floating
"back to index" button:

```javascript
let parent = target.closest('details');
while (parent) {
  parent.open = true;
  parent = parent.parentElement?.closest('details');
}
```

---

## HTML Patterns

### Section Markers

```html
<!-- ╔═════════════════════════════════════════════════════════════════════════╗
     ║  SECTION NAME                                                          ║
     ╚═════════════════════════════════════════════════════════════════════════╝ -->
```

### City Profile Markers

```html
<!-- ┌───────────────────────────────────────────────────────────────────────┐
     │  LISBON                                                               │
     └───────────────────────────────────────────────────────────────────────┘ -->
```

---

## Encoding & Diacritics

**⚠️ CRITICAL: Preserve Portuguese Characters**

- Files: UTF-8
- City names: Guimarães, Covilhã, Évora, Setúbal
- Never use escape sequences (`\u00e9`) — use literal characters (é)

Test after edits: Évora, Covilhã, Guimarães, Setúbal, Península

---

## Cities Covered

### Featured (10) — Full profiles

| City | ID | Region |
|------|-----|--------|
| Lisbon | `lisbon` | Lisbon Metro |
| Porto | `porto` | Norte |
| Braga | `braga` | Norte |
| Guimarães | `guimaraes` | Norte |
| Coimbra | `coimbra` | Centro |
| Aveiro | `aveiro` | Centro |
| Covilhã | `covilha` | Centro |
| Évora | `evora` | Alentejo |
| Faro | `faro` | Algarve |
| Setúbal | `setubal` | Setúbal Peninsula |

### Secondary (10) — Metrics only

| City | ID | Region |
|------|-----|--------|
| Vila Real | `vilareal` | Norte |
| Viana do Castelo | `vianacastelo` | Norte |
| Bragança | `braganca` | Norte |
| Viseu | `viseu` | Centro |
| Castelo Branco | `castelobranco` | Centro |
| Leiria | `leiria` | Centro |
| Santarém | `santarem` | Oeste |
| Tomar | `tomar` | Oeste |
| Beja | `beja` | Alentejo |
| Portalegre | `portalegre` | Alentejo |

---

## Testing

```bash
npm run test          # Unit tests (Vitest)
npm run test:visual   # Visual regression (Playwright)
npm run test:all      # Both
```

---

## Credits

- **Authors:** Claude AI (Opus 4.5)
- **Research:** Perplexity AI, Gemini Deep Research, GPT-5
- **Data:** DGEEC, ANACOM, Eurostat, CFP, live listings and public institutional datasets


