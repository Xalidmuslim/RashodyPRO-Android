// Produces a clearly marked disposable Android preview AFTER normal verified
// Capacitor sync. Never edit the production Capacitor config or finance files.
import fs from 'node:fs';
const files={
 gradle:'android/app/build.gradle',
 strings:'android/app/src/main/res/values/strings.xml',
 html:'android/app/src/main/assets/public/index.html'
};
const read=(f)=>fs.readFileSync(f,'utf8');
const write=(f,s)=>fs.writeFileSync(f,s,'utf8');
let gradle=read(files.gradle);
if(!/applicationId\s+["']ru\.rashody\.pro["']/.test(gradle))
 throw new Error('Unexpected production application ID: refusing to build preview');
gradle=gradle.replace(/applicationId\s+["']ru\.rashody\.pro["']/,'applicationId "ru.rashody.pro.preview"');
if(!/versionName\s+["']5\.4["']/.test(gradle))
 throw new Error('Unexpected versionName: refusing to build preview');
gradle=gradle.replace(/versionName\s+["']5\.4["']/,'versionName "5.4-preview"');
write(files.gradle,gradle);
let strings=read(files.strings);
const match=strings.match(/<string name="app_name">[^<]*<\/string>/);
if(!match)throw new Error('Launcher title not found; refusing unmarked preview');
strings=strings.replace(match[0],'<string name="app_name">Расходы PRO ТЕСТ</string>');
for(const name of ['title_activity_main','custom_url_scheme']){
 const regex=new RegExp('<string name="'+name+'">[^<]*<\\/string>');
 if(name==='title_activity_main'&&regex.test(strings))
  strings=strings.replace(regex,'<string name="title_activity_main">Расходы PRO ТЕСТ</string>');
}
write(files.strings,strings);
let html=read(files.html);
const marker='Расходы PRO 5.4 · Deep Matte';
if(html.split(marker).length!==2)throw new Error('Expected v5.4 footer missing; refusing invisible preview');
html=html.replace(marker,'Расходы PRO 5.4 · ТЕСТ · Deep Matte');
write(files.html,html);
console.log('Disposable test build: ru.rashody.pro.preview; no access to main app data.');
