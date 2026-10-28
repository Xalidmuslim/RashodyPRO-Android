import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const html=fs.readFileSync('www/index.html','utf8');
const css=fs.readFileSync('www/deep-matte.css','utf8');
const start=html.indexOf('async function switchCategorySheet('), end=html.indexOf('\nfunction openModal(){',start);
assert.ok(start>=0&&end>start,'Cannot locate actual modal transition implementation');
const source=html.slice(start,end);
assert.ok(!/modal\.animate\(\[\{opacity:/.test(source),'Do not animate blocked sheet opacity/transform; height is permitted');
assert.ok(!/\.focus\(\{preventScroll:true\}\)/.test(html.slice(html.indexOf('async function startCatFromTx('),html.indexOf('async function saveCat('))),'Do not auto-focus an input and raise Android keyboard');
assert.match(source,/getBoundingClientRect\(\)\.height/,'Measure old and new real sheet heights');
assert.match(source,/modal\.style\.height/,'Animate the sheet size instead of snapping between two different heights');
assert.match(source,/modal\.children/,'Animate actual modal content, not !important-overridden parent');
assert.match(source,/scrollTop\s*=\s*scrollY/,'Restore scroll position after a return');
assert.match(html,/id="dialog-title" tabindex="-1"/,'Use non-editable focus target');
assert.ok(!/},'txCategorySearch',modalScrollBeforeCategory/.test(html),'Return must not autofocus search input and trigger Android IME');
assert.match(html,/txCategorySearchBeforeCategory/,'Preserve category search filter');
assert.match(html,/txExpandedBeforeCategory/,'Preserve expanded categories state');
assert.match(html,/categorySheetNeedsRefresh/,'Refresh background screen after dismissing, not midway through modal transition');
assert.match(css, /category-modal-matte-v54/,'Final modal matte overrides absent');
const finish=css.slice(css.indexOf('/* category-modal-matte-v54'));
assert.ok(!/linear-gradient\(|radial-gradient\(/.test(finish),'No glassy lighting gradients');
for (const selector of [
 '#modal.tx-sheet .tx-amount-block',
 '#modal.tx-sheet .r105-key',
 '#modal.tx-sheet .tx-quick-amount>button',
 '#modal.tx-sheet .tx-category-search',
 '#modal.tx-sheet .tx-details input',
 '#modal.cat-sheet .icon-choice'
]) assert.ok(finish.includes(selector),'Modal matte token missing: '+selector);
assert.match(finish,/prefers-reduced-motion/,'Motion reduction should be supported');
assert.match(html,/Расходы PRO 5\.4 · Deep Matte/,'Version label must reflect the new build');
console.log('OK: stable animated category sheet, no forced keyboard, preserved inputs and solid matte modal');


// Execute the real production helper under an isolated DOM simulation:
// no external data and no Android device required. The test proves that the
// sheet height interpolates and the original scroll offset is restored.
const stubRuns=[];
let naturalHeight=780;
let focusId=null;
const child={
 animate(frames,opts){stubRuns.push({kind:'child',frames,opts});return {finished:Promise.resolve()};}
};
const modal={
 children:[child],
 style:{height:''},scrollTop:430,
 getBoundingClientRect(){return {height:this.style.height&&this.style.height!=='auto'?parseFloat(this.style.height):naturalHeight}},
 setAttribute(){},removeAttribute(){},
 animate(frames,opts){stubRuns.push({kind:'sheet',frames,opts});return {finished:Promise.resolve(),cancel(){}};}
};
const context={
 categorySheetBusy:false,
 document:{getElementById(id){return id==='modal'?modal:{focus(){focusId=id}};}},
 window:{matchMedia(){return {matches:false}}},
 Promise
};
vm.createContext(context);
vm.runInContext(source+';globalThis.testSwitch=switchCategorySheet;',context);
await context.testSwitch(()=>{naturalHeight=450;modal.scrollTop=0;},'dialog-title',0);
assert.equal(focusId,'dialog-title','Category screen must focus a non-editable heading');
assert.equal(modal.style.height,'','No fixed height should leak into subsequent scrolling');
assert.ok(stubRuns.some(x=>x.kind==='child'&&x.opts.duration>=100),'Content must animate in both directions');
assert.ok(stubRuns.some(x=>x.kind==='sheet'&&x.frames[0].height==='780px'&&x.frames[1].height==='450px'),'Panel height should move smoothly');
const sheetAnimationsBefore=stubRuns.length;
await context.testSwitch(()=>{naturalHeight=780;modal.scrollTop=0;},'dialog-title',430);
assert.equal(modal.scrollTop,430,'Return must restore exact scroll offset, not force top');
assert.ok(stubRuns.length>sheetAnimationsBefore,'Return must animate too');
assert.equal(context.categorySheetBusy,false,'Transition lock should release');
// Reduced motion is an explicit alternative behavior, not an error.
context.window.matchMedia=()=>({matches:true});
const animationsBefore=stubRuns.length;
await context.testSwitch(()=>{naturalHeight=450;},'dialog-title',0);
assert.equal(stubRuns.length,animationsBefore,'Reduce Motion must bypass all transitions');
console.log('OK: two-way sheet motion, restored position, no keyboard focus, reduce-motion');
