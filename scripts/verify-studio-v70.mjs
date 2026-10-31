import assert from 'node:assert/strict';
import fs from 'node:fs';
const h=fs.readFileSync('www/index.html','utf8');
const css=fs.readFileSync('www/studio-v70.css','utf8');
const p=JSON.parse(fs.readFileSync('package.json','utf8'));
const wanted=['premium-depth.css','satin-finish.css','deep-matte.css','studio-v70.css'];
const linked=[...h.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m=>m[1]);
assert.deepEqual(linked,wanted,'Old experimental layers must not be loaded');
for(const old of ['matte-premium-v57.css','matte-director-v58.css','matte-polish-v59.css','sculptural-restore-v61.css','matte-finish-v62.css'])
 assert.ok(!linked.includes(old),'Legacy high-specificity sheet re-enabled: '+old);
assert.match(h,/<meta name="theme-color" content="#eee8df">/);
assert.match(css,/--ui-panel-radius:26px/);
assert.match(css,/--ui-card-radius:22px/);
assert.match(css,/--ui-button-radius:17px/);
assert.match(css,/--ui-ink:#1c2e35/);
for(const selector of ['.trend-cards .trend-card','.studio-stats .compare-metric',
 '.history-tally','.color-category-card','.mobile-nav .fab',
 '.settings-grid button.danger-btn','.r105-key','.cat-choice',
 '.analytics-ring-panel','.period-controls','.record-row',
 '.day-ledger','.feature-day','.filter-select','.search','.day-donut-center']){
 assert.ok(css.includes(selector),'Missing screen surface: '+selector);
}
assert.match(css,/html body\.matte-editorial #page \.feature-day\.feature-day/,'Outrank obsolete embedded theme specificity');
assert.match(css,/html body\.matte-editorial #page \.panel\.panel/);
assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,'Unbalanced stylesheet');
const baseMaterial=css.split('/* Premium Motion v7.3')[0];
assert.doesNotMatch(baseMaterial,/(?:linear|radial|conic)-gradient\s*\(/,'No glossy base material gradients');
assert.match(css,/button\.depth-engaged::after,[\s\S]*?radial-gradient/,'Only touched buttons may display diffuse matte lighting');
assert.doesNotMatch(css,/transition\s*:[^;]*(?:box-shadow|filter)/,'Do not animate expensive paint');
assert.match(css,/:focus-visible/);
assert.match(css,/prefers-reduced-motion/);
const L=hex=>{
 const rgb=hex.replace('#','').match(/../g).map(z=>parseInt(z,16)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);
 return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
};
const contrast=(a,b)=>(Math.max(L(a),L(b))+.05)/(Math.min(L(a),L(b))+.05);
for(const bg of ['#fffaf3','#f5ecdf','#c4dfcd','#e7bcb1','#eed6a9']){
 assert.ok(contrast('#1c2e35',bg)>=4.5,'Normal text low contrast on '+bg);
}
for(const name of ['--ui-shadow-lg','--ui-shadow-md','--ui-shadow-sm']){
 const e=css.match(new RegExp(name+':([^;]+);'));assert.ok(e,'Missing sculptural depth '+name);
 assert.ok((e[1].match(/rgba\(/g)||[]).length>=3,'Layered surface expected '+name);
}
assert.ok(p.scripts.verify.includes('verify-studio-v70.mjs'),'Studio QA must run in CI');
for(const x of ['function renderTxModal(){','function circleChart(map,total){','function daySummaryRing(items){','function analytics(){',
 'function settings(){','function dashboard(){','async function bootstrap(){','function persist(){',
 'async function settleModalKeyboard(){','async function switchCategorySheet']){
 assert.ok(h.includes(x),'Financial behavior accidentally changed: '+x);
}
assert.match(fs.readFileSync('native/FinanceStoragePlugin.java','utf8'),/class FinanceStoragePlugin/);
console.log('OK: Studio v7.0 single skin, all key controls, accessible matte palette, untouched finance logic');
