#!/usr/bin/env node
// Remove unreferenced source fragments from the Android WebView bundle only.
// The editable CSS inputs stay in Git; the already generated compiled CSS stays in APK.
import fs from 'node:fs';
import path from 'node:path';
const root='android/app/src/main/assets/public';
const required=['index.html','r80-theme.css','r78-runtime.js','sculpted-motion-v77.js',
 'premium-motion-v73.js','premium-motion-v76.js','assets/icons/kpi/kpi-coins.png'];
for(const file of required)if(!fs.existsSync(path.join(root,file)))throw Error('Required runtime missing: '+file);
const fragments=['r78-header.css','r78-hero.css','r78-details.css','r79-visual-qa.css','r81-premium.css'];
for(const name of fragments){
 const file=path.join(root,name);
 if(!fs.existsSync(file))throw Error('Expected bundler input not synced: '+name);
 fs.unlinkSync(file);
}
for(const name of fragments)if(fs.existsSync(path.join(root,name)))throw Error('Redundant style survived '+name);
console.log('Android runtime clean: four CSS fragments excluded; active components and bundled theme preserved');
