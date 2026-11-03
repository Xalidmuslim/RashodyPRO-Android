import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
const source=fs.readFileSync('www/index.html','utf8');
const css=fs.readFileSync('www/r100-dashboard-interactive.css','utf8');
const motion=fs.readFileSync('www/r98-dashboard-motion.js','utf8');
const bundle=fs.readFileSync('scripts/bundle-runtime-theme-v80.mjs','utf8');
const nav=fs.readFileSync('www/nav-dock-stability-v92.js','utf8');
const start=source.indexOf('function dashboardV96(){'),end=source.indexOf('function txRow(t){',start);
const dash=source.slice(start,end);
assert.match(dash,/data-sculpted-detail="average"/,'Mean/day replaces duplicate weekly KPI');
assert.doesNotMatch(dash,/data-sculpted-detail="week"/,'No duplicate weekly KPI');
assert.match(source,/if\(kind==='average'\)return \{title:'Средний расход за день'/);
assert.match(dash,/const dailyAverage=F\.money\(weekTotal\/7\)/);
assert.match(dash,/compared\.difference/);
assert.match(dash,/comparisonDescription/);
assert.match(dash,/r100-sector/);
assert.match(dash,/data-dashboard-category=/,'SVG sectors are interactive');
assert.match(dash,/aria-pressed=/,'Accessible selected state');
assert.match(dash,/data-dashboard-open-category=/,'Category drilldown');
assert.match(dash,/data-dashboard-bar-id=/);
assert.match(dash,/id="r100-trend-readout"/);
assert.match(source,/dashboardCategoryPick\(dashboardCategory\.dataset\.dashboardCategory\)/);
assert.match(source,/if\(btn\.dataset\.dashboardBarId\)\{return dashboardBarPick\(btn\)\}/);
assert.match(source,/if\(btn\.dataset\.dashboardOpenCategory\)/);
assert.match(source,/dashboardHaptic\(\)/);
assert.match(css,/transform-origin:center bottom!important/,'Trend animation grows from bottom');
assert.match(css,/\.r100-sector\.is-picked/);
assert.match(css,/\.r96-bar-column\.is-picked/);
assert.match(css,/gap:clamp\(7px,1\.15dvh,11px\)!important/,'Compact consistent vertical spacing');
assert.doesNotMatch(css,/#mobile-nav\b/,'Pinned dock remains untouched');
assert.match(nav,/const horizontalFrame=/);
assert.match(motion,/delay:480,duration:380/,'Latest operations enter after financial overview');
assert.match(motion,/duration:460,delay:270\+i\*30/,'Staggered trend growth lasts under ~1000ms');
assert.match(motion,/strokeDasharray:'0 '/,'Sectors draw around circumference');
assert.match(bundle,/'r99-dashboard-balance\.css','r100-dashboard-interactive\.css'/);
execFileSync('node',['--check','www/r98-dashboard-motion.js']);
function cut(from,to){
 const a=source.indexOf(from),b=source.indexOf(to,a+from.length);
 assert.ok(a>=0&&b>a,'Missing helper '+from);
 return source.slice(a,b).trim();
}
function item(dataset={}){
 const attrs={};const classes=new Set();
 return {dataset,attrs,classes,classList:{toggle(k,on){on?classes.add(k):classes.delete(k)}},
 setAttribute(k,v){attrs[k]=v}};
}
const circles=[item({dashboardCategory:'food',amount:'120'}),item({dashboardCategory:'travel',amount:'80'})];
const legend=[item({dashboardCategory:'food'}),item({dashboardCategory:'travel'})];
const readout={textContent:''},label={textContent:''},number={textContent:''};
const open={dataset:{view:'analytics'},textContent:''};
const barA=item({dashboardBarId:'d:2026-11-03',dashboardBarDate:'2026-11-03',dashboardBarWeekly:'false',dashboardBarLabel:'3',dashboardBarAmount:'120'});
const barB=item({dashboardBarId:'d:2026-11-02',dashboardBarDate:'2026-11-02',dashboardBarWeekly:'false',dashboardBarLabel:'2',dashboardBarAmount:'80'});
const ring={dataset:{total:'200'}};
const root={
 querySelector(q){
  return {
   '#r100-category-number':number,'#r100-category-label':label,
   '#r100-category-open':open,'#r100-trend-readout':readout,
   '.r96-spending .r96-ring':ring
  }[q]||null;
 },
 querySelectorAll(q){
  if(q==='.r100-sector[data-dashboard-category]')return circles;
  if(q==='.r96-category-line[data-dashboard-category]')return legend;
  if(q==='.r96-bar-column[data-dashboard-bar-id]')return [barA,barB];
  return [];
 }
};
let hapticCount=0,renderCount=0;
const ctx={document:{querySelector:q=>q==='#page .r100-dashboard'?root:null},
 dashboardSelectedCategory:null,dashboardSelectedBar:null,dashboardPeriodV96:'month',
 dashboardWeekAnchor:'2026-11-03',dashboardFocusDay:'2026-11-03',month:null,
 dashboardHaptic:()=>hapticCount++,getCat:id=>({name:id==='food'?'Продукты':'Транспорт'}),
 compactMoney:n=>n>=100?String(n)+' ₽':String(n)+' ₽',
 money:n=>Number(n).toFixed(2)+' ₽',F:{isDate:s=>/^\d{4}-\d{2}-\d{2}$/.test(s)},
 dateFromMonth:s=>new Date(s+'T12:00:00'),render:()=>renderCount++};
const pickCategory=vm.runInNewContext('('+cut('function dashboardCategoryPick(id){','function dashboardBarPick(button){')+')',ctx);
pickCategory('food');
assert.equal(ctx.dashboardSelectedCategory,'food');
assert.equal(number.textContent,'120.00 ₽','Sector displays precise currency amount');
assert.equal(label.textContent,'Продукты');
assert.equal(circles[0].attrs['aria-pressed'],'true');
assert.ok(circles[0].classes.has('is-picked'));
assert.equal(open.dataset.dashboardOpenCategory,'food');
assert.equal(open.dataset.view,undefined);
pickCategory('food');
assert.equal(ctx.dashboardSelectedCategory,null,'Second tap clears selection');
assert.equal(number.textContent,'200 ₽');
assert.equal(open.dataset.view,'analytics');
const barStart=source.indexOf('function dashboardBarPick(button){');
const barEnd=source.indexOf('\n}',barStart)+2;
assert.ok(barStart>=0&&barEnd>barStart);
const pickBar=vm.runInNewContext('('+source.slice(barStart,barEnd)+')',ctx);
pickBar(barA);
assert.equal(ctx.dashboardSelectedBar,'d:2026-11-03');
assert.equal(readout.textContent,'3 · 120.00 ₽');
assert.ok(barA.classes.has('is-picked'));
assert.equal(renderCount,0,'First bar tap must not navigate or rerender');
pickBar(barA);
assert.equal(ctx.dashboardPeriodV96,'day');
assert.equal(renderCount,1,'Second bar tap drills into corresponding period');
assert.equal(ctx.dashboardFocusDay,'2026-11-03');
assert.ok(hapticCount>=3);
execFileSync('node',['scripts/bundle-runtime-theme-v80.mjs']);
const output=fs.readFileSync('www/r80-theme.css','utf8');
assert.ok(output.indexOf('SOURCE: r100-dashboard-interactive.css')>output.indexOf('SOURCE: r99-dashboard-balance.css'));
console.log('PASS v10: actual category focus/clear/drilldown, bar values and second-tap period, mean KPI, staged animations, fixed dock preserved');
