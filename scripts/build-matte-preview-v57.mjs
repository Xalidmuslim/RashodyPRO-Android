// Build a side-by-side IME QA application; the installed financial app stays untouched.
import fs from 'node:fs';
const root='android/app/';
const gradlePath=root+'build.gradle';
const stringsPath=root+'src/main/res/values/strings.xml';
const htmlPath=root+'src/main/assets/public/index.html';
let gradle=fs.readFileSync(gradlePath,'utf8');
if(!/applicationId\s+["']ru\.rashody\.pro["']/.test(gradle)
 || !/versionName\s+["']5\.4["']/.test(gradle))
 throw Error('Expected production application ID/version; refusing unsafe preview');
gradle=gradle.replace(/applicationId\s+["']ru\.rashody\.pro["']/,
 'applicationId "ru.rashody.pro.preview58"')
 .replace(/versionCode\s+\d+/,'versionCode 58')
 .replace(/versionName\s+["']5\.4["']/,'versionName "5.8-director-preview"');
fs.writeFileSync(gradlePath,gradle,'utf8');
let strings=fs.readFileSync(stringsPath,'utf8');
if(!strings.includes('<string name="app_name">'))throw Error('Missing Android app title');
strings=strings.replace(/<string name="app_name">[^<]*<\/string>/,
 '<string name="app_name">Расходы PRO MATTE 5.8</string>');
strings=strings.replace(/<string name="title_activity_main">[^<]*<\/string>/,
 '<string name="title_activity_main">Расходы PRO MATTE 5.8</string>');
fs.writeFileSync(stringsPath,strings,'utf8');
let html=fs.readFileSync(htmlPath,'utf8');
const marker='Расходы PRO 5.4 · Deep Matte';
if(html.split(marker).length!==2)throw Error('Missing unique preview footer marker');
html=html.replace(marker,'Расходы PRO 5.8 · Director Matte 3D');
fs.writeFileSync(htmlPath,html,'utf8');
console.log('Isolated QA package ru.rashody.pro.preview58 — not a production upgrade');
