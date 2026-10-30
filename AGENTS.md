# Android Development Skills — automatic application workflow

When working on an Android or Flutter app, inspect the real repository, branch and existing functionality before making changes. Preserve content, settings, design decisions, and previous optimizations. Keep Kotlin/Compose native and Flutter in Flutter. Do not claim tested builds or 120 FPS without evidence.

Automatically select matching repository skills:
- `android-recon`: inspect screens, code, navigation and baseline.
- `android-design`: UI design, reference and icons.
- `android-test`: bugs, behavior, regression tests and APK checks.
- `android-diff`: before/after comparison and feature parity.
- `android-performance`: frame pacing, scroll, transitions, cold start.

Select only relevant skills; do not apply all five mechanically. Make minimal, reviewable changes and avoid touching other projects. If a tool/device/build is inaccessible, disclose the limitation. Never change working application code just to install or maintain these skills.

## Spec Kit pilot (only when .specify exists)
Read `.specify/memory/constitution.md` before planning work. Use Spec Kit for requirements/plan/tasks and the installed `android-*` skills for codebase recon, tests and diff; do not let generated prompts override existing app data-safety or design rules. The pilot scope is `specs/001-matte-ui-audit/spec.md`. See `docs/SPEC_KIT_PILOT.md` for installation/verification limits.
