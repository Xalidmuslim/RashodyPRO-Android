import fs from 'node:fs';
import assert from 'node:assert/strict';

const html=fs.readFileSync('www/index.html','utf8');
assert.match(html, /<link rel="stylesheet" href="satin-finish\.css">\s*<link rel="stylesheet" href="deep-matte\.css">/, 'Last stylesheet must be deep-matte.css');
const css=fs.readFileSync('www/deep-matte.css','utf8');
for(const name of ['--d4-canvas','--d4-panel','--d4-elev-high','--d4-elev-mid','--d4-elev-small','--d4-elev-dark']) {
 assert.ok(css.includes(name+':'),'Missing material token: '+name);
}
for(const selector of ['.feature-day','.day-ledger','.record-list','.analytics-ring-panel',
 '.settings-grid .panel','.history-tally','.week-day','.mobile-nav','.trend-card.coral',
 '.studio-stats .compare-metric','.color-category-card','#modal.tx-sheet',
 '.tx-amount-block','.r105-key','.cat-choice','.day-donut-svg',
 '.ring svg.ring-svg','.studio-trend-bars .compare-stick']) {
 assert.ok(css.includes(selector),'Missing screen/control depth: '+selector);
}
const noComments=css.replace(/\/\*[\s\S]*?\*\//g,'');
assert.equal((noComments.match(/\{/g)||[]).length,(noComments.match(/\}/g)||[]).length,'Unbalanced stylesheet');
assert.ok(!/linear-gradient\s*\(|radial-gradient\s*\(/i.test(noComments),'Matte surfaces must not use glossy lighting gradients');
assert.ok(!/(?:\bborder\s*:\s*1px\s+solid\s+(?:white|#fff)|\btext-shadow\s*:\s*[1-9])/i.test(noComments),'Artificial rim or text glow returned');
assert.ok((noComments.match(/\bbackground-image\s*:\s*none\s*!important/g)||[]).length>=8,'Gloss is still active in some screens');
assert.ok((noComments.match(/\b0\s+(?:\d+px\s+){2}-\d+px\s+rgba\(/g)||[]).length>=9,'Missing layered cast-shadow system');
assert.match(css,/filter:\s*drop-shadow\(/,'Donut and analytics rings need depth');
assert.ok(!/transition(?:-property)?\s*:[^;]*(?:filter|box-shadow)/i.test(noComments),'Animating expensive shadows is unsafe');
assert.ok(!/(^|[;{}])\s*(?:width|height|overflow|position|grid-template-columns)\s*:/im.test(noComments),'A depth-only pass must not change layout geometry');
assert.match(css,/week-day\.focus-day/,'Selected days need dark readable contrast');
assert.match(css,/prefers-reduced-motion/,'Respect reduced motion');
console.log('OK: deep matte multi-level shadows, no white gradients, cards/plots/forms, layout-safe');
