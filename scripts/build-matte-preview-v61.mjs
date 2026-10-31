// v6.1 isolated Android preview; preserve existing production SQLite.
import fs from 'node:fs';
const gradlePath='android/app/build.gradle';
const stringsPath='android/app/src/main/res/values/strings.xml';
const htmlPath='android/app/src/main/assets/public/index.html';
const gradle=fs.readFileSync(gradlePath,'utf8');
if(!/applicationId\s+["']ru\.rashody\.pro["']/.test(gradle)
 || !/versionName\s+["']5\.4["']/.test(gradle))
 throw new Error('Unexpected production package/version; preview build aborted');
fs.writeFileSync(gradlePath,gradle
 .replace(/applicationId\s+["']ru\.rashody\.pro["']/,'applicationId "ru.rashody.pro.preview61"')
 .replace(/versionCode\s+\d+/,'versionCode 61')
 .replace(/versionName\s+["']5\.4["']/,'versionName "6.1-sculptural-preview"'));
let strings=fs.readFileSync(stringsPath,'utf8');
if(!/<string name="app_name">[^<]*<\/string>/.test(strings))throw new Error('Missing launcher name');
strings=strings.replace(/<string name="app_name">[^<]*<\/string>/,'<string name="app_name">Расходы PRO 6.1 ТЕСТ</string>');
strings=strings.replace(/<string name="title_activity_main">[^<]*<\/string>/,'<string name="title_activity_main">Расходы PRO 6.1 ТЕСТ</string>');
fs.writeFileSync(stringsPath,strings);
let html=fs.readFileSync(htmlPath,'utf8');
const marker='Расходы PRO 5.4 · Deep Matte';
if(html.split(marker).length!==2)throw new Error('Unexpected footer; refuse to generate unlabeled APK');
html=html.replace(marker,'Расходы PRO 6.1 · Sculptural Matte 3D TEST');
fs.writeFileSync(htmlPath,html);
console.log('Prepared separate APK: ru.rashody.pro.preview61');
