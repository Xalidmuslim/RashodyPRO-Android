/* Rashody PRO v9.3: screen-stationary navigation dock, retaining v9.2 vertical fix.
 * Keep left, width and top anchored to the visible Android WebView viewport.
 * The dock is never animated; only individual tabs are animated by r86.
 * Finance/SQLite, page transitions, route history and saved data are untouched.
 */
(()=>{
 'use strict';
 const dock=document.getElementById('mobile-nav');
 if(!dock)return;
 const vv=window.visualViewport;
 const info={pins:0,drifts:0,horizontalDrifts:0,viewportResizes:0,lastReason:'',lastTop:null,lastLeft:null,lastWidth:null,events:[]};
 const probe=document.createElement('span');
 probe.setAttribute('aria-hidden','true');
 probe.style.cssText='position:fixed;bottom:calc(4px + env(safe-area-inset-bottom,0px));width:0;height:0;visibility:hidden;pointer-events:none;';
 document.body.append(probe);
 let scheduled=false,watchUntil=0,watching=false,started=false,scheduledReason='';
 const bottomOfViewport=()=>{
  const visual=vv?vv.offsetTop+vv.height:window.innerHeight;
  return Math.min(window.innerHeight,visual);
 };
 // The horizontal CSS clamp is used by the existing 5-button navigation.
 // Anchor against the visible viewport rather than the layout viewport:
 // an occasional visualViewport.offsetLeft change must not slide the frame.
 const horizontalFrame=()=>{
  const width=Number(vv?.width)||Number(window.innerWidth)||0;
  if(width<=0)return null;
  const margin=Math.min(22,Math.max(10,width*.03));
  const offset=Number(vv?.offsetLeft)||0;
  return {left:Math.round(offset+margin),width:Math.round(Math.max(1,width-2*margin))};
 };
 function desiredFrame(){
  const h=dock.getBoundingClientRect().height||dock.offsetHeight;
  if(!h)return null;
  const inset=Number.parseFloat(getComputedStyle(probe).bottom)||4;
  return {top:Math.round(Math.max(0,bottomOfViewport()-h-inset)),...horizontalFrame()};
 }
 function pin(reason){
  scheduled=false;
  if(!dock.isConnected||getComputedStyle(dock).display==='none')return;
  const frame=desiredFrame();if(!frame)return;
  // Never abort just because Y has not changed: the remaining bug was X drift.
  const topChanged=info.lastTop===null||Math.abs(info.lastTop-frame.top)>=1;
  const leftChanged=Number.isFinite(frame.left)&&(info.lastLeft===null||Math.abs(info.lastLeft-frame.left)>=1);
  const widthChanged=Number.isFinite(frame.width)&&(info.lastWidth===null||Math.abs(info.lastWidth-frame.width)>=1);
  if(!topChanged&&!leftChanged&&!widthChanged&&reason!=='force')return;
  if(topChanged||reason==='force'){
   dock.style.setProperty('top',frame.top+'px','important');
   dock.style.setProperty('bottom','auto','important');
  }
  if(Number.isFinite(frame.left)&&Number.isFinite(frame.width)&&(leftChanged||widthChanged||reason==='force')){
   dock.style.setProperty('left',frame.left+'px','important');
   dock.style.setProperty('width',frame.width+'px','important');
   dock.style.setProperty('right','auto','important');
   dock.style.setProperty('margin','0','important');
   info.lastLeft=frame.left;info.lastWidth=frame.width;
  }
  info.lastTop=frame.top;info.pins++;info.lastReason=reason;
 }
 function schedule(reason){
  scheduledReason=reason;
  if(scheduled)return;
  scheduled=true;requestAnimationFrame(()=>pin(scheduledReason));
 }
 function watch(){
  if(watching)return;
  watching=true;
  const tick=()=>{
   if(!dock.isConnected){watching=false;return;}
   const should=desiredFrame(),actual=dock.getBoundingClientRect();
   if(should){
    const dy=Math.abs(actual.top-should.top)>3;
    const dx=Number.isFinite(should.left)&&Number.isFinite(actual.left)&&Math.abs(actual.left-should.left)>3;
    const dw=Number.isFinite(should.width)&&Number.isFinite(actual.width)&&Math.abs(actual.width-should.width)>3;
    if(dy||dx||dw){
     info.drifts++;if(dx||dw)info.horizontalDrifts++;
     info.events.push({when:Math.round(performance.now()),expectedTop:should.top,actualTop:Math.round(actual.top),expectedLeft:should.left,actualLeft:Math.round(actual.left),expectedWidth:should.width,actualWidth:Math.round(actual.width)});
     if(info.events.length>12)info.events.shift();
     if(dy)info.lastTop=null;
     if(dx||dw){info.lastLeft=null;info.lastWidth=null;}
     pin('drift');
    }
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
 const init=()=>{
  if(started)return;started=true;
  requestAnimationFrame(()=>{pin('force');track('initial');});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();
