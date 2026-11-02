import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
const motion=fs.readFileSync('www/sculpted-motion-v77.js','utf8');
const css=fs.readFileSync('www/r87-polish.css','utf8');
execFileSync('node',['--check','www/sculpted-motion-v77.js']);
assert.doesNotMatch(motion,/modal\.appendChild\(card\)|card\.before\(cardSlot\)|card\.classList\.add\('r88-expand-card'\)/);
assert.match(css,/\.r95-rows-only-scrim/);
assert.match(css,/\.r95-rows-only-row/);
assert.match(motion,/duration:960,delay:120\+i\*185/,'Rows visibly and slowly emerge in original order');
assert.match(motion,/duration:720,delay:i\*125/,'Rows retract in that SAME order');
assert.match(motion,/const current=getComputedStyle\(item\.row\)/,'Early Back resumes from current visual frame');
assert.match(motion,/const rows=\[\.\.\.list\.children\]/,'Use all rows, not a fake sample count');
let created=0,returnedToSource=false,historyBack=0;
const events={},animations=[];
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.attributes={};this.dataset={};this.style={};this.isConnected=true;this.className='';this.innerHTML='';this._rect={left:20,top:200,width:340,height:60};this.index=0;
 this.classList={add:()=>{},remove:()=>{}};}
 getBoundingClientRect(){return this._rect;}
 appendChild(el){this.children.push(el);el.parent=this;return el}
 setAttribute(k,v){this.attributes[k]=v}
 removeAttribute(k){delete this.attributes[k]}
 addEventListener(){}
 remove(){this.isConnected=false;if(this.parent)this.parent.children=this.parent.children.filter(x=>x!==this)}
 querySelector(selector){
  if(selector==='.r77-detail-list'&&this.innerHTML.includes('r77-detail-list')){
   const count=(this.innerHTML.match(/class="r77-detail-row"/g)||[]).length;
   return {children:Array.from({length:count},(_,i)=>{
    const el=new Element('row');el.index=i;el._rect={left:26,top:240+i*74,width:330,height:58};return el;
   })};
  }
  return selector==='.r88-morph-close'?this.children.find(x=>x.tag==='button')||null:null;
 }
 animate(frames,options){animations.push({tag:this.tag,index:this.index,frames,options});return {finished:Promise.resolve(),cancel(){}};}
 focus(){returnedToSource=true}
}
const card=new Element('kpi');card.dataset.sculptedDetail='week';card._rect={left:25,top:160,width:112,height:87};
const body=new Element('body');
const document={hidden:false,body,
 getElementById(id){return id==='overlay'?{hidden:true}:null},
 createElement(tag){created++;return new Element(tag)},
 addEventListener(name,fn){events['document:'+name]=fn}};
const window={innerWidth:390,innerHeight:780,
 matchMedia:()=>({matches:false,addEventListener(){}}),
 addEventListener(name,fn){events['window:'+name]=fn},
 RashodySculptedDetails:()=>({title:'Итоги',number:'100 ₽',sub:'',rows:[
   {name:'Первая',value:'10 ₽'},{name:'Вторая',value:'20 ₽'},{name:'Третья',value:'70 ₽'}
 ]})};
const context={document,window,history:{pushState(){},back(){historyBack++}},
 getComputedStyle(){return {transform:'none',opacity:'1'}},requestAnimationFrame(cb){cb()},console};
vm.runInNewContext(motion,context);
events['document:click']({target:{closest(sel){return sel==='#page [data-sculpted-detail]'?card:null}},stopImmediatePropagation(){},preventDefault(){}});
assert.equal(body.children.length,1,'One transparent scrim, not one enclosing detail card');
const scrim=body.children[0];
assert.ok(scrim.className.includes('r95-rows-only-scrim'));
assert.equal(scrim.children.length,2,'Separate unframed row stack plus standalone close control');
assert.ok(scrim.children.every(x=>x!==card),'Do not pull source card out of dashboard');
const stack=scrim.children[0];
assert.ok(stack.className.includes('r95-rows-only-stack'));
assert.equal(stack.children.length,3);
const openings=animations.filter(a=>a.tag==='row');
assert.equal(openings.length,3);
assert.deepEqual(openings.map(a=>a.options.duration),[960,960,960]);
assert.deepEqual(openings.map(a=>a.options.delay),[120,305,490]);
// Close immediately before any entrance promise settles.
window.RashodySculptedMotion.closeDetail();
const closing=animations.filter(a=>a.tag==='row').slice(3);
assert.equal(closing.length,3);
assert.deepEqual(closing.map(a=>a.options.delay),[0,125,250]);
assert.ok(closing.every(a=>a.options.duration===720));
await Promise.resolve();await Promise.resolve();await new Promise(resolve=>setImmediate(resolve));
assert.equal(body.children.length,0,'No leftover scrim after fast Back');
assert.equal(card.attributes['aria-expanded'],undefined,'Card state restored');
assert.ok(returnedToSource,'Focus returned to unchanged KPI');
assert.equal(historyBack,1);
console.log('PASS v9.5: rows only, 960ms slow stagger, same-order return, fast Back, original KPI untouched');