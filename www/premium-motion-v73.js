/* RASHODY PRO / Premium Motion v7.3
 * Motion language: press 240-320ms, tracked tilt, parallax, matte light,
 * spring return 860-1220ms. One active target; no pointer capture or
 * prevented touch events. Swipe and vertical scroll always win.
 */
(() => {
  'use strict';
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const selector = [
    'body.matte-editorial button',
    'body.matte-editorial .week-day',
    'body.matte-editorial #page .trend-card',
    'body.matte-editorial #page .compare-metric',
    'body.matte-editorial #page .history-tally',
    'body.matte-editorial #page .color-category-card'
  ].join(',');
  const groups = '.period-toggle,.trend-mode-toggle,.font-toggle,.filter-group,.mobile-nav';
  let active = null;
  let raf = 0;
  let releaseTimer = 0;
  let cleanupTimer = 0;
  let returning = null;

  const clamp = (x, min, max) => Math.min(max, Math.max(min, x));
  const isCard = el => el.matches('.trend-card,.compare-metric,.history-tally,.color-category-card');
  const profile = el => {
    if (el.matches('.r105-key,.tx-quick-amount>button')) return {press:175,release:690,min:70,tilt:3.5,scale:.954};
    if (el.closest('.mobile-nav')) return {press:250,release:1020,min:145,tilt:5.3,scale:.928};
    if (isCard(el)) return {press:310,release:1220,min:190,tilt:6.5,scale:.961};
    if (el.matches('.icon-btn') || el.getBoundingClientRect().width < 54)
      return {press:205,release:860,min:110,tilt:4.5,scale:.927};
    return {press:290,release:1160,min:170,tilt:7,scale:.945};
  };
  function visible(el) {
    if (!el || !el.isConnected || el.disabled) return false;
    if (el.closest('[hidden],[inert]') || el.matches('[aria-disabled="true"],.depth-motion-off')) return false;
    const r = el.getBoundingClientRect();
    return r.width >= 24 && r.height >= 24;
  }
  function reset(el) {
    el.classList.remove('depth-engaged','depth-return');
    for (const key of [
      'transform','transition','--depth-icon-x','--depth-icon-y',
      '--depth-text-x','--depth-text-y','--depth-shadow-x','--depth-shadow-y',
      '--depth-light-x','--depth-light-y','--depth-from-transform','--depth-release'
    ]) el.style.removeProperty(key);
    el.style.willChange = '';
  }
  function cancelTimers() {
    if (releaseTimer) {clearTimeout(releaseTimer);releaseTimer=0;}
    if (cleanupTimer) {
      clearTimeout(cleanupTimer); cleanupTimer=0;
      if(returning) reset(returning);
      returning=null;
    }
    if (raf) {cancelAnimationFrame(raf);raf=0;}
  }
  function pose() {
    raf = 0;
    const a=active;
    if (!a || !a.el.isConnected || a.ending) return;
    const w=a.rect.width,h=a.rect.height;
    const nx=clamp(((a.x-a.rect.left)/w-.5)*2,-1,1);
    const ny=clamp(((a.y-a.rect.top)/h-.5)*2,-1,1);
    // Smoothly follow touch. Browser animates transform between positions;
    // no CPU-heavy box-shadow changes on pointermove.
    const el=a.el;
    el.style.setProperty('transform',
      'perspective(920px) rotateX('+(-ny*a.motion.tilt).toFixed(2)+'deg) '+
      'rotateY('+(nx*a.motion.tilt).toFixed(2)+'deg) '+
      'translate3d(0,0,0) scale('+a.motion.scale+')','important');
    el.style.setProperty('--depth-icon-x',(nx*5.6).toFixed(2)+'px');
    el.style.setProperty('--depth-icon-y',(ny*5.0).toFixed(2)+'px');
    el.style.setProperty('--depth-text-x',(nx*2.1).toFixed(2)+'px');
    el.style.setProperty('--depth-text-y',(ny*1.8).toFixed(2)+'px');
    el.style.setProperty('--depth-shadow-x',(-nx*8).toFixed(2)+'px');
    el.style.setProperty('--depth-shadow-y',(5-ny*5).toFixed(2)+'px');
    el.style.setProperty('--depth-light-x',(50+nx*26).toFixed(1)+'%');
    el.style.setProperty('--depth-light-y',(50+ny*24).toFixed(1)+'%');
  }
  function schedule() {if (!raf) raf=requestAnimationFrame(pose);}
  function settle(a) {
    if (!a || active!==a) return;
    if (!a.el.isConnected || reduced?.matches) {finish(true);return;}
    a.ending=true;
    const el=a.el;
    // Capture the actual tilted pose BEFORE enabling return keyframes.
    // Otherwise CSS animation would immediately replace the press pose
    // and produce a subtle but visible snap on angled touches.
    const from=window.getComputedStyle(el).transform;
    el.classList.remove('depth-engaged');
    el.classList.add('depth-return');
    el.style.setProperty('--depth-from-transform',
      from && from!=='none' ? from : 'scale('+a.motion.scale+')');
    el.style.setProperty('--depth-release',a.motion.release+'ms');
    el.style.removeProperty('transition');
    el.style.removeProperty('transform');
    for (const [key,value] of [
      ['--depth-icon-x','0px'],['--depth-icon-y','0px'],
      ['--depth-text-x','0px'],['--depth-text-y','0px'],
      ['--depth-shadow-x','0px'],['--depth-shadow-y','0px'],
      ['--depth-light-x','50%'],['--depth-light-y','50%']
    ]) el.style.setProperty(key,value);
    active=null;
    returning=el;
    cleanupTimer=setTimeout(()=>{reset(el);returning=null;cleanupTimer=0;},a.motion.release+60);
  }
  function finish(immediate=false) {
    const a=active;
    if (!a) return;
    if (raf){cancelAnimationFrame(raf);raf=0;}
    if (releaseTimer){clearTimeout(releaseTimer);releaseTimer=0;}
    if (immediate || reduced?.matches || !a.el.isConnected){
      reset(a.el);active=null;return;
    }
    const remaining=Math.max(0,a.motion.min-(performance.now()-a.started));
    if (remaining) {
      releaseTimer=setTimeout(()=>{releaseTimer=0;settle(a);},remaining);
    } else settle(a);
  }
  function onDown(e) {
    if (reduced?.matches || active || e.isPrimary===false || e.button!==0) return;
    const el=e.target.closest?.(selector);
    if (!visible(el)) return;
    cancelTimers();
    const m=profile(el);
    el.classList.remove('depth-return');
    el.classList.add('depth-engaged');
    el.style.willChange='transform';
    el.style.setProperty('transition',
      'transform '+m.press+'ms cubic-bezier(.2,.9,.24,1.04)','important');
    active={el,pointerId:e.pointerId,rect:el.getBoundingClientRect(),
      x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,
      started:performance.now(),motion:m,ending:false};
    schedule();
  }
  function onMove(e) {
    const a=active;
    if (!a || a.pointerId!==e.pointerId || a.ending) return;
    if (Math.abs(e.clientY-a.sy)>13 || Math.abs(e.clientX-a.sx)>24) {
      finish(true);return;
    }
    a.x=e.clientX;a.y=e.clientY;schedule();
  }
  function onEnd(e) {
    if (!active || active.pointerId!==e.pointerId) return;
    finish(e.type==='pointercancel');
  }
  function selectMotion(e) {
    const target=e.target.closest?.('button');
    if (!target || reduced?.matches) return;
    const group=target.closest(groups);
    if (!group) return;
    const before=[...group.querySelectorAll(':scope > button')];
    const from=before.findIndex(el=>el.matches('.active'));
    const to=before.indexOf(target);
    if (to<0 || to===from) return;
    const selectorForGroup='.'+[...group.classList].find(x=>
      ['period-toggle','trend-mode-toggle','font-toggle','filter-group','mobile-nav'].includes(x));
    if (selectorForGroup==='.'+String(undefined)) return;
    const groupIndex=[...document.querySelectorAll(selectorForGroup)].indexOf(group);
    // Trigger after existing click handlers re-render the destination screen.
    requestAnimationFrame(()=>{
      const newGroup=[...document.querySelectorAll(selectorForGroup)][groupIndex];
      const chosen=newGroup?.querySelector(':scope > button.active');
      if (!chosen || !chosen.isConnected || !chosen.animate) return;
      const dx=clamp((from-to)*26,-54,54);
      const anim=chosen.animate([
        {transform:'translate3d('+dx+'px,0,0) scale(.91)',offset:0},
        {transform:'translate3d(0,0,0) scale(1.07)',offset:.60},
        {transform:'translate3d(0,0,0) scale(1)',offset:1}
      ],{duration:930,easing:'cubic-bezier(.2,.8,.25,1)',fill:'none'});
      anim.finished?.catch(()=>{});
    });
  }

  document.addEventListener('pointerdown',onDown,{capture:true,passive:true});
  document.addEventListener('pointermove',onMove,{capture:true,passive:true});
  document.addEventListener('pointerup',onEnd,{capture:true,passive:true});
  document.addEventListener('pointercancel',onEnd,{capture:true,passive:true});
  document.addEventListener('click',selectMotion,{capture:true,passive:true});
  document.addEventListener('scroll',()=>finish(true),{capture:true,passive:true});
  window.addEventListener('blur',()=>finish(true));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)finish(true);});
  reduced?.addEventListener?.('change',()=>{if(reduced.matches)finish(true);});
})();
