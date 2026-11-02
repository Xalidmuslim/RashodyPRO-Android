import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
const js=fs.readFileSync('www/nav-dock-stability-v92.js','utf8');
const html=fs.readFileSync('www/index.html','utf8');
const css=fs.readFileSync('www/r87-polish.css','utf8');
const motion=fs.readFileSync('www/r86-expressive-motion.js','utf8');
execFileSync('node',['--check','www/nav-dock-stability-v92.js']);
assert.match(html,/<script src="nav-dock-stability-v92\.js" defer><\/script>/);
assert.match(css,/#mobile-nav\.mobile-nav\s*\{\s*position:fixed!important;\s*transform:translate3d\(0,0,0\)!important/);
assert.match(motion,/navAnimation=animate\(active/,'The icon/tab still tilts, not the dock');
assert.doesNotMatch(js,/innerHTML|replaceWith|appendChild\(dock\)/,'Never recreate the navigation');
let top='';let bottom='';let now=0;const frames=[];const listeners={};const vvListeners={};
const style={setProperty(k,v){if(k==='top')top=v;if(k==='bottom')bottom=v}};
const dock={style,isConnected:true,offsetHeight:74,childElementCount:5,
  getBoundingClientRect:()=>({top:top?parseFloat(top):768,height:74,bottom:(top?parseFloat(top):768)+74}),
};
const viewport={height:845,offsetTop:0,addEventListener(k,v){vvListeners[k]=v}};
const document={readyState:'complete',body:{append(){}},createElement(){return {style:{cssText:''},setAttribute(){}}},getElementById:id=>id==='mobile-nav'?dock:null,addEventListener(k,v){listeners[k]=v}};
const window={innerHeight:851,visualViewport:viewport,addEventListener(k,v){listeners['window:'+k]=v}};
const requestAnimationFrame=cb=>{frames.push(cb);return frames.length};
const getComputedStyle=el=>el===dock?{display:'flex'}:{bottom:'4px'};
vm.runInNewContext(js,{document,window,performance:{now:()=>now},requestAnimationFrame,getComputedStyle,ResizeObserver:class{observe(){}}});
function pump(n=4){for(let i=0;i<n;i++){const cb=frames.shift();if(!cb)break;now+=16;cb();}}
pump(6);
assert.equal(top,'767px','Initial visual viewport: 845 - 74 - 4');
assert.equal(bottom,'auto','CSS bottom anchor must be replaced by independent top coordinate');
assert.equal(dock.childElementCount,5);
viewport.height=700;vvListeners.resize();pump(8);
assert.equal(top,'622px','When keyboard/viewport shrinks, dock remains ABOVE the visible bottom');
viewport.height=845;vvListeners.resize();pump(8);
assert.equal(top,'767px','Return to original coordinate without CSS slide');
assert.equal(window.RashodyNavStability.diagnostics().viewportResizes,2);
assert.equal(dock.childElementCount,5);
console.log('PASS v9.2: visual viewport anchor, no remount, stable nav position on Android resize');
