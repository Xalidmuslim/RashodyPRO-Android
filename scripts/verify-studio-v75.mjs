import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const html=fs.readFileSync('www/index.html','utf8');
const css=fs.readFileSync('www/studio-v75.css','utf8');
const motion=fs.readFileSync('www/premium-motion-v73.js','utf8');
assert.match(html,/<link rel="stylesheet" href="studio-v75\.css">/);
assert.ok(html.indexOf('href="studio-v70.css"')<html.indexOf('href="studio-v75.css"'),'v7.5 overrides must load last');
assert.match(html,/function r75Icon\(id,group='actions',size=28\)/);
assert.match(html,/r75Icon\(c\.id,'categories'/);
assert.match(html,/r75Icon\(id,'nav',31\)/);
assert.match(html,/r75Icon\('backspace','actions',29\)/);
assert.match(html,/duration:420,easing:'cubic-bezier/,'Category sheet height should transition smoothly');
assert.match(html,/duration:370,easing:'cubic-bezier/,'Category contents must not pop in');
assert.match(css, /height:45px!important;min-height:45px!important/,'Keypad targets must remain tappable');
assert.match(css, /background-color:#efe7db!important/,'Do not regress to grey calculator slab');
assert.match(css, /html body\.matte-editorial \.mobile-nav/,'Safe mobile navigation required');
assert.match(css, /prefers-reduced-motion/);
assert.match(motion,/pointermove/);
execFileSync('python3',['scripts/generate-premium-icons.py'],{stdio:'inherit'});
const assets={
 categories:['food','cafe','transport','home','health','fun','shop','other'],
 nav:['dashboard','transactions','analytics','settings'],
 actions:['plus','close','check','back','forward','up','down','search','filter','calendar','backspace','delete','edit','export']
};
for(const [group,names] of Object.entries(assets))for(const name of names){
 const file='www/assets/icons/'+group+'/'+name+'.png';
 const buf=fs.readFileSync(file);
 assert.equal(buf.subarray(0,8).toString('hex'),'89504e470d0a1a0a',file+' must be PNG');
 assert.equal(buf.readUInt32BE(16),96,file+' width');
 assert.equal(buf.readUInt32BE(20),96,file+' height');
 assert.equal(buf[25],6,file+' should have an alpha channel');
 assert.ok(buf.length>400,file+' suspiciously empty');
}
assert.match(fs.readFileSync('native/FinanceStoragePlugin.java','utf8'),/class FinanceStoragePlugin/);
console.log('OK: 26 transparent 3D PNGs, scoped UI, 45px keypad, stable category transitions and SQLite');
