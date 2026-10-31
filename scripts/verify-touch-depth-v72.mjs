import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('www/touch-depth-v72.js','utf8');
const html=fs.readFileSync('www/index.html','utf8');
const css=fs.readFileSync('www/studio-v70.css','utf8');
assert.match(html,/<script src="touch-depth-v72\.js" defer><\/script>/);
assert.match(source,/document\.addEventListener\('pointerdown'/);
assert.match(source,/document\.addEventListener\('pointermove'/);
assert.match(source,/document\.addEventListener\('pointerup'/);
assert.match(source,/document\.addEventListener\('pointercancel'/);
assert.match(source,/prefers-reduced-motion: reduce/);
assert.match(source,/requestAnimationFrame/);
assert.match(source,/release\(true\)/);
assert.doesNotMatch(source,/preventDefault|setPointerCapture|stopPropagation|touch-action\s*:/);
assert.match(css,/Touch Depth v7\.2/);
assert.match(css,/button\.depth-engaged::after/);
assert.match(css,/depth-shadow-x/);
assert.match(css,/depth-text-x/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
assert.match(fs.readFileSync('native/FinanceStoragePlugin.java','utf8'),/class FinanceStoragePlugin/);
const listeners={document:{},window:{}};
const add=(place,type,fn)=>{(listeners[place][type]??=[]).push(fn)};
const media={matches:false,addEventListener(){}};
const timers=new Map();
const frames=new Map();
let seq=0;
const styles=new Map(),classes=new Set();
const fakeButton={
  isConnected:true,disabled:false,
  classList:{add(...names){for(const n of names)classes.add(n)},remove(...names){for(const n of names)classes.delete(n)},contains(n){return classes.has(n)}},
  style:{setProperty(k,v){styles.set(k,v)},removeProperty(k){styles.delete(k)}},
  matches(){return false},getClientRects(){return [{}]},
  getBoundingClientRect(){return {left:20,top:30,width:110,height:60}}
};
const ctx={
  window:{matchMedia:()=>media,addEventListener:(t,fn)=>add('window',t,fn)},
  document:{addEventListener:(t,fn)=>add('document',t,fn),hidden:false},
  setTimeout:(fn)=>{const id=++seq;timers.set(id,fn);return id},
  clearTimeout:(id)=>timers.delete(id),
  requestAnimationFrame:(fn)=>{const id=++seq;frames.set(id,fn);return id},
  cancelAnimationFrame:(id)=>frames.delete(id)
};
vm.runInNewContext(source,ctx);
const emit=(type,el=fakeButton,x=55,y=50,other={})=>{
 const e={type,button:0,isPrimary:true,pointerId:1,clientX:x,clientY:y,
  target:{closest(){return el}},...other};
 for(const fn of listeners.document[type]??[])fn(e);
};
const paint=()=>{const tasks=[...frames.values()];frames.clear();for(const fn of tasks)fn()};
emit('pointerdown');paint();
assert.ok(classes.has('depth-engaged'),'Press should engage');
assert.match(styles.get('transform'),/rotateX\(/);
assert.match(styles.get('transform'),/scale\(0\.973\)/);
emit('pointermove',fakeButton,60,52);paint();
assert.match(styles.get('--depth-light-x'),/%/);
assert.match(styles.get('--depth-shadow-x'),/px/);
emit('pointerup');
assert.ok(classes.has('depth-return'),'Release should spring');
assert.match(styles.get('transition'),/490ms/);
for(const fn of timers.values())fn();timers.clear();
assert.ok(!classes.has('depth-return') && !classes.has('depth-engaged'));
assert.ok(!styles.has('transform'),'Resting transform must not remain inline');
// Gesture: native scrolling must not be delayed/blocked.
emit('pointerdown');paint();
emit('pointermove',fakeButton,55,80);paint();
assert.ok(!classes.has('depth-engaged'));
assert.ok(!styles.has('transform'));
// Disabled buttons must never visually respond.
fakeButton.disabled=true;emit('pointerdown');paint();
assert.ok(!classes.has('depth-engaged'));fakeButton.disabled=false;
// Honor OS motion preference.
media.matches=true;emit('pointerdown');paint();
assert.ok(!classes.has('depth-engaged'));
console.log('OK: press, tilt, parallax, dynamic shadow, release, scroll cancel, disabled, reduced-motion');
