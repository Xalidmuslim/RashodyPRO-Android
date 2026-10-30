# First-pass v5.9 audit — not a screenshot review

**Baseline:** `c03f4e9c3b2480d7d5bcd502d278107fe5884469` (29 October 2026). Static source checks only.

## Evidence about versions
The old Spec Kit pilot `experiment/spec-kit-rashodypro-2026-10-31` starts from `main` (`2c4189f...`), whose preview is v5.4. The separate v5.9 source branch is 50 commits ahead of `main`. Therefore **the v5.4 risk list cannot be treated as a v5.9 bug list**.

## Grounded v5.9 observations
- `package.json` extends `npm run verify` with checks for v5.7/v5.8/v5.9 and keyboard handling.
- `www/index.html` imports `matte-premium-v57.css`, `matte-director-v58.css` and `matte-polish-v59.css` after the older three CSS files.
- `www/matte-polish-v59.css` explicitly covers `.color-category-grid .color-category-card`, `.clear-history-filters`, `.r105-key`, `.day-donut-caption`, navigation and system alerts. Some suspected v5.4 styling gaps may already be addressed. This is **not** proof of final computed CSS.
- v5.9 existing GitHub Actions run `40930610863` passed; v5.9 QA preview package ID is `ru.rashody.pro.preview59`.
- Maestro run `40960992292` failed on `Element not found: Text matching regex: Операции` after saving an expense. **That run belongs to `qa/maestro-e2e-2026-10-30` (based on the old main), not to the v5.9 branch.** It must not be reported as a confirmed v5.9 defect.

## Required device checks
1. Collect equivalent screenshots for Обзор, Операции, Аналитика, Настройки, addition/edit and category dialogs; include narrow screen 360 px and increased font scale.
2. Inspect computed backgrounds on analytical cards; evaluate inline `!important` vs last v5.9 styles; do not strip category identities by default.
3. Measure actual clickable bounds for keypad keys, quick amounts and filter reset; source hints are not enough.
4. Check diagram caption readability and labels with lengthy category names.
5. Check storage failure banner visibility and backup action without touching real user finances.
6. Reproduce or dismiss Maestro step failures **on the v5.9 isolated package**, not an old QA branch.

## Scope and QA
No UI, storage or performance code changes in this pilot; tests on an actual device are outstanding. Do not call this an approved redesign or completed regression test.
