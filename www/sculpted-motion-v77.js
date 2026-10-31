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
 let modal=null,origin=null,overlayHistory=false,inFlight=null,lastView=null,previousNav=null;
 let selectionAnimation=null,txChange=null,dayChange=null,oldSelectedRect=null,openSourceRect=null;
 const animate=(node,frames,options)=>{
  if(!ok()||!node?.animate)return null;
  const a=node.animate(frames,{fill:'both',...options});
  a.finished.then(()=>a.cancel(),()=>{});return a;
 };
 const escapeHtml=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 function detailsHtml(data) {
  const rows=(data.rows||[]).map((r,i)=>'<div class="r77-detail-row" style="--r77-i:'+i+'"><span class="r77-detail-name">'+escapeHtml(r.name)+(r.note?'<small>'+escapeHtml(r.note)+'</small>':'')+'</span><strong>'+escapeHtml(r.value)+'</strong></div>').join('');
  return '<header class="r77-detail-head"><span class="r77-detail-icon"><img alt="" width="68" height="68" src="assets/icons/kpi/'+escapeHtml(data.icon)+'.png"></span><button type="button" class="r77-detail-close" aria-label="Закрыть подробности">✕</button></header>'+
  '<div class="r77-detail-body"><span class="r77-detail-eyebrow">ФИНАНСОВЫЙ ДНЕВНИК</span><h2 id="r77-detail-title">'+escapeHtml(data.title)+'</h2>'+
  '<strong class="r77-detail-number">'+escapeHtml(data.number)+'</strong><p class="r77-detail-sub">'+escapeHtml(data.sub)+'</p>'+
  '<div class="r77-detail-list">'+(rows||'<div class="r77-detail-row">Нет операций за выбранный период</div>')+'</div></div>';
 }
 const main=()=>document.getElementById('page');
 function openDetail(card) {
  if(modal||document.getElementById('overlay')?.hidden===false)return;
  const data=window.RashodySculptedDetails?.(card.dataset.sculptedDetail);
  if(!data)return;
  origin=card;
  const rect=card.getBoundingClientRect();
  modal=document.createElement('div');
  modal.className='r77-detail-scrim';
  modal.innerHTML='<section class="r77-detail-panel" role="dialog" aria-modal="true" aria-labelledby="r77-detail-title" tabindex="-1">'+detailsHtml(data)+'</section>';
  document.body.appendChild(modal);
  const panel=modal.querySelector('.r77-detail-panel');
  document.body.classList.add('r77-detail-open');
  const p=panel.getBoundingClientRect();
  const dx=rect.left+rect.width/2-(p.left+p.width/2);
  const dy=rect.top+rect.height/2-(p.top+p.height/2);
  const sx=Math.max(.14,Math.min(1,rect.width/p.width));
  const sy=Math.max(.14,Math.min(1,rect.height/p.height));
  animate(modal,[{backgroundColor:'rgba(19,36,34,0)'},{backgroundColor:'rgba(19,36,34,.30)'}],{duration:530,easing});
  inFlight=animate(panel,[
   {transform:'translate3d('+dx+'px,'+dy+'px,0) scale('+sx+','+sy+') rotateX(9deg)',borderRadius:'26px',opacity:.90,offset:0},
   {transform:'translate3d(0,-10px,0) scale(1.018) rotateX(-2deg)',borderRadius:'32px',opacity:1,offset:.78},
   {transform:'translate3d(0,0,0) scale(1) rotateX(0deg)',borderRadius:'32px',opacity:1,offset:1}
  ],{duration:790,easing:settling});
  modal.querySelectorAll('.r77-detail-icon img').forEach(img=>animate(img,[
   {transform:'translateY(20px) rotateX(24deg) scale(.65)',opacity:.2},
   {transform:'translateY(-4px) rotateX(-5deg) scale(1.07)',opacity:1,offset:.72},
   {transform:'none',opacity:1}
  ],{duration:790,delay:120,easing:settling}));
  modal.querySelectorAll('.r77-detail-row').forEach((row,i)=>animate(row,[
    {opacity:0,transform:'translate3d(0,15px,0) rotateX(8deg)'},
    {opacity:1,transform:'none'}
  ],{duration:460,delay:290+i*58,easing}));
  modal.querySelector('.r77-detail-close').addEventListener('click',()=>closeDetail());
  modal.addEventListener('click',e=>{if(e.target===modal)closeDetail()});
  try{history.pushState({__r77Detail:true},'');overlayHistory=true}catch(_){overlayHistory=false}
  requestAnimationFrame(()=>panel.focus({preventScroll:true}));
 }
 function closeDetail(fromHistory=false){
  if(!modal)return;
  const pane=modal.querySelector('.r77-detail-panel');
  const p=pane.getBoundingClientRect();
  const r=origin?.isConnected?origin.getBoundingClientRect():null;
  const dx=r?r.left+r.width/2-(p.left+p.width/2):0;
  const dy=r?r.top+r.height/2-(p.top+p.height/2):38;
  const sx=r?Math.max(.15,Math.min(1,r.width/p.width)):.85;
  const sy=r?Math.max(.15,Math.min(1,r.height/p.height)):.85;
  const closing=modal;
  modal=null;document.body.classList.remove('r77-detail-open');
  inFlight?.cancel();inFlight=null;
  const a=animate(pane,[{transform:'none',opacity:1},{transform:'translate3d('+dx+'px,'+dy+'px,0) scale('+sx+','+sy+') rotateX(8deg)',opacity:.55}],{duration:570,easing});
  animate(closing,[{backgroundColor:'rgba(19,36,34,.30)'},{backgroundColor:'rgba(19,36,34,0)'}],{duration:570,easing});
  if(a)a.finished.then(()=>closing.remove(),()=>closing.remove());
  else closing.remove();
  if(overlayHistory&&!fromHistory){overlayHistory=false;try{history.back()}catch(_){}}
  else overlayHistory=false;
  if(origin?.isConnected)origin.focus({preventScroll:true});
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