import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const html=fs.readFileSync('www/index.html','utf8');
const css=fs.readFileSync('www/satin-finish.css','utf8');
assert.match(html, /<link rel="stylesheet" href="premium-depth\.css">\s*<link rel="stylesheet" href="satin-finish\.css">/, 'Satin styles must override earlier finish');
for (const selector of [
  '#page .trend-card.coral',
  '#page .trend-card.teal',
  '#page .trend-card.amber',
  '#page .studio-stats .compare-metric',
  '#page .color-category-card',
  '#page .feature-day',
  '#page .day-ledger',
  '#page .record-list',
  '#page .day-donut-svg',
  '#page .analytics-ring-panel .ring-svg',
  '#page .studio-trend-bars .compare-stick',
  '#page .day-donut-center'
]) {
  assert.ok(css.includes(selector), 'Finish not applied to '+selector);
}
for (const token of ['--satin-paper','--satin-ink','--satin-elevation']) {
  assert.ok(css.includes(token+':'), 'Missing token '+token);
}
assert.match(css, /filter:\s*drop-shadow\(/, 'SVG donut must cast a soft shadow');
assert.match(css, /\.ring-svg[\s\S]*?filter:\s*drop-shadow\(/, 'Analytics ring shadow missing');
assert.ok(!/border:\s*1px\s+solid\s+(?:white|#fff|rgba\(255,255,255)/i.test(css), 'Do not reintroduce painted white outlines');
assert.ok(!/text-shadow\s*:/i.test(css), 'Text must stay sharp');
assert.ok(!/transition(?:-property)?\s*:[^;]*(?:filter|box-shadow)/i.test(css), 'Do not animate shadow filters while scrolling');

// Contrast test: all category-specific surfaces must have sufficiently light
// midtones for near-black type, including custom-category fallback.
const start=html.indexOf('function categoryCardColor(id){');
const end=html.indexOf('\nfunction pluralOperations',start);
assert.ok(start!==-1&&end>start,'Category visual palette not found');
const raw=html.slice(start,end);
const context={neutralChartColors:['#579F98','#CF7864','#244D58'], categoryColor:()=> '#579F98'};
vm.createContext(context);
vm.runInContext(raw,context);
const bg=['food','cafe','transport','home','health','fun','shop','other','custom'].map(id=>vm.runInContext('categoryCardColor('+JSON.stringify(id)+')',context));
const luminance=hex=>{
 const t=hex.match(/^#([0-9a-f]{6})$/i);
 assert.ok(t,'Not a color: '+hex);
 const rgb=[0,2,4].map(i=>parseInt(t[1].slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4));
 return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
};
const ink=luminance('#192e35');
for(const color of bg) {
 const contrast=(luminance(color)+.05)/(ink+.05);
 assert.ok(contrast>=4.5, 'Black-on-category-card contrast too low: '+color+' / '+contrast.toFixed(2));
}
assert.match(css,/color:\s*var\(--satin-ink\)\s*!important/, 'Card text must be dark');
assert.ok((css.match(/background-image:/g)||[]).length>=12,'Not enough matte material variation');
console.log('OK: satin matte surfaces, dark legible card text and static donut shadows');
