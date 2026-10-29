import assert from 'node:assert/strict';
import fs from 'node:fs';
const index=fs.readFileSync('www/index.html','utf8');
const css=fs.readFileSync('www/matte-director-v58.css','utf8');
const base=fs.readFileSync('www/matte-premium-v57.css','utf8');
const pack=JSON.parse(fs.readFileSync('package.json','utf8'));
assert.match(index,/<link rel="stylesheet" href="matte-premium-v57\.css">\s*<link rel="stylesheet" href="matte-director-v58\.css">/,'Director layer must be after v5.7');
assert.ok(pack.scripts.verify.includes('verify-director-v58.mjs'),'Register v5.8 QA in npm verify');
assert.ok(base.includes('--p57-hero:'),'Keep v5.7 fallback for older Android WebView');
assert.doesNotMatch(css,/(?:linear|radial|conic)-gradient\s*\(/i,'No sheen or luminous gradient');
assert.doesNotMatch(css,/\b(?:border|outline)(?:-color)?\s*:\s*(?:white|#fff|rgba\(\s*255)/i,'No white contour');
assert.doesNotMatch(css,/transition\s*:[^;]*(?:box-shadow|filter)/i,'No paint-heavy shadow animation');
assert.doesNotMatch(css,/\b(?:animation|will-change)\s*:\s*[^;]*(?:box-shadow|filter)/i,'Shadows cannot animate');
assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,'Balanced CSS braces');
for (const token of ['--p58-ground','--p58-panel','--p58-panel-hero','--p58-control',
 '--p58-recess','--p58-coral','--p58-teal','--p58-ochre','--p58-sage',
 '--p58-hero','--p58-card','--p58-key','--p58-active','--p58-well']) {
 assert.ok(css.includes(token+':'),'Missing unified material token '+token);
}
for (const token of ['--p58-hero','--p58-card','--p58-key','--p58-active']) {
 const x=css.match(new RegExp(token+'\\s*:\\s*([^;]+);'));
 assert.ok(x,token);
 assert.equal((x[1].match(/rgba\(/g)||[]).length,3,'Raised shadow needs 3 real distances: '+token);
 assert.doesNotMatch(x[1],/inset|255\s*,\s*255\s*,\s*255/,'Raised shadow must not mimic white emboss');
}
for(const selector of [
 '.feature-day','.day-ledger','.record-list','.trend-card.coral',
 '.trend-card.teal','.trend-card.amber','.analytics-ring-panel',
 '.day-donut-svg','.ring-svg','.day-donut-center','.ring-inner',
 '.week-day.focus-day','.mobile-nav','.mobile-nav .fab',
 '.history-tally','.search','.filter-select','.period-toggle',
 '.settings-actions button','.category-manage button',
 '.r105-key','.tx-quick-amount > button','.cat-choice',
 '.settings-grid .panel','.feature-link','.ledger-actions',
 '.day-donut-legend','.record-amount','.history-tally strong',
 '.font-toggle','.analytics-trend-panel'
]) assert.ok(css.includes(selector),'Missing v5.8 coverage: '+selector);
assert.match(css,/@media\s*\(max-width:\s*380px\)/,'Small screens must fit labels');
assert.match(css,/:focus-visible/,'Preserve accessible focus affordance');
assert.match(css,/prefers-reduced-motion/,'Honor motion preference');
assert.match(index,/async function switchCategorySheet\(/,'Category animation must remain');
assert.match(index,/async function settleModalKeyboard\(/,'Keyboard handling must remain');
assert.match(index,/function renderTxModal\(/,'Transaction editor must remain');
assert.match(fs.readFileSync('native/FinanceStoragePlugin.java','utf8'),/class FinanceStoragePlugin/,'Storage must remain native');
console.log('OK: v5.8 director material system, three-stage shadows, no gloss, narrow-screen text and unchanged data flow');
