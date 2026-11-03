// Build independent Studio Premium Motion 9.7 APK; production ID and SQLite data untouched.
import fs from 'node:fs';
const gradlePath='android/app/build.gradle';
const stringsPath='android/app/src/main/res/values/strings.xml';
const htmlPath='android/app/src/main/assets/public/index.html';
const gradle=fs.readFileSync(gradlePath,'utf8');
if(!/applicationId\s+["']ru\.rashody\.pro["']/.test(gradle)
 || !/versionName\s+["']5\.4["']/.test(gradle))
 throw new Error('Unexpected production app identity; stop build rather than overwrite data');
fs.writeFileSync(gradlePath,gradle
 .replace(/applicationId\s+["']ru\.rashody\.pro["']/,'applicationId "ru.rashody.pro.preview97"')
 .replace(/versionCode\s+\d+/,'versionCode 97')
 .replace(/versionName\s+["']5\.4["']/,'versionName "9.7-studio-matte-preview"'));
let strings=fs.readFileSync(stringsPath,'utf8');
strings=strings.replace(/<string name="app_name">[^<]*<\/string>/,'<string name="app_name">Расходы PRO 9.7 ТЕСТ</string>');
strings=strings.replace(/<string name="title_activity_main">[^<]*<\/string>/,'<string name="title_activity_main">Расходы PRO 9.7 ТЕСТ</string>');
fs.writeFileSync(stringsPath,strings);
let html=fs.readFileSync(htmlPath,'utf8');
const marker='Расходы PRO 5.4 · Deep Matte';
if(html.split(marker).length!==2)throw new Error('Unexpected footer, stop package labeling');
html=html.replace(marker,'Расходы PRO 9.7 · SCULPTED MATTE TEST');
if(!html.includes('href="studio-v77.css"')||!html.includes('src="sculpted-motion-v77.js"'))throw new Error('Premium Motion assets not synced into APK');
fs.writeFileSync(htmlPath,html);
if(!fs.existsSync('android/app/src/main/assets/public/r80-theme.css'))throw Error('Compiled premium theme is missing');
if(!fs.existsSync('www/r84-clean-motion.css')||!fs.existsSync('www/r85-interactions.css')||!fs.existsSync('www/r86-expressive.css')||!fs.existsSync('www/r87-polish.css'))throw Error('Active expressive styles are missing');
if(!fs.existsSync('android/app/src/main/assets/public/r86-expressive-motion.js'))throw Error('Expressive spring module missing from APK assets');
if(!fs.readFileSync('android/app/src/main/assets/public/index.html','utf8').includes('function dashboardV96()'))throw Error('Approved dashboard missing from packaged HTML');
if(!fs.readFileSync('android/app/src/main/assets/public/r80-theme.css','utf8').includes('SOURCE: r96-dashboard.css'))throw Error('Approved dashboard CSS missing from APK assets');
if(!fs.readFileSync('android/app/src/main/assets/public/r80-theme.css','utf8').includes('SOURCE: r97-one-screen-dashboard.css'))throw Error('One-screen compact dashboard CSS missing');
if(!fs.readFileSync('android/app/src/main/assets/public/index.html','utf8').includes('r97-dashboard'))throw Error('New compact dashboard markup missing');
if(!fs.readFileSync('android/app/src/main/assets/public/sculpted-motion-v77.js','utf8').includes('r95-rows-only-stack'))throw Error('Slow rows-only KPI behavior not packed into APK');
if(!fs.existsSync('android/app/src/main/assets/public/nav-dock-stability-v92.js'))throw Error('Viewport dock stabilization module missing from APK assets');
if(!fs.existsSync('android/app/src/main/assets/public/r78-runtime.js'))throw Error('Reference skin is absent in APK');
if(!fs.existsSync('android/app/src/main/assets/public/assets/icons/kpi/kpi-coins.png'))throw Error('Matte coin PNG is missing');
if(!fs.existsSync('android/app/src/main/assets/public/assets/icons/categories/food.png'))throw Error('PNG category assets were not packed by Capacitor');
if(!fs.existsSync('android/app/src/main/assets/public/assets/icons/nav/dashboard.png'))throw Error('PNG navigation assets missing');
if(!fs.existsSync('android/app/src/main/assets/public/assets/brand/native-launcher.png'))throw Error('Exact factory Android app icon missing from WebView');
import {execFileSync} from 'node:child_process';
execFileSync('node',['scripts/prune-runtime-assets-v80.mjs'],{stdio:'inherit'});
console.log('Prepared isolated Week-first Slide Sheets 9.7: ru.rashody.pro.preview97');
