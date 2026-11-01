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
 let sourceAnimation=null,cardSlot=null,cardStyle=null,detailPanel=null,selectionToken=0;
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
  cardStyle=card.style.cssText;
  // Keep the original grid position occupied; move the REAL colored card,
  // not a duplicate panel, to a temporary full-screen dialog host.
  cardSlot=document.createElement('div');
  cardSlot.className='r88-card-slot';
  cardSlot.style.height=from.height+'px';
  card.before(cardSlot);
  modal=document.createElement('div');
  modal.className='r77-detail-scrim r88-morph-scrim';
  modal.setAttribute('role','dialog');
  modal.setAttribute('aria-modal','true');
  modal.setAttribute('aria-labelledby','r77-detail-title');
  document.body.appendChild(modal);
  modal.appendChild(card);
  card.classList.add('r88-expand-card');
  card.setAttribute('aria-expanded','true');
  const color=card.classList.contains('amber')?'#28251f':'#fff9f0';
  const fill=card.classList.contains('coral')?'#CF7864':card.classList.contains('teal')?'#4D908A':'#D8A34F';
  const viewport=window.visualViewport;
  const vw=viewport?.width||window.innerWidth,vh=viewport?.height||window.innerHeight;
  const x=viewport?.offsetLeft||0,y=viewport?.offsetTop||0;
  const width=Math.min(vw-24,520),height=Math.min(Math.max(290,vh*.54),Math.max(290,vh-48),540);
  const to={left:x+(vw-width)/2,top:y+(vh-height)/2,width,height};
  for(const [property,value] of Object.entries({
   position:'fixed',left:to.left+'px',top:to.top+'px',
   width:to.width+'px',height:to.height+'px',
   zIndex:'16002',background:fill,color,margin:'0',
   transform:'none',borderRadius:'29px',pointerEvents:'auto'
  }))card.style.setProperty(property,value,'important');
  const contents=document.createElement('div');
  contents.className='r88-expanded-contents';
  // The old close BUTTON must not be nested inside the real KPI button.
  contents.innerHTML=detailsHtml(data).replace(/<button type="button" class="r77-detail-close"[^>]*>✕<\/button>/,'');
  card.appendChild(contents);
  detailPanel=contents;
  const close=document.createElement('button');
  close.type='button';close.className='r77-detail-close r88-morph-close';
  close.setAttribute('aria-label','Закрыть подробности');close.textContent='✕';
  modal.appendChild(close);
  close.style.left=(to.left+width-54)+'px';close.style.top=(to.top+12)+'px';
  document.body.classList.add('r77-detail-open');
  sourceAnimation=animate(card,[
   {left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px',borderRadius:'18px',offset:0},
   {left:(to.left+(from.left-to.left)*.06)+'px',top:(to.top+(from.top-to.top)*.06)+'px',width:(to.width*.98)+'px',height:(to.height*.98)+'px',borderRadius:'31px',offset:.83},
   {left:to.left+'px',top:to.top+'px',width:to.width+'px',height:to.height+'px',borderRadius:'29px',offset:1}
  ],{duration:480,easing:settling});
  animate(modal,[{backgroundColor:'rgba(19,36,34,0)'},{backgroundColor:'rgba(19,36,34,.28)'}],
   {duration:360,easing});
  animate(contents,[{opacity:0,transform:'translate3d(0,15px,0)'},{opacity:1,transform:'none'}],
   {duration:280,delay:185,easing});
  animate(close,[{opacity:0},{opacity:1}],{duration:220,delay:250,easing});
  if(sourceAnimation)sourceAnimation.finished.then(()=>{
   if(detailState==='opening')detailState='open';
  },()=>{});
  else detailState='open';
  close.addEventListener('pointerdown',e=>{if(e.button===0){e.preventDefault();closeDetail()}});
  close.addEventListener('click',()=>closeDetail());
  modal.addEventListener('click',e=>{if(e.target===modal)closeDetail()});
  try{history.pushState({__r77Detail:true},'');overlayHistory=true}catch(_){overlayHistory=false}
  requestAnimationFrame(()=>close.focus({preventScroll:true}));
 }
 function closeDetail(fromHistory=false){
  if(!modal||detailState==='closing')return;
  detailState='closing';
  sourceAnimation?.cancel();sourceAnimation=null;
  const layer=modal,source=origin,slot=cardSlot,contents=detailPanel;
  const from=source?.getBoundingClientRect(),target=slot?.getBoundingClientRect();
  animate(contents,[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(10px)'}],
   {duration:165,easing});
  const close=layer.querySelector('.r88-morph-close');
  animate(close,[{opacity:1},{opacity:0}],{duration:140,easing});
  animate(layer,[{backgroundColor:'rgba(19,36,34,.28)'},{backgroundColor:'rgba(19,36,34,0)'}],
   {duration:410,easing});
  const finish=()=>{
   if(slot?.isConnected&&source){slot.replaceWith(source)}
   if(source){
    contents?.remove();
    source.classList.remove('r88-expand-card');
    source.style.cssText=cardStyle||'';
    source.removeAttribute('aria-expanded');
   }
   layer.remove();
   if(modal===layer)modal=null;
   origin=null;cardSlot=null;detailPanel=null;cardStyle=null;
   detailState='closed';
   document.body.classList.remove('r77-detail-open');
   if(source?.isConnected)source.focus({preventScroll:true});
  };
  const back=(source&&target&&from&&ok())?animate(source,[
   {left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px',borderRadius:'29px'},
   {left:target.left+'px',top:target.top+'px',width:target.width+'px',height:target.height+'px',borderRadius:'18px'}
  ],{duration:425,easing}):null;
  if(back)back.finished.then(finish,finish);else finish();
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
    {transform:'translate3d('+dx+'px,'+dy+'px,0) scale('+sx+','+sy+')',opacity:.12,borderRadius:'50%'}
   ],{duration:360,easing});
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
   {transform:'translate3d('+dx+'px,'+dy+'px,0) scale('+sx+','+sy+')',opacity:.22,borderRadius:'50%',offset:0},
   {transform:'translate3d(-2px,-4px,0) scale(1.012)',opacity:1,borderRadius:'19px',offset:.80},
   {transform:'translate3d(0,0,0) scale(1)',opacity:1,borderRadius:'22px',offset:1}
  ],{duration:610,easing:settling});
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
