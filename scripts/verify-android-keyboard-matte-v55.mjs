import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const html=fs.readFileSync('www/index.html','utf8');
const css=fs.readFileSync('www/deep-matte.css','utf8');
const start=html.indexOf('const modalViewportState={');
const end=html.indexOf('\nfunction openModal(){',start);
assert.ok(start>0&&end>start,'Android IME and category-sheet implementation must exist');
const source=html.slice(start,end);
const final=css.slice(css.indexOf('/* matte-unified-v55'));
assert.ok(final.startsWith('/* matte-unified-v55'),'Final matte override must load last');
assert.doesNotMatch(final,/(?:linear|radial|conic)-gradient\s*\(/i,'No glossy gradient in the final material layer');
assert.match(final,/--r-modal-visible-height/,'Sheet must follow visual viewport');
assert.match(final,/max-height:calc\(var\(--r-modal-visible-height/,'Sheet must adapt to IME height');
assert.match(final,/prefers-reduced-motion/,'Reduced-motion users must not get layout transitions');
assert.match(css,/dashboard-label-fit-v55/,'Responsive dashboard text corrections missing');
for(const selector of [
 '.trend-card strong','.trend-card>span:last-child','.feature-copy :is(h2,p,.feature-amount)',
 '.day-donut-legend :is(.day-donut-name,.day-donut-data)','.week-day-total'
]) assert.ok(final.includes(selector),'Text fitting rule missing: '+selector);
for(const selector of [
 '#modal.tx-sheet','.overlay .sheet','.icon-btn','.primary-btn',
 '.week-day:not(.focus-day)','.r105-key','.tx-category-search'
]) assert.ok(final.includes(selector),'Shared matte component missing: '+selector);

const listeners=new Map();
const vv={height:460,offsetTop:0,
 addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type).add(fn);},
 removeEventListener(type,fn){listeners.get(type)?.delete(fn);},
 emit(type){for(const fn of listeners.get(type)||[])fn();}
};
const changes=[],animations=[];
let naturalHeight=780,blurred=false,rendered=false,focusId='';
const overlay={hidden:false,style:{
 setProperty(key,value){changes.push([key,value]);},removeProperty(){} }};
const modal={children:[{animate(frames,options){animations.push(['content',options.duration]);return {finished:Promise.resolve()};}}],
 style:{height:''},scrollTop:340,
 getBoundingClientRect(){return {height:this.style.height&&this.style.height!=='auto'?parseFloat(this.style.height):naturalHeight};},
 setAttribute(){},removeAttribute(){},
 animate(frames,options){animations.push(['sheet',options.duration]);return {finished:Promise.resolve(),cancel(){}};}
};
const heading={focus(){focusId='dialog-title'}};
const input={tagName:'INPUT',readOnly:false,disabled:false,closest(){return modal;},
 blur(){blurred=true;context.document.activeElement=heading;}};
const context={
 nativeAndroid:true,categorySheetBusy:false,window:{visualViewport:vv,scrollY:0,innerHeight:780,
  scrollTo(){},matchMedia(){return {matches:false};}},
 document:{activeElement:input,getElementById(id){return id==='modal'?modal:id==='overlay'?overlay:heading;}},
 requestAnimationFrame(fn){fn();},setTimeout,clearTimeout,Promise
};
vm.createContext(context);
vm.runInContext(source+';globalThis.testSwitch=switchCategorySheet;globalThis.state=modalViewportState;',context);
context.state.fullHeight=780;
const first=context.testSwitch(()=>{
 assert.equal(blurred,true,'Blur editor before swapping contents');
 assert.equal(vv.height,780,'Do not replace editor while keyboard is collapsing');
 rendered=true;naturalHeight=450;modal.scrollTop=0;
},'dialog-title',0);
setTimeout(()=>{vv.height=780;vv.emit('resize')},10);
await first;
assert.ok(rendered,'Category screen was not rendered');
assert.equal(focusId,'dialog-title','Focus heading instead of opening keyboard again');
assert.equal(modal.style.height,'','No sticky height after animation');
assert.ok(animations.some(([kind])=>kind==='sheet'),'Sheet height should animate');
assert.ok(changes.some(([key,value])=>key==='--r-modal-visible-height'&&value==='780px'),
 'Visible viewport CSS must update after the IME closes');

context.document.activeElement=input;blurred=false;vv.height=460;rendered=false;naturalHeight=450;
const back=context.testSwitch(()=>{
 assert.ok(blurred,'Blur category input before returning');
 assert.equal(vv.height,780,'Wait for keyboard before returning to expense');
 rendered=true;naturalHeight=780;modal.scrollTop=0;
},'dialog-title',340);
setTimeout(()=>{vv.height=780;vv.emit('resize')},10);
await back;
assert.ok(rendered,'Expense screen was not restored');
assert.equal(modal.scrollTop,340,'Expense scroll offset must be preserved');
assert.equal(context.categorySheetBusy,false,'Busy flag must release');
context.window.matchMedia=()=>({matches:true});
const n=animations.length;
await context.testSwitch(()=>{naturalHeight=450;},'dialog-title',0);
assert.equal(animations.length,n,'Reduced motion must not animate');

console.log('OK: keyboard closes before category switch and back; scrolling, animation and matte UI contracts');
