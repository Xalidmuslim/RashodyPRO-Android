/* Rashody PRO v7.6 — cinematic, finite motion.
 * Timed matte 3D stage entrances for calendar, 3 summary cards and SVG charts.
 * No continuous RAF, no layout animation, no capture of scrolling touches.
 * Events are emitted by the existing render() without touching finance state.
 */
(() => {
 'use strict';
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 const stageEasing='cubic-bezier(.16,.77,.2,1)';
 const settleEasing='cubic-bezier(.16,.88,.22,1)';
 let last=null, frame=0, requestedView='';
 const clamp=(n,min,max)=>Math.max(min,Math.min(n,max));
 const page=()=>document.getElementById('page');
 function animate(el,frames,options={}){
   if(!el?.isConnected||typeof el.animate!=='function'||reduced?.matches)return;
   const a=el.animate(frames,{duration:1600,easing:stageEasing,fill:'none',...options});
   a.finished?.catch(()=>{});
   return a;
 }
 function pose(y,rx,ry,scale,opacity){
   return {'--stage-y':y+'px','--stage-rx':rx+'deg',
           '--stage-ry':ry+'deg','--stage-scale':String(scale),opacity};
 }
 function lifted(el,{index=0,kind='calendar',selected=false}={}){
   const sign=index%2?-1:1;
   if(kind==='calendar'){
     return animate(el,[
       {...pose(49,-23,sign*13,.82,.16),offset:0},
       {...pose(-12,8,-sign*4,1.075,1),offset:.74},
       {...pose(2,-2,sign*1.4,.992,1),offset:.88},
       {...pose(0,0,0,1,1),offset:1}
     ],{duration:selected?1450:1760,delay:selected?0:index*95,easing:stageEasing});
   }
   return animate(el,[
     {...pose(65,-18,sign*16,.83,.14),offset:0},
     {...pose(-14,6,-sign*6,1.058,1),offset:.70},
     {...pose(3,-1,sign*1.4,.989,1),offset:.88},
     {...pose(0,0,0,1,1),offset:1}
   ],{duration:1920,delay:index*190,easing:stageEasing});
 }
 function drawRing(scope,{delay=0,large=false}={}){
   if(!scope)return;
   const ring=scope.matches?.('.day-donut,.ring')?scope:scope.querySelector('.day-donut,.ring');
   if(ring){
     animate(ring,[
       {...pose(39,-24,-14,.68,.35),offset:0},
       {...pose(-10,6,5,1.078,1),offset:.72},
       {...pose(2,-2,-1,.99,1),offset:.89},
       {...pose(0,0,0,1,1),offset:1}
     ],{duration:large?2150:2000,delay,easing:settleEasing});
   }
   const sectors=[...scope.querySelectorAll('.day-donut-sector,.ring-slice')];
   for(const [i,arc] of sectors.entries()){
     const r=Number(arc.getAttribute('r'));
     const dash=arc.getAttribute('stroke-dasharray');
     if(!Number.isFinite(r)||r<=0||!dash)continue;
     const circumference=(2*Math.PI*r).toFixed(3);
     animate(arc,[
       {strokeDasharray:'0 '+circumference,opacity:0.36,offset:0},
       {strokeDasharray:dash,opacity:1,offset:1}
     ],{duration:large?1900:1730,delay:delay+180+i*145,easing:'cubic-bezier(.22,.8,.16,1)'});
   }
   const center=scope.querySelector('.day-donut-center,.ring-inner');
   animate(center,[
     {transform:'scale(.76) translateY(10px)',opacity:0,offset:0},
     {transform:'scale(1.08) translateY(-2px)',opacity:1,offset:.78},
     {transform:'scale(1)',opacity:1,offset:1}
   ],{duration:1650,delay:delay+260,easing:settleEasing});
 }
 function enterDashboard(root,previous,current){
   const fresh=!previous||previous.view!=='dashboard';
   const weekChanged=fresh||previous.week!==current.week;
   const chosenChanged=fresh||previous.chosen!==current.chosen;
   const figuresChanged=fresh||previous.figures!==current.figures;
   const days=[...root.querySelectorAll('.week-strip .week-day')];
   if(weekChanged)days.forEach((el,index)=>lifted(el,{index,kind:'calendar'}));
   else if(chosenChanged){
     const active=days.find(el=>el.classList.contains('focus-day'));
     lifted(active,{kind:'calendar',selected:true});
   }
   if(figuresChanged||chosenChanged){
     root.querySelectorAll('.trend-cards .trend-card').forEach((el,index)=>{
       lifted(el,{index,kind:'stat'});
       const icon=el.querySelector('.trend-icon');
       animate(icon,[
         {transform:'translate3d(0,12px,0) scale(.65) rotate(-17deg)',opacity:.35},
         {transform:'translate3d(0,-5px,0) scale(1.11) rotate(7deg)',opacity:1,offset:.77},
         {transform:'translate3d(0,0,0) scale(1) rotate(0deg)',opacity:1}
       ],{duration:1540,delay:270+index*190,easing:settleEasing});
     });
   }
   if(chosenChanged||figuresChanged){
     const feature=root.querySelector('.feature-copy');
     animate(feature,[
       {transform:'translate3d(-22px,25px,0)',opacity:.15,offset:0},
       {transform:'translate3d(6px,-4px,0)',opacity:1,offset:.79},
       {transform:'translate3d(0,0,0)',opacity:1,offset:1}
     ],{duration:1680,delay:150,easing:settleEasing});
     drawRing(root.querySelector('.day-category-graphic'),{delay:170});
     root.querySelectorAll('.day-donut-legend-item').forEach((el,index)=>animate(el,[
       {transform:'translate3d(0,16px,0) scale(.94)',opacity:.08},
       {transform:'translate3d(0,-3px,0) scale(1.025)',opacity:1,offset:.80},
       {transform:'none',opacity:1}
     ],{duration:1310,delay:380+index*115,easing:stageEasing}));
   }
 }
 function enterAnalytics(root,previous,current){
   if(previous?.view==='analytics'&&previous.figures===current.figures&&previous.chart===current.chart)return;
   root.querySelectorAll('.studio-stats .compare-metric').forEach((el,index)=>{
     animate(el,[
       {transform:'perspective(800px) rotateX(-15deg) rotateY('+(index%2?-8:8)+'deg) translateY(45px) scale(.85)',opacity:.15},
       {transform:'perspective(800px) rotateX(5deg) translateY(-8px) scale(1.04)',opacity:1,offset:.78},
       {transform:'none',opacity:1}
     ],{duration:1740,delay:index*175,easing:stageEasing});
   });
   drawRing(root.querySelector('.analytics-ring-panel'),{delay:280,large:true});
   root.querySelectorAll('.analytics-ring-panel .legend-line').forEach((el,index)=>animate(el,[
     {transform:'translate3d(15px,16px,0) scale(.93)',opacity:.08},
     {transform:'translate3d(-2px,-3px,0) scale(1.025)',opacity:1,offset:.76},
     {transform:'none',opacity:1}
   ],{duration:1420,delay:470+index*125,easing:stageEasing}));
 }
 function snapshot(root,view){
   const days=[...root.querySelectorAll('.week-strip .week-day')];
   return {view,
     week:days.map(x=>x.dataset.jumpDay).join('|'),
     chosen:days.find(x=>x.classList.contains('focus-day'))?.dataset.jumpDay||'',
     figures:[...root.querySelectorAll('.trend-card strong,.compare-metric strong')].map(x=>x.textContent).join('|'),
     chart:[...root.querySelectorAll('.day-donut-sector,.ring-slice')].map(x=>x.getAttribute('stroke-dasharray')).join('|')};
 }
 function perform(view){
   frame=0;
   if(reduced?.matches||document.hidden)return;
   const root=page();
   if(!root)return;
   const current=snapshot(root,view),previous=last;
   last=current;
   if(view==='dashboard')enterDashboard(root,previous,current);
   if(view==='analytics')enterAnalytics(root,previous,current);
 }
 function schedule(view){
   requestedView=view;
   if(frame)cancelAnimationFrame(frame);
   frame=requestAnimationFrame(()=>perform(requestedView));
 }
 document.addEventListener('rashody:render',event=>schedule(event.detail?.view||'dashboard'));
 document.addEventListener('DOMContentLoaded',()=>{if(page()?.querySelector('.week-strip,.analytics-ring-panel'))schedule(page().querySelector('.week-strip')?'dashboard':'analytics')});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&frame){cancelAnimationFrame(frame);frame=0}});
 reduced?.addEventListener?.('change',()=>{if(reduced.matches&&frame){cancelAnimationFrame(frame);frame=0}});
})();
