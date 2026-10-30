# QA результат — Spec Kit + Расходы PRO v5.9

**Проверяемая ветка:** `experiment/spec-kit-rashodypro-v59-2026-10-31`  
**Исходный базовый коммит v5.9:** `c03f4e9c3b2480d7d5bcd502d278107fe5884469`  
**Проверенный коммит:** `b67e81cfdc24746de5a6a77419a4dcc2f8b83b46`  
**Дата:** 2026-10-31

## Подтверждённые результаты
- [GitHub Actions #41135893413](https://github.com/Xalidmuslim/RashodyPRO-Android/actions/runs/41135893413): статус **completed / success**.
- `npm run verify`: **success** (включая v5.9 UI и IME source-level regression checks).
- Android SDK setup: **success**.
- Generating side-by-side preview with existing `scripts/build-matte-preview-v57.mjs`: **success**.
- `./gradlew assembleDebug`: **success**.
- `aapt dump badging` validation of `ru.rashody.pro.preview59`: **success**.
- Existing app/source immutability check `git diff --exit-code -- www native package.json`: **success**.
- [APK artifact](https://github.com/Xalidmuslim/RashodyPRO-Android/actions/runs/41135893413/artifacts/13016087675) `RashodyPRO-SpecKit-v59-SAFE-PREVIEW` present; GitHub reports artifact ZIP size 4,262,188 bytes. This is an isolated debug preview, not a production release.

## Not verified (do not claim otherwise)
- Installation and operation on a real user's Android device.
- Screenshots/visual comparison, computed CSS, tap target measurements and frame pacing.
- Full transaction persistence, backup/restore and import/export via device interactions.
- Maestro E2E **for v5.9**. Earlier failed Maestro run [#40960992292](https://github.com/Xalidmuslim/RashodyPRO-Android/actions/runs/40960992292) used a different, older QA branch and does not establish a v5.9 bug.

## Preservation and next gate
The branch diff relative to the v5.9 source contains Spec Kit files/instructions, plans and CI only; `www/`, `native/`, `scripts/` and `package.json` were not changed. Do not merge or edit UI until device-based confirmation of actual risks. The baseline is v5.9, not `main` v5.4.
