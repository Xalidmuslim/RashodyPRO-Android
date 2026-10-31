/* Rashody PRO — Touch Depth Motion v7.2.
 * Delegated pointer animation; survives render() redraws and dynamically
 * created transaction/category sheets. Never cancels a pointer event,
 * changes application state, captures the pointer or disables scroll.
 * One active target, one rAF update, transform-only compositor motion.
 */
(() => {
  'use strict';
  const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const selector = 'body.matte-editorial button, body.matte-editorial .week-day';
  const MAX_DEGREES = 5;
  const RETURN_MS = 490;
  const RADIUS = 25;
  let active = null;
  let frame = 0;
  const releaseTimers = new WeakMap();
  function eligible(element) {
    return element && element.isConnected && !element.disabled &&
      !element.matches('[aria-disabled="true"], [hidden], .depth-motion-off') &&
      element.getClientRects().length > 0;
  }
  function clamp(v) { return Math.min(1, Math.max(-1, v)); }
  function clearRelease(element) {
    const timer = releaseTimers.get(element);
    if (timer != null) { clearTimeout(timer); releaseTimers.delete(element); }
  }
  function neutral(element) {
    element.classList.remove('depth-engaged', 'depth-return');
    for (const key of [
      'transform','transition','--depth-parallax-x','--depth-parallax-y',
      '--depth-light-x','--depth-light-y','--depth-shadow-x','--depth-shadow-y'
    ]) element.style.removeProperty(key);
  }
  function release(immediate = false) {
    if (!active) return;
    const current = active;
    active = null;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    const element = current.element;
    if (!element.isConnected || immediate || media?.matches) { neutral(element); return; }
    element.classList.remove('depth-engaged');
    element.classList.add('depth-return');
    element.style.setProperty('transition',
      'transform 490ms cubic-bezier(.2,1.46,.35,1), opacity 180ms ease','important');
    element.style.setProperty('transform',
      'perspective(850px) rotateX(0deg) rotateY(0deg) translateZ(0) scale(1)','important');
    element.style.setProperty('--depth-parallax-x','0px');
    element.style.setProperty('--depth-parallax-y','0px');
    element.style.setProperty('--depth-shadow-x','0px');
    element.style.setProperty('--depth-shadow-y','0px');
    element.style.setProperty('--depth-light-x','50%');
    element.style.setProperty('--depth-light-y','50%');
    clearRelease(element);
    releaseTimers.set(element, setTimeout(() => {
      neutral(element);
      releaseTimers.delete(element);
    }, RETURN_MS + 50));
  }
  function update() {
    frame = 0;
    const t = active;
    if (!t || !t.element.isConnected) return;
    const rect = t.rect;
    const nx = clamp(((t.x - rect.left) / rect.width - .5) * 2);
    const ny = clamp(((t.y - rect.top) / rect.height - .5) * 2);
    const degrees = rect.width < 46 ? MAX_DEGREES * .55 : MAX_DEGREES;
    const rx = -ny * degrees;
    const ry = nx * degrees;
    const scale = rect.width < 46 ? .965 : .973;
    const el = t.element;
    el.style.setProperty('transform',
      'perspective(850px) rotateX(' + rx.toFixed(2) +
      'deg) rotateY(' + ry.toFixed(2) +
      'deg) translateZ(0) scale(' + scale + ')','important');
    el.style.setProperty('--depth-parallax-x',(nx * 2.6).toFixed(2)+'px');
    el.style.setProperty('--depth-parallax-y',(ny * 2.6).toFixed(2)+'px');
    el.style.setProperty('--depth-shadow-x',(-nx * 3.5).toFixed(2)+'px');
    el.style.setProperty('--depth-shadow-y',(3 - ny * 2).toFixed(2)+'px');
    el.style.setProperty('--depth-light-x',(50 + nx * RADIUS).toFixed(1)+'%');
    el.style.setProperty('--depth-light-y',(50 + ny * RADIUS).toFixed(1)+'%');
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  function pointerDown(e) {
    if (media?.matches || !e.isPrimary || e.button !== 0 || active) return;
    const element = e.target.closest?.(selector);
    if (!eligible(element)) return;
    const rect = element.getBoundingClientRect();
    if (rect.width < 24 || rect.height < 24) return;
    clearRelease(element);
    const t = {element, pointerId:e.pointerId, x:e.clientX, y:e.clientY,
      startX:e.clientX,startY:e.clientY,rect};
    active = t;
    element.classList.remove('depth-return');
    element.classList.add('depth-engaged');
    element.style.setProperty('transition','none','important');
    schedule();
  }
  function pointerMove(e) {
    const t = active;
    if (!t || t.pointerId !== e.pointerId) return;
    if (Math.abs(e.clientY-t.startY)>14 || Math.abs(e.clientX-t.startX)>22) {
      // A swipe belongs to the scrolling/calendar gesture, not the tilt.
      release(true); return;
    }
    t.x=e.clientX;t.y=e.clientY;schedule();
  }
  function pointerEnd(e) {
    if (active?.pointerId !== e.pointerId) return;
    release(e.type === 'pointercancel');
  }
  document.addEventListener('pointerdown', pointerDown,{passive:true,capture:true});
  document.addEventListener('pointermove', pointerMove,{passive:true,capture:true});
  document.addEventListener('pointerup', pointerEnd,{passive:true,capture:true});
  document.addEventListener('pointercancel', pointerEnd,{passive:true,capture:true});
  window.addEventListener('scroll',()=>{if(active)release(true);},{passive:true,capture:true});
  window.addEventListener('blur',()=>release(true));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)release(true);});
  media?.addEventListener?.('change',()=>{if(media.matches)release(true);});
})();
