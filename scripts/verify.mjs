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
  ['Custom numeric keypad replaces Android IME', html.includes('data-numpad=') && html.includes('inputmode="none" readonly')],
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
    if(body.style.overflow!=='hidden'||inputFocuses!==0||historyPushes!==1)throw new Error('Browser modal behavior changed');
  }
  vm.runInContext('hideModal()',context,{timeout:2000});
  if(!overlay.hidden||scrollCalls||window.scrollY!==629)throw new Error('Close moved the page');
  if(!native&&body.style.overflow!=='')throw new Error('Browser overflow not restored');
}
try{modalScenario(true);modalScenario(false);console.log('OK: Android and browser modal no-jump regression');}
catch(error){console.error('FAILED: Modal transition regression:',error);okay=false}

/* Expense sheet regression: first eight categories stay visible on a 4-column
   mobile grid; selecting a later custom category still expands the picker. */
const compactCss=html.slice(html.indexOf('/* v1.0.6 — compact expense entry;'));
const compactGuards=[
  ['Collapsed category picker shows eight (not six)', html.includes('.category-picker:not(.expanded)>.cat-choice:nth-child(n+9){display:none!important}') && !html.includes('.category-picker:not(.expanded)>.cat-choice:nth-child(n+7)')],
  ['Eighth selected category stays in the compact grid',html.includes('if(icons.findIndex(c=>c.id===draft.category)>7)')],
  ['Mobile category grid has four columns',/\.category-picker\{grid-template-columns:repeat\(4,minmax\(0,1fr\)\)!important/.test(compactCss)],
  ['Keypad is a smaller fixed-height on-screen grid', /\.r105-key\{height:40px!important;min-height:40px!important/.test(compactCss)],
  ['Category tile remains a readable touch target',/\.cat-choice\{min-height:62px!important/.test(compactCss)],
  ['Existing amount entry and data persistence unchanged',html.includes('function enterAmountDigit(')&&html.includes('function persist(){')]
];
for(const [name,pass] of compactGuards){console.log((pass?'OK':'FAILED')+': '+name);if(!pass)okay=false;}


/* Dashboard visual regression: exercise production calculations and donut templates. */
try{
 const section=(first,last)=>{
  const start=html.indexOf('function '+first+'('),end=html.indexOf('\nfunction '+last+'(',start);
  if(start<0||end<start)throw new Error('Function missing: '+first);
  return html.slice(start,end);
 };
 const days=Array.from({length:7},(_,i)=>'2026-10-'+(19+i)), amounts=[0,30,100,101,200,201,300];
 const weekContext={weekRangeFor:()=>days,monthExpenseMap:()=>Object.fromEntries(days.map((d,i)=>[d,amounts[i]])),
  dateLocal:()=>days[0],dashboardWeekAnchor:null,data:{transactions:[],settings:{currency:'₽'}},F:{money:n=>n},
  compactMoney:n=>String(n),money:n=>String(n)+' ₽',matteDateLabel:n=>n,svg:()=>'',esc:n=>String(n)};
 vm.createContext(weekContext);
 vm.runInContext(section('weekSpendLevel','currentExpenseStreak'),weekContext,{timeout:2000});
 const calendar=vm.runInContext("compactWeekWidget('2026-10-21')",weekContext,{timeout:2000});
 const levels=[...calendar.matchAll(/class="week-day ([^"]+)" data-jump-day="[^"]+"/g)]
  .map(m=>m[1].match(/spend-(zero|low|medium|high)/)?.[1]);
 if(levels.join(',')!=='zero,low,low,medium,medium,high,high')
  throw new Error('Wrong color levels for visible week');
 for(const rule of ['spend-zero .week-day-meter{background:#CFCFC8!important}',
   'spend-low .week-day-meter-fill{background:#6FAF7A!important}',
   'spend-medium .week-day-meter-fill{background:#D8B24C!important}',
   'spend-high .week-day-meter-fill{background:#D06A5C!important}']){
   if(!html.includes(rule))throw new Error('Missing color rule '+rule);
 }
 const items=[{type:'expense',category:'fun',amount:9000},{type:'expense',category:'food',amount:1200},
  {type:'expense',category:'cafe',amount:200}];
 const donut={items,dashboardFocusDay:'2026-10-25',dateLocal:()=> '2026-10-25',expensesOfDay:()=>items,
  data:{settings:{currency:'₽'}},F:{expenseCategories:rows=>rows.reduce((m,t)=>{
   if(t.type==='expense')m[t.category]=(m[t.category]||0)+t.amount;return m;},{})},
  getCat:id=>({name:({fun:'Развлечения',food:'Продукты',cafe:'Кафе и рестораны'})[id]||id}),
  categoryColor:()=> '#A7C8B6',money:n=>String(n)+' ₽',esc:n=>String(n),render:()=>{}};
 vm.createContext(donut);
 vm.runInContext('let dayChartSelection=null;\n'+section('dayChartBreakdown','dashboard'),donut,{timeout:2000});
 const selected=vm.runInContext("dayChartSelection='fun';daySummaryRing(items)",donut,{timeout:2000});
 if(!selected.includes('day-donut-category')||!selected.includes('>Развлечения</span>')
  ||!selected.includes('>86,5% расходов</span>')||!selected.includes('day-donut-legend-item is-selected'))
  throw new Error('Selected donut category name/amount/share not rendered');
 vm.runInContext("updateDayChartSelection('fun')",donut,{timeout:2000});
 const cleared=vm.runInContext('daySummaryRing(items)',donut,{timeout:2000});
 if(!cleared.includes('>Все расходы</span>')||!cleared.includes('>за день</span>'))
  throw new Error('Repeating selection did not restore total');
 console.log('OK: seven-day color levels and selected category labeling');
}catch(error){console.error('FAILED: Dashboard visual regression:',error);okay=false}

if(!okay)process.exit(1);

