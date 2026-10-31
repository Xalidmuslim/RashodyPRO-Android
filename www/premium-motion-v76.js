/* RASHODY PRO v7.6 — GRAND MOTION
   Directed, staged, scroll-safe choreography. Independent of money/data logic.
   3D entry: calendar wave -> statistics rise -> detailed donut drawn by segments.
   Inputs remain responsive; reduced-motion / hidden tabs disable all effects.
*/
(() => {
 'use strict';
 const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 const active=new Set();
 const state={view:'',week:'',day:'',period:'',selection:'',summary:'',chart:'',generation:0};
 const ease='cubic-bezier(.18,.86,.22,1)';
 const spring='cubic-bezier(.17,1.17,.29,1)';
 const page=()=>document.getElementById('page');
 const safe=()=>!reduce?.matches&&!document.hidden;
 const remember=a=>{
  if(!a)return;
  active.add(a);
  a.finished?.then(()=>{active.delete(a);a.cancel()},()=>{active.delete(a)});
 };
 function stop(){
  for(const a of active)try{a.cancel()}catch(_){}
  active.clear();
  // Animations release their own compositor layers; no persistent DOM classes.
 }
 function animate(el,frames,options){
  if(!el?.animate||!safe())return;
  const a=el.animate(frames,{fill:'none',...options});
  remember(a);return a;
 }
 const enterCard=(el,delay,distance=24,tilt=9,duration=1280)=>{
  if(!el)return;
  animate(el,[
   {transform:'perspective(960px) translate3d(0,'+distance+'px,0) rotateX('+tilt+'deg) scale(.915)',opacity:.2,offset:0},
   {transform:'perspective(960px) translate3d(0,-8px,0) rotateX(-2.2deg) scale(1.028)',opacity:1,offset:.70},
   {transform:'perspective(960px) translate3d(0,0,0) rotateX(0) scale(1)',opacity:1,offset:1}
  ],{duration,delay,easing:spring,fill:'both'});
 };
 function calibrateArc(c,i,delay,baseDuration=1500){
  const dash=c.getAttribute('stroke-dasharray');
  const split=(dash||'').trim().split(/[,\s]+/).map(Number);
  if(split.length<2||!split.every(Number.isFinite)||split[0]<=0)return;
  const circumference=split[0]+split[1];
  animate(c,[
   {strokeDasharray:'0 '+circumference.toFixed(3),opacity:.18,offset:0},
   {strokeDasharray:dash,opacity:1,offset:1}
  ],{duration:baseDuration,delay:delay+i*105,easing:'cubic-bezier(.23,.72,.21,1)',fill:'both'});
 }
 function raiseInner(el,delay){
  if(!el)return;
  animate(el,[
   {transform:'translate3d(0,12px,0) scale(.75)',opacity:0},
   {transform:'translate3d(0,-3px,0) scale(1.065)',opacity:1,offset:.77},
   {transform:'translate3d(0,0,0) scale(1)',opacity:1}
  ],{duration:690,delay,easing:spring,fill:'both'});
 }
 function drawDonut(root,mode,delay=180){
  const holder=mode==='dashboard'?root.querySelector('.day-donut'):root.querySelector('.analytics-ring-panel .ring');
  if(!holder)return;
  const svg=holder.querySelector('svg');
  if(!svg)return;
  // Transform only the static chart container. Do not animate filter/box-shadow
  // or clone SVG; interactive circle semantics and live amounts stay intact.
  animate(svg,[
   {transform:'perspective(1000px) rotate(-13deg) rotateX(12deg) scale(.82)',opacity:.7},
   {transform:'perspective(1000px) rotate(2deg) rotateX(-3deg) scale(1.035)',opacity:1,offset:.70},
   {transform:'none',opacity:1}
  ],{duration:900,delay,easing:spring,fill:'both'});
  const selector=mode==='dashboard'?'.day-donut-sector':'.ring-slice';
  svg.querySelectorAll(selector).forEach((c,i)=>calibrateArc(c,i,delay+90,790));
  const center=holder.querySelector(mode==='dashboard'?'.day-donut-center':'.ring-inner');
  raiseInner(center,delay+290);
  const legend=mode==='dashboard'?root.querySelectorAll('.day-donut-legend-item'):
   root.querySelectorAll('.analytics-ring-panel .legend-line');
  legend.forEach((el,i)=>{
   animate(el,[
    {transform:'translate3d(-14px,8px,0) scale(.94)',opacity:0},
    {transform:'translate3d(3px,-2px,0) scale(1.015)',opacity:1,offset:.78},
    {transform:'none',opacity:1}
   ],{duration:590,delay:delay+350+i*60,easing:ease,fill:'both'});
  });
 }
 function selectReveal(root){
  const c=root.querySelector('.day-donut-center,.analytics-ring-panel .ring-inner');
  if(c)raiseInner(c,70);
 }
 function dashboard(root,full,dayChanged,selectionChanged,summaryChanged,chartChanged){
  if(full){
   animate(root.querySelector('.calendar-title-row h1'),[
    {transform:'translate3d(0,14px,0) rotateX(8deg)',opacity:.25},
    {transform:'translate3d(0,-2px,0)',opacity:1,offset:.78},
    {transform:'none',opacity:1}
   ],{duration:640,delay:0,easing:spring,fill:'both'});
   root.querySelectorAll('.day-ledger .record-row').forEach((row,i)=>animate(row,[
    {transform:'translate3d(0,22px,0) rotateX(7deg) scale(.96)',opacity:0},
    {transform:'translate3d(0,-2px,0) rotateX(-1deg) scale(1.012)',opacity:1,offset:.75},
    {transform:'none',opacity:1}
   ],{duration:710,delay:600+i*52,easing:spring,fill:'both'}));
   const days=[...root.querySelectorAll('.week-strip .week-day')];
   days.forEach((el,i)=>{
    const phase=i%2===0?1:-1;
    animate(el,[
      {transform:'perspective(820px) translate3d(0,38px,0) rotateY('+(phase*12)+'deg) rotateX(17deg) scale(.84)',opacity:.05},
      {transform:'perspective(820px) translate3d(0,-8px,0) rotateY('+(phase*-2)+'deg) rotateX(-3deg) scale(1.045)',opacity:1,offset:.72},
      {transform:'none',opacity:1}
    ],{duration:760,delay:i*65,easing:spring,fill:'both'});
    const meter=el.querySelector('.week-day-meter-fill');
    animate(meter,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],
      {duration:570,delay:310+i*65,easing:ease,fill:'both'});
   });
  }
  if(full||summaryChanged){
   root.querySelectorAll('.trend-cards .trend-card').forEach((el,i)=>{
    enterCard(el,full?235+i*105:90+i*90,24,7,850);
    raiseInner(el.querySelector('.trend-icon'),full?310+i*105:170+i*90);
   });
  }
  if(dayChanged&&!full){
   const selected=root.querySelector('.week-day.focus-day');
   // Calendar press/selection spring is owned by v8.6; keep the meter animation only.
   const bar=selected?.querySelector('.week-day-meter-fill');
   animate(bar,[{transform:'scaleX(.10)'},{transform:'scaleX(1)'}],{duration:680,delay:150,easing:ease,fill:'both'});
  }
  if(full||dayChanged||chartChanged){
   enterCard(root.querySelector('.feature-day'),full?400:65,18,4,870);
   drawDonut(root,'dashboard',full?480:95);
  } else if(selectionChanged) selectReveal(root);
 }
 function analytics(root,full,periodChanged,selectionChanged,summaryChanged,chartChanged){
  if(full||periodChanged||summaryChanged||chartChanged){
   root.querySelectorAll('.studio-stats .compare-metric').forEach((el,i)=>
    enterCard(el,150+i*115,22,6,850));
   enterCard(root.querySelector('.analytics-ring-panel'),325,15,4,900);
   drawDonut(root,'analytics',420);
   root.querySelectorAll('.compare-stick').forEach((el,i)=>{
    animate(el,[
     {transform:'scaleY(.02)',transformOrigin:'bottom center'},
     {transform:'scaleY(1.045)',transformOrigin:'bottom center',offset:.82},
     {transform:'scaleY(1)',transformOrigin:'bottom center'}
    ],{duration:800,delay:360+i*60,easing:spring,fill:'both'});
   });
  } else if(selectionChanged) selectReveal(root);
 }
 // Explicit post-render hook avoids MutationObserver loops and repeats only on
 // meaningful date/period changes. The app still owns all rendering and events.
 function afterRender(meta){
  const root=page();if(!root)return;
  const view=meta?.view||'';
  const full=state.view!==view;
  const week=root.querySelector('.week-strip');
  const weekKey=[...week?.querySelectorAll('[data-jump-day]')||[]]
   .map(el=>el.getAttribute('data-jump-day')).join('|');
  const day=root.querySelector('.week-day.focus-day')?.getAttribute('data-jump-day')||'';
  const chartSel=root.querySelector('.day-donut-sector.is-selected,.ring-slice.selected')
    ?.getAttribute('data-day-chart-category')||
    root.querySelector('.ring-slice.selected')?.getAttribute('data-chart-category')||'';
  const period=root.querySelector('.analytics-controls .period-caption')?.textContent?.trim()||'';
  const summary=[...root.querySelectorAll('.trend-cards .trend-card strong,.studio-stats .compare-metric strong')]
   .map(el=>el.textContent?.trim()).join('|');
  const chart=[...root.querySelectorAll('.day-donut-sector,.ring-slice')]
   .map(el=>(el.getAttribute('stroke-dasharray')||'')+':'+(el.getAttribute('stroke')||'')).join('|');
  const weekChanged=weekKey!==state.week,dayChanged=day!==state.day;
  const periodChanged=period!==state.period,selectionChanged=chartSel!==state.selection;
  const summaryChanged=summary!==state.summary,chartChanged=chart!==state.chart;
   stop();
  const generation=++state.generation;
  Object.assign(state,{view,week:weekKey,day,period,selection:chartSel,summary,chart});
  if(!safe())return;
  // Avoid delaying first paint or input: start on next compositor frame.
  requestAnimationFrame(()=>{
   if(root!==page()||generation!==state.generation||!safe())return;
   if(view==='dashboard')dashboard(root,full||weekChanged,dayChanged,selectionChanged,summaryChanged,chartChanged);
   else if(view==='analytics')analytics(root,full,periodChanged,selectionChanged,summaryChanged,chartChanged);
  });
 }
 // Window capture interrupts decorative entry BEFORE the existing document-level tilt handler.
 window.addEventListener('pointerdown',e=>{
  if(e.target.closest?.('#page .week-day,#page .trend-card,#page .feature-day,#page .ring,#page .day-donut'))stop();
 },{capture:true,passive:true});
 // Do not cancel on programmatic scrollTo(0) after navigation; only real
 // touch drag / wheel should interrupt the visual entrance animation.
 document.addEventListener('touchmove',stop,{capture:true,passive:true});
 document.addEventListener('wheel',stop,{capture:true,passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
 reduce?.addEventListener?.('change',()=>{if(reduce.matches)stop()});
 window.RashodyGrandMotion={afterRender,stop};
})();
