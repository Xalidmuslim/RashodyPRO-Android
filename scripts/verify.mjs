import fs from 'node:fs';
const html=fs.readFileSync('www/index.html','utf8');
const required=['function persist(){','function daySummaryRing(', 'async function bootstrap(){','function registerAndroidBack()', 'financeNative()', 'readSnapshot()', 'writeSnapshot({snapshot})','exportFile({filename,mime:'];
let okay=true;
for(const str of required){const hit=html.includes(str);console.log(`${hit?'OK':'FAILED'}: ${str}`);if(!hit)okay=false;}
const encoded=html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi)||[];
console.log('Script blocks:',encoded.length);

const native = fs.readFileSync('native/FinanceStoragePlugin.java', 'utf8');
const guards = [
  ['Native keyboard method is present', native.includes('@PluginMethod public void showAmountKeyboard(')],
  ['IME uses SHOW_IMPLICIT, never SHOW_FORCED', native.includes('InputMethodManager.SHOW_IMPLICIT') && !native.includes('SHOW_FORCED')],
  ['Instant focus in plus handler', html.includes('input?.focus({preventScroll:true})')],
  ['Android keyboard bridge invoked', html.includes('plugin?.showAmountKeyboard?.()')],
  ['Background scroll locked during modal', html.includes("document.body.classList.add('r105-modal-locked')")],
  ['Background scroll restored after modal', html.includes('window.scrollTo({top:r105PageY')],
  ['Medicine motion profile set', html.includes('r105-medicine-motion')],
  ['No deferred input focus', !html.includes('requestAnimationFrame(()=>{const modal=')]
];
for(const [name, success] of guards){console.log((success?'OK':'FAILED')+': '+name);if(!success)okay=false;}

if(!okay)process.exit(1);
