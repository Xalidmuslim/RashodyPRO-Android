import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

const html=fs.readFileSync('www/index.html','utf8');
const css=fs.readFileSync('www/studio-v76.css','utf8');
const motion=fs.readFileSync('www/premium-motion-v76.js','utf8');
const oldMotion=fs.readFileSync('www/premium-motion-v73.js','utf8');
execFileSync('node',['--check','www/premium-motion-v76.js'],{stdio:'inherit'});
assert.match(html,/<link rel="stylesheet" href="studio-v76\.css">/);
assert.match(html,/<script src="premium-motion-v76\.js" defer><\/script>/);
assert.match(html,/window\.RashodyGrandMotion\?\.afterRender\(\{view\}\)/);
assert.ok(html.indexOf('href="studio-v75.css"')<html.indexOf('href="studio-v76.css"'));
assert.match(css,/\.calendar-shell \.week-strip \.week-day/);
assert.match(css,/\.trend-cards \.trend-card/);
assert.match(css,/\.day-donut-sector/);
assert.match(css,/\.studio-stats \.compare-metric/);
assert.match(css,/\.analytics-ring-panel/);
assert.match(css,/prefers-reduced-motion/);
assert.match(motion,/strokeDasharray:'0 '/);
assert.match(motion,/duration:1510/);
assert.match(motion,/duration:1200,delay:i\*108/);
assert.match(motion,/duration:1390|,1390/);
assert.match(motion,/generation!==state\.generation/);
assert.match(motion,/window\.addEventListener\('pointerdown'/);
assert.match(oldMotion,/release:1430/);
assert.match(oldMotion,/release:1570/);
assert.doesNotMatch(motion,/preventDefault|stopPropagation|setPointerCapture|setInterval/);

const calls=[],events={};
let screen='dashboard',reduced=false;
const media={get matches(){return reduced},addEventListener(){}};
const node=(name,attr={})=>({
 name,
 getAttribute:key=>attr[key]??null,
 animate:(frames,options)=>{
  calls.push({name,frames,options});
  return {finished:new Promise(()=>{}),cancel(){calls.push({name:'cancel:'+name})}};
 },
 querySelector:()=>null,querySelectorAll:()=>[]
});
const days=Array.from({length:7},(_,i)=>{
 const m=node('meter'+i);
 return {...node('day'+i,{'data-jump-day':'2026-10-'+String(i+1).padStart(2,'0')}),
 querySelector:q=>q==='.week-day-meter-fill'?m:null};
});
const stats=Array.from({length:3},(_,i)=>{
 const n=node('stat-icon'+i);
 return {...node('stat'+i),querySelector:q=>q==='.trend-icon'?n:null};
});
const sectors=[node('arc0',{'stroke-dasharray':'140 268.407'}),node('arc1',{'stroke-dasharray':'82 326.407'})];
const chartSvg={...node('chartSvg'),querySelectorAll:q=>q==='.day-donut-sector'?sectors:q==='.ring-slice'?sectors:[]};
const chartCenter=node('chartCenter');
const donut={...node('donut'),querySelector:q=>q==='svg'?chartSvg:q==='.day-donut-center'?chartCenter:null};
const ring={...node('analyticsRing'),querySelector:q=>q==='svg'?chartSvg:q==='.ring-inner'?chartCenter:null};
const week={querySelectorAll:()=>days};
const first={getAttribute:()=>days[0].getAttribute('data-jump-day')};
const overview={
 querySelector:q=>q==='.week-strip'?week:q==='.week-day.focus-day'?first:
  q==='.day-donut'?donut:q==='.feature-day'?node('feature'):null,
 querySelectorAll:q=>q==='.week-strip .week-day'?days:
 q==='.trend-cards .trend-card'?stats:
 q==='.day-donut-legend-item'?[node('legend0'),node('legend1')]:[]
};
const caption={textContent:'Октябрь 2026 г.'};
const analytics={
 querySelector:q=>q==='.analytics-controls .period-caption'?caption:
 q==='.analytics-ring-panel .ring'?ring:
 q==='.analytics-ring-panel'?node('ringPanel'):null,
 querySelectorAll:q=>q==='.studio-stats .compare-metric'?stats:
 q==='.compare-stick'?[node('bar0'),node('bar1')]:
 q==='.analytics-ring-panel .legend-line'?[node('legend0')]:[]
};
const document={
 get hidden(){return false},
 getElementById:()=>screen==='dashboard'?overview:analytics,
 addEventListener:(event,fn)=>{events['doc:'+event]=fn}
};
const window={
 matchMedia:()=>media,
 addEventListener:(event,fn)=>{events['win:'+event]=fn}
};
vm.runInNewContext(motion,{window,document,requestAnimationFrame:fn=>(fn(),1),console});
assert.ok(window.RashodyGrandMotion?.afterRender);
window.RashodyGrandMotion.afterRender({view:'dashboard'});
assert.equal(calls.filter(x=>/^day\d/.test(x.name)).length,7,'All 7 calendar days must animate');
assert.equal(calls.filter(x=>/^stat\d/.test(x.name)).length,3,'Three statistic cards must enter');
assert.equal(calls.filter(x=>/^stat-icon/.test(x.name)).length,3,'Three statistic pictograms must rise');
assert.ok(calls.some(x=>x.name==='arc0'&&x.options.duration>=1400));
assert.ok(calls.some(x=>x.name==='chartSvg'&&x.options.duration>=1500));
const firstCount=calls.filter(x=>!x.name.startsWith('cancel:')).length;
window.RashodyGrandMotion.afterRender({view:'dashboard'});
assert.equal(calls.filter(x=>!x.name.startsWith('cancel:')).length,firstCount,'No entry choreography on an identical re-render');
screen='analytics';
window.RashodyGrandMotion.afterRender({view:'analytics'});
assert.ok(calls.some(x=>x.name==='bar0'&&x.options.duration>=1200));
assert.ok(calls.some(x=>x.name==='analyticsRing'));
reduced=true;
const at=calls.filter(x=>!x.name.startsWith('cancel:')).length;
screen='dashboard';
window.RashodyGrandMotion.afterRender({view:'dashboard'});
assert.equal(calls.filter(x=>!x.name.startsWith('cancel:')).length,at,'Reduce-motion setting must suppress choreographies');
assert.match(fs.readFileSync('native/FinanceStoragePlugin.java','utf8'),/class FinanceStoragePlugin/);
console.log('OK v7.6: staged 3D calendar, 3 raised KPI cards, donut SVG reveal, period changes, reduced motion, intact native storage');
