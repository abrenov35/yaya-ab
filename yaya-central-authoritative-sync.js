(function(){
  'use strict';
  if(window.__yayaCentralAuthorityV1)return;
  window.__yayaCentralAuthorityV1=true;

  const TABS=['chantiers','salaries','heures','achats','avenants','documents','validations','commandes','DEVIS'];
  const CACHE_DATA_KEY='YAYA_CACHE_DATA_V2';
  const CACHE_META_KEY='YAYA_CACHE_META_V2';
  let inFlight=null;
  let lastSync=0;
  let bootDone=false;

  function apiEndpoint(){
    try{return (typeof API==='string'&&API)?API.trim():'';}catch(e){return '';}
  }

  function ensureOverlay(message,isError){
    let box=document.getElementById('yaya-central-authority-overlay');
    if(!box){
      box=document.createElement('div');
      box.id='yaya-central-authority-overlay';
      box.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(244,246,248,.97);display:flex;align-items:center;justify-content:center;padding:24px;font-family:Arial,sans-serif;';
      const inner=document.createElement('div');
      inner.id='yaya-central-authority-message';
      inner.style.cssText='max-width:560px;width:100%;padding:22px;border-radius:12px;background:#fff;border:1px solid #cbd5e1;box-shadow:0 8px 30px rgba(15,23,42,.15);text-align:center;font-size:15px;font-weight:700;color:#1e293b;';
      box.appendChild(inner);
      document.body.appendChild(box);
    }
    const inner=document.getElementById('yaya-central-authority-message');
    if(inner){
      inner.style.color=isError?'#b42318':'#1e293b';
      inner.innerHTML=String(message||'Synchronisation de la base centrale…')+(isError?'<div style="margin-top:14px"><button type="button" id="yaya-central-retry" style="padding:9px 16px;border:1px solid #b42318;border-radius:8px;background:#fff;color:#b42318;font-weight:700;cursor:pointer">Réessayer</button></div>':'');
      const retry=document.getElementById('yaya-central-retry');
      if(retry)retry.onclick=function(){syncNow(true);};
    }
    return box;
  }

  function hideOverlay(){
    const box=document.getElementById('yaya-central-authority-overlay');
    if(box)box.remove();
  }

  function canSync(){
    if((Number(window.__yayaWriteInFlight)||0)>0)return false;
    const lastWrite=Number(window.__yayaLastWriteAt)||0;
    if(lastWrite&&Date.now()-lastWrite<2500)return false;
    const modal=document.querySelector('#modalRoot .overlay');
    if(modal)return false;
    return true;
  }

  async function fetchCentral(){
    const api=apiEndpoint();
    if(!api)throw new Error('API Yaya indisponible');
    const sep=api.includes('?')?'&':'?';
    let lastErr=null;
    const timeouts=[12000,16000,20000];
    for(let tentative=0;tentative<timeouts.length;tentative++){
      const ctrl=new AbortController();
      const timer=setTimeout(function(){ctrl.abort();},timeouts[tentative]);
      try{
        const r=await fetch(api+sep+'_yaya_central='+Date.now()+'_'+tentative,{method:'GET',cache:'no-store',signal:ctrl.signal});
        const txt=await r.text();
        let j;
        try{j=JSON.parse(txt);}catch(e){throw new Error('Réponse centrale invalide');}
        if(!j||j.ok!==true||!j.data)throw new Error(j&&j.error||'Réponse centrale invalide');
        if(!Array.isArray(j.data.chantiers))throw new Error('Liste chantiers centrale absente');
        return j;
      }catch(e){
        lastErr=e;
        if(tentative<timeouts.length-1)await new Promise(function(resolve){setTimeout(resolve,400*(tentative+1));});
      }finally{
        clearTimeout(timer);
      }
    }
    throw lastErr||new Error('Base centrale indisponible');
  }

  function applyCentral(j){
    if(typeof S==='undefined'||!S)throw new Error('Yaya non initialisé');
    const data=j.data||{};
    TABS.forEach(function(tab){
      if(Array.isArray(data[tab]))S[tab]=data[tab];
    });
    try{
      localStorage.setItem(CACHE_DATA_KEY,JSON.stringify(data));
      if(j.meta&&j.meta.tabs)localStorage.setItem(CACHE_META_KEY,JSON.stringify(j.meta));
    }catch(e){}
    window.__yayaCachedBoot=false;
    window.__yayaCentralSyncedAt=Date.now();
    lastSync=Date.now();
    try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed',{detail:{tabs:TABS.slice(),source:'central-authority'}}));}catch(e){}
    try{if(typeof render==='function')render();}catch(e){}
  }

  async function syncNow(blocking){
    if(inFlight)return inFlight;
    if(!blocking&&!canSync())return false;
    if(blocking)ensureOverlay('Synchronisation de la base centrale…',false);
    inFlight=(async function(){
      try{
        const j=await fetchCentral();
        applyCentral(j);
        bootDone=true;
        hideOverlay();
        return true;
      }catch(e){
        console.error('Yaya · base centrale indisponible :',e);
        ensureOverlay('Base centrale indisponible. Yaya est bloqué pour éviter de travailler sur des données anciennes.<br><span style="font-weight:500">'+String(e&&e.message||e)+'</span>',true);
        return false;
      }
    })();
    try{return await inFlight;}finally{inFlight=null;}
  }

  async function checkLatestVersion(){
    try{
      const r=await fetch('index.html?_yaya_version_check='+Date.now(),{cache:'no-store'});
      if(!r.ok)return;
      const txt=await r.text();
      const remote=(txt.match(/<title>Yaya v([^ <]+)/i)||[])[1]||'';
      const local=(String(document.title||'').match(/Yaya v([^ <]+)/i)||[])[1]||'';
      if(!remote||!local||remote===local)return;
      const marker='YAYA_VERSION_RELOAD_'+remote;
      if(sessionStorage.getItem(marker)==='1')return;
      sessionStorage.setItem(marker,'1');
      const u=new URL(window.location.href);
      u.searchParams.set('_yaya_v',remote);
      window.location.replace(u.toString());
    }catch(e){}
  }

  function boot(){
    if(typeof S==='undefined'||!S||typeof render!=='function'||!apiEndpoint()){
      setTimeout(boot,120);
      return;
    }
    checkLatestVersion().finally(function(){syncNow(true);});
  }

  window.yayaCentralSyncNow=function(){return syncNow(true);};
  window.yayaRefreshSharedNow=function(){return syncNow(true);};
  window.yayaRefreshChantiersNow=function(){return syncNow(true);};
  window.yayaRefreshDocumentsNow=function(){return syncNow(true);};
  window.yayaRefreshAchatsNow=function(){return syncNow(true);};
  window.yayaRefreshCommandesNow=function(){return syncNow(true);};

  window.addEventListener('focus',function(){
    if(bootDone&&Date.now()-lastSync>5000)syncNow(true);
  });
  document.addEventListener('visibilitychange',function(){
    if(!document.hidden&&bootDone&&Date.now()-lastSync>5000)syncNow(true);
  });
  setInterval(function(){
    if(!document.hidden&&bootDone&&Date.now()-lastSync>60000&&canSync())syncNow(false);
  },15000);

  ensureOverlay('Synchronisation de la base centrale…',false);
  setTimeout(boot,0);
})();
