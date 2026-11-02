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
 let detailStack=null,rowMotion=[],selectionToken=0;
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
  const from=card.getBoundingClientRect();
  if(!from.width||!from.height)return;
  window.RashodyGrandMotion?.stop();
  detailState='opening';origin=card;
  // v9.5: DO NOT detach or enlarge the source KPI. It remains in the grid.
  // Only free-standing, individually framed rows emerge from that location.
  const host=document.createElement('div');
  host.innerHTML=detailsHtml(data);
  const list=host.querySelector('.r77-detail-list');
  const rows=[...list.children];
  modal=document.createElement('div');
  modal.className='r77-detail-scrim r88-morph-scrim r95-rows-only-scrim';
  modal.setAttribute('role','dialog');
  modal.setAttribute('aria-modal','true');
  modal.setAttribute('aria-label','Подробности показателя');
  document.body.appendChild(modal);
  detailStack=document.createElement('div');
  detailStack.className='r94-detached-stack r95-rows-only-stack';
  detailStack.setAttribute('role','list');
  detailStack.setAttribute('aria-label','Подробные показатели');
  const viewport=window.visualViewport;
  const vw=viewport?.width||window.innerWidth,vh=viewport?.height||window.innerHeight;
  const x=viewport?.offsetLeft||0,y=viewport?.offsetTop||0;
  const width=Math.min(Math.max(240,vw-32),440);
  const maxHeight=Math.max(90,vh-106);
  const estimatedHeight=rows.length*60+Math.max(0,rows.length-1)*12+8;
  const visibleHeight=Math.min(maxHeight,estimatedHeight);
  const left=x+(vw-width)/2;
  const top=y+Math.max(55,(vh-visibleHeight)/2);
  detailStack.style.left=left+'px';
  detailStack.style.top=top+'px';
  detailStack.style.width=width+'px';
  detailStack.style.maxHeight=maxHeight+'px';
  if(estimatedHeight<=maxHeight)detailStack.style.overflow='visible';
  for(const row of rows){
   row.classList.add('r94-detached-row','r95-rows-only-row');
   row.setAttribute('role','listitem');
   detailStack.appendChild(row);
  }
  modal.appendChild(detailStack);
  const close=document.createElement('button');
  close.type='button';close.className='r77-detail-close r88-morph-close r95-rows-close';
  close.setAttribute('aria-label','Закрыть подробности');
  close.textContent='✕';
  close.style.left=(left+width-43)+'px';
  close.style.top=Math.max(y+7,top-51)+'px';
  modal.appendChild(close);
  card.setAttribute('aria-expanded','true');
  document.body.classList.add('r77-detail-open');
  // Separate timelines: long enough to perceive the tile travelling from
  // the source, with deliberate increasing delays, not a shared fade sheet.
  rowMotion=rows.map((row,i)=>{
   const rect=row.getBoundingClientRect();
   const dx=Math.round(from.left+from.width/2-rect.left-rect.width/2);
   const dy=Math.round(from.top+from.height/2-rect.top-rect.height/2);
   const originTransform='translate3d('+dx+'px,'+dy+'px,0) scale(.38)';
   let animation=null;
   if(ok()&&row.animate){
    animation=row.animate([
     {transform:originTransform,opacity:0,offset:0},
     {transform:'translate3d(0,-4px,0) scale(1.012)',opacity:1,offset:.82},
     {transform:'none',opacity:1,offset:1}
    ],{duration:960,delay:120+i*185,
      easing:'cubic-bezier(.19,.78,.23,1)',fill:'both'});
    animation.finished.catch(()=>{});
   }
   return {row,originTransform,animation};
  });
  if(ok()&&close.animate)animate(close,[{opacity:0},{opacity:1}],{duration:340,delay:180,easing});
  if(ok()&&modal.animate)animate(modal,[
    {backgroundColor:'rgba(19,36,34,0)'},{backgroundColor:'rgba(19,36,34,.23)'}
   ],{duration:420,easing});
  Promise.all(rowMotion.map(item=>item.animation?.finished.catch(()=>{})||Promise.resolve()))
   .then(()=>{if(detailState==='opening')detailState='open'});
  close.addEventListener('pointerdown',e=>{if(e.button===0){e.preventDefault();closeDetail()}});
  close.addEventListener('click',()=>closeDetail());
  modal.addEventListener('click',e=>{if(e.target===modal)closeDetail()});
  try{history.pushState({__r77Detail:true},'');overlayHistory=true}catch(_){overlayHistory=false}
  requestAnimationFrame(()=>close.focus({preventScroll:true}));
 }
 function closeDetail(fromHistory=false){
  if(!modal||detailState==='closing')return;
  detailState='closing';
  const layer=modal,source=origin,closingRows=rowMotion.slice();
  const close=layer.querySelector('.r88-morph-close');
  if(ok()&&close)animate(close,[{opacity:1},{opacity:0}],{duration:180,easing});
  if(ok())animate(layer,[
    {backgroundColor:'rgba(19,36,34,.23)'},{backgroundColor:'rgba(19,36,34,0)'}
   ],{duration:550,easing});
  let finished=false;
  const finish=()=>{
   if(finished)return;
   finished=true;
   for(const item of closingRows){item.animation?.cancel();item.exit?.cancel()}
   source?.removeAttribute('aria-expanded');
   layer.remove();
   if(modal===layer)modal=null;
   origin=null;detailStack=null;rowMotion=[];
   detailState='closed';
   document.body.classList.remove('r77-detail-open');
   if(source?.isConnected)source.focus({preventScroll:true});
  };
  // Top-to-bottom return order matches top-to-bottom entrance.
  // Capture the on-screen frame BEFORE cancelling entrance, so a quick Back
  // tap never causes a transform jump.
  if(ok()&&closingRows.length){
   const exits=closingRows.map((item,i)=>{
    const current=getComputedStyle(item.row);
    const currentTransform=current.transform==='none'?'none':current.transform;
    const opacity=Number.parseFloat(current.opacity);
    item.animation?.cancel();
    item.exit=item.row.animate([
     {transform:currentTransform,opacity:Number.isFinite(opacity)?opacity:1},
     {transform:item.originTransform,opacity:0}
    ],{duration:720,delay:i*125,
      easing:'cubic-bezier(.33,.02,.5,.94)',fill:'both'});
    return item.exit.finished.catch(()=>{});
   });
   Promise.all(exits).then(finish,finish);
  }else finish();
  if(overlayHistory&&!fromHistory){overlayHistory=false;try{history.back()}catch(_){}}
  else overlayHistory=false;
 }
 function transitionSector(previous,next,details,update){
  // One animation owner for the expense breakdown. Its source is the selected
  // SVG donut sector, not an arbitrary fade/slide from below.
  const token=++selectionToken;
  selectionAnimation?.cancel();selectionAnimation=null;
  const sourceId=next||previous;
  const source=[...document.querySelectorAll('#page .day-donut-sector[data-day-chart-category]')]
   .find(el=>el.dataset.dayChartCategory===sourceId);
  const from=source?.getBoundingClientRect();
  const reduced=!ok()||!from||!details?.animate;
  const clear=()=>{
   details.style.removeProperty('transform-origin');
   details.style.removeProperty('overflow');
   details.style.removeProperty('will-change');
  };
  if(next===null){
   if(reduced||details.hidden){update();clear();return}
   const to=details.getBoundingClientRect();
   const dx=from.left+from.width/2-(to.left+to.width/2);
   const dy=from.top+from.height/2-(to.top+to.height/2);
   const sx=Math.max(.2,Math.min(.65,from.width/Math.max(1,to.width)));
   const sy=Math.max(.2,Math.min(.65,from.height/Math.max(1,to.height)));
   details.style.transformOrigin='center center';
   details.style.overflow='hidden';
   details.style.willChange='transform,opacity';
   selectionAnimation=animate(details,[
    {transform:'translate3d(0,0,0) scale(1)',opacity:1,borderRadius:'22px'},
    {transform:'translate3d('+dx+'px,'+dy+'px,0) scale('+sx+','+sy+')',opacity:1,borderRadius:'22px'}
   ],{duration:760,easing:'cubic-bezier(.25,.04,.3,1)'});
   const done=()=>{if(selectionToken!==token)return;update();clear();selectionAnimation=null;};
   selectionAnimation?.finished.then(done,done);
   if(!selectionAnimation)done();
   return;
  }
  update();
  if(reduced){clear();return}
  const to=details.getBoundingClientRect();
  if(!to.width||!to.height){clear();return}
  const dx=from.left+from.width/2-(to.left+to.width/2);
  const dy=from.top+from.height/2-(to.top+to.height/2);
  const sx=Math.max(.2,Math.min(.65,from.width/Math.max(1,to.width)));
  const sy=Math.max(.2,Math.min(.65,from.height/Math.max(1,to.height)));
  details.style.transformOrigin='center center';
  details.style.overflow='hidden';
  details.style.willChange='transform,opacity';
  selectionAnimation=animate(details,[
   {transform:'translate3d('+dx+'px,'+dy+'px,0) scale('+sx+','+sy+')',opacity:1,borderRadius:'22px',offset:0},
   {transform:'translate3d(0,0,0) scale(1)',opacity:1,borderRadius:'22px',offset:1}
  ],{duration:760,easing:'cubic-bezier(.18,.78,.22,1)'});
  const done=()=>{if(selectionToken!==token)return;clear();selectionAnimation=null;};
  selectionAnimation?.finished.then(done,done);
  if(!selectionAnimation)done();
 }
 function afterRender({view}={}){
  const newView=view||'';
  window.RashodyReferenceV78?.afterRender({view:newView,changed:lastView!==null&&lastView!==newView});
  if(lastView!==newView){
   const current=document.querySelector('#mobile-nav button.active:not(.fab)');
   // Liquid navigation indicator and active icon are now animated by Expressive Motion.
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
   // The spring-pressed day is owned by Expressive Motion, not a second FLIP animator.
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
