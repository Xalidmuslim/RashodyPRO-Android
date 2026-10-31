// Build independent Studio Premium Motion 7.7 APK; production ID and SQLite data untouched.
import fs from 'node:fs';
const gradlePath='android/app/build.gradle';
const stringsPath='android/app/src/main/res/values/strings.xml';
const htmlPath='android/app/src/main/assets/public/index.html';
const gradle=fs.readFileSync(gradlePath,'utf8');
if(!/applicationId\s+["']ru\.rashody\.pro["']/.test(gradle)
 || !/versionName\s+["']5\.4["']/.test(gradle))
 throw new Error('Unexpected production app identity; stop build rather than overwrite data');
fs.writeFileSync(gradlePath,gradle
 .replace(/applicationId\s+["']ru\.rashody\.pro["']/,'applicationId "ru.rashody.pro.preview77"')
 .replace(/versionCode\s+\d+/,'versionCode 77')
 .replace(/versionName\s+["']5\.4["']/,'versionName "7.7-studio-matte-preview"'));
let strings=fs.readFileSync(stringsPath,'utf8');
strings=strings.replace(/<string name="app_name">[^<]*<\/string>/,'<string name="app_name">Расходы PRO 7.7 ТЕСТ</string>');
strings=strings.replace(/<string name="title_activity_main">[^<]*<\/string>/,'<string name="title_activity_main">Расходы PRO 7.7 ТЕСТ</string>');
fs.writeFileSync(stringsPath,strings);
let html=fs.readFileSync(htmlPath,'utf8');
const marker='Расходы PRO 5.4 · Deep Matte';
if(html.split(marker).length!==2)throw new Error('Unexpected footer, stop package labeling');
html=html.replace(marker,'Расходы PRO 7.7 · SCULPTED MATTE TEST');
if(!html.includes('href="studio-v77.css"')||!html.includes('src="sculpted-motion-v77.js"'))throw new Error('Premium Motion assets not synced into APK');
fs.writeFileSync(htmlPath,html);
if(!fs.existsSync('android/app/src/main/assets/public/assets/icons/categories/food.png'))throw Error('PNG category assets were not packed by Capacitor');
if(!fs.existsSync('android/app/src/main/assets/public/assets/icons/nav/dashboard.png'))throw Error('PNG navigation assets missing');
console.log('Prepared isolated Studio 7.7: ru.rashody.pro.preview77');
