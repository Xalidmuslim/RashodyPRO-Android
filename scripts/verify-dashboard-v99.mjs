import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const css=fs.readFileSync('www/r99-dashboard-balance.css','utf8');
const compiled=fs.readFileSync('scripts/bundle-runtime-theme-v80.mjs','utf8');
const html=fs.readFileSync('www/index.html','utf8');
const motion=fs.readFileSync('www/r98-dashboard-motion.js','utf8');
const nav=fs.readFileSync('www/nav-dock-stability-v92.js','utf8');
assert.match(css,/grid-template-rows:78px 98px 78px clamp\(180px,26dvh,248px\) 36px 88px!important/);
assert.match(css,/grid-template-rows:70px 86px 67px clamp\(148px,25dvh,196px\) 32px 73px!important/);
assert.match(css,/grid-template-rows:60px 70px 56px clamp\(126px,25dvh,161px\) 27px 59px!important/);
assert.match(css,/align-content:space-evenly!important/,'Distribute extra height outside frames');
assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/);
assert.match(css,/\.r96-spending \.r96-ring-layout/);
assert.match(css,/\.r96-trend \.r96-bar-chart/);
assert.match(css,/max-height:625px/,'Prevent overflow around 606px');
assert.match(css,/max-height:560px/,'Small-screen fallback may scroll instead of clipping');
assert.doesNotMatch(css,/#mobile-nav\b/,'Do not touch anchored navigation');
assert.match(compiled,/'r98-dashboard-refinement\.css','r99-dashboard-balance\.css'/,'Fix must load last in CSS cascade');
assert.match(html,/r98-dashboard/);
assert.match(motion,/strokeDasharray:'0 '/,'Keep animated donut sectors');
assert.match(motion,/scaleY\(\.025\)/,'Keep growing bars');
assert.match(nav,/const horizontalFrame=/,'Pinned navigation module unchanged');
const clamp=(min,v,max)=>Math.max(min,Math.min(v,max));
const layouts=[
 {viewport:840,tracks:[78,98,78,clamp(180,840*.26,248),36,88],gap:5},
 {viewport:740,tracks:[70,86,67,clamp(148,740*.25,196),32,73],gap:4},
 {viewport:640,tracks:[70,86,67,clamp(148,640*.25,196),32,73],gap:4},
 {viewport:625,tracks:[60,70,56,clamp(126,625*.25,161),27,59],gap:3},
 {viewport:590,tracks:[60,70,56,clamp(126,590*.25,161),27,59],gap:3},
 {viewport:561,tracks:[60,70,56,clamp(126,561*.25,161),27,59],gap:3},
];
for(const {viewport,tracks,gap} of layouts){
 // Android status safe area (26px floor) + top padding 3px + stable 85px dock.
 const visible=viewport-29-85;
 const used=tracks.reduce((s,t)=>s+t,0)+gap*(tracks.length-1);
 assert.ok(used<=visible+1,viewport+'px screen would clip dashboard: '+used+' > '+visible);
 assert.ok(tracks[3]<=248,'Analytics shall never take all spare height');
 assert.ok(tracks[3]>=126,'Charts must remain legible');
}
execFileSync('node',['scripts/bundle-runtime-theme-v80.mjs'],{stdio:'inherit'});
const bundle=fs.readFileSync('www/r80-theme.css','utf8');
assert.ok(bundle.indexOf('SOURCE: r99-dashboard-balance.css')>bundle.indexOf('SOURCE: r98-dashboard-refinement.css'));
console.log('PASS v9.9: six-track bounded analytics on 561–840px portraits; nav untouched and no hidden overflow');
