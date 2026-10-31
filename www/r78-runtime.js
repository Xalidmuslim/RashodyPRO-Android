/* Reference Matte v7.8.
   Additive DOM composition only: all state, events, calculations and prior animations are unchanged. */
(()=>{
 'use strict';
 const green='#5c7867',terra='#d98b61';
 const img=(name,group='categories',size=36)=>'<img alt="" aria-hidden="true" draggable="false" width="'+size+'" height="'+size+'" src="assets/icons/'+group+'/'+name+'.png">';
 const categories=new Set(['food','cafe','transport','home','health','fun','shop','other']);
 function enhanceDashboard(){
  const page=document.getElementById('page');
  if(!page)return;
  const brandTitle=page.querySelector('.calendar-title-row h1');
  if(brandTitle){
   const header=document.createElement('div');
   header.className='r78-brand';
   header.innerHTML='<span class="r78-brand-icon">'+'<img alt="" aria-hidden="true" draggable="false" width="64" height="64" src="assets/brand/native-launcher.png">'+'</span><div class="r78-brand-copy"><h1>Расходы Про</h1><p>Личные финансы</p></div>';
   brandTitle.replaceWith(header);
  }
  const copy=page.querySelector('.feature-day .feature-copy');
  if(copy&&!copy.querySelector('.r78-day-heading')){
   const eyebrow=copy.querySelector('.eyebrow'),title=copy.querySelector('h2');
   if(eyebrow&&title){
    const wrapper=document.createElement('div');wrapper.className='r78-day-heading';
    const square=document.createElement('span');square.className='r78-day-icon';square.innerHTML=img('calendar','actions',28);
    const labels=document.createElement('div');
    labels.append(eyebrow,title);wrapper.append(square,labels);
    copy.prepend(wrapper);
   }
  }
  page.querySelectorAll('.day-donut-legend-item[data-day-chart-category]').forEach(item=>{
   const id=item.dataset.dayChartCategory;
   if(!item.querySelector('.r78-category-icon')){
    const square=document.createElement('span');square.className='r78-category-icon';
    square.innerHTML=img(categories.has(id)?id:'other');
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
   icon.innerHTML=img('transactions','nav',25);ledgerTitle.prepend(icon);
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
