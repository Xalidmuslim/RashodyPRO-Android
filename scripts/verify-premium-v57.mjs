import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync('www/index.html','utf8');
const css=fs.readFileSync('www/matte-premium-v57.css','utf8');
const deep=fs.readFileSync('www/deep-matte.css','utf8');

assert.match(html,/<link rel="stylesheet" href="deep-matte\.css">\s*<link rel="stylesheet" href="matte-premium-v57\.css">/,
  'Premium matte CSS must load after historical skins');
assert.ok(deep.includes('matte-depth-v56'),'Keep established layered-shadow fallback');
assert.match(css,/--p57-hero:/,'Missing hero shadows');
assert.match(css,/--p57-card:/,'Missing card shadows');
assert.match(css,/--p57-key:/,'Missing tactile button shadows');
assert.match(css,/--p57-well:/,'Missing recessed input material');
for(const key of ['--p57-hero','--p57-card','--p57-key','--p57-active']) {
 const m=css.match(new RegExp(key+'\\s*:\\s*([^;]+);'));
 assert.ok(m,'No shadow token '+key);
 assert.equal((m[1].match(/rgba\(/g)||[]).length,3,'Use 3 believable shadow distances in '+key);
 assert.doesNotMatch(m[1],/inset|255\s*,\s*255\s*,\s*255/,'Raised shadows must not draw specular rims');
}
assert.doesNotMatch(css,/(?:linear|radial|conic)-gradient\s*\(/i,'Matte material layer cannot add glossy gradients');
assert.doesNotMatch(css,/\bborder(?:-color)?\s*:\s*(?:#fff(?:fff)?|white|1px solid white)/i,
 'Do not paint white decorative borders');
assert.doesNotMatch(css,/transition\s*:[^;]*box-shadow/i,'Do not animate expensive shadow paints');
for(const selector of [
 '.trend-card.coral','.trend-card.teal','.trend-card.amber',
 '.feature-day','.day-donut-svg','.day-donut-center','.day-donut-legend',
 '.day-ledger','.ledger-actions','.repeat-inline','.record-amount',
 '.mobile-nav','.mobile-nav .fab','.week-day.focus-day',
 '.history-tally','.analytics-ring-panel','.settings-grid .panel',
 '.period-toggle','.font-toggle','.category-manage button',
 '#modal.tx-sheet','#modal.cat-sheet','.r105-key','.tx-quick-amount > button',
 '.tx-category-search','.category-picker .cat-choice','.field input'
]) assert.ok(css.includes(selector),'Missing v5.7 style coverage: '+selector);
const cssBlocks=(css.match(/\{/g)||[]).length;
assert.equal(cssBlocks,(css.match(/\}/g)||[]).length,'Unbalanced CSS blocks');
assert.match(css,/prefers-reduced-motion/,'Motion accessibility fallback required');
assert.match(css,/:focus-visible/,'Keep non-decorative accessible focus');
const viewportHandler=html.slice(html.indexOf('const onViewportChange='),html.indexOf("window.visualViewport.addEventListener('resize'"));
assert.ok(viewportHandler.includes('syncModalViewport()'),'Keep viewport sync during native keyboard resize');
assert.doesNotMatch(viewportHandler,/keepModalBackgroundStationary|scrollTo\s*\(/,
 'Do not forcibly scroll on each Android IME frame');
assert.match(html,/if\(Math\.abs\(window\.scrollY-y\)>1\)window\.scrollTo/,
 'Restore scroll only after overlay closes and only if the position changed');
assert.match(css,/html\.rashody-native-android body\.matte-editorial #overlay:not\(\[hidden\]\)\s*\{\s*transition:none!important/,
 'Avoid double-easing native keyboard resize and CSS height');
assert.match(html,/async function switchCategorySheet\(/,'Preserve category transition');
assert.match(html,/async function settleModalKeyboard\(/,'Preserve keyboard settlement logic');
assert.match(html,/function renderTxModal\(/,'Preserve expense flow');
console.log('OK: v5.7 matte materials, 5 screens, typography, category motion and keyboard no-snap contracts');
