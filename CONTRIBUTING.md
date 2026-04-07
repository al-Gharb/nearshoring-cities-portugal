# Contributing

Thank you for contributing to this project.

This repository is a data-driven analysis site, so contributions should prioritize factual accuracy, traceability, and reproducible changes.

## 1. Local Setup

Requirements:
- Node.js >= 20
- npm

Install dependencies:

```bash
npm install
```

## 2. Development Commands

```bash
npm run dev         # local development server
npm run gen:rendered # regenerate rendered snapshots from normalized data
npm run check:rendered # verify rendered snapshots are in sync
npm run lint        # eslint + stylelint
npm run lint:js     # javascript lint only
npm run lint:css    # css lint only
npm run test        # unit tests (vitest)
npm run test:visual # playwright visual checks
npm run test:all    # unit + visual
npm run build       # production build
npm run preview     # preview built output
```

## 3. Branch and PR Workflow

1. Create a focused branch for one change set.
2. Keep commits scoped and descriptive.
3. Before opening a PR, run at minimum:
   - `npm run check:rendered`
   - `npm run lint`
   - `npm run build`
4. If UI, data, or rendering logic changed, also run `npm run test:all` when feasible.
5. In the PR description, include:
   - What changed
   - Why it changed
   - Which files/data sources were updated
   - Validation commands run

## 4. Data Update Rules

Primary data sources are under [public/data/normalized](public/data/normalized):
- [MASTER.json](public/data/normalized/MASTER.json)
- [CITY_PROFILES.json](public/data/normalized/CITY_PROFILES.json)
- [WEBSITE_CONTENT.json](public/data/normalized/WEBSITE_CONTENT.json)
- [COMPENSATION_DATA.json](public/data/normalized/COMPENSATION_DATA.json)

Rules:
- Treat normalized JSON files as the source of truth.
- Avoid duplicating values in JS when data binding is possible.
- After data edits, verify rendering paths using [public/data/DATA_FLOW.md](public/data/DATA_FLOW.md).
- Keep internal/derived metrics clearly identified as methodology outputs.
- Rendered snapshots under [public/data/rendered](public/data/rendered) are generated derivatives, not authoritative input data.
- After changes to [public/data/normalized/MASTER.json](public/data/normalized/MASTER.json) or [public/data/normalized/COMPENSATION_DATA.json](public/data/normalized/COMPENSATION_DATA.json), run `npm run gen:rendered`.
- Do not hand-edit `public/data/rendered/*.json` except emergency recovery; regenerate immediately afterward and verify with `npm run check:rendered`.

## 5. Fact-Check Correction Workflow

Fact-check process docs live in [factchecks/README.md](factchecks/README.md).

Required gate:
- Do not modify source databases from fact-check suggestions until explicit human approval (`GO`).

Expected flow:
1. Generate category prompt from the site.
2. Run the same prompt across multiple engines.
3. Record outputs in the matching [factchecks](factchecks) file.
4. Build consensus and proposed corrections.
5. Wait for explicit `GO`.
6. Apply approved changes in normalized data.
7. Rebuild and verify.

## 6. Editorial and Content Standards

- Prefer precise, verifiable statements over promotional language.
- Use numbers and caveats where relevant.
- Keep claim wording source-free in prompts; source attribution belongs in source registry and fact-check records.
- Preserve Portuguese diacritics in labels and city names.

## 7. Definition of Done

A change is done when:
- Code/data updates are complete and scoped.
- Documentation is updated where behavior/process changed.
- Lint/build pass.
- Relevant tests have been run or explicitly deferred with rationale.
