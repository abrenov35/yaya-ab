(function(){
'use strict';
if(window.__yayaSyncCoordinatorV1)return;
window.__yayaSyncCoordinatorV1=true;

const originalFetch=window.fetch.bind(window);
const reads=new Map();
let activeWrites=0;
let writeEpoch=0;
let writeWaiters=[];
const metrics={dedupedReads:0,delayedReads:0,replayedReads:0,reads:0,writes:0};

function apiUrl(){
  try{return typeof API==='string'&&API?new URL(API,location.href):null;}catch(_){return null;}
}
function requestUrl(input){
  try{
    if(typeof input==='string'||input instanceof URL)return new URL(String(input),location.href);
    if(input&&input.url)return new URL(String(input.url),location.href);
  }catch(_){}
  return null;
}
function methodOf(input,init){
  return String((init&&init.method)||(input&&input.method)||'GET').toUpperCase();
}
function isYayaApi(url){
  const api=apiUrl();
  return !!(api&&url&&api.origin===url.origin&&api.pathname===url.pathname);
}
function scopeOf(url){
  const semantic=[];
  url.searchParams.forEach((value,key)=>{
    if(/^_yaya/i.test(key)||key==='_ts')return;
    if(key==='tabs')value=String(value||'').split(',').map(x=>x.trim()).filter(Boolean).sort().join(',');
    semantic.push(key+'='+value);
  });
  semantic.sort();
  return semantic.length?semantic.join('&'):'all';
}
function notifyState(){
  window.__yayaSyncState={activeReads:reads.size,activeWrites,writeEpoch,metrics:{...metrics}};
  try{window.dispatchEvent(new CustomEvent('yaya:sync-state',{detail:window.__yayaSyncState}));}catch(_){}
}
function finishWrite(){
  activeWrites=Math.max(0,activeWrites-1);
  writeEpoch++;
  if(!activeWrites){
    const pending=writeWaiters.splice(0);
    pending.forEach(resolve=>resolve());
  }
  notifyState();
}
function waitForWrites(){
  if(!activeWrites)return Promise.resolve();
  metrics.delayedReads++;
  return new Promise(resolve=>{
    let done=false;
    const finish=()=>{if(done)return;done=true;clearTimeout(timer);resolve();};
    const timer=setTimeout(finish,8000);
    writeWaiters.push(finish);
  });
}
async function freshRead(input,init){
  await waitForWrites();
  const startEpoch=writeEpoch;
  let response=await originalFetch(input,init);
  if(response&&response.ok&&writeEpoch!==startEpoch){
    metrics.replayedReads++;
    await waitForWrites();
    response=await originalFetch(input,init);
  }
  return response;
}
function coordinatedRead(input,init,url){
  const scope=scopeOf(url);
  const current=reads.get(scope);
  if(current){
    metrics.dedupedReads++;
    notifyState();
    return current.then(response=>response.clone());
  }
  metrics.reads++;
  const job=freshRead(input,init);
  reads.set(scope,job);
  notifyState();
  job.finally(()=>{if(reads.get(scope)===job)reads.delete(scope);notifyState();}).catch(()=>{});
  return job.then(response=>response.clone());
}

window.fetch=function(input,init){
  const url=requestUrl(input);
  if(!isYayaApi(url))return originalFetch(input,init);
  const method=methodOf(input,init);
  if(method==='GET')return coordinatedRead(input,init,url);
  if(method==='POST'||method==='PUT'||method==='PATCH'||method==='DELETE'){
    activeWrites++;
    writeEpoch++;
    metrics.writes++;
    notifyState();
    return originalFetch(input,init).finally(finishWrite);
  }
  return originalFetch(input,init);
};
window.fetch.__yayaOriginalFetch=originalFetch;
window.__yayaSyncCoordinator={metrics:()=>({...metrics}),state:()=>window.__yayaSyncState||null};
notifyState();
})();
