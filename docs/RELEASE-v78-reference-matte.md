# Reference Matte v7.8 — implementation record

Base: v7.7 (f3f14a27), isolated preview branch.

- New warm cream, sage/forest, muted terracotta visual system with sculpted layered static shadows.
- Dashboard header shows the product name, subtitle and generated matte PNG coin stack, no search or notification controls.
- Seven-day selector remains interactive and driven by existing financial data.
- KPI cards are horizontal; existing FLIP detail panels and their timing are preserved.
- Selected-day hero arranges live values on the left and interactive SVG donut on the right; category legend carries real alpha PNG icons.
- Transaction list, bottom navigation and backgrounds match the visual reference.
- Page navigation alone adds 760ms 3D perspective rotation; reduced-motion is respected.
- The app's financial calculations, SQLite schema, native Android bridge and existing screens are not migrated or replaced.

Build target: ru.rashody.pro.preview78, an independent debug APK. Installing it does NOT update or migrate production data.

Verification: baseline npm run verify; verify-reference-v78; Android SDK 36 debug build; ZIP and APK identity/PNG checks.
Device-only QA still needed: screen sizes, fonts, keyboard inset, navigation gestures and frame-time measurement.
