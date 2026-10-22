import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
const html=readFileSync(new URL('../www/index.html', import.meta.url),'utf8');
function bodyBetween(a,b) {
 const start=html.indexOf(a),end=html.indexOf(b,start+a.length);
 assert.ok(start>=0&&end>start,'Expected motion integration '+a);
 return html.slice(start,end);
}
test('all inline scripts pass JavaScript syntax parsing',()=>{
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
 assert.ok(scripts.length>=2);
 for(const [,script] of scripts)new Script(script);
});
test('plus dialog never locks the document or opens keyboard automatically',()=>{
 const open=bodyBetween('function openModal(){','function hideModal(){');
 assert.doesNotMatch(open,/document\.body\.style\.overflow/);
 assert.match(open,/modal\.focus\(\{preventScroll:true\}\)/);
 assert.doesNotMatch(open,/txAmount.*\.focus/);
});
test('background scroll and user focus are preserved on dialog close',()=>{
 const hide=bodyBetween('function hideModal(){','function closeModal(){');
 assert.doesNotMatch(hide,/document\.body\.style\.overflow|window\.scrollTo/);
 assert.match(hide,/lastFocus\.focus\(\{preventScroll:true\}\)/);
});
test('sheet enters 205-215 ms and exits 165 ms with no transform-based bounce',()=>{
 const open=bodyBetween('function openModal(){','function hideModal(){');
 const close=bodyBetween('function closeModal(){','function timeLocal(){');
 assert.match(open,/duration:205/);
 assert.match(open,/duration:215/);
 assert.match(close,/duration:165/);
 assert.doesNotMatch(open+close,/translate|scale\(/);
});
test('route motion is only a subtle fade; accessibility reduces motion',()=>{
 const fade=bodyBetween('function softNavEnter(){','function navState(');
 assert.match(fade,/\{opacity:\.96\},\{opacity:1\}/);
 assert.match(html,/prefers-reduced-motion:reduce/);
 assert.match(html,/cubic-bezier\(\.4,0,\.2,1\)/);
});
test('category editor preserves expense draft without keyboard-opening focus',()=>{
 const nested=bodyBetween('function startCatFromTx(){','function startCat(');
 assert.match(nested,/txDraftBeforeCategory=\{\.\.\.draft\}/);
 assert.doesNotMatch(nested,/getElementById\('catName'\).*focus/);
});

test('Android sheet keeps vertical touch scrolling, including inside long forms',()=>{
 assert.match(html,/\.overlay \.sheet \{overscroll-behavior:contain;touch-action:pan-y\}/);
 assert.doesNotMatch(html,/\.overlay \{[^}]*touch-action:none/);
});
