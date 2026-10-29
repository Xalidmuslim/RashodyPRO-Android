# Maestro — Android E2E

Tests run against the real Capacitor Android APK on an isolated emulator.

## Covered (initial smoke suite)
- App dashboard and Add Expense modal.
- Navigation to Analytics and Settings.

**Not covered yet:** adding/editing/deleting transactions, category management, totals, import/export, backup integrity and all buttons. Extend with deterministic emulator fixtures before asserting these paths.

## Local command
Generate the Android project and build the debug APK using the existing `build_android.sh` workflow, install on an emulator and run:

```sh
maestro test .maestro
```

CI: `.github/workflows/maestro-e2e.yml` (manual or pull requests).
`clearState: true` erases app data on the selected device. **Use only a disposable emulator**, not a phone with real finance records.

No design, storage plugin or release APK is modified by this test addition.
