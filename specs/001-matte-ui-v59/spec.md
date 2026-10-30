# Spec 001: Matte v5.9 — verify actual rendering before UI edits

**Status:** Analysis only, not permission to rewrite or release.  
**Source baseline:** `fix/keyboard-sheet-matte-v55`, commit `c03f4e9c3b2480d7d5bcd502d278107fe5884469`.  
**Target:** isolated `experiment/spec-kit-rashodypro-v59-2026-10-31`.

## User stories
- As a user, I want all four sections and forms to have the approved deep matte 3D visual language without unreadable labels or glossy controls.
- As a user, I need saved expenses, category management, import/export and navigation preserved.
- As a tester, I need findings confirmed on the **v5.9** package rather than inferred from the old `main` v5.4 styles.

## Functional requirements
- FR-001: Inventory `dashboard()`, `transactions()`, `analytics()`, `settings()`, transaction and category modals, system notification states.
- FR-002: Inspect actual cascade in order: embedded stylesheet, `premium-depth.css`, `satin-finish.css`, `deep-matte.css`, `matte-premium-v57.css`, `matte-director-v58.css`, `matte-polish-v59.css`.
- FR-003: For each suspected issue specify computed CSS, screenshot/device and reproducible steps; classify issues as suspected or confirmed.
- FR-004: Follow existing `npm run verify`, then build **separate preview59** (`ru.rashody.pro.preview59`) using the existing `scripts/build-matte-preview-v57.mjs`. Verify the artifact package with Android `aapt`.
- FR-005: Do not edit UI, Android native financial storage, existing tests, data or published releases during this initial pilot.

## Acceptance
1. Existing v5.9 source and user data are unchanged.
2. Isolated pilot has official Spec Kit v1.2.5 scaffolding + Codex integration.
3. CI checks and preview APK are reported according to actual run outcomes, not predictions.
4. Visual issues remain unconfirmed until emulator/physical-device screenshots and computed styles are inspected.
