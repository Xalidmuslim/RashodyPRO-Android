import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
const src=fs.readFileSync('www/index.html','utf8');
const css=fs.readFileSync('www/r96-dashboard.css','utf8');
const bundle=fs.readFileSync('scripts/bundle-runtime-theme-v80.mjs','utf8');
const marker='function dashboardV96(){',start=src.indexOf(marker),end=src.indexOf('function txRow(t){',start);
assert.ok(start>0&&end>start,'New dashboard must be available before transaction renderer');
assert.match(src,/view==='dashboard'\?dashboardV96\(\):/,'New dashboard must actually render');
assert.match(src,/if\(btn\.dataset\.dashboardPeriod\)/,'Period buttons must update dashboard');
assert.match(src,/if\(btn\.dataset\.dashboardTrendWeek\)/,'Weekly trend navigation wired');
assert.match(src,/if\(btn\.dataset\.r96Category\)/,'Category detail navigation wired');
assert.match(src,/let dashboardPeriodV96='month'/,'Monthly view default');
assert.match(bundle,/'r87-polish\.css','r96-dashboard\.css'/,'Dashboard styling compiled after legacy styling');
assert.match(css,/\.r96-summary/);assert.match(css,/\.r96-ring/);assert.match(css,/\.r96-trend/);
assert.match(css,/@media\(min-width:680px\)/,'Responsive 1-column phone and 2-column wide chart layout');
assert.doesNotMatch(src.slice(start,end),/modal\.appendChild\(card\)/,'KPI source card must not be moved');
assert.match(src.slice(start,end),/data-sculpted-detail="week"/);
assert.match(src.slice(start,end),/data-sculpted-detail="daily"/);
assert.match(src.slice(start,end),/data-sculpted-detail="max"/);
assert.match(src.slice(start,end),/r97-day-summary/,'Compact day chip replaces redundant full-screen detail panel');
assert.match(src.slice(start,end),/data-view="transactions"/);
assert.match(src.slice(start,end),/data-view="analytics"/);
assert.match(src.slice(start,end),/data-action="new-expense-day"/);
assert.match(src.slice(start,end),/data-action="view-focus-day"/);
const dates=['2026-11-02','2026-11-03'];
const tx=[
 {id:'a',date:dates[1],type:'expense',amount:120,category:'food',time:'11:00'},
 {id:'b',date:dates[1],type:'income',amount:500,category:'salary',time:'11:10'},
 {id:'c',date:dates[0],type:'expense',amount:60,category:'transport',time:'11:20'}
];
const F={
 money:n=>Math.round(n*100)/100,
 latestExpenseDay:()=>({day:dates[1]}),
 periodRange:(anchor,period)=>period==='month'?{start:'2026-11-01',end:'2026-11-30'}:period==='day'?{start:anchor,end:anchor}:{start:'2026-11-02',end:'2026-11-08'},
 compareExpenses:()=>({changePercent:12}),
 expenseCategories:items=>items.filter(t=>t.type==='expense').reduce((acc,t)=>(acc[t.category]=(acc[t.category]||0)+t.amount,acc),{})
};
const state={data:{transactions:tx,settings:{incomeEnabled:true,currency:'₽'}},
 dashboardPeriodV96:'month',dashboardFocusDay:dates[1],dashboardWeekAnchor:dates[1],month:new Date(2026,10,1),dayChartSelection:null};
const fmt=n=>n.toFixed(2)+' ₽';
const ctx={...state,F,Math,Number,Intl,Date,
 dateLocal:(d)=>d?new Date(d).toISOString().slice(0,10):dates[1],
 monthKey:()=> '2026-11',
 weekRangeFor:()=>['2026-11-02','2026-11-03','2026-11-04','2026-11-05','2026-11-06','2026-11-07','2026-11-08'],
 monthExpenseMap:items=>items.filter(t=>t.type==='expense').reduce((acc,t)=>(acc[t.date]=(acc[t.date]||0)+t.amount,acc),{}),
 expensesOfDay:d=>tx.filter(t=>t.date===d&&t.type==='expense'),
 sortTx:items=>items.slice().reverse(),getCat:id=>({name:{food:'Продукты',transport:'Транспорт',salary:'Зарплата'}[id]||id}),
 money:fmt,summaryMoney:fmt,compactMoney:fmt,axisMoney:fmt,esc:x=>String(x).replaceAll('<','&lt;').replaceAll('>','&gt;'),
 ruMonth:()=> 'Ноябрь 2026',matteDateLabel:()=> 'вт, 3 ноября',
 compactWeekWidget:()=>'<div class="calendar-shell">Календарь</div>',
 svg:()=>'<svg/>',categoryColor:()=> '#456654',expenseCountLabel:n=>n+' операций',
 daySummaryRing:()=>'<div class="day-donut">День</div>',
 daySelectedOperations:()=>'',txRow:t=>'<button data-tx="'+t.id+'"></button>'
};
const fn=vm.runInNewContext('('+src.slice(start,end).trim()+')',ctx);
let html=fn();
assert.match(html,/Расходы PRO/);
assert.match(html,/180\.00 ₽/,'Summary must derive from actual expense transactions');
assert.match(html,/500\.00 ₽/,'Income only from transactions');
assert.match(html,/320\.00 ₽/,'Net income-minus-expense is not a fake bank balance');
assert.match(html,/Разница доходов и расходов/);
assert.match(html,/Продукты/);
assert.match(html,/r96-bar-chart/);
assert.match(html,/Последние операции/);
ctx.data.settings.incomeEnabled=false;
html=fn();
assert.doesNotMatch(html,/Разница доходов и расходов/,'Optional income must disappear when disabled');
ctx.data.transactions=[];
html=fn();
assert.match(html,/Расходов за период нет/,'Zero category period should show explicit empty state');
assert.match(html,/Пока нет операций/,'Zero latest transactions should show empty state');
assert.doesNotMatch(html,/NaN|Infinity/);
execFileSync('node',['scripts/bundle-runtime-theme-v80.mjs'],{stdio:'inherit'});
const built=fs.readFileSync('www/r80-theme.css','utf8');
assert.match(built,/SOURCE: r96-dashboard\.css/);
console.log('PASS v9.6: real finance data/zero states, optional income, responsive dashboard, KPI and existing navigation');
