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


