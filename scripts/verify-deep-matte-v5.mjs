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
