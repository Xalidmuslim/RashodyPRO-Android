import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html=fs.readFileSync('www/index.html','utf8');
const css=fs.readFileSync('www/studio-v76.css','utf8');
const src=fs.readFileSync('www/premium-stage-v76.js','utf8');
const old=fs.readFileSync('www/premium-motion-v73.js','utf8');
assert.match(html,/<link rel="stylesheet" href="studio-v76\.css">/);
assert.match(html,/<script src="premium-stage-v76\.js" defer><\/script>/);
assert.match(html,/document\.dispatchEvent\(new CustomEvent\('rashody:render'/);
assert.match(html,/duration:980,easing:/,'Remove rapid 205ms navigation fade');
assert.ok(html.indexOf('href="studio-v76.css"')>html.indexOf('href="studio-v75.css"'),'Stage CSS must load last');
assert.match(css,/@property --stage-y/);
assert.match(css,/@property --stage-rx/);
assert.match(css,/\.week-strip \.week-day\.week-day/);
assert.match(css,/\.trend-cards \.trend-card\.trend-card/);
assert.match(css,/\.analytics-ring-panel \.ring/);
assert.match(css,/prefers-reduced-motion:reduce/);
assert.doesNotMatch(src,/setInterval|preventDefault|setPointerCapture|\\.scrollTop\\s*=|innerHTML\\s*=/);
assert.match(old,/press:455,release:1670/);
assert.match(old,/press:470,release:1740/);

const listeners={};let raf=0, pending=new Map(), callLog=[];
const elem=(name,extra={})=>({
 name,isConnected:true,dataset:extra.dataset||{},
 classList:{contains:tag=>extra.active===tag},
 getAttribute:attr=>(extra[attr]??null),
 matches:sel=>name==='day-donut'&&sel.includes('.day-donut'),
 animate(frames,options){callLog.push({name,frames,options});return {finished:Promise.resolve()}},
 querySelector:sel=>extra.querySelector?.(sel)||null,
 querySelectorAll:sel=>extra.querySelectorAll?.(sel)||[],
 textContent:extra.textContent||''
});
let selected=1;
const days=Array.from({length:7},(_,i)=>elem('day'+i,{dataset:{jumpDay:'2026-10-'+String(10+i)},active:i===selected?'focus-day':''}));
const icons=Array.from({length:3},(_,i)=>elem('icon'+i));
const stats=Array.from({length:3},(_,i)=>elem('stat'+i,{querySelector:s=>s==='.trend-icon'?icons[i]:null}));
const sectors=Array.from({length:3},(_,i)=>elem('arc'+i,{r:'65','stroke-dasharray':'100 308'}));
const center=elem('center');
const donut=elem('day-donut',{querySelector:sel=>sel==='.day-donut-center,.ring-inner'?center:null});
const graphic=elem('graphic',{querySelector:()=>donut,querySelectorAll:()=>sectors});
const feature=elem('feature');
const legend=elem('legend');
const root={
 querySelector:sel=>sel==='.feature-copy'?feature:sel==='.day-category-graphic'?graphic:sel==='.week-strip'?{isConnected:true}:null,
 querySelectorAll:sel=>sel==='.week-strip .week-day'?days:sel==='.trend-cards .trend-card'?stats:sel==='.trend-card strong,.compare-metric strong'?stats:sel==='.day-donut-sector,.ring-slice'?sectors:sel==='.day-donut-legend-item'?[legend]:[]
};
const doc={
 hidden:false,
 getElementById:id=>id==='page'?root:null,
 addEventListener:(name,fn)=>listeners[name]=fn
};
const media={matches:false,addEventListener:()=>{}};
const context={
 window:{matchMedia:()=>media},
 document:doc,
 requestAnimationFrame:fn=>{let i=++raf;pending.set(i,fn);return i},
 cancelAnimationFrame:id=>pending.delete(id)
};
vm.runInNewContext(src,context,{filename:'premium-stage-v76.js'});
const render=()=>{listeners['rashody:render']({detail:{view:'dashboard'}});const callbacks=[...pending.values()];pending.clear();callbacks.forEach(fn=>fn())};
render();
assert.equal(callLog.filter(x=>x.name.startsWith('day')&&!x.name.includes('donut')).length,7,'Stagger all 7 calendar days');
assert.equal(callLog.filter(x=>x.name.startsWith('stat')).length,3,'Stage 3 summary cards');
assert.equal(callLog.filter(x=>x.name.startsWith('arc')).length,3,'Draw each SVG donut segment');
assert.ok(callLog.some(x=>x.options.duration>=1900),'Must include cinematic 1.9+ second motion');
assert.ok(callLog.find(x=>x.name==='day6').options.delay>=500,'Calendar must be staggered, not all at once');
const before=callLog.length;render();
assert.equal(callLog.length,before,'No expensive repeat animation on unchanged render');
days[1].classList.contains=()=>false;days[2].classList.contains=t=>t==='focus-day';
render();
assert.ok(callLog.length>before,'Selected day change should animate');
assert.ok(callLog.length-before<18,'Do not restart all 7 dates on a simple selected-day change');
media.matches=true;const after=callLog.length;render();
assert.equal(callLog.length,after,'Respect reduced motion');
assert.match(fs.readFileSync('native/FinanceStoragePlugin.java','utf8'),/class FinanceStoragePlugin/);
console.log('OK v7.6: 7-day cascading reveal, 3 tactile stats, SVG sweep, selection transitions, reduced motion and SQLite');
