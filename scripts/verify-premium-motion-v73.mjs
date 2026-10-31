import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('www/premium-motion-v73.js','utf8');
const css=fs.readFileSync('www/studio-v70.css','utf8');
const html=fs.readFileSync('www/index.html','utf8');
assert.match(html,/<script src="premium-motion-v73\.js" defer><\/script>/);
assert.doesNotMatch(html,/<script src="touch-depth-v72\.js" defer><\/script>/);
for(const term of ["pointerdown","pointermove","pointerup","pointercancel","click","scroll","blur"]){
 assert.ok(source.includes("'"+term+"'"),'Missing pointer/gesture handling: '+term);
}
assert.match(source,/prefers-reduced-motion: reduce/);
assert.match(source,/requestAnimationFrame/);
assert.match(source,/const groups = '.period-toggle,.trend-mode-toggle,.font-toggle,.filter-group,.mobile-nav'/);
assert.match(source,/\.trend-card/);
assert.match(source,/\.history-tally/);
assert.doesNotMatch(source,/preventDefault|setPointerCapture|stopPropagation|touch-action\s*:/);
assert.match(css,/Premium Motion v7\.3/);
assert.match(css,/--depth-icon-x/);
assert.match(css,/--depth-text-x/);
assert.match(css,/--depth-shadow-x/);
assert.match(css,/radial-gradient/);
assert.match(css,/prefers-reduced-motion/);
assert.match(css,/@keyframes depth-premium-return/);
assert.match(css,/60%\{transform:perspective\(920px\) scale\(\.987\)\}/);
assert.doesNotMatch(css.slice(css.indexOf('/* Premium Motion v7.3')),/transition\s*:[^;]*(?:box-shadow|filter)/);
assert.match(fs.readFileSync('native/FinanceStoragePlugin.java','utf8'),/class FinanceStoragePlugin/);
// Simulated Android PointerEvents, without browser APIs or external packages.
const events={document:{},window:{}};
const listen=(where,type,fn)=>{(events[where][type]??=[]).push(fn)};
let clock=0,id=0;
const timers=new Map(),frames=new Map(),classes=new Set(),styles=new Map();
const style={
 setProperty:(k,v)=>styles.set(k,v),removeProperty:k=>styles.delete(k),
 set willChange(v){styles.set('willChange',v)},
 get willChange(){return styles.get('willChange')}
};
const button={
 isConnected:true,disabled:false,
 classList:{add(...a){a.forEach(k=>classes.add(k))},remove(...a){a.forEach(k=>classes.delete(k))},contains(k){return classes.has(k)}},
 style,
 matches:()=>false,
 closest:()=>null,
 getClientRects:()=>[{}],
 getBoundingClientRect:()=>({left:10,top:10,width:145,height:60})
};
const media={matches:false,addEventListener(){}};
const doc={hidden:false,addEventListener:(type,fn)=>listen('document',type,fn),querySelectorAll:()=>[]};
const ctx={
 document:doc,window:{matchMedia:()=>media,addEventListener:(type,fn)=>listen('window',type,fn),
  getComputedStyle:(el)=>({transform:el.style.getPropertyValue?.('transform') ?? styles.get('transform') ?? 'none'})},
 performance:{now:()=>clock},
 requestAnimationFrame:fn=>{const k=++id;frames.set(k,fn);return k},
 cancelAnimationFrame:k=>frames.delete(k),
 setTimeout:(fn,ms)=>{const k=++id;timers.set(k,{fn,ms});return k},
 clearTimeout:k=>timers.delete(k)
};
vm.runInNewContext(source,ctx);
const event=(type,x=50,y=40)=>({
 type,isPrimary:true,button:0,pointerId:4,clientX:x,clientY:y,
 target:{closest:(selector)=>selector==='button'?button:button}
});
const send=(type,x=50,y=40)=>{for(const fn of events.document[type]??[])fn(event(type,x,y))};
const paint=()=>{const q=[...frames.values()];frames.clear();q.forEach(fn=>fn())};
const nextTimer=()=>{const q=[...timers.entries()];if(!q.length)return 0;const [k,v]=q[0];timers.delete(k);clock+=v.ms;v.fn();return v.ms};
send('pointerdown');paint();
assert.ok(classes.has('depth-engaged'),'Touch must activate depth');
assert.match(styles.get('transition'),/290ms/,'Press must be gracefully eased');
assert.match(styles.get('transform'),/scale\(0\.945\)/);
assert.match(styles.get('--depth-shadow-x'),/px/);
assert.match(styles.get('--depth-icon-x'),/px/);
send('pointermove',53,43);paint();
assert.ok(styles.has('--depth-text-x'));
send('pointerup');
assert.ok(!classes.has('depth-return'),'Keep perceptible minimum press for quick taps');
assert.ok(nextTimer()>0,'Minimum hold duration must be scheduled');
assert.ok(classes.has('depth-return'),'Release must begin a spring phase');
assert.match(styles.get('--depth-release'),/1160ms/,'Premium return must last over one second');
nextTimer();
assert.ok(!classes.has('depth-return'));
assert.ok(!styles.has('transform'),'No transform stays stuck after spring');
// A native vertical swipe must cancel motion immediately and never intercept scroll.
send('pointerdown');paint();
send('pointermove',50,90);paint();
assert.ok(!classes.has('depth-engaged'));
assert.ok(!styles.has('transform'));
// Inactive control cannot be pressed.
button.disabled=true;send('pointerdown');paint();
assert.ok(!classes.has('depth-engaged'));button.disabled=false;
media.matches=true;send('pointerdown');paint();
assert.ok(!classes.has('depth-engaged'));
console.log('OK v7.3: long press easing, parallax, 1160ms spring, swipe cancellation, disabled/reduced motion');
