import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
const js=fs.readFileSync('www/nav-dock-stability-v92.js','utf8');
const html=fs.readFileSync('www/index.html','utf8');
const css=fs.readFileSync('www/r87-polish.css','utf8');
const nav=fs.readFileSync('www/r86-expressive-motion.js','utf8');
execFileSync('node',['--check','www/nav-dock-stability-v92.js']);
assert.match(html,/src="nav-dock-stability-v92\.js" defer/);
assert.match(css,/#mobile-nav\.mobile-nav/);
assert.match(nav,/navAnimation=animate\(active/);
assert.match(js,/const horizontalFrame=/);
assert.match(js,/vv\?\.offsetLeft/,'The visible WebView can shift horizontally independent of the layout viewport');
assert.match(js,/dock\.style\.setProperty\('left'/);
assert.match(js,/dock\.style\.setProperty\('width'/);
assert.doesNotMatch(js,/innerHTML|replaceWith|appendChild\(dock\)/);
const frames=[],listeners={},vvListeners={};
let now=0,top=null,bottom=null,left=null,right=null,width=null,margin=null;
let boxLeft=12,boxWidth=367;
const style={setProperty(key,v){
 if(key==='top')top=v;
 if(key==='bottom')bottom=v;
 if(key==='left'){left=v;boxLeft=parseFloat(v)}
 if(key==='width'){width=v;boxWidth=parseFloat(v)}
 if(key==='right')right=v;
 if(key==='margin')margin=v;
}};
const dock={style,isConnected:true,offsetHeight:74,childElementCount:5,
 getBoundingClientRect:()=>({top:top===null?768:parseFloat(top),left:boxLeft,width:boxWidth,height:74})};
const viewport={height:845,offsetTop:0,width:390,offsetLeft:0,
 addEventListener(name,handler){vvListeners[name]=handler}};
const document={readyState:'complete',body:{append(){}},
 getElementById:id=>id==='mobile-nav'?dock:null,
 createElement(){return {style:{},setAttribute(){}}},
 addEventListener(name,handler){listeners[name]=handler}};
const window={innerHeight:851,innerWidth:390,visualViewport:viewport,
 addEventListener(name,handler){listeners['window:'+name]=handler}};
function requestAnimationFrame(callback){frames.push(callback);return frames.length;}
function pump(n=7){for(let i=0;i<n;i++){const callback=frames.shift();if(!callback)break;now+=16;callback();}}
function getComputedStyle(el){return el===dock?{display:'flex'}:{bottom:'4px'};}
vm.runInNewContext(js,{document,window,ResizeObserver:class{observe(){}},
 performance:{now:()=>now},requestAnimationFrame,getComputedStyle});
pump(7);
assert.equal(top,'767px','Preserve v9.2 vertical anchor');
assert.equal(bottom,'auto');
assert.equal(left,'12px','Centered horizontal start');
assert.equal(width,'367px','Explicit measured dock width');
assert.equal(right,'auto');
assert.equal(margin,'0');
assert.equal(dock.childElementCount,5);
const firstPins=window.RashodyNavStability.diagnostics().pins;
// Simulate visual WebView viewport shifting to the right while its height stays the same.
viewport.offsetLeft=9;vvListeners.scroll();pump(7);
assert.equal(top,'767px','Horizontal offset must not move Y');
assert.equal(left,'21px','Compensate horizontal visual viewport offset');
assert.equal(width,'367px');
assert.ok(window.RashodyNavStability.diagnostics().pins>firstPins,
 'Horizontal-only change must not be ignored because top is unchanged');
// Resize viewport width with offset. Keep the panel inside the visible range.
viewport.width=350;vvListeners.resize();pump(7);
assert.equal(left,'20px','Inset respects resized visual viewport + offset');
assert.equal(width,'329px','Panel width tracks viewport rather than CSS layout width');
// Return and verify exact original coordinates, no transform bounce.
viewport.offsetLeft=0;viewport.width=390;vvListeners.resize();pump(7);
assert.equal(left,'12px');
assert.equal(width,'367px');
assert.equal(top,'767px');
// An unexpected panel X displacement is detected and corrected without node replacement.
boxLeft=44;
now+=30;window.RashodyNavStability.refresh();pump(8);
assert.equal(left,'12px');
assert.equal(boxLeft,12);
assert.ok(window.RashodyNavStability.diagnostics().horizontalDrifts>0);
assert.equal(dock.childElementCount,5);
console.log('PASS v9.3: viewport-anchored dock X/Y/width, restores horizontal drift, buttons remain mounted');
