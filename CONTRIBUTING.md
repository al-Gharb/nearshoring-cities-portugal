# Contributing

## Scope

This repository combines code, normalized datasets, and process documentation.
Use this guide for docs, data, and code contributions.

## Branch Workflow

1. Branch from `main`.
2. Use a descriptive branch name, for example:
   - `docs/v0.95-baseline-followup`
   - `data/workforce-claim-update`
   - `fix/source-anchor-link`
3. Open a PR with a clear summary and verification notes.

## Commit Conventions

Use Conventional Commits where possible:

- `docs(scope): ...`
- `data(scope): ...`
- `fix(scope): ...`
- `chore(scope): ...`

Examples:

- `docs(v0.95): baseline consistency update`
- `data(workforce): adjust ICT ratio source year`

## Required Checks Before PR

1. `npm run build`
2. `npm run test` (or `npm run test:all` for release-sensitive changes)
3. Verify changed links and paths in touched documentation.
4. Confirm no generated or excluded paths are staged (`dist/`, `_backups/`, visual artifacts).

## Fact-Check and Data Update Policy

The fact-check system is HITL-gated.

1. Generate prompt from site Verification Archive.
2. Run 5 to 6 independent engines.
3. Paste JSONL results into matching file in `factchecks/`.
4. Build consensus matrix and proposed corrections.
5. Wait for explicit human approval (`GO`).
6. Only after `GO`, update source databases in `public/data/normalized/`.

Never apply database corrections without explicit HITL approval.

## Data Editing Notes

- Source of truth is `public/data/normalized/`.
- Check `public/data/DATA_FLOW.md` before editing values that may also appear as hardcoded HTML.
- Keep Portuguese diacritics intact (for example, `Évora`, `Guimarães`, `Covilhã`, `Setúbal`).

## Documentation Updates

When process or architecture changes, update all impacted docs together:

- `README.md`
- `.github/copilot-instructions.md`
- `docs/INDEX.md`
- `factchecks/README.md` (if workflow changes)
- `public/data/DATA_FLOW.md` (if data flow changes)

## Out of Scope for Baseline Docs Work

`_backups/` is historical archive content and should remain untouched unless explicitly scoped.

