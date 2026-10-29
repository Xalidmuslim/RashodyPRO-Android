import fs from "node:fs";
import assert from "node:assert/strict";

const html=fs.readFileSync("www/index.html","utf8");
const css=fs.readFileSync("www/deep-matte.css","utf8");
const start=css.indexOf("/* Deep Matte v5 — final system polish");
assert.ok(start>0,"v5 finishing layer missing");
const nextLayer=css.indexOf("/* v5.3: category choices",start);
const finish=css.slice(start,nextLayer<0?undefined:nextLayer).replace(/\/\*[\s\S]*?\*\//g,"");
assert.equal((finish.match(/\{/g)||[]).length,(finish.match(/\}/g)||[]).length,"Unbalanced v5 CSS");
assert.ok(!/(?:linear|radial|conic)-gradient\s*\(/i.test(finish),"Glossy gradients reintroduced");
assert.ok(!/\bborder(?:-color)?\s*:\s*(?:white|#fff|rgba\(\s*255\s*,\s*255\s*,\s*255)/i.test(finish),"Bright rim reintroduced");
assert.ok(!/(^|[;{}])\s*(?:position|width|height|overflow|grid-template-columns|transform)\s*:/mi.test(finish),"Layout modifications require separate review");
assert.ok(!/transition(?:-property)?\s*:[^;]*(?:filter|box-shadow)/i.test(finish),"No animated shadows on Android WebView");

for(const key of ["--d5-surface-hero","--d5-surface-panel","--d5-surface-recessed","--d5-shadow-hero","--d5-shadow-card","--d5-shadow-control","--d5-shadow-graph"]) {
  assert.ok(finish.includes(key+":"),"Missing material token "+key);
}
for(const selector of [
  "#page .feature-day", "#page .day-ledger", "#page .record-list",
  "#page .trend-card", "#page .week-day", "#page .period-controls",
  "#page .period-toggle", "#page .period-toggle button.active",
  "#page .history-tally", "#page .search", "#page .jump-label",
  "#page .studio-stats .compare-metric", "#page .color-category-card",
  "#page .analytics-ring-panel", "#page .analytics-trend-panel",
  "#page .studio-trend-bars .compare-stick",
  "#page .day-donut-svg", "#page .analytics-ring-panel .ring-svg",
  "#page .settings-grid .panel", "#page .category-manage button",
  "#page .settings-actions button", ".mobile-nav", ".mobile-nav .fab",
  "#modal.tx-sheet", "#modal.tx-sheet .r105-key", "#modal.tx-sheet .cat-choice"
]) {
  assert.ok(finish.includes(selector),"Screen control missing: "+selector);
}
assert.ok((finish.match(/box-shadow\s*:/g)||[]).length>=12,"Insufficient material elevations");
assert.ok((finish.match(/background-image\s*:\s*none\s*!important/g)||[]).length>=10,"Bright legacy gradients not fully overridden");
assert.ok(finish.includes("#modal.tx-sheet .cat-choice.active"),"Keep category selection visible");
assert.ok(finish.includes(":focus-visible"),"Preserve keyboard focus cues");
assert.ok(finish.includes("prefers-reduced-motion"),"Respect motion preferences");
assert.match(html,/<link rel="stylesheet" href="deep-matte\.css">/,"Final material CSS must load");
for(const selector of [
  ".period-controls:not(.analytics-controls) .period-toggle",
  ".settings-grid .category-manage button:nth-child(n)"
]) {
  assert.ok(finish.includes(selector),"Cascade specificity fix missing: "+selector);
}
console.log("OK: all-screen deep matte v5 visual contract");


// Natural matte depth v5.6: safeguard three layers and layout invariants.
const v56start=css.indexOf('/* matte-depth-v56:');
assert.ok(v56start>css.indexOf('/* matte-unified-v55'),'v5.6 must follow v5.5');
const v56=css.slice(v56start);
assert.ok(v56.trimEnd().endsWith('never decorative. */'),'v5.6 should be the last CSS pass');
assert.doesNotMatch(v56,/(?:linear|radial|conic)-gradient\s*\(/i,'No glossy gradients');
assert.doesNotMatch(v56,/border(?:-color)?\s*:\s*(?:white|#fff|rgba\(\s*255)/i,'No white rims');
assert.doesNotMatch(v56,/(^|[;{}])\s*(?:position|top|left|right|bottom|height|width|overflow|transform|translate)\s*:/mi,'No layout or IME modifications');
assert.doesNotMatch(v56,/transition(?:-property)?\s*:[^;]*(?:box-shadow|filter)/i,'Do not animate shadows');
assert.equal((v56.match(/\{/g)||[]).length,(v56.match(/\}/g)||[]).length,'CSS braces balanced');
for (const key of ['--d5-shadow-hero','--d5-shadow-card','--d5-shadow-control']) {
  const mat=v56.match(new RegExp(key+'\\s*:\\s*([^;]+);'));
  assert.ok(mat,'Missing shadow token '+key);
  assert.equal((mat[1].match(/rgba\(/g)||[]).length,3,'Must use 3 real shadow layers: '+key);
  assert.doesNotMatch(mat[1],/inset|255\s*,\s*255\s*,\s*255/,'No painted bright bevel on raised material');
}
for (const target of ['.feature-day','.analytics-ring-panel','.history-tally','.category-manage button','.mobile-nav','.mobile-nav .fab','#modal.tx-sheet','#modal.cat-sheet','.r105-key','.field input','.period-toggle button.active','.tx-amount-block']) {
  assert.ok(v56.includes(target),'No depth coverage for '+target);
}
assert.match(css,/:focus-visible\s*\{/,'Keep keyboard accessibility outline');
console.log('OK: natural v5.6 matte three-layer depth; no gloss, no geometry change');
