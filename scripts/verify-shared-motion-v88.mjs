import assert from 'node:assert/strict';
import fs from 'node:fs';
const motion=fs.readFileSync('www/sculpted-motion-v77.js','utf8');
const expressive=fs.readFileSync('www/r86-expressive-motion.js','utf8');
const styles=fs.readFileSync('www/r87-polish.css','utf8');
const index=fs.readFileSync('www/index.html','utf8');

// KPI must expand the SAME colored DOM element, rather than opening a second sheet.
assert.match(motion,/cardSlot\.replaceWith\(source\)/);
assert.match(motion,/card\.classList\.add\('r88-expand-card'\)/);
assert.doesNotMatch(motion,/translate3d\(0,100%,0\)/);
assert.doesNotMatch(motion,/modal\.innerHTML\s*=\s*'<section class="r77-detail-panel"/);
assert.match(motion,/function closeDetail\(fromHistory=false\)/);

// A selected category must originate visually at the selected donut sector.
assert.match(motion,/function transitionSector\(previous,next,details,update\)/);
assert.match(motion,/day-donut-sector\[data-day-chart-category\]/);
assert.match(motion,/selectionToken/);
assert.match(index,/RashodySculptedMotion\?\.transitionSector/);

// Bottom navigation has horizontal-only tab travel and lower static placement.
assert.match(expressive,/function directionalNav\(view,changed\)/);
assert.match(styles,/bottom:calc\(4px \+ env\(safe-area-inset-bottom,0px\)\)/);
assert.match(styles,/\.mobile-nav\s*>\s*button\.fab\s*\{/);
assert.doesNotMatch(expressive,/function liquidNav\(/);
console.log('PASS v8.8 shared-element KPI, donut-origin selection and settled bottom navigation');