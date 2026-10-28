import fs from 'node:fs';
import assert from 'node:assert/strict';
const gradle=fs.readFileSync('android/app/build.gradle','utf8');
const manifest=fs.readFileSync('android/app/src/main/AndroidManifest.xml','utf8');
const strings=fs.readFileSync('android/app/src/main/res/values/strings.xml','utf8');
const html=fs.readFileSync('android/app/src/main/assets/public/index.html','utf8');
assert.match(gradle,/applicationId\s+["']ru\.rashody\.pro\.preview["']/,
 'Preview must install separately from the protected original');
assert.match(gradle,/versionName\s+["']5\.4-preview["']/,
 'Preview Android version must be distinguishable');
assert.match(strings,/Расходы PRO.*ТЕСТ/,
 'Launcher must clearly say this is a test app');
assert.match(html,/Расходы PRO 5\.4 · ТЕСТ · Deep Matte/,
 'Test label must be visible in app settings');
assert.ok(!/android:sharedUserId=/.test(manifest),'No shared uid or access to original user data');
assert.match(manifest,/android:allowBackup="false"/,'Keep existing conservative backup policy');
console.log('OK: preview installs side-by-side, clearly labeled, cannot replace real expense database');
