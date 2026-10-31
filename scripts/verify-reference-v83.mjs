import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const css=fs.readFileSync('www/r82-refinement.css','utf8');
const build=fs.readFileSync('scripts/bundle-runtime-theme-v80.mjs','utf8');
const html=fs.readFileSync('www/index.html','utf8');
const runtime=fs.readFileSync('www/r78-runtime.js','utf8');
const prev=fs.readFileSync('www/sculpted-motion-v77.js','utf8');
// Screenshot regression: empty-day hero should not repeat the absence of data.
assert.match(css,/\.feature-day:has\(\.day-donut-empty-legend\) \.day-donut-legend/);
assert.match(css,/\.feature-day:has\(\.day-donut-empty-legend\) \.day-donut/);
assert.match(css,/\.fancy-empty \.empty-add/);
// Screenshot regression: richer headline and fuller KPI object silhouettes.
assert.match(css,/\.r78-brand h1[\s\S]*?-webkit-text-stroke:/);
assert.match(css,/\.trend-cards button\.trend-card \.trend-icon img[\s\S]*?scale\(1\.2/);
assert.match(css,/\.trend-cards button\.trend-card strong[\s\S]*?font-weight:900/);
assert.match(build,/r82-refinement\.css/);
assert.doesNotMatch(runtime,/r78-brand-icon/);
assert.match(prev,/r80-theme\.css/);
assert.match(runtime,/function pageTransformer\(direction/);
assert.match(html,/function daySummaryRing\(/);
assert.match(html,/function persist\(\)/);
assert.match(fs.readFileSync('native/FinanceStoragePlugin.java','utf8'),/class FinanceStoragePlugin/);
execFileSync('node',['--check','www/r78-runtime.js'],{stdio:'inherit'});
execFileSync('node',['--check','www/sculpted-motion-v77.js'],{stdio:'inherit'});
execFileSync('node',['scripts/bundle-runtime-theme-v80.mjs'],{stdio:'inherit'});
console.log('PASS v8.3 zero-state layout, reference type/KPI, native icon, nav, unchanged motion and finance');
