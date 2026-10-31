import assert from 'node:assert/strict';
import fs from 'node:fs';
const css=fs.readFileSync('www/studio-v70.css','utf8');
for(const selector of [
 'html.rashody-native-android body.matte-editorial #overlay:not([hidden]) #modal.tx-sheet',
 'html.rashody-native-android body.matte-editorial #overlay:not([hidden]) #modal.cat-sheet'
])assert.ok(css.includes(selector),'Missing native Android top-inset constraint for '+selector);
assert.match(css,/max-height:calc\(100dvh - max\(74px,env\(safe-area-inset-top,0px\) \+ 20px\)\)!important/);
assert.match(css,/overflow-y:auto!important/);
assert.match(css,/scroll-padding-bottom:calc\(28px \+ env\(safe-area-inset-bottom,0px\)\)!important/);
assert.match(css,/\.mobile-nav button:not\(\.fab\)\{[^}]*box-shadow:/);
assert.match(fs.readFileSync('native/FinanceStoragePlugin.java','utf8'),/class FinanceStoragePlugin/);
console.log('OK: Android sheet safe-top and scroll clearance; tactile navigation remains');
