import fs from 'node:fs';
import assert from 'node:assert/strict';
const css=fs.readFileSync('www/matte-polish-v59.css','utf8');
const start=css.indexOf('/* v6.0: matte frame hierarchy and palette consistency.');
assert.ok(start>0,'Missing isolated matte frame v6.0 finishing pass');
const finish=css.slice(start).replace(/\/\*[\s\S]*?\*\//g,'');
const verify=(selector,reg,why)=>{
 const pos=finish.indexOf(selector);
 assert.ok(pos>=0,'Missing frame contract for '+selector);
 assert.match(finish.slice(pos,pos+450),reg,why);
};
verify('body.matte-editorial #page .calendar-shell',/box-shadow:none!important/,'Calendar must not retain a second raised frame');
verify('body.matte-editorial #page .summary-strip',/box-shadow:none!important/,'History summary parent must be flat');
verify('body.matte-editorial #page .studio-stats .compare-metric',/box-shadow:var\(--p59-medium\)!important/,'Legacy statistics shadows must use medium elevation');
verify('body.matte-editorial #modal.tx-sheet .type-switch.type-switch',/box-shadow:none!important/,'Type selector must not show a heavy nested well');
verify('body.matte-editorial #modal.tx-sheet .category-picker .cat-choice.active',/background-color:var\(--p59-sage\)!important/,'Chosen category must be distinguishable');
for(const token of ['--p59-ground','--p59-panel','--p59-control','--p59-recess','--p59-coral','--p59-teal','--p59-ochre','--p59-ink','--p59-muted'])
 assert.match(finish,new RegExp(token+':#[0-9a-fA-F]{6}'),'Missing pigment token: '+token);
assert.equal((finish.match(/\{/g)||[]).length,(finish.match(/\}/g)||[]).length,'CSS declarations unbalanced');
assert.doesNotMatch(finish,/(?:linear|radial|conic)-gradient\s*\(/i,'No glossy materials');
assert.doesNotMatch(finish,/transition\s*:[^;]*(?:filter|box-shadow)/i,'No repaint-heavy shadow motion');
assert.doesNotMatch(finish,/\b(?:position|width|height|transform|overflow|grid-template-columns)\s*:/i,'No app geometry or gestures changed');
console.log('OK: v6.0 matte parent-frame / category-state / pigment source contract');
