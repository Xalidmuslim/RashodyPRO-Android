import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const html=fs.readFileSync('www/index.html','utf8');
const css=fs.readFileSync('www/deep-matte.css','utf8');
const start=html.indexOf('async function switchCategorySheet('), end=html.indexOf('\nfunction openModal(){',start);
assert.ok(start>=0&&end>start,'Cannot locate actual modal transition implementation');
const source=html.slice(start,end);
assert.ok(!/\bmodal\.animate\(/.test(source),'Animating the sheet itself is overridden by legacy transform:none!important');
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
