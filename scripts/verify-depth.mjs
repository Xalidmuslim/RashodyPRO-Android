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
// Matte depth must be cast by the surface, never drawn as white outlines.
const opaqueBorders=[...css.matchAll(/\bborder\s*:\s*1px\s+solid\s+(?!transparent\b)[^;]+!important\s*;/gi)];
assert.equal(opaqueBorders.length,0,'Visible 1px rims remain: '+opaqueBorders.slice(0,3).map(m=>m[0]).join(' | '));
const brightInset=/\binset\b[^,;]*\b(?:rgba\(\s*255\s*,\s*(?:255|235)\s*,\s*(?:255|223)|#fff(?:fff)?\b)/i;
assert.ok(!brightInset.test(css),'Artificial white inset highlight remains');
assert.ok((css.match(/\b0\s+\d+px\s+\d+px\s+-\d+px\s+rgba\(/g)||[]).length>=8,'Real, soft external cast shadows should remain');
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


/* Unified 3D pass regression: screen inventory supplied by Android screenshots. */
for(const selector of [
  'body.matte-editorial #page .studio-stats .compare-metric.main',
  'body.matte-editorial #page .color-category-card',
  'body.matte-editorial #page .studio-stats .soft-stat-symbol',
  'body.matte-editorial #page .period-controls:not(.analytics-controls) .period-toggle button.active',
  'body.matte-editorial #page .analytics-controls .period-toggle button.active',
  'body.matte-editorial #page .r49-filter-btn',
  'body.matte-editorial #page .history-tally.spent',
  'body.matte-editorial #page .history-tally.earned',
  'body.matte-editorial #page .category-manage .category-manage-row',
  'body.matte-editorial #page .studio-settings-icon',
  'body.matte-editorial #modal.tx-sheet .r105-key',
  'body.matte-editorial #modal.tx-sheet .tx-amount-block',
  'body.matte-editorial #modal.tx-sheet .tx-category-search',
  'body.matte-editorial #modal.tx-sheet .cat-choice.active',
  'body.matte-editorial #modal.tx-sheet .tx-check:disabled',
  'body.matte-editorial #modal.tx-sheet .r49-more-categories'
]) {
  assert.ok(css.includes(selector), 'Premium depth missing from screen component: '+selector);
}
for(const token of ['--p3-satin','--p3-push','--p3-field','--p3-pastel','--p3-dark']) {
  assert.ok(css.includes(token+':'), 'Missing consistent secondary material token: '+token);
}
assert.ok(css.includes('outline: none !important; /* remove drawn thick outline'), 'Selected category still has hard wire outline');
assert.ok(css.includes('body.matte-editorial #modal.tx-sheet .cat-choice:focus-visible'), 'Keyboard focus lost');
assert.ok(css.includes('color: #fffefa !important;'), 'Dark selected state needs legible light text');
assert.ok(css.includes('body.matte-editorial #page .color-category-card::after'), 'Remove decorative ring');
console.log('OK: full-surface sculpted-depth coverage for modal/history/analytics/settings');
