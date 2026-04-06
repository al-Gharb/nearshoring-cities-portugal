# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Added

- Added [CONTRIBUTING.md](CONTRIBUTING.md) with:
  - local setup requirements
  - command matrix for dev/lint/test/build
  - PR workflow and validation expectations
  - fact-check correction gate (`GO` required before source-data edits)
- Added `scripts/generate_fa_subset.mjs` and npm script `npm run gen:fa-subset` to regenerate icon subset CSS safely.

### Changed

- Updated [README.md](README.md):
  - Quick Start now includes Node.js requirement (`>=20`)
  - added `npm run lint` to baseline verification flow
  - added quality-tooling links (`eslint.config.js`, `stylelint.config.cjs`, `vite.config.js`)
- Updated [docs/INDEX.md](docs/INDEX.md) with a Quality and Tooling section.
- Updated [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) to require `npm run lint` in release validation.
- Restored single-open accordion behavior for top-level main collapsible containers, with independent city-profile expand/collapse behavior.
- Improved accordion open transitions when switching between top-level containers by stabilizing summary position during sibling close and avoiding down-then-up scroll jumps.
- Closing the top-level City Profiles container now collapses all expanded city profile cards.
- City profile opening now aligns to the profile header and performs a post-transition re-alignment pass for stable viewport positioning.
- Replaced full Font Awesome CSS import with a generated local subset stylesheet that includes only icon classes used in source files.
- Deferred loading of the D3 bubble chart and simulator/fact-check generator modules until their sections are opened, reducing initial JavaScript execution.
- Refactored bubble chart D3 usage to import only required submodules instead of a full namespace import, improving tree-shaking.
- Updated INE regional earnings dataset from 2023 to 2024 across normalized databases and UI references:
  - refreshed `ineRegionalEarnings` values in `public/data/normalized/COMPENSATION_DATA.json`
  - refreshed legacy `salaryByRegion` values in `public/data/normalized/WEBSITE_CONTENT.json`
  - updated INE source metadata in `public/data/sources.json` (2024 period, published 2026-03-27)
  - updated salary-index methodology examples and INE year labels in `src/index.html`
- Aligned Tech STEM+ methodology numbers with the stated 2-year CAGR projection logic:
  - updated projected component totals and national estimate in `public/data/normalized/MASTER.json`
  - updated projected regional Tech STEM+ totals in `public/data/normalized/MASTER.json`
  - persisted recalculated city-level Tech STEM+ allocations from updated regional totals in `public/data/normalized/MASTER.json`
  - synchronized projection values in `src/index.html`, `src/scripts/modules/contentRenderer.js`, `public/data/rendered/city_table.json`, `public/data/rendered/bubble_chart.json`, and `public/llms.txt`
- Updated City Database methodology navigation and metric definitions:
  - made the three header `auto` badges clickable to their methodology anchors (`#src-ict-pct`, `#src-tech-stemplus`, `#src-salary-index`)
  - expanded Tech STEM+ tooltip copy in city, regional-subtotal, and mainland-total cells to state the metric definition (projected annual hiring-relevant tech graduate pool, gross end-2026)
  - generalized `#src-*` anchor click handling so new in-table methodology links open and scroll reliably

### Notes

- Documentation now matches the current repository tooling and quality gates.

## [0.95.0] - 2026-04-02

### Added (0.95.0)

- Added launch-baseline documentation set:
  - `docs/INDEX.md`
  - `CONTRIBUTING.md`
  - `RELEASE_CHECKLIST.md`
  - `CHANGELOG.md`
- Added baseline status line to `public/llms.txt`.

### Changed (0.95.0)

- Normalized version markers to `0.95.0` in:
  - `package.json`
  - `package-lock.json`
  - `README.md`
  - `.github/copilot-instructions.md`
  - `src/index.html` release banner copy
- Refreshed `README.md` with documentation map and updated module labels.
- Refreshed `.github/copilot-instructions.md` entry points and fixed `DATA_FLOW.md` references to `public/data/DATA_FLOW.md`.
- Standardized fact-check process wording for pending verification states.

### Notes (0.95.0)

- This is a pre-launch baseline with minor refinements pending.
- `_backups/` remains out of scope for this baseline and is intentionally unchanged.
