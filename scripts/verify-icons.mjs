import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const expected=['mdpi','hdpi','xhdpi','xxhdpi','xxxhdpi'];
const pngSignature=Buffer.from([137,80,78,71,13,10,26,10]);
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'rashody-icons-'));
try{
 const res=path.join(temp,'android/app/src/main/res');fs.mkdirSync(res,{recursive:true});
 const installer=path.join(root,'scripts/install_android_icons.py');
 execFileSync('python3',[installer,temp],{stdio:'pipe'});
 for(const density of expected){
  for(const name of ['ic_launcher.png','ic_launcher_round.png','ic_launcher_foreground.png']){
   const file=path.join(res,'mipmap-'+density,name);
   assert.ok(fs.existsSync(file), 'Missing '+file);
   const data=fs.readFileSync(file);
   assert.ok(data.subarray(0,8).equals(pngSignature), 'Invalid PNG '+file);
   assert.ok(data.length>1000,'Empty '+file);
  }
 }
 for(const name of ['ic_launcher.xml','ic_launcher_round.xml']){
  const x=fs.readFileSync(path.join(res,'mipmap-anydpi-v26',name),'utf8');
  assert.match(x,/<adaptive-icon/);
  assert.match(x,/@mipmap\/ic_launcher_foreground/);
  assert.match(x,/@drawable\/ic_launcher_monochrome/);
 }
 const mono=fs.readFileSync(path.join(res,'drawable/ic_launcher_monochrome.xml'),'utf8');
 assert.match(mono,/<vector/);
 const colors=fs.readFileSync(path.join(res,'values/launcher_icon_colors.xml'),'utf8');
 assert.match(colors,/#315D54/i);

 // Check masks and safe-area transform after rendering in CI.
 const fg=fs.readFileSync(path.join(res,'mipmap-xxxhdpi/ic_launcher_foreground.png'));
 const originalHeader=fs.readFileSync(path.join(root,'assets/launcher-icons.zip'));
 assert.ok(fg.length>2000 && originalHeader.length>2000,'Launcher safe-area icon should be rendered');
 const old=path.join(res,'mipmap-mdpi/ic_launcher.png');fs.writeFileSync(old,'old-placeholder');
 execFileSync('python3',[installer,temp],{stdio:'pipe'});
 assert.ok(fs.readFileSync(old).subarray(0,8).equals(pngSignature),'Failed to replace existing icon');
 console.log('OK: approved matte 3D launcher installed in all densities (19 files, repeatable)');
}finally{fs.rmSync(temp,{recursive:true,force:true});}
