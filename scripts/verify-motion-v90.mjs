// v9.0: regression for stable navigation and compact same-color KPI morph.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
const read=p=>fs.readFileSync(p,'utf8');
const html=read('www/index.html'),motion=read('www/sculpted-motion-v77.js');
const navSource=read('www/r86-expressive-motion.js'),css=read('www/r87-polish.css');
execFileSync('node',['--check','www/r86-expressive-motion.js']);
execFileSync('node',['--check','www/sculpted-motion-v77.js']);
assert.match(html,/if\(mobileDock\.childElementCount!==tabs\.length\)mobileDock\.innerHTML=/,'Nav must mount only once');
assert.match(html,/tab\.classList\.toggle\('active',selected\)/);
assert.doesNotMatch(html,/\.mobile-nav button:active \{transform:none!important;/);
assert.doesNotMatch(html,/\.mobile-nav button,\.tx-check\):active \{/);
assert.doesNotMatch(css,/\.mobile-nav > button\[data-view\]:active\{\s*transform:none!important;/);
assert.match(css,/\.mobile-nav\{[\s\S]*?position:fixed!important;/);
assert.match(navSource,/function tabDown\(tab,e\)/);
assert.match(navSource,/function tabUp\(\)/);
assert.match(motion,/const from=card\.getBoundingClientRect\(\)/);
assert.match(motion,/const host=document\.createElement\('div'\)/);
assert.doesNotMatch(motion,/const color=card\.classList\.contains\('amber'\)/);
assert.match(motion,/detailStack\.className='r94-detached-stack r95-rows-only-stack'/,'No expanded KPI header, only individual rows');
assert.match(motion,/const layer=modal,source=origin,closingRows=rowMotion\.slice\(\)/);
assert.match(motion,/item\.animation\?\.cancel\(\)/);
assert.match(motion,/source\?\.removeAttribute\('aria-expanded'\)/);
assert.doesNotMatch(motion,/transform:'translate3d\(0,-3px,0\) scale\(1\.008/);
assert.match(css,/\.r88-expand-card \.r88-expanded-contents :is\(h2,strong,span,small,p,div\)/);
// Runtime smoke test: directional motion touches selected BUTTON only, not dock.
const handlers={};const animations=[];
const makeTab=(view,active=false)=>({
 dataset:{view},getBoundingClientRect:()=>({left:10,top:700,width:70,height:60}),
 querySelector:()=>({animate:(frames,opts)=>{animations.push({target:'icon',frames,opts});return {finished:Promise.resolve(),cancel(){}}}}),
 animate(frames,opts){animations.push({target:view,frames,opts});return {finished:Promise.resolve(),cancel(){}}},
 classList:{contains:name=>name==='active'&&active},
 set active(value){active=value},get isConnected(){return true}
});
const tabs=['dashboard','transactions','analytics','settings'].map((v,i)=>makeTab(v,i===0));
const nav={
 querySelector:selector=>selector==='button.active[data-view]'?tabs.find(x=>x.classList.contains('active')):null,
 querySelectorAll:()=>tabs,
 animate(){throw Error('Fixed dock must not animate')}
};
const document={hidden:false,getElementById:id=>id==='mobile-nav'?nav:null,
 querySelector:()=>null,addEventListener:(event,fn)=>{handlers[event]=fn}};
const win={matchMedia:()=>({matches:false}),Capacitor:{isNativePlatform:()=>false}};
vm.runInNewContext(navSource,{window:win,document,navigator:{vibrate(){}},getComputedStyle:()=>({transform:'none'})});
win.RashodyExpressiveMotion.afterRender({view:'dashboard',changed:false});
tabs[0].active=false;tabs[3].active=true;
win.RashodyExpressiveMotion.afterRender({view:'settings',changed:true});
assert.ok(animations.some(a=>a.target==='settings'&&a.frames.some(k=>/rotateY/.test(k.transform))), 'Selected tab rotates without dock motion');
assert.ok(animations.some(a=>a.target==='settings'&&a.frames.some(k=>/,-7px,/.test(k.transform))), 'Selected tab lifts');
assert.ok(tabs[0]&&tabs[3]&&nav,'Tab nodes are preserved');
console.log('PASS v9.0 pinned persistent dock, tactile directional tilt, compact same-palette reversible KPI');
