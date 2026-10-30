# Plan: Spec Kit on the real v5.9 source

**Branch:** `experiment/spec-kit-rashodypro-v59-2026-10-31`  
**Spec:** [spec.md](spec.md)  
**Evidence:** [audit.md](audit.md)

## Technical context
- Capacitor 8 + HTML/CSS/JavaScript + Android native SQLite bridge.
- Existing final style layer: `www/matte-polish-v59.css`.
- Existing regression suite: `npm run verify`; build: Android Gradle with Node 22 and Java 21.
- Production package `ru.rashody.pro` is protected; preview uses `ru.rashody.pro.preview59`.

## Constitution checks
- [x] Code baseline is existing v5.9 HEAD, not old `main`.
- [x] Existing Android skills, UI and data are not overwritten.
- [x] No partial CSS refactor or migration.
- [ ] Device screenshots and actual UI regression are not completed.
- [ ] Preview CI is pending verification of its run and APK artifact.

## Procedure
1. Verify Spec Kit files and branch diff; only `.specify/`, new Spec Kit skill files, project instructions, docs and isolated CI workflow may change.
2. Execute existing `npm run verify` and separate v5.9 Android preview build in CI; record build outcome and package.
3. Record screenshots/computed properties from v5.9 on emulator or physical Android device.
4. Write reproduction test for confirmed defect; make a targeted fix in a separate branch/PR with approved comparison.
5. Re-run tests and check storage, navigation, dialogs, contrast and scroll; do not merge into production automatically.
