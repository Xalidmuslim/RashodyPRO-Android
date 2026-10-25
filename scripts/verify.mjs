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
  ['Browser input focus retained', html.includes('input?.focus({preventScroll:true})')],
  ['Android plus does not force keyboard', !html.includes('plugin?.showAmountKeyboard?.()')],
  ['Android plus never fixes body', !html.includes("document.body.classList.add('r105-modal-locked')")],
  ['Modal close does not force scroll', !html.includes('window.scrollTo({top:r105PageY')],
  ['Android dialog does not force focus or keyboard', !html.includes("modal.focus({preventScroll:true})")],
  ['Medicine motion profile set', html.includes('r105-medicine-motion')],
  ['No deferred input focus', !html.includes('requestAnimationFrame(()=>{const modal=')]
];
for(const [name, success] of guards){console.log((success?'OK':'FAILED')+': '+name);if(!success)okay=false;}


/* Regression: the plus button must open the dialog without moving the WebView page.
   Exercise the real extracted functions in a minimal DOM stub, not only source text. */
import vm from 'node:vm';
const extract=(name,next)=> {
  const start=html.indexOf('function '+name+'(){');
  const end=html.indexOf('\nfunction '+next+'(){',start);
  if(start<0||end<0)throw new Error('Could not find '+name);
  return html.slice(start,end);
};
function modalScenario(native){
  let modalFocuses=0,inputFocuses=0,scrollCalls=0,keyboardCalls=0,historyPushes=0;
  const overlay={hidden:true};
  const modal={classList:{contains:(cls)=>cls==='tx-sheet',remove:()=>{}},
     setAttribute:()=>{},focus:()=>{modalFocuses++},contains:()=>false,
     querySelector:()=>null};
  const input={id:'txAmount',focus:()=>{inputFocuses++}};
  const last={isConnected:true,focus:()=>{}};
  const body={style:{},classList:{added:[],add(name){this.added.push(name)},contains:()=>false,remove:()=>{}}};
  const document={activeElement:last,body,
     getElementById:id=>({overlay,modal,txAmount:input})[id]};
  const window={scrollY:629,scrollTo:()=>{scrollCalls++}};
  const history={pushState:()=>{historyPushes++}};
  const context={document,window,console,history,navState:()=>({}),nativeAndroid:native,
    navReady:true,lastFocus:null,view:'dashboard',modalHistoryOpen:false,
    draft:{amount:1250},catDraft:null,financeNative:()=>({showAmountKeyboard:()=>{keyboardCalls++}})};
  vm.createContext(context);
  vm.runInContext(extract('openModal','hideModal')+'\n'+extract('hideModal','closeModal')+
     '\nopenModal();',context,{timeout:2000});
  if(overlay.hidden)throw new Error('Plus button did not open dialog');
  if(native){
    if(body.classList.added.length||Object.keys(body.style).length)throw new Error('Android page geometry changed');
    if(modalFocuses||inputFocuses||keyboardCalls)throw new Error('Android dialog grabbed focus or opened the keyboard');
    if(historyPushes!==0)throw new Error('Native + pushed a browser history entry and can jump the viewport');
  }else{
    if(body.style.overflow!=='hidden'||inputFocuses!==1||historyPushes!==1)throw new Error('Browser modal behavior changed');
  }
  vm.runInContext('hideModal()',context,{timeout:2000});
  if(!overlay.hidden||scrollCalls||window.scrollY!==629)throw new Error('Close moved the page');
  if(!native&&body.style.overflow!=='')throw new Error('Browser overflow not restored');
}
try{modalScenario(true);modalScenario(false);console.log('OK: Android and browser modal no-jump regression');}
catch(error){console.error('FAILED: Modal transition regression:',error);okay=false}
if(!okay)process.exit(1);

