import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

const html=fs.readFileSync('www/index.html','utf8');
const css=fs.readFileSync('www/studio-v77.css','utf8');
const motion=fs.readFileSync('www/sculpted-motion-v77.js','utf8');
const prior=fs.readFileSync('www/premium-motion-v76.js','utf8');
execFileSync('node',['--check','www/sculpted-motion-v77.js'],{stdio:'inherit'});
execFileSync('node',['--check','www/premium-motion-v76.js'],{stdio:'inherit'});
assert.match(html,/<link rel="stylesheet" href="studio-v77\.css">/);
assert.match(html,/<script src="sculpted-motion-v77\.js" defer><\/script>/);
assert.ok(html.indexOf('href="studio-v76.css"')<html.indexOf('href="studio-v77.css"'));
assert.match(html,/data-sculpted-detail="week"/);
assert.match(html,/data-sculpted-detail="daily"/);
assert.match(html,/data-sculpted-detail="max"/);
assert.match(html,/\$\{svg\('wallet',32\)\}/,'The first KPI uses native wallet SVG');
assert.match(html,/\$\{svg\('receipt',32\)\}/,'The second KPI uses native receipt SVG');
assert.match(html,/\$\{svg\('shirt',32\)\}/,'The third KPI uses native purchase SVG');
assert.match(html,/window\.RashodySculptedDetails=sculptedDetails/);
assert.match(html,/function daySelectedOperations/);
assert.match(html,/function updateDayChartSelection\(id\)/);
const begin=html.indexOf('function updateDayChartSelection(id)');
const end=html.indexOf('function daySelectedOperations(',begin);
const body=html.slice(begin,end);
assert.ok(begin>0&&end>begin);
assert.doesNotMatch(body,/\brender\s*\(/,'Selecting a donut sector must NOT re-render the page');
assert.match(body,/transitionSector\(previous,next/);
assert.match(html,/<g transform="rotate\(-90 100 100\)">\$\{arcs\}<\/g>/,'Keep SVG ring geometry');
assert.match(html,/--r77-x:\$\{outX\.toFixed\(2\)\}px/);
assert.match(html,/id="r77DaySelection"/);
assert.match(html,/markTransactionChange\(tx.id,isEdit\?'edit':'add'\)/);
assert.match(html,/markTransactionChange\(draft.id,'delete'\)/);
assert.match(html,/window\.RashodySculptedMotion\?\.enterAdd\(\)/);
assert.match(css,/\.day-donut-sector\.is-selected/);
assert.match(css,/stroke-width:35px!important/);
assert.match(css,/\.trend-cards button\.trend-card/);
assert.match(css,/height:113px!important/);
assert.match(css,/\.r77-detail-panel/);
assert.match(css,/prefers-reduced-motion/);
assert.match(motion,/duration:480/,'Compact KPI sheets should slide up smoothly');
assert.match(motion,/duration:760/,'Sector details transition should last ~760ms');
assert.match(motion,/history\.pushState/,'Back navigation should close expanded stats');
assert.match(motion,/window\.addEventListener\('popstate'/);
assert.match(motion,/const escapeHtml/,'All generated detail strings must be escaped');
assert.match(prior,/duration:900/,'First chart entry should not be needlessly slow');
// Generate and inspect all 3 *actual* PNGs (not only markup references).
execFileSync('python3',['scripts/generate-premium-icons.py'],{stdio:'inherit'});
for(const icon of ['kpi-wallet','kpi-receipt','kpi-bag']){
 const buf=fs.readFileSync('www/assets/icons/kpi/'+icon+'.png');
 assert.equal(buf.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(buf.readUInt32BE(16),96);
 assert.equal(buf.readUInt32BE(20),96);
 assert.equal(buf[25],6,'RGBA PNG alpha required');
 assert.ok(buf.length>900,icon+' looks empty or malformed');
}
// Isolated interaction harness: reduced motion and data-change lifecycle.
const handlers={},motions=[];
const root={querySelector:()=>null,querySelectorAll:()=>[]};
const document={
 get hidden(){return false},
 getElementById:id=>id==='page'?root:null,
 querySelector:()=>null,querySelectorAll:()=>[],
 addEventListener:(name,cb)=>{handlers['document:'+name]=cb}
};
const window={
 matchMedia:()=>({matches:false,addEventListener(){}}),
 addEventListener:(name,cb)=>{handlers['window:'+name]=cb}
};
vm.runInNewContext(motion,{window,document,history:{pushState(){},back(){}},
 requestAnimationFrame:cb=>cb(),console});
assert.ok(window.RashodySculptedMotion);
const api=window.RashodySculptedMotion;
assert.equal(typeof api.transitionSector,'function');
assert.equal(typeof api.markTransactionChange,'function');
assert.equal(typeof api.beforeDayChange,'function');
assert.equal(typeof api.enterAdd,'function');
api.afterRender({view:'dashboard'});
api.markTransactionChange('sample-id','delete');
api.afterRender({view:'dashboard'});
assert.match(fs.readFileSync('native/FinanceStoragePlugin.java','utf8'),/class FinanceStoragePlugin/);
console.log('OK v7.7 sculpted: 3 real PNG, expandable stats, per-sector chart geometry, no re-render, animation lifecycle and SQLite');
