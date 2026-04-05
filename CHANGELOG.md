# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Added
- Added [CONTRIBUTING.md](CONTRIBUTING.md) with:
  - local setup requirements
  - command matrix for dev/lint/test/build
  - PR workflow and validation expectations
  - fact-check correction gate (`GO` required before source-data edits)

### Changed
- Updated [README.md](README.md):
  - Quick Start now includes Node.js requirement (`>=20`)
  - added `npm run lint` to baseline verification flow
  - added quality-tooling links (`eslint.config.js`, `stylelint.config.cjs`, `vite.config.js`)
- Updated [docs/INDEX.md](docs/INDEX.md) with a Quality and Tooling section.
- Updated [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) to require `npm run lint` in release validation.
- Removed automatic single-open accordion closing behavior for top-level containers and city profiles.
- Replaced full Font Awesome CSS import with a generated local subset stylesheet that includes only icon classes used in source files.
- Deferred loading of the D3 bubble chart and simulator/fact-check generator modules until their sections are opened, reducing initial JavaScript execution.
- Refactored bubble chart D3 usage to import only required submodules instead of a full namespace import, improving tree-shaking.

### Added
- Added `scripts/generate_fa_subset.mjs` and npm script `npm run gen:fa-subset` to regenerate icon subset CSS safely.

### Notes
- Documentation now matches the current repository tooling and quality gates.

## [0.95.0] - 2026-04-02

### Added
- Added launch-baseline documentation set:
  - `docs/INDEX.md`
  - `CONTRIBUTING.md`
  - `RELEASE_CHECKLIST.md`
  - `CHANGELOG.md`
- Added baseline status line to `public/llms.txt`.

### Changed
- Normalized version markers to `0.95.0` in:
  - `package.json`
  - `package-lock.json`
  - `README.md`
  - `.github/copilot-instructions.md`
  - `src/index.html` release banner copy
- Refreshed `README.md` with documentation map and updated module labels.
- Refreshed `.github/copilot-instructions.md` entry points and fixed `DATA_FLOW.md` references to `public/data/DATA_FLOW.md`.
- Standardized fact-check process wording for pending verification states.

### Notes
- This is a pre-launch baseline with minor refinements pending.
- `_backups/` remains out of scope for this baseline and is intentionally unchanged.


