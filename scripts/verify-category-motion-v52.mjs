import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync('www/index.html','utf8');
const styles=fs.readFileSync('www/deep-matte.css','utf8');
const workflow=fs.readFileSync('.github/workflows/build-android.yml','utf8');

// Modal transitions must be composited and never break a partially entered
// expense, native storage, browser navigation history or keyboard focus.
assert.match(html,/async function switchCategorySheet\(/, 'Missing expense ↔ category transition');
assert.match(html,/matchMedia\('\(prefers-reduced-motion: reduce\)'\)/, 'Respect Reduce Motion on every transition');
assert.match(html,/\.animate\(/, 'Use the Web Animations API instead of frame-bound timers');
assert.match(html,/\.finished\.catch\(/, 'Interrupted animations should not block category navigation');
assert.match(html,/async function startCatFromTx\(/, 'Switch from expense into category with transition');
assert.match(html,/await switchCategorySheet\(/, 'Await the category transition and preserve controls');
assert.match(html,/modalScrollBeforeCategory\s*=\s*modal\.scrollTop/, 'Restore expense scroll context');
assert.match(html,/aria-pressed="\$\{catDraft\.icon===i\}"/, 'Icon picker must communicate selection');
assert.match(html,/btn\.dataset\.catIcon&&catDraft[\s\S]*?classList\.toggle\('active'/, 'Selecting an icon must not re-render and close the keyboard');
assert.ok(!/btn\.dataset\.catIcon&&catDraft\)\{collectCat\(\);catDraft\.icon=btn\.dataset\.catIcon;renderCatModal\(\)/.test(html),'Legacy icon picker DOM rebuild still present');

// Buttons have cohesive, subtle tactile feedback: only composition-friendly
// properties (opacity / translate) change with press, never expensive shadows.
const start=styles.indexOf('/* v5.2 Control and motion audit');
assert.ok(start>0,'Final button and color tuning layer missing');
const finish=styles.slice(start);
assert.match(finish,/body\.matte-editorial #page button:not\(:disabled\)/,'All main-screen buttons covered');
assert.match(finish,/body\.matte-editorial #modal button:not\(:disabled\)/,'All modal buttons covered');
assert.match(finish,/body\.matte-editorial \.mobile-nav button:not\(:disabled\)/,'Bottom navigation covered');
assert.match(finish,/translate\s*:\s*0\s+1px\s*!important/,'Need physically responsive button press');
assert.match(finish,/\.icon-choice\.active/,'Active icon selection must remain visible');
assert.match(finish,/\.cat-sheet/,'Category sheet opening animation missing');
assert.match(finish,/prefers-reduced-motion:reduce/,'Motion-reduction CSS missing');
assert.ok(!/(?:linear|radial)-gradient\s*\(/.test(finish),'No bright gradient is permitted');
assert.ok(!/transition(?:-property)?\s*:[^;]*(box-shadow|filter)/i.test(finish),'Shadows must never animate on scrolling');
assert.match(workflow,/deep-matte-v5\.2/, 'Publish new version as a separate downloadable APK');
console.log('OK: category return preserving expense state, icon selection, coherent tactile controls and matte color polish');
