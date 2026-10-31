// Build independent Studio Premium Motion 7.3 APK; production ID and SQLite data untouched.
import fs from 'node:fs';
const gradlePath='android/app/build.gradle';
const stringsPath='android/app/src/main/res/values/strings.xml';
const htmlPath='android/app/src/main/assets/public/index.html';
const gradle=fs.readFileSync(gradlePath,'utf8');
if(!/applicationId\s+["']ru\.rashody\.pro["']/.test(gradle)
 || !/versionName\s+["']5\.4["']/.test(gradle))
 throw new Error('Unexpected production app identity; stop build rather than overwrite data');
fs.writeFileSync(gradlePath,gradle
 .replace(/applicationId\s+["']ru\.rashody\.pro["']/,'applicationId "ru.rashody.pro.preview73"')
 .replace(/versionCode\s+\d+/,'versionCode 73')
 .replace(/versionName\s+["']5\.4["']/,'versionName "7.3-studio-matte-preview"'));
let strings=fs.readFileSync(stringsPath,'utf8');
strings=strings.replace(/<string name="app_name">[^<]*<\/string>/,'<string name="app_name">Расходы PRO 7.3 ТЕСТ</string>');
strings=strings.replace(/<string name="title_activity_main">[^<]*<\/string>/,'<string name="title_activity_main">Расходы PRO 7.3 ТЕСТ</string>');
fs.writeFileSync(stringsPath,strings);
let html=fs.readFileSync(htmlPath,'utf8');
const marker='Расходы PRO 5.4 · Deep Matte';
if(html.split(marker).length!==2)throw new Error('Unexpected footer, stop package labeling');
html=html.replace(marker,'Расходы PRO 7.3 · STUDIO MATTE TEST');
if(!html.includes('href="studio-v70.css"')||!html.includes('src="premium-motion-v73.js"'))throw new Error('Premium Motion assets not synced into APK');
fs.writeFileSync(htmlPath,html);
console.log('Prepared isolated Studio 7.3: ru.rashody.pro.preview73');
