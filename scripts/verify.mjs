import fs from 'node:fs';
const html=fs.readFileSync('www/index.html','utf8');
const required=['function persist(){','function daySummaryRing(', 'async function bootstrap(){','function registerAndroidBack()', 'financeNative()', 'readSnapshot()', 'writeSnapshot({snapshot})','exportFile({filename,mime:'];
let okay=true;
for(const str of required){const hit=html.includes(str);console.log(`${hit?'OK':'FAILED'}: ${str}`);if(!hit)okay=false;}
const encoded=html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi)||[];
console.log('Script blocks:',encoded.length);
if(!okay)process.exit(1);
