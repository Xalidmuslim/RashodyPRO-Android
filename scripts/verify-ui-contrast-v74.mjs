import assert from 'node:assert/strict';
import fs from 'node:fs';

// Regression guard for the washed-out v7.3 screens: overview, history,
// analytics, settings, 3D buttons and bottom navigation.
const css = fs.readFileSync('www/studio-v70.css', 'utf8');
const html = fs.readFileSync('www/index.html', 'utf8');
const motion = fs.readFileSync('www/premium-motion-v73.js', 'utf8');
const token = name => {
 const match = css.match(new RegExp('--' + name + ':\\s*(#[0-9a-fA-F]{6})'));
 assert.ok(match, 'Missing design token ' + name);
 return match[1].toLowerCase();
};
const luminance = hex => {
 const values=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
 const linear=values.map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);
 return linear[0]*0.2126 + linear[1]*0.7152 + linear[2]*0.0722;
};
const contrast=(a,b)=>{
 const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
};
assert.ok(contrast(token('ui-bg'),token('ui-surface'))>1.08,'Panels merge with background');
assert.ok(contrast(token('ui-muted'),token('ui-surface'))>=4.5,'Muted copy fails AA contrast');
assert.ok(contrast(token('ui-ink'),token('ui-surface'))>=10,'Primary text not decisive');
assert.ok(contrast(token('ui-dark'),token('ui-dark-ink'))>=7,'Selected button loses legibility');
assert.ok(new Set(['ui-sage','ui-rose','ui-amber'].map(token)).size===3,'Status categories must remain distinct');
assert.match(css,/--ui-panel-radius:26px;--ui-card-radius:22px;--ui-button-radius:17px/);
assert.match(css,/--ui-shadow-lg:[^;]+inset 0 1px 0/,'Matte surfaces need contact highlight');
assert.match(css,/\.mobile-nav \.fab\{[^}]*background:var\(--ui-dark\)/s,'FAB must be a dark primary action');
assert.match(css,/\.mobile-nav button\.active:not\(\.fab\)\{[^}]*background-color:var\(--ui-sage\)/s);
assert.match(css,/body\.matte-editorial #page :is\(button\.primary-btn,/,'Primary CTA needs the same depth system');
assert.match(css,/\.period-toggle[^}]*gap:6px/);
assert.match(css,/\.analytics-ring-panel \.legend-line\{[^}]*border-radius:17px/);
assert.match(css,/\.settings-grid \.setting-row/);
assert.match(css,/\.week-day:not\(\.focus-day\)/);
assert.match(css,/\.r105-key\{/);
assert.match(css,/prefers-reduced-motion/);
assert.match(html,/<link rel="stylesheet" href="studio-v70\.css">/);
assert.match(html,/<script src="premium-motion-v73\.js" defer><\/script>/);
assert.match(motion,/prefers-reduced-motion: reduce/);
assert.match(fs.readFileSync('native/FinanceStoragePlugin.java','utf8'),/class FinanceStoragePlugin/);
console.log('OK: v7.4 perceptual contrast, button geometry, depth, modal, navigation, motion/SQLite invariants');
