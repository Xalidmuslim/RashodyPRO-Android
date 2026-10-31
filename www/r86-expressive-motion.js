/* v8.6 Expressive Motion — one owner for week press/haptics and liquid tabs.
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
 function liquidNav(view,changed){
  const nav=document.getElementById('mobile-nav');
  if(!nav)return;
  const active=nav.querySelector('button.active[data-view]');
  if(!active)return;
  let indicator=nav.querySelector('.r86-liquid-indicator');
  if(!indicator){
   indicator=document.createElement('span');indicator.className='r86-liquid-indicator';
   indicator.setAttribute('aria-hidden','true');nav.prepend(indicator);
  }
  const navRect=nav.getBoundingClientRect(),target=active.getBoundingClientRect();
  const x=target.left-navRect.left,y=target.top-navRect.top;
  indicator.style.left=x+'px';indicator.style.top=y+'px';
  indicator.style.width=target.width+'px';indicator.style.height=target.height+'px';
  navAnimation?.cancel();navAnimation=null;
  if(changed&&previousView&&allowed()){
   const start=nav.querySelector('button[data-view="'+previousView+'"]');
   if(start){
    const r=start.getBoundingClientRect(),dx=r.left-target.left,dir=Math.sign(-dx)||1;
    navAnimation=animate(indicator,[
     {transform:'translate3d('+dx+'px,0,0) scaleX(.91) scaleY(.99)',borderRadius:'23px',offset:0},
     {transform:'translate3d('+(dx*.46)+'px,-2px,0) scaleX(1.22) scaleY(.90)',borderRadius:'30px 17px 30px 17px',offset:.43},
     {transform:'translate3d('+(dir*7)+'px,1px,0) scaleX(.93) scaleY(1.07)',borderRadius:'18px 27px 18px 27px',offset:.81},
     {transform:'translate3d(0,0,0) scaleX(1) scaleY(1)',borderRadius:'22px',offset:1}
    ],{duration:510,easing:'cubic-bezier(.22,.81,.20,1)'});
    const icon=active.querySelector('img,svg');
    animate(icon,[
     {transform:'translate3d('+(-dir*9)+'px,0,0) scale(.91)',opacity:.7},
     {transform:'translate3d('+(dir*2)+'px,-3px,0) scale(1.13)',opacity:1,offset:.76},
     {transform:'none',opacity:1}
    ],{duration:450,easing:'cubic-bezier(.2,.9,.22,1)'});
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
  liquidNav(view,changed);
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
