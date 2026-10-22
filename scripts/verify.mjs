import fs from 'node:fs';
const html=fs.readFileSync('www/index.html','utf8');
const required=['function persist(){','function daySummaryRing(', 'async function bootstrap(){','function registerAndroidBack()', 'financeNative()', 'readSnapshot()', 'writeSnapshot({snapshot})','exportFile({filename,mime:'];
let okay=true;
for(const str of required){const hit=html.includes(str);console.log(`${hit?'OK':'FAILED'}: ${str}`);if(!hit)okay=false;}
const encoded=html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi)||[];
console.log('Script blocks:',encoded.length);
if(!okay)process.exit(1);


// Medicine Smooth Motion regression checks: fail CI before APK packaging.
import vm from 'node:vm';
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
for(const [i,script] of scripts.entries())new vm.Script(script,{filename:'web-inline-'+(i+1)+'.js'});
const source=fs.readFileSync('scripts/prepare-android.mjs','utf8');
const checks={
 'Numeric keyboard opens from the original + tap':html.includes("document.getElementById('txAmount')?.focus({preventScroll:true})"),
 'Keyboard does not move background':html.includes('medicine-entry-active')&&source.includes('windowSoftInputMode="adjustNothing"'),
 'Navigation has no slide/scale':html.includes('Medicine Smooth Motion / Capacitor adaptation')&&html.includes('transform:none!important'),
 'Reduce motion accessibility':html.includes('prefers-reduced-motion'),
 'Builtin categories can be deleted persistently':html.includes('hiddenCategoryIds')&&html.includes("['other','other-income'].includes(catDraft.id)"),
 'At least 35 category icons':((html.match(/const ICON_OPTIONS=\[([^\]]+)\]/)||[])[1]||'').split(',').length>=35,
 'Default fallback categories protected':html.includes("excluded.delete('other')")&&html.includes("excluded.delete('other-income')"),
 'Storage integrity guards remain':html.includes('recoveryLocked')&&html.includes('writeSnapshot({snapshot})')
};
for(const [name,ok] of Object.entries(checks)){console.log((ok?'OK':'FAILED')+': '+name);if(!ok)okay=false}
if(!okay)process.exit(1);
console.log('Medicine Smooth Motion checks passed; JS parsed:',scripts.length);
