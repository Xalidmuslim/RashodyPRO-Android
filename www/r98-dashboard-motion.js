/* Rashody PRO v9.8: first-visit/return dashboard choreography.
 * Independent CSS transforms (no layout mutation), ring stroke drawing and
 * bar growth; bottom navigation and financial calculation are untouched. */
(()=>{
 'use strict';
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 let lastView=null,lastPeriod=null,generation=0,active=[];
 const ease='cubic-bezier(.18,.76,.23,1)';
 function clean(){
  for(const a of active){try{a.cancel()}catch(_){}}
  active=[];
 }
 function run(el,frames,options){
  if(!el?.animate||reduced?.matches||document.hidden)return null;
  const anim=el.animate(frames,{fill:'both',easing:ease,...options});
  active.push(anim);
  anim.finished.then(()=>{
   // Keyframe effect must be over before removing the temporary layer.
   try{anim.cancel()}catch(_){}
  },()=>{});
  return anim;
 }
 function play(){
  const root=document.querySelector('#page .r98-dashboard');
  if(!root||reduced?.matches||document.hidden)return;
  // Never animate the common page container: Android nav remains fixed.
  const panels=[
   root.querySelector('.r96-summary'),
   root.querySelector('.r96-calendar'),
   root.querySelector('.r96-kpis'),
   root.querySelector('.r96-spending'),
   root.querySelector('.r96-trend'),
   root.querySelector('.r97-day-summary'),
   root.querySelector('.r96-latest')
  ].filter(Boolean);
  const timings=[
   {delay:0,duration:350},
   {delay:80,duration:350},
   {delay:150,duration:410},
   {delay:240,duration:390},
   {delay:300,duration:390},
   {delay:350,duration:350},
   {delay:480,duration:380}
  ];
  panels.forEach((el,i)=>run(el,[
   {transform:'translate3d(0,8px,0) scale(.994)',opacity:.84},
   {transform:'translate3d(0,-1px,0) scale(1.001)',opacity:1,offset:.8},
   {transform:'none',opacity:1}
  ],timings[i]));
  const circles=[...root.querySelectorAll('.r96-ring svg circle[stroke-dasharray]')];
  const circumference=(2*Math.PI*67).toFixed(3);
  circles.forEach((circle,i)=>{
   const final=circle.getAttribute('stroke-dasharray');
   if(!final)return;
   run(circle,[
    {strokeDasharray:'0 '+circumference,offset:0},
    {strokeDasharray:final,offset:1}
   ],{duration:550,delay:230+i*35});
  });
  const bars=[...root.querySelectorAll('.r96-bar-chart .r96-bar-column .r96-bar')];
  bars.forEach((bar,i)=>run(bar,[
   {transform:'scaleY(.025)',offset:0},
   {transform:'scaleY(1.025)',offset:.78},
   {transform:'scaleY(1)',offset:1}
  ],{duration:460,delay:270+i*30}));
 }
 function afterRender({view,period}={}){
  const was=lastView,oldPeriod=lastPeriod;
  lastView=view;lastPeriod=period;
  if(was==='dashboard'&&oldPeriod===period&&view==='dashboard')return; // keep pending first-frame animation
  generation++;
  if(view!=='dashboard'){clean();return}
  clean();
  const key=generation;
  requestAnimationFrame(()=>{
   if(key!==generation)return;
   play();
  });
 }
 window.RashodyDashboardMotion={afterRender,diagnostics:()=>({lastView,lastPeriod,activeAnimations:active.length})};
 // Inline bootstrap may render before deferred modules have executed.
 function boot(){
  const dashboard=document.querySelector('#page .r98-dashboard');
  if(dashboard&&lastView===null)afterRender({view:'dashboard',period:dashboard.dataset.dashboardPeriodActive||'month'});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
 else boot();
})();
