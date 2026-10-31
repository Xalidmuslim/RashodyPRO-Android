/* Reference Matte v7.8.
   Additive DOM composition only: all state, events, calculations and prior animations are unchanged. */
(()=>{
 'use strict';
 const green='#5c7867',terra='#d98b61';
 const categories={food:'cart',cafe:'coffee',transport:'car',home:'home',health:'heart',fun:'film',shop:'shirt',other:'box'};
 const factory=(name,size=27)=>window.RashodyFactorySvg?.(name,size)||'';
 function enhanceDashboard(){
  const page=document.getElementById('page');
  if(!page)return;
  // Core owns the single touchstart/touchend swipe handler for weeks.
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
 let transformer=null,lastPageView='';
 const viewOrder=['dashboard','transactions','analytics','settings'];
 function pageTransformer(direction=1){
  const page=document.getElementById('page');
  if(!page?.animate||window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches||document.hidden)return;
  transformer?.cancel();page.style.transformOrigin='center 28%';
  const slide=direction>0?43:-43,tilt=direction>0?-7:7;
  transformer=page.animate([
   {transform:'perspective(1050px) translate3d('+slide+'px,12px,0) rotateY('+tilt+'deg) scale(.965)',opacity:.81,offset:0},
   {transform:'perspective(1050px) translate3d('+(-Math.sign(slide)*7)+'px,-3px,0) rotateY('+(-tilt*.22)+'deg) scale(1.012)',opacity:1,offset:.76},
   {transform:'perspective(1050px) translate3d(0,0,0) rotateY(0deg) scale(1)',opacity:1,offset:1}
  ],{duration:480,easing:'cubic-bezier(.18,.85,.22,1)',fill:'both'});
  const active=transformer;
  active.finished.then(()=>{
   if(transformer===active){active.cancel();page.style.transformOrigin='';transformer=null;}
  },()=>{
   if(transformer===active){page.style.transformOrigin='';transformer=null;}
  });
 }
 function afterRender({view='',changed=false}={}){
  if(view==='dashboard')enhanceDashboard();
  const before=viewOrder.indexOf(lastPageView),after=viewOrder.indexOf(view);
  const direction=before>=0&&after>=0&&after<before?-1:1;
  if(changed)pageTransformer(direction);
  window.RashodyExpressiveMotion?.afterRender({view,changed,direction});
  if(view)lastPageView=view;
 }
 window.RashodyReferenceV78={afterRender};
})();
