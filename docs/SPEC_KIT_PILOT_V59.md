# Spec Kit — v5.9 experimental integration

- Baseline: `fix/keyboard-sheet-matte-v55` at `c03f4e9c3b2480d7d5bcd502d278107fe5884469`.
- New isolated branch: `experiment/spec-kit-rashodypro-v59-2026-10-31`.
- Official Spec Kit v1.2.5 Codex skills and template files copied from the successfully installed, CI-verified old pilot `experiment/spec-kit-rashodypro-2026-10-31`.
- Spec: `specs/001-matte-ui-v59/spec.md`.
- The previous pilot on `main` is v5.4; its audit findings are **not** automatically valid for v5.9.
- `.github/workflows/spec-kit-v59-qa.yml` runs current v5.9 source tests, builds an isolated package `ru.rashody.pro.preview59`, uploads QA-only APK; never publishes/releases or modifies the production package.
- Existing v5.9 published preview is independent of this pilot. Android visual QA requires screenshots/device evidence.
