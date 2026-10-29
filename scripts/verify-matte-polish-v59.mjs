import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync('www/index.html','utf8');
const css=fs.readFileSync('www/matte-polish-v59.css','utf8');
const legacy=fs.readFileSync('www/matte-director-v58.css','utf8');
const manifest=JSON.parse(fs.readFileSync('package.json','utf8'));
assert.match(html,/<link rel="stylesheet" href="matte-director-v58\.css">\s*<link rel="stylesheet" href="matte-polish-v59\.css">/,
 'Final matte layer must load after v5.8');
assert.match(html,/<meta name="theme-color" content="#bfbbb4">/,'Status bar pigment must match ground');
assert.ok(manifest.scripts.verify.includes('verify-matte-polish-v59.mjs'),'New QA must run in npm verify');
assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,'Balanced CSS');
assert.doesNotMatch(css,/(?:linear|radial|conic)-gradient\s*\(/i,'No reflective gradients');
assert.doesNotMatch(css,/\b(?:border|outline)(?:-color)?\s*:\s*(?:white|#fff|rgba\(\s*255)/i,
 'No white contours (focus accessibility excepted)');
assert.doesNotMatch(css,/transition\s*:[^;]*(?:box-shadow|filter)/i,'Do not animate paint-heavy shadow property');
for(const k of [
 '--p59-ground','--p59-panel','--p59-hero','--p59-control',
 '--p59-recess','--p59-coral','--p59-teal','--p59-ochre',
 '--p59-sage','--p59-large','--p59-medium','--p59-small','--p59-selected'
]) assert.ok(css.includes(k+':'),'Missing v5.9 material token '+k);
for(const k of ['--p59-large','--p59-medium','--p59-small','--p59-selected']){
 const shadow=css.match(new RegExp(k+'\\s*:\\s*([^;]+);'));
 assert.ok(shadow,'Missing shadow '+k);
 assert.equal((shadow[1].match(/rgba\(/g)||[]).length,3,
  'Every raised surface needs three physical shadow distances: '+k);
 assert.doesNotMatch(shadow[1],/inset|255\s*,\s*255\s*,\s*255/,
  'Raised surfaces cannot fake a white highlight: '+k);
}
for(const control of [
 '.feature-day','.day-ledger','.record-list','.trend-cards .trend-card.coral',
 '.trend-cards .trend-card.teal','.trend-cards .trend-card.amber',
 '.day-donut-svg','.ring-svg','.day-donut-center','.legend-line',
 '.settings-grid .settings-actions button','.category-manage button',
 '.history-tally','.search','.switch-track',
 '.r105-key','.cat-choice','.tx-amount-block',
 '.mobile-nav .fab','.analytics-trend-panel'
]) assert.ok(css.includes(control),'v5.9 missing cross-screen component '+control);
assert.match(css,/html\.rashody-native-android body\.matte-editorial::before/,
 'Opaque status bar protection prevents Android edge-to-edge bleed');
assert.match(css,/scroll-padding-bottom:140px/,'Scroll content must clear floating dock');
assert.match(css,/body\.matte-editorial::after\s*\{content:none!important/,
 'Remove GPU-heavy full-screen grain veil');
assert.match(css,/@media\(max-width:380px\)/,'Verify narrow-screen label accommodation');
assert.match(css,/:focus-visible/,'Keep accessible keyboard focus');
assert.match(css,/prefers-reduced-motion/,'Respect motion preferences');
for(const name of ['async function switchCategorySheet','async function settleModalKeyboard','function renderTxModal']){
 assert.ok(html.includes(name),'Keep established keyboard and category handling: '+name);
}
assert.match(fs.readFileSync('native/FinanceStoragePlugin.java','utf8'),
 /class FinanceStoragePlugin/,'Native SQLite remains');
assert.match(legacy,/--p58-hero:/,'v5.8 fallback stays intact');
console.log('OK: v5.9 status bar, true 3-stage shadows, flat pigments, consistent controls, data isolation');
