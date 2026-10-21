import fs from 'node:fs';
import path from 'node:path';
const project=path.resolve('android');
if(!fs.existsSync(project)){
 console.error('Android ещё не добавлен. Выполните: npm install && npx cap add android');process.exit(1);
}
const packageId='ru.rashody.pro';
const pkgDir=path.join(project,'app/src/main/java',...packageId.split('.'));
fs.mkdirSync(pkgDir,{recursive:true});
const dst=path.join(pkgDir,'FinanceStoragePlugin.java');
fs.copyFileSync('native/FinanceStoragePlugin.java',dst);
const activity=path.join(pkgDir,'MainActivity.java');
// Capacitor CLI creates this file. Keep its native activity and register the SQLite plugin.
let body=fs.existsSync(activity)?fs.readFileSync(activity,'utf8'):`package ${packageId};\n\nimport com.getcapacitor.BridgeActivity;\n\npublic class MainActivity extends BridgeActivity {}\n`;
if(!body.includes('registerPlugin(FinanceStoragePlugin.class)')){
 body=body.replace(/(public\s+class\s+MainActivity\s+extends\s+BridgeActivity\s*\{)/,
 `$1\n  @Override public void onCreate(android.os.Bundle savedInstanceState) {\n    registerPlugin(FinanceStoragePlugin.class);\n    super.onCreate(savedInstanceState);\n  }`);
}
if(!body.includes('registerPlugin(FinanceStoragePlugin.class)'))throw Error('MainActivity registration failed');
fs.writeFileSync(activity,body,'utf8');
console.log('SQLite plugin registered: '+activity);
// Keep private financial data out of automatic OS cloud backups. Manual JSON exports remain available.
const manifest=path.join(project,'app/src/main/AndroidManifest.xml');
if(fs.existsSync(manifest)){
 let xml=fs.readFileSync(manifest,'utf8');
 if(/android:allowBackup="[^"]*"/.test(xml))xml=xml.replace(/android:allowBackup="[^"]*"/,'android:allowBackup="false"');
 else xml=xml.replace(/<application\b/,'<application android:allowBackup="false"');
 fs.writeFileSync(manifest,xml,'utf8');
 console.log('Android automatic data backup disabled (manual JSON backup enabled).');
}
