import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
const html=fs.readFileSync('www/index.html','utf8');
const css=fs.readFileSync('www/r98-dashboard-refinement.css','utf8');
const js=fs.readFileSync('www/r98-dashboard-motion.js','utf8');
const bundle=fs.readFileSync('scripts/bundle-runtime-theme-v80.mjs','utf8');
const from=html.indexOf('function dashboardV96(){'),to=html.indexOf('function txRow(t){',from);
const dashboard=html.slice(from,to);
assert.ok(from>0&&to>from);
assert.match(dashboard,/class="r96-dashboard r97-dashboard r98-dashboard"/);
assert.doesNotMatch(dashboard,/<header class="r96-brand"/,'No redundant name and settings on dashboard');
assert.doesNotMatch(dashboard,/class="r96-gear"/);
assert.match(dashboard,/r96-summary-side r98-summary-side/);
assert.match(dashboard,/aria-label="Разница доходов и расходов"/,'Financial semantics preserved');
assert.match(dashboard,/data-sculpted-detail="week"/);
assert.match(dashboard,/data-sculpted-detail="daily"/);
assert.match(dashboard,/data-sculpted-detail="max"/);
assert.match(dashboard,/r96-ring/);
assert.match(dashboard,/r96-bar-chart/);
assert.match(dashboard,/data-action="week-prev"/);
assert.match(dashboard,/data-action="week-next"/);
assert.match(dashboard,/\$\{compactWeekWidget\(chosen\)\}/,'Keep original clickable 7-day calendar');
assert.match(html,/src="r98-dashboard-motion\.js" defer/);
assert.match(html,/RashodyDashboardMotion\?\.afterRender\(\{view,period:dashboardPeriodV96\}\)/);
assert.match(css,/\.week-day-meter\{/,'Restore calendar mini-meter');
assert.match(css,/display:block!important;height:3px!important/,'Mini-meter not clipped');
assert.match(css,/\.r96-summary::after\{/,'Remove summary ornament that wastes space');
assert.match(css,/grid-template-rows:78px 94px 72px minmax\(96px,1fr\) 35px 77px!important/,'Fit 6 rows, not 7');
assert.match(css,/max-height:740px/);
assert.match(css,/max-height:605px/);
assert.doesNotMatch(css,/#mobile-nav\b/,'Never touch stable dock layout');
assert.match(bundle,/'r97-one-screen-dashboard\.css','r98-dashboard-refinement\.css'/);
execFileSync('node',['--check','www/r98-dashboard-motion.js']);
const calls=[];
const panels={};
for(const kind of ['.r96-summary','.r96-calendar','.r96-kpis','.r96-spending','.r96-trend','.r97-day-summary','.r96-latest']){
 panels[kind]={animate(frames,options){calls.push({kind,frames,options});return {finished:new Promise(()=>{}),cancel(){}}}};
}
function target(kind,id,attr){
 return {getAttribute:x=>x===attr?.key?attr.val:null,animate(frames,options){calls.push({kind,id,frames,options});return {finished:new Promise(()=>{}),cancel(){}}}};
}
const circles=Array.from({length:3},(_,i)=>target('circle',i,{key:'stroke-dasharray',val:(40+i*35)+' 380'}));
const bars=Array.from({length:5},(_,i)=>target('bar',i));
const root={dataset:{dashboardPeriodActive:'month'},
 querySelector:key=>panels[key]||null,
 querySelectorAll:key=>key.includes('stroke-dasharray')?circles:key.includes('.r96-bar-column')?bars:[]};
const handlers={};
let reduced=false;
const document={hidden:false,readyState:'loading',querySelector:q=>q==='#page .r98-dashboard'?root:null,
 addEventListener(name,cb){handlers[name]=cb;}};
const window={matchMedia:()=>({get matches(){return reduced}})};
vm.runInNewContext(js,{window,document,requestAnimationFrame:fn=>fn()});
assert.equal(typeof window.RashodyDashboardMotion.afterRender,'function');
handlers.DOMContentLoaded();
assert.equal(calls.length,15,'7 section entrances + 3 ring sectors + 5 bars');
assert.ok(calls.filter(a=>a.kind==='circle').every(a=>a.frames[0].strokeDasharray.startsWith('0 ')),'Donut sectors draw without fading');
assert.ok(calls.filter(a=>a.kind==='bar').every(a=>a.frames[0].transform==='scaleY(.025)'),'Bars grow from baseline');
assert.ok(calls.every(a=>!a.kind.includes('nav')),'Bottom dock never animated');
const played=calls.length;
window.RashodyDashboardMotion.afterRender({view:'dashboard',period:'month'});
assert.equal(calls.length,played,'Do not reanimate on daily selection/render');
window.RashodyDashboardMotion.afterRender({view:'transactions',period:'month'});
window.RashodyDashboardMotion.afterRender({view:'dashboard',period:'month'});
assert.equal(calls.length,played*2,'Reanimate on returning to dashboard');
window.RashodyDashboardMotion.afterRender({view:'dashboard',period:'week'});
assert.equal(calls.length,played*3,'Reanimate when period changes');
reduced=true;
window.RashodyDashboardMotion.afterRender({view:'dashboard',period:'day'});
assert.equal(calls.length,played*3,'Respect reduced motion');
execFileSync('node',['scripts/bundle-runtime-theme-v80.mjs'],{stdio:'inherit'});
const compiled=fs.readFileSync('www/r80-theme.css','utf8');
assert.ok(compiled.indexOf('SOURCE: r98-dashboard-refinement.css')>compiled.indexOf('SOURCE: r97-one-screen-dashboard.css'));
console.log('PASS v9.8: no header, mini financial frame, improved calendar, timeline entrance and return, reduced motion, pinned dock untouched');
