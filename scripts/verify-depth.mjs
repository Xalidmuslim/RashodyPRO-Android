import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';

const html = fs.readFileSync('www/index.html', 'utf8');
const stylesheet = path.join('www', 'premium-depth.css');
assert.match(html, /<link\s+rel="stylesheet"\s+href="premium-depth\.css"\s*\/?>/, 'Premium depth file must load after original styles');
assert.ok(fs.existsSync(stylesheet), 'Premium depth stylesheet is missing');
const css = fs.readFileSync(stylesheet, 'utf8');
const selectors = [
  'body.matte-editorial #page .feature-day',
  'body.matte-editorial #page .week-day',
  'body.matte-editorial #page .week-day.focus-day',
  'body.matte-editorial #page .trend-card',
  'body.matte-editorial #page .trend-card .trend-icon',
  'body.matte-editorial #page .day-ledger',
  'body.matte-editorial #page .record-row .category-icon',
  'body.matte-editorial .mobile-nav',
  'body.matte-editorial .mobile-nav .fab',
  'body.matte-editorial #page .feature-link',
  'body.matte-editorial #page .analytics-ring-panel',
  'body.matte-editorial #page .compare-metric',
  'body.matte-editorial #page .history-tally',
  'body.matte-editorial .overlay .sheet'
];
for (const selector of selectors) assert.ok(css.includes(selector), 'Depth not covered: ' + selector);
for (const token of ['--p3-shadow-hero', '--p3-shadow-raised', '--p3-shadow-control']) {
  assert.ok(css.includes(token + ':'), 'Missing shared token: ' + token);
}
assert.ok((css.match(/inset\s+0\s+[12]px/g) || []).length >= 6, 'Missing consistent rim lighting');
assert.ok((css.match(/linear-gradient\(/g) || []).length >= 12, 'No material lighting gradients');
assert.ok((css.match(/box-shadow:/g) || []).length >= 12, 'No physical contact/ambient shadows');
// Guardrail: decoration must not change page geometry, scrolling or storage behavior.
const clean = css.replace(/\/\*[\s\S]*?\*\//g,'');
for(const forbidden of [/\bposition\s*:/i,/\boverflow\s*:/i,/\bfilter\s*:/i,/\bbackdrop-filter\s*:/i,/\bwill-change\s*:/i,/\btransform\s*:/i, /url\s*\(/i]){
  assert.ok(!forbidden.test(clean), 'Forbidden performance/layout property in premium layer: '+forbidden);
}
assert.ok(!/transition-(?:property|duration):[^;]*box-shadow/i.test(clean), 'Do not animate blurred box shadows');
assert.match(css, /prefers-reduced-motion:reduce/, 'Respect Android reduce motion');
console.log('OK: premium sculpted depth, anchored selectors, safe visual-only CSS');
