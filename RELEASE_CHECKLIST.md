# Release Checklist

Use this checklist before tagging or deploying a release candidate.

## 1. Version and Baseline Consistency

- [ ] `package.json` and `package-lock.json` versions match.
- [ ] README version badge matches package version.
- [ ] Visible site release label in `src/index.html` matches baseline intent.
- [ ] `.github/copilot-instructions.md` project version matches metadata.

## 2. Documentation Integrity

- [ ] `README.md` links to current docs and process files.
- [ ] `docs/INDEX.md` links resolve.
- [ ] Fact-check process language is consistent between:
  - `.github/copilot-instructions.md`
  - `factchecks/README.md`
  - individual `factchecks/*.md` templates/status blocks
- [ ] Dated audit docs are marked as point-in-time evidence, not current validation:
  - `public/data/source-links-audit-2026-02-18.md`
  - `public/data/DATABASE_MATH_AUDIT_2026-02-17.md`
  - `public/data/DATABASE_MATH_AUDIT_EXECUTIVE_2026-02-17.md`

## 3. Build and Test

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] `npm run test` passes (or `npm run test:all` for release-critical updates).
- [ ] Manual smoke-check on local preview (`npm run preview`) if UI text/layout changed.

## 4. Data and Fact-Check Governance

- [ ] Any database edits in `public/data/normalized/` have matching rationale in PR.
- [ ] `WEBSITE_CONTENT.json` `_meta.lastUpdated` is current enough to keep header freshness meaningful.
- [ ] Fact-check correction updates include explicit HITL `GO` approval trail.
- [ ] No internal metrics are presented as externally verified facts.

## 5. Source and Link Quality

- [ ] Internal source anchors (`#src-*`) resolve in `src/index.html`.
- [ ] High-priority source-link audit findings are either fixed or tracked.
- [ ] No accidental direct external links bypassing source registry when a `#src-*` entry exists.

## 6. Commit Hygiene

- [ ] `git status` shows only intended files.
- [ ] Excluded artifacts are not staged (`dist/`, `_backups/`, `tests/visual/__screenshots__/`, temp files).
- [ ] Commit message is baseline-clear and scoped.

## 7. Commit and Tag Hygiene

- [ ] Commit message(s) and PR title are scoped to the release contents.
- [ ] If release is squashed, final commit message is clear and version-appropriate.
- [ ] Release tag annotation summarizes user-visible and data-impacting changes.

## 8. Sign-off

- [ ] Product/content owner sign-off
- [ ] Data verifier sign-off
- [ ] Release owner sign-off

Date: ____________________
Release Tag: ____________________


