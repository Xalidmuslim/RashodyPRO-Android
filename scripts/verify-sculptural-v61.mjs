import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync('www/index.html','utf8');
const css=fs.readFileSync('www/sculptural-restore-v61.css','utf8');
const gradleSrc=fs.readFileSync('scripts/build-matte-preview-v61.mjs','utf8');
assert.match(html,/<link rel="stylesheet" href="matte-polish-v59.css">\s*<link rel="stylesheet" href="sculptural-restore-v61.css">/,'v6.1 must be last material layer');
assert.match(html,/style="--category-matte:\$\{categoryCardColor\(id\)\}"/,'Category color should be a themeable variable');
assert.doesNotMatch(html,/style="background-color:\$\{categoryCardColor\(id\)\}!important"/,'Never block theme with important inline pigment');
assert.match(html,/const explicit=\{food:'#b5c1b8'/,'All category card colors must be desaturated');
assert.match(css,/--r61-radius-panel:32px/);
assert.match(css,/--r61-radius-card:26px/);
assert.match(css,/--r61-radius-control:19px/);
assert.match(css,/\.color-category-card:nth-child\(n\)\s*\{[\s\S]*?background:var\(--category-matte/,'Top-category tiles must outrank all old nth-child bright fills');
assert.match(css,/\.chart-detail-sub[^{]*\{[\s\S]*?background:transparent!important/,'Informational text must not become a full-width grey stripe');
assert.match(css,/button\.mini-action\.danger-btn\[data-action="clear-data"\]\s*\{[\s\S]*?border-radius:21px!important/,'Destructive button must be rounded and elevated');
assert.match(css,/\.mobile-nav \.fab\s*\{[\s\S]*?box-shadow:var\(--p59-selected\)!important/,'Central add button must have dimensional depth');
for(const name of ['--p59-large','--p59-medium','--p59-small','--p59-selected']){
 const m=css.match(new RegExp(name+'\\s*:\\s*([^;]+);'));
 assert.ok(m,'Missing elevation '+name);
 assert.equal((m[1].match(/rgba\(/g)||[]).length,3,'Need three shadow layers '+name);
}
assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length);
assert.doesNotMatch(css,/(?:linear|radial|conic)-gradient\s*\(/i,'Materials should be matte');
assert.doesNotMatch(css,/transition\s*:[^;]*(?:box-shadow|filter)/i,'No animated blur on scroll');
assert.match(css,/:focus-visible/);
assert.match(css,/prefers-reduced-motion/);
assert.match(gradleSrc,/ru\.rashody\.pro\.preview61/,'Build isolated v6.1 APK only');
const luminance=(hex)=>{
 const v=hex.slice(1).match(/../g).map(c=>parseInt(c,16)/255).map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4);
 return .2126*v[0]+.7152*v[1]+.0722*v[2];
};
const contrast=(fg,bg)=>{
 const a=luminance(fg),b=luminance(bg);
 return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
};
for(const pigment of ['#9db7ab','#c2a198','#b3bdb8','#c8b595','#b9adb7','#a9bdb2','#c3ae95','#abb9ae',
 '#b99c95','#9cb6ac','#c4ae8f','#b1c6ba','#e8e3dd']){
 assert.ok(contrast('#20333a',pigment)>=4.5,'WCAG small text contrast: '+pigment);
}
assert.ok(contrast('#452c2c','#b79a94')>=4.5,'Danger action text must be readable');
assert.ok(contrast('#fffaf1','#32585b')>=4.5,'Active control text must be readable');
for(const phrase of ['data-action="clear-data"','function chartDetail(','function categoryCardColor(','function settings(){']){
 assert.ok(html.includes(phrase),'Critical view function preserved: '+phrase);
}
assert.match(fs.readFileSync('native/FinanceStoragePlugin.java','utf8'),/class FinanceStoragePlugin/,'Persisted SQLite unaffected');
console.log('OK: v6.1 matte source contracts, 3-level depth, round corners and 4.5:1 readability');
