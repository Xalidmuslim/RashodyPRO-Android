/* Rashody PRO v9.2: viewport-anchored dock. Motion is allowed on tabs, never the dock.
 * A CSS bottom anchor moves when Android WebView's visual viewport changes
 * during a page transition; keep a measured, absolute viewport coordinate.
 * Does not touch financial data, page rendering or navigation history.
 */
(()=>{
 'use strict';
 const dock=document.getElementById('mobile-nav');
 if(!dock)return;
 const vv=window.visualViewport;
 const info={pins:0,drifts:0,viewportResizes:0,lastReason:'',lastTop:null,events:[]};
 const probe=document.createElement('span');
 probe.setAttribute('aria-hidden','true');
 probe.style.cssText='position:fixed;bottom:calc(4px + env(safe-area-inset-bottom,0px));width:0;height:0;visibility:hidden;pointer-events:none;';
 document.body.append(probe);
 let scheduled=false,watchUntil=0,watching=false,started=false;
 const bottomOfViewport=()=>{
  const visual=vv?vv.offsetTop+vv.height:window.innerHeight;
  // Fixed-position CSS coordinates belong to the layout viewport. Never place
  // the dock past its bottom even if the visual viewport overscrolls.
  return Math.min(window.innerHeight,visual);
 };
 function desiredTop(){
  const h=dock.getBoundingClientRect().height||dock.offsetHeight;
  if(!h)return null;
  const inset=Number.parseFloat(getComputedStyle(probe).bottom)||4;
  return Math.round(Math.max(0,bottomOfViewport()-h-inset));
 }
 function pin(reason){
  scheduled=false;
  if(!dock.isConnected||getComputedStyle(dock).display==='none')return;
  const top=desiredTop();if(top===null)return;
  if(info.lastTop!==null&&Math.abs(info.lastTop-top)<2&&reason!=='force')return;
  dock.style.setProperty('top',top+'px','important');
  dock.style.setProperty('bottom','auto','important');
  info.lastTop=top;info.pins++;info.lastReason=reason;
 }
 function schedule(reason){
  if(scheduled)return;
  scheduled=true;requestAnimationFrame(()=>pin(reason));
 }
 function watch(){
  if(watching)return;
  watching=true;
  const tick=()=>{
   if(!dock.isConnected){watching=false;return;}
   const should=desiredTop(), actual=dock.getBoundingClientRect().top;
   if(should!==null&&Math.abs(actual-should)>3){
    info.drifts++;
    info.events.push({when:Math.round(performance.now()),expected:should,actual:Math.round(actual)});
    if(info.events.length>12)info.events.shift();
    // Force a new anchor if Android has shifted the fixed layer.
    info.lastTop=null;pin('drift');
   }
   if(performance.now()<watchUntil)requestAnimationFrame(tick);
   else watching=false;
  };
  requestAnimationFrame(tick);
 }
 function track(reason){
  watchUntil=performance.now()+750;
  schedule(reason);watch();
 }
 window.addEventListener('resize',()=>{info.viewportResizes++;track('window-resize')},{passive:true});
 vv?.addEventListener?.('resize',()=>{info.viewportResizes++;track('visual-resize')},{passive:true});
 vv?.addEventListener?.('scroll',()=>track('visual-offset'),{passive:true});
 document.addEventListener('pointerdown',event=>{
  if(event.target.closest?.('#mobile-nav button[data-view]'))track('nav-press');
 },{capture:true,passive:true});
 document.addEventListener('click',event=>{
  if(event.target.closest?.('#mobile-nav button[data-view]'))track('nav-activate');
 },{capture:true,passive:true});
 const observer=new ResizeObserver(()=>schedule('dock-resize'));
 observer.observe(dock);
 window.RashodyNavStability={diagnostics:()=>({...info,events:info.events.slice()}),refresh:()=>track('manual')};
 // The page scripts are deferred; wait for the compiled theme and its sizing.
 const init=()=>{
  if(started)return;started=true;
  requestAnimationFrame(()=>{pin('force');track('initial');});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();
