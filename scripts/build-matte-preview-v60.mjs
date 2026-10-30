// v6.0 side-by-side test APK: DO NOT modify primary installed expense app.
import fs from 'node:fs';
const gradlePath='android/app/build.gradle';
const stringsPath='android/app/src/main/res/values/strings.xml';
const htmlPath='android/app/src/main/assets/public/index.html';
const gradle=fs.readFileSync(gradlePath,'utf8');
if(!/applicationId\s+["']ru\.rashody\.pro["']/.test(gradle)
 || !/versionName\s+["']5\.4["']/.test(gradle))
 throw new Error('Unexpected production package/version; preview build aborted');
const next=gradle.replace(/applicationId\s+["']ru\.rashody\.pro["']/,'applicationId "ru.rashody.pro.preview60"')
 .replace(/versionCode\s+\d+/,'versionCode 60')
 .replace(/versionName\s+["']5\.4["']/,'versionName "6.0-matte-preview"');
fs.writeFileSync(gradlePath,next);
let strings=fs.readFileSync(stringsPath,'utf8');
if(!/<string name="app_name">[^<]*<\/string>/.test(strings)) throw new Error('Missing launcher name');
strings=strings.replace(/<string name="app_name">[^<]*<\/string>/,'<string name="app_name">Расходы PRO 6.0 ТЕСТ</string>');
strings=strings.replace(/<string name="title_activity_main">[^<]*<\/string>/,'<string name="title_activity_main">Расходы PRO 6.0 ТЕСТ</string>');
fs.writeFileSync(stringsPath,strings);
let html=fs.readFileSync(htmlPath,'utf8');
const marker='Расходы PRO 5.4 · Deep Matte';
if(html.split(marker).length!==2) throw new Error('Unexpected footer; refused to generate unlabeled APK');
html=html.replace(marker,'Расходы PRO 6.0 · Matte 3D TEST');
fs.writeFileSync(htmlPath,html);
console.log('Prepared only: ru.rashody.pro.preview60');
