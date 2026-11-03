#!/usr/bin/env node
// Bundle the four current matte design layers in the exact previous cascade order.
// Keep editable source files under www/; ship only the compiled CSS in the APK.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const sources=['r78-header.css','r78-hero.css','r78-details.css','r79-visual-qa.css','r81-premium.css','r82-refinement.css','r84-clean-motion.css','r85-interactions.css','r86-expressive.css','r87-polish.css','r96-dashboard.css','r97-one-screen-dashboard.css','r98-dashboard-refinement.css'];
const output='www/r80-theme.css';
const parts=sources.map(name=>{
 const file='www/'+name;
 if(!fs.existsSync(file))throw Error('Missing active theme source: '+file);
 const source=fs.readFileSync(file,'utf8');
 if(!source.trim()||source.includes('@import'))throw Error('Invalid theme source '+file);
 return '/* SOURCE: '+name+' */\n'+source.trim()+'\n';
});
const css='/* Rashody PRO v8.0 — active reference theme bundle. Generated; do not hand-edit. */\n'+parts.join('\n');
if(css.includes('url(https:')||css.includes('url(http:'))throw Error('Unexpected external asset');
fs.writeFileSync(output,css);
console.log('Bundled '+sources.length+' existing layers into '+output+' ('+Buffer.byteLength(css)+' bytes, sha256 '+createHash('sha256').update(css).digest('hex')+')');
