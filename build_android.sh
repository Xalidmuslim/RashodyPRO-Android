#!/usr/bin/env bash
set -euo pipefail
if ! command -v npm >/dev/null; then echo 'Node.js/npm required'; exit 1; fi
npm install
if [ ! -d android ]; then npx cap add android; fi
node scripts/prepare-android.mjs
npx cap sync android
cd android
chmod +x gradlew
./gradlew assembleDebug
printf '\nAPK: android/app/build/outputs/apk/debug/app-debug.apk\n'
