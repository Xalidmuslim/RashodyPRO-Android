/* Reference Matte v7.8.
   Additive DOM composition only: all state, events, calculations and prior animations are unchanged. */
(()=>{
 'use strict';
 const green='#5c7867',terra='#d98b61';
 const categories={food:'cart',cafe:'coffee',transport:'car',home:'home',health:'heart',fun:'film',shop:'shirt',other:'box'};
 const factory=(name,size=27)=>window.RashodyFactorySvg?.(name,size)||'';
 let swipeInstalled=false;
 function installWeekSwipe(){
  if(swipeInstalled)return;
  const page=document.getElementById('page');
  if(!page)return;
  swipeInstalled=true;
  let touch=null;
  page.addEventListener('touchstart',e=>{
   const inside=e.target.closest?.('.week-strip');
   touch=inside&&e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;
  },{passive:true});
  page.addEventListener('touchend',e=>{
   if(!touch||!e.changedTouches.length)return;
   const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;
   touch=null;
   if(Math.abs(dx)<45||Math.abs(dx)<Math.abs(dy)*1.4)return;
   // The navigation buttons remain in DOM solely for existing business logic.
   page.querySelector(dx<0?'[data-action="week-next"]':'[data-action="week-prev"]')?.click();
  },{passive:true});
  page.addEventListener('touchcancel',()=>{touch=null},{passive:true});
 }
 function enhanceDashboard(){
  const page=document.getElementById('page');
  if(!page)return;
  installWeekSwipe();
  // No app icon, app title, or visible navigation arrows above the week.
  const copy=page.querySelector('.feature-day .feature-copy');
  if(copy&&!copy.querySelector('.r78-day-heading')){
   const eyebrow=copy.querySelector('.eyebrow'),title=copy.querySelector('h2');
   if(eyebrow&&title){
    const wrapper=document.createElement('div');wrapper.className='r78-day-heading';
    const square=document.createElement('span');square.className='r78-day-icon';
    square.innerHTML=factory('calendar',25);
    const labels=document.createElement('div');labels.append(eyebrow,title);
    wrapper.append(square,labels);copy.prepend(wrapper);
   }
  }
  page.querySelectorAll('.day-donut-legend-item[data-day-chart-category]').forEach(item=>{
   const id=item.dataset.dayChartCategory;
   if(!item.querySelector('.r78-category-icon')){
    const square=document.createElement('span');square.className='r78-category-icon';
    square.innerHTML=factory(categories[id]||'box',28);
    item.prepend(square);
   }
   const swatch=item.querySelector('.day-donut-swatch');
   if(swatch&&id==='shop')swatch.style.background=terra;
   if(swatch&&id==='cafe')swatch.style.background=green;
  });
  page.querySelectorAll('.day-donut-sector[data-day-chart-category]').forEach(circle=>{
   const id=circle.dataset.dayChartCategory;
   if(id==='shop')circle.setAttribute('stroke',terra);
   if(id==='cafe')circle.setAttribute('stroke',green);
  });
  const ledgerTitle=page.querySelector('.day-ledger .ledger-heading h2');
  if(ledgerTitle&&!ledgerTitle.querySelector('.r78-ledger-icon')){
   const icon=document.createElement('span');icon.className='r78-ledger-icon';
   icon.innerHTML=factory('transactions',25);ledgerTitle.prepend(icon);
  }
 }
 let transformer=null;
 function pageTransformer(){
  const page=document.getElementById('page');
  if(!page?.animate||window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)return;
  transformer?.cancel();page.style.transformOrigin='center 28%';
  transformer=page.animate([
   {transform:'perspective(1100px) translate3d(0,25px,0) rotateY(-11deg) rotateX(4deg) scale(.915)',offset:0},
   {transform:'perspective(1100px) translate3d(0,-5px,0) rotateY(2deg) rotateX(-1deg) scale(1.013)',offset:.76},
   {transform:'perspective(1100px) translate3d(0,0,0) rotateY(0) rotateX(0) scale(1)',offset:1}
  ],{duration:760,easing:'cubic-bezier(.2,.81,.22,1)',fill:'both'});
  const active=transformer;
  active.finished.then(()=>{if(transformer===active){active.cancel();page.style.transformOrigin='';transformer=null;}},()=>{if(transformer===active){page.style.transformOrigin='';transformer=null;}});
 }
 function afterRender({view='',changed=false}={}){
  if(view==='dashboard')enhanceDashboard();
  if(changed)pageTransformer();
 }
 window.RashodyReferenceV78={afterRender};
})();
