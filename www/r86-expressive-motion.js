/* v8.7 Expressive Motion — spring calendar, haptics and approved horizontal tabs.
 * App state, SQLite, menu actions and accessibility semantics remain in core.
 * Animate transforms/opacity for transient states; no persistent GPU layers. */
(()=>{
 'use strict';
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 const allowed=()=>!reduced?.matches&&!document.hidden;
 let previousView=null,previousDay=null,navAnimation=null;
 const pressed=new WeakMap();
 function nativeHaptic(){
  // Device feedback only; respects OS feedback settings and failure is nonfatal.
  const native=window.Capacitor?.isNativePlatform?.() || window.Capacitor?.getPlatform?.()==='android';
  if(native){
   const action=window.Capacitor?.Plugins?.FinanceStorage?.hapticTap;
   if(typeof action==='function')Promise.resolve(action.call(window.Capacitor.Plugins.FinanceStorage)).catch(()=>{});
  } else {
   try{if(typeof navigator.vibrate==='function')navigator.vibrate(8)}catch(_){}
  }
 }
 const animate=(el,frames,options)=>{
  if(!allowed()||!el?.animate)return null;
  const a=el.animate(frames,{fill:'none',...options});
  a.finished.catch(()=>{});
  return a;
 };
 function pressCalendar(button){
  if(!allowed())return;
  pressed.get(button)?.cancel();
  const a=button.animate([
   {transform:'scale(1)',borderRadius:'19px'},
   {transform:'scale(.95)',borderRadius:'25px 14px 25px 14px'}
  ],{duration:135,easing:'cubic-bezier(.19,.73,.24,1)',fill:'forwards'});
  pressed.set(button,a);
 }
 function releaseCalendar(button){
  const prior=pressed.get(button);if(!prior)return;
  pressed.delete(button);prior.cancel();
  if(!button.isConnected||!allowed())return;
  // For an already selected day the same element remains mounted.
  if(button.getAttribute('aria-pressed')==='true')
   animate(button,[
    {transform:'scale(.95)',borderRadius:'25px 14px 25px 14px'},
    {transform:'scale(1.045)',borderRadius:'15px 22px 15px 22px',offset:.42},
    {transform:'scale(.985)',borderRadius:'21px 18px',offset:.74},
    {transform:'scale(1)',borderRadius:'19px'}
   ],{duration:400,easing:'cubic-bezier(.18,.8,.24,1)'});
 }
 // Previous approved interaction: the active TAB moves horizontally between sections.
 // No detached liquid layer, vertical shift or dynamic tab width.
 function directionalNav(view,changed){
  const nav=document.getElementById('mobile-nav');
  const active=nav?.querySelector('button.active[data-view]');
  if(!active)return;
  navAnimation?.cancel();navAnimation=null;
  // The nav is re-rendered on every view change; no overlay cleanup is needed.
  if(changed&&previousView&&allowed()){
   const previous=nav.querySelector('button[data-view="'+previousView+'"]');
   if(previous){
    const from=previous.getBoundingClientRect(),to=active.getBoundingClientRect();
    const dx=Math.max(-nav.clientWidth,Math.min(nav.clientWidth,(from.left+from.width/2)-(to.left+to.width/2)));
    const dir=Math.sign(-dx)||1;
    navAnimation=animate(active,[
     {transform:'translate3d('+dx+'px,0,0) scale(.92)',opacity:.82,offset:0},
     {transform:'translate3d('+(-dir*5)+'px,0,0) scale(1.035)',opacity:1,offset:.76},
     {transform:'translate3d(0,0,0) scale(1)',opacity:1,offset:1}
    ],{duration:440,easing:'cubic-bezier(.2,.86,.22,1)'});
    const icon=active.querySelector('img,svg');
    animate(icon,[
     {transform:'translate3d('+(-dir*9)+'px,0,0) scale(.88)',opacity:.8},
     {transform:'translate3d('+(dir*2)+'px,0,0) scale(1.08)',opacity:1,offset:.70},
     {transform:'translate3d(0,0,0) scale(1)',opacity:1}
    ],{duration:430,easing:'cubic-bezier(.2,.86,.22,1)'});
   }
  }
  previousView=view;
 }
 function afterRender({view='',changed=false}={}){
  const day=document.querySelector('#page .week-strip .week-day.focus-day');
  if(day){
   const dayKey=day.dataset.jumpDay;
   if(previousDay&&previousDay!==dayKey){
    animate(day,[
     {transform:'scale(.95)',borderRadius:'25px 14px 25px 14px',offset:0},
     {transform:'scale(1.045)',borderRadius:'15px 22px 15px 22px',offset:.42},
     {transform:'scale(.982)',borderRadius:'21px 18px',offset:.76},
     {transform:'scale(1)',borderRadius:'19px',offset:1}
    ],{duration:410,easing:'cubic-bezier(.18,.83,.21,1)'});
   }
   previousDay=dayKey;
  }
  directionalNav(view,changed);
 }
 document.addEventListener('pointerdown',e=>{
  if(e.button!==undefined&&e.button!==0)return;
  const day=e.target.closest?.('#page .week-day[data-jump-day]');
  if(day){pressCalendar(day);nativeHaptic();return}
  const tab=e.target.closest?.('#mobile-nav button[data-view]');
  const kpi=e.target.closest?.('#page [data-sculpted-detail]');
  if(tab||kpi)nativeHaptic();
 },{capture:true,passive:true});
 for(const event of ['pointerup','pointercancel']){
  document.addEventListener(event,e=>{
   const day=e.target.closest?.('#page .week-day[data-jump-day]');
   if(day)releaseCalendar(day);
  },{capture:true,passive:true});
 }
 document.addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ')&&e.target.matches?.('#page .week-day[data-jump-day]'))nativeHaptic();
 },{capture:true});
 window.RashodyExpressiveMotion={afterRender,nativeHaptic};
})();
