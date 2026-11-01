/* v8.7 Expressive Motion — spring calendar, haptics and approved horizontal tabs.
 * App state, SQLite, menu actions and accessibility semantics remain in core.
 * Animate transforms/opacity for transient states; no persistent GPU layers. */
(()=>{
 'use strict';
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 const allowed=()=>!reduced?.matches&&!document.hidden;
 let previousView=null,previousDay=null,navAnimation=null,navRelease=null;
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
  navRelease?.cancel();navRelease=null;
  // Raise and tilt the selected tab; NEVER animate or move the dock itself.
  if(changed&&previousView&&allowed()){
   const tabs=[...nav.querySelectorAll('button[data-view]')];
   const old=tabs.findIndex(el=>el.dataset.view===previousView);
   const next=tabs.findIndex(el=>el.dataset.view===view);
   const dir=Math.sign(next-old)||1;
   navAnimation=animate(active,[
    {transform:'perspective(750px) translate3d('+(-dir*7)+'px,0,0) rotateY('+(dir*8)+'deg) rotateZ('+(-dir*2)+'deg) scale(.96)',offset:0},
    {transform:'perspective(750px) translate3d('+(dir*3)+'px,-7px,0) rotateX(-4deg) rotateY('+(-dir*5)+'deg) rotateZ('+(dir*3.4)+'deg) scale(1.055)',offset:.54},
    {transform:'perspective(750px) translate3d(0,0,0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)',offset:1}
   ],{duration:500,easing:'cubic-bezier(.19,.78,.24,1)'});
   const icon=active.querySelector('img,svg');
   animate(icon,[
    {transform:'translate3d('+(-dir*7)+'px,0,0) rotateZ('+(-dir*8)+'deg)',offset:0},
    {transform:'translate3d('+(dir*3)+'px,-2px,0) rotateZ('+(dir*4)+'deg)',offset:.67},
    {transform:'none',offset:1}
   ],{duration:470,easing:'cubic-bezier(.2,.82,.22,1)'});
  }
  previousView=view;
 }
 let heldTab=null,heldAnimation=null;
 function tabDown(tab,e){
  if(!allowed())return;
  heldTab=tab;heldAnimation?.cancel();navRelease?.cancel();navRelease=null;
  const rect=tab.getBoundingClientRect();
  const local=((e.clientX-rect.left)/Math.max(1,rect.width)-.5)*2;
  const tilt=Math.max(-5,Math.min(5,local*5));
  heldAnimation=animate(tab,[
   {transform:'perspective(750px) translateY(0) rotateY(0deg) scale(1)'},
   {transform:'perspective(750px) translateY(-4px) rotateY('+tilt+'deg) scale(1.035)'}
  ],{duration:155,easing:'cubic-bezier(.2,.85,.2,1)',fill:'forwards'});
 }
 function tabUp(){
  if(!heldTab)return;
  const tab=heldTab;
  const pose=getComputedStyle(tab).transform;
  heldAnimation?.cancel();heldAnimation=null;heldTab=null;
  if(tab.isConnected)navRelease=animate(tab,[
   {transform:pose==='none'?'translateY(-3px) scale(1.02)':pose},
   {transform:'none'}
  ],{duration:310,easing:'cubic-bezier(.22,.82,.24,1)'});
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
  if(tab)tabDown(tab,e);
  if(tab||kpi)nativeHaptic();
 },{capture:true,passive:true});
 for(const event of ['pointerup','pointercancel']){
  document.addEventListener(event,e=>{
   if(heldTab)tabUp();
   const day=e.target.closest?.('#page .week-day[data-jump-day]');
   if(day)releaseCalendar(day);
  },{capture:true,passive:true});
 }
 document.addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ')&&e.target.matches?.('#page .week-day[data-jump-day]'))nativeHaptic();
 },{capture:true});
 window.RashodyExpressiveMotion={afterRender,nativeHaptic};
})();
