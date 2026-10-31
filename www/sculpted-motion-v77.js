/* RASHODY PRO — Sculpted Matte Motion v7.7
 * Three physically continuous detail transitions + chart sector selection,
 * shared navigation elevation and transaction changes. No money formulas here.
 * The legacy app owns all state, transactions and persistence.
 */
(() => {
 'use strict';
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 const ok=()=>!reduced?.matches&&!document.hidden;
 const easing='cubic-bezier(.2,.78,.22,1)';
 const settling='cubic-bezier(.16,1.03,.26,1)';
 let modal=null,origin=null,overlayHistory=false,inFlight=null,lastView=null,previousNav=null,detailState='closed';
 let selectionAnimation=null,txChange=null,dayChange=null,oldSelectedRect=null,openSourceRect=null;
 const animate=(node,frames,options)=>{
  if(!ok()||!node?.animate)return null;
  const a=node.animate(frames,{fill:'both',...options});
  a.finished.then(()=>a.cancel(),()=>{});return a;
 };
 const escapeHtml=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 function detailsHtml(data) {
  const rows=(data.rows||[]).map((r,i)=>'<div class="r77-detail-row" style="--r77-i:'+i+'"><span class="r77-detail-name">'+escapeHtml(r.name)+(r.note?'<small>'+escapeHtml(r.note)+'</small>':'')+'</span><strong>'+escapeHtml(r.value)+'</strong></div>').join('');
  return '<header class="r77-detail-head"><span class="r77-detail-icon">'+(window.RashodyFactorySvg?.(data.icon==='kpi-receipt'?'receipt':data.icon==='kpi-bag'?'shirt':'wallet',42)||'')+'</span><button type="button" class="r77-detail-close" aria-label="Закрыть подробности">✕</button></header>'+
  '<div class="r77-detail-body"><span class="r77-detail-eyebrow">ФИНАНСОВЫЙ ДНЕВНИК</span><h2 id="r77-detail-title">'+escapeHtml(data.title)+'</h2>'+
  '<strong class="r77-detail-number">'+escapeHtml(data.number)+'</strong><p class="r77-detail-sub">'+escapeHtml(data.sub)+'</p>'+
  '<div class="r77-detail-list">'+(rows||'<div class="r77-detail-row">Нет операций за выбранный период</div>')+'</div></div>';
 }
 const main=()=>document.getElementById('page');
 function openDetail(card) {
  if(detailState!=='closed'||modal||document.getElementById('overlay')?.hidden===false)return;
  const data=window.RashodySculptedDetails?.(card.dataset.sculptedDetail);
  if(!data)return;
  detailState='opening';
  origin=card;
  const rect=card.getBoundingClientRect();
  modal=document.createElement('div');
  modal.className='r77-detail-scrim';
  modal.innerHTML='<section class="r77-detail-panel" role="dialog" aria-modal="true" aria-labelledby="r77-detail-title" tabindex="-1">'+detailsHtml(data)+'</section>';
  document.body.appendChild(modal);
  const panel=modal.querySelector('.r77-detail-panel');
  document.body.classList.add('r77-detail-open');
  // One compositor translate for the bottom sheet; avoid old 3D FLIP layers.
  animate(modal,[{backgroundColor:'rgba(19,36,34,0)'},{backgroundColor:'rgba(19,36,34,.26)'}],{duration:460,easing});
  inFlight=animate(panel,[
   {transform:'translate3d(0,100%,0)',opacity:.98,offset:0},
   {transform:'translate3d(0,-5px,0)',opacity:1,offset:.84},
   {transform:'translate3d(0,0,0)',opacity:1,offset:1}
  ],{duration:560,easing:settling});
  if(inFlight)inFlight.finished.then(()=>{if(detailState==='opening')detailState='open'},()=>{});
  else detailState='open';
  modal.querySelector('.r77-detail-close').addEventListener('click',()=>closeDetail());
  modal.addEventListener('click',e=>{if(e.target===modal)closeDetail()});
  try{history.pushState({__r77Detail:true},'');overlayHistory=true}catch(_){overlayHistory=false}
  requestAnimationFrame(()=>panel.focus({preventScroll:true}));
 }
 function closeDetail(fromHistory=false){
  if(!modal||detailState==='closing')return;
  detailState='closing';
  const closing=modal;
  const pane=closing.querySelector('.r77-detail-panel');
  inFlight?.cancel();inFlight=null;
  const finish=()=>{
   closing.remove();
   if(modal===closing)modal=null;
   detailState='closed';
   document.body.classList.remove('r77-detail-open');
   if(origin?.isConnected)origin.focus({preventScroll:true});
  };
  const a=animate(pane,[
   {transform:'translate3d(0,0,0)',opacity:1},
   {transform:'translate3d(0,105%,0)',opacity:.96}
  ],{duration:400,easing});
  animate(closing,[{backgroundColor:'rgba(19,36,34,.26)'},{backgroundColor:'rgba(19,36,34,0)'}],{duration:400,easing});
  if(a)a.finished.then(finish,finish);else finish();
  if(overlayHistory&&!fromHistory){overlayHistory=false;try{history.back()}catch(_){}}
  else overlayHistory=false;
 }
 function transitionSector(previous,next,details,update){
  selectionAnimation?.cancel();selectionAnimation=null;
  const now=details.getBoundingClientRect().height;
  update();
  if(!ok())return;
  const h=details.getBoundingClientRect().height;
  details.style.overflow='clip';
  details.style.height=h+'px';
  details.style.transformOrigin='center top';
  selectionAnimation=animate(details,[
   {height:now+'px',opacity:previous?.65:.25,transform:'translateY(8px) scale(.976)'},
   {height:h+'px',opacity:1,transform:'none'}
  ],{duration:760,easing:settling});
  const remove=()=>{details.style.height='';details.style.overflow='';details.style.transformOrigin=''};
  if(selectionAnimation)selectionAnimation.finished.then(remove,remove);else remove();
  const center=document.querySelector('.day-donut-center');
  animate(center,[{transform:'translate3d(0,4px,0) scale(.89)'},{transform:'translate3d(0,-4px,0) scale(1.06)',offset:.65},{transform:'none'}],{duration:780,easing:settling});
 }
 function afterRender({view}={}){
  const newView=view||'';
  window.RashodyReferenceV78?.afterRender({view:newView,changed:lastView!==null&&lastView!==newView});
  if(lastView!==newView){
   const current=document.querySelector('#mobile-nav button.active:not(.fab)');
   if(previousNav&&current){
    const next=current.getBoundingClientRect(),prev=previousNav;
    animate(current,[
     {transform:'translate3d('+(prev.left-next.left)+'px,0,0) scale(.94)',opacity:.75},
     {transform:'translate3d(0,-4px,0) scale(1.03)',opacity:1,offset:.72},
     {transform:'none',opacity:1}
    ],{duration:470,easing:settling});
    animate(current.querySelector('img'),[
     {transform:'translateY(12px) scale(.84)'},{transform:'translateY(-5px) scale(1.10)',offset:.72},{transform:'none'}
    ],{duration:590,easing:settling});
   }
   lastView=newView;
  }
  const pending=txChange;txChange=null;
  if(pending){
   document.querySelectorAll('#page .record-row').forEach((row,i)=>{
    if(row.dataset.tx===pending.id&&pending.type!=='delete')animate(row,[
      {transform:'translate3d(0,29px,0) rotateX(11deg) scale(.95)',opacity:0},
      {transform:'translate3d(0,-4px,0) rotateX(-2deg) scale(1.013)',opacity:1,offset:.78},
      {transform:'none',opacity:1}
    ],{duration:820,delay:80+i*24,easing:settling});
    else if(pending.type==='delete'&&i<8)animate(row,[{transform:'translateY(12px)',opacity:.78},{transform:'none',opacity:1}],{duration:520,delay:i*30,easing});
   });
  }
  if(dayChange&&newView==='dashboard'){
   // Selection motion is owned by the existing calendar/diagram choreography;
   // keep only a keyed date transition, never restart the whole entrance.
   const card=document.querySelector('#page .week-day.focus-day');
   const rect=card?.getBoundingClientRect();
   const dx=rect&&oldSelectedRect?oldSelectedRect.left-rect.left:0;
   const dy=rect&&oldSelectedRect?oldSelectedRect.top-rect.top:0;
   animate(card,[{transform:'translate3d('+dx+'px,'+dy+'px,0) perspective(900px) scale(.91) rotateY(7deg)',opacity:.85},{transform:'translate3d(0,-4px,0) scale(1.055)',opacity:1,offset:.68},{transform:'none',opacity:1}],{duration:760,easing:settling});
   dayChange=null;oldSelectedRect=null;
  }
 }
 function markTransactionChange(id,type){txChange={id,type}}
 function beforeDayChange(day){dayChange=day;oldSelectedRect=document.querySelector('#page .week-day.focus-day')?.getBoundingClientRect()||null}
 function startAdd(originButton){
  if(!originButton)return;
  previousNav=originButton.getBoundingClientRect();
 }
 function enterAdd(){
  const panel=document.getElementById('modal');
  const source=document.querySelector('#mobile-nav .fab');
  if(!panel||(!source&&!openSourceRect)||!ok())return;
  const from=openSourceRect||(source&&source.getBoundingClientRect()),to=panel.getBoundingClientRect();
  openSourceRect=null;
  const dx=from.left+from.width/2-(to.left+to.width/2),dy=from.top+from.height/2-(to.top+to.height/2);
  animate(panel,[
    {transform:'translate3d('+dx*.14+'px,'+Math.min(dy,85)+'px,0) perspective(1000px) rotateX(6deg) scale(.91)',opacity:.75},
    {transform:'translate3d(0,-7px,0) rotateX(-1deg) scale(1.01)',opacity:1,offset:.78},
    {transform:'none',opacity:1}
  ],{duration:760,easing:settling});
 }
 window.addEventListener('pointerdown',e=>{
  const row=e.target.closest?.('#page .record-row[data-tx]');
  if(row)openSourceRect=row.getBoundingClientRect();
  const nav=e.target.closest?.('#mobile-nav button[data-view]');
  if(nav){const active=document.querySelector('#mobile-nav button.active:not(.fab)');previousNav=active?.getBoundingClientRect()||null}
 },{capture:true,passive:true});
 // Capture ensures tiles are handled before the delegated application listener.
 document.addEventListener('click',e=>{
  const card=e.target.closest?.('#page [data-sculpted-detail]');
  if(!card)return;
  e.stopImmediatePropagation();e.preventDefault();
  openDetail(card);
 },true);
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&modal){e.preventDefault();e.stopImmediatePropagation();closeDetail()}
 },true);
 window.addEventListener('popstate',e=>{if(modal)closeDetail(true)});
 reduced?.addEventListener?.('change',()=>{if(reduced.matches&&modal)closeDetail()});
 window.RashodySculptedMotion={afterRender,transitionSector,markTransactionChange,beforeDayChange,enterAdd,closeDetail,isDetailOpen:()=>!!modal};
})();
/* Isolated reference skin loader. v7.7 behavior above remains unchanged. */
if(document.createElement&&document.head){
 for(const href of ['r80-theme.css']){
  const link=document.createElement('link');link.rel='stylesheet';link.href=href;document.head.appendChild(link);
 }
 const script=document.createElement('script');script.src='r78-runtime.js';
 script.onload=()=>window.RashodyReferenceV78?.afterRender({view:document.querySelector('#mobile-nav button.active:not(.fab)')?.dataset?.view||'dashboard'});
 document.head.appendChild(script);
}
