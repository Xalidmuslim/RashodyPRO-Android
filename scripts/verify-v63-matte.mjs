import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync('www/index.html','utf8');
const css=fs.readFileSync('www/matte-finish-v62.css','utf8');
const original=fs.readFileSync('www/sculptural-restore-v61.css','utf8');
assert.match(html,/const neutralChartColors=\['#a19088','#788e85'/);
assert.match(html,/const categoryColorById=\{food:'#788e85',cafe:'#a19088'/);
assert.match(html,/const explicit=\{food:'#b5c1b8',cafe:'#c5b5ae'/);
assert.match(html,/style="--category-matte:\$\{categoryCardColor\(id\)\}"/);
assert.match(css,/v6\.3 direct source correction:/);
for(const property of ['--p59-coral:#c2afa8','--p59-teal:#b4c2b8','--p59-ochre:#c9beac','--p59-large:0 4px','--p59-medium:0 3px','--p59-small:0 1px']){
 assert.ok(css.includes(property),'Missing v6.3 muted token: '+property);
}
assert.match(css,/\.analytics-controls\.period-controls\{\s*padding:12px 14px!important;/);
assert.match(css,/\.period-controls \.period-toggle,[\s\S]*?margin:0 0 12px!important/);
assert.match(css,/\.color-category-grid \.color-category-card:nth-child\(n\)\{\s*background:var\(--category-matte/);
assert.match(css,/\.studio-stats \.compare-metric\.main,[\s\S]*?\.trend-cards \.trend-card\.coral\{background:var\(--p59-coral\)!important\}/);
assert.match(css,/html\.rashody-native-android body\.matte-editorial #overlay:not\(\[hidden\]\) #modal\.tx-sheet\{\s*max-height:calc\(100dvh - max\(66px/);
assert.match(css,/\.mobile-nav \.fab\{background:#9b837d!important/);
assert.match(css,/\.ring-inner\{[\s\S]*?background:var\(--p59-hero\)!important/);
assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length);
assert.doesNotMatch(css,/(?:linear|radial|conic)-gradient\s*\(/);
const hex=l=>l.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
const light=l=>{let x=hex(l);return .2126*x[0]+.7152*x[1]+.0722*x[2]};
const contrast=(a,b)=>{const x=light(a),y=light(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
for(const tone of ['#c2afa8','#b4c2b8','#c9beac','#b9c9bd','#c5b5ae','#b5c1b8','#d4d9d3','#c5b3ad']){
 assert.ok(contrast('#20343a',tone)>=4.5,'Text below 4.5:1 on '+tone);
}
assert.match(fs.readFileSync('native/FinanceStoragePlugin.java','utf8'),/class FinanceStoragePlugin/);
console.log('OK v6.3 screenshot-driven CSS geometry, muted materials, accessibility, preserved data source');
