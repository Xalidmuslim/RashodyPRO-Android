// v9.1 regression: one nav animation owner, reversible KPI morph, opaque chart motion.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
const read = path => fs.readFileSync(path, 'utf8');
const card = read('www/sculpted-motion-v77.js');
const legacy = read('www/premium-motion-v73.js');
const nav = read('www/r86-expressive-motion.js');
const css = read('www/r87-polish.css');
for (const path of ['www/sculpted-motion-v77.js','www/premium-motion-v73.js','www/r86-expressive-motion.js'])
  execFileSync('node',['--check',path]);
assert.match(legacy,/if\(group\?\.classList\.contains\('mobile-nav'\)\)return;/,
  'Legacy depth motion must not independently animate the mobile dock');
assert.match(nav,/navRelease\?\.cancel\(\)/,
  'Cancel outgoing press animation before directional tilt begins');
assert.match(card,/animation=row\.animate\(/,
  'Individual KPI rows animate without moving the source card');
assert.match(card,/Promise\.all\(exits\)\.then\(finish,finish\)/,
  'Closing returns each row to its origin even during partial opening');
assert.doesNotMatch(card,/modal\.appendChild\(card\)/,
  'Do not move the source KPI into an enlarged enclosing panel');
assert.match(card,/duration:960/,
  'Individual rows must move slowly enough to see their full travel');
assert.match(card,/duration:7[2-9]0/,
  'Chart transform must have a deliberate, visible duration');
assert.doesNotMatch(card,/opacity:\.22,borderRadius:'50%'/,
  'Category panel must not appear as a transparent ghost');
assert.match(css,/height:calc\(74px \+ env\(safe-area-inset-bottom,0px\)\)!important/,
  'Dock height must not collapse when tab state updates');
console.log('PASS v9.1: reversible KPI, steady dock, single tilt owner, opaque category transition');
