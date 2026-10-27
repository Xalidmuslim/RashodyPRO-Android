import assert from 'node:assert/strict';
import fs from 'node:fs';

const workflow = fs.readFileSync('.github/workflows/build-android.yml', 'utf8');
assert.match(workflow, /permissions:\s*\n\s+contents:\s*write\b/, 'Public release needs scoped contents write permission');
assert.match(workflow, /github\.event\.head_commit\.message[^\n]*\[publish-apk\]/, 'Release must be opt-in; not every main push');
assert.match(workflow, /gh release create deep-matte-v5\.2/, 'One stable GitHub Release must be created');
assert.match(workflow, /RashodyPRO-DeepMatte-v5\.2\.apk/, 'Asset should be a directly downloadable APK');
assert.match(workflow, /android\/app\/build\/outputs\/apk\/debug\/app-debug\.apk/, 'Release must use the APK from the same successful build');
assert.match(workflow, /GITHUB_TOKEN:\s*\$\{\{ secrets\.GITHUB_TOKEN \}\}/, 'Use the GitHub-managed token, not a private key');
console.log('OK: opt-in public APK download without requiring chat attachments');
