(function(){
  'use strict';
  if(window.__yayaChantierTabsLiveRefreshV2)return;
  window.__yayaChantierTabsLiveRefreshV2=true;

  const CACHE_DATA_KEY='YAYA_CACHE_DATA_V2';
  const CACHE_META_KEY='YAYA_CACHE_META_V2';
  const SECTION_TABS={
    documents:['documents'],
    depenses:['achats'],
    charges:['achats'],
    commandes:['commandes']
  };
  const inFlight={};
  const lastRefresh={};

  function apiEndpoint(){
    try{return (typeof API==='string'&&API)?API.trim():'';}catch(e){return '';}
  }

  function saveCacheTab(tab,rows,meta){
    try{
      const cached=JSON.parse(localStorage.getItem(CACHE_DATA_KEY)||'{}')||{};
      cached[tab]=rows;
      localStorage.setItem(CACHE_DATA_KEY,JSON.stringify(cached));
      if(meta&&typeof meta==='object'){
        const oldMeta=JSON.parse(localStorage.getItem(CACHE_META_KEY)||'{}')||{};
        const merged={...oldMeta,...meta,tabs:{...(oldMeta.tabs||{}),...(meta.tabs||{})}};
        localStorage.setItem(CACHE_META_KEY,JSON.stringify(merged));
      }
    }catch(e){}
  }

  async function refreshTab(tab,force){
    if(inFlight[tab])return inFlight[tab];
    if(!force&&Date.now()-(lastRefresh[tab]||0)<3000)return true;
    const api=apiEndpoint();
    if(!api)return false;

    inFlight[tab]=(async function(){
      const sep=api.includes('?')?'&':'?';
      const ctrl=new AbortController();
      const timer=setTimeout(()=>ctrl.abort(),10000);
      try{
        const r=await fetch(api+sep+'tabs='+encodeURIComponent(tab)+'&_yaya_live='+Date.now(),{
          method:'GET',
          cache:'no-store',
          signal:ctrl.signal
        });
        const txt=await r.text();
        const j=JSON.parse(txt);
        if(!j||j.ok!==true||!j.data||!Array.isArray(j.data[tab])){
          throw new Error(j&&j.error||('Réponse '+tab+' invalide'));
        }
        const rows=j.data[tab];
        if(typeof S!=='undefined'&&S)S[tab]=rows;
        saveCacheTab(tab,rows,j.meta);
        lastRefresh[tab]=Date.now();
        try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed',{detail:{tabs:[tab],source:'chantier-tab'}}));}catch(e){}
        return true;
      }catch(e){
        console.warn('Yaya '+tab+' · actualisation impossible :',e);
        return false;
      }finally{
        clearTimeout(timer);
      }
    })();

    try{return await inFlight[tab];}finally{inFlight[tab]=null;}
  }

  async function refreshForSection(section){
    const tabs=SECTION_TABS[String(section||'')]||[];
    if(!tabs.length)return false;
    const results=await Promise.all(tabs.map(tab=>refreshTab(tab,true)));
    if(results.some(Boolean)){
      try{if(typeof render==='function')render();}catch(e){}
      return true;
    }
    return false;
  }

  document.addEventListener('click',function(e){
    const tab=e.target&&e.target.closest?e.target.closest('#pane-chantiers .yaya-detail-section-tab[data-section]'):null;
    if(!tab)return;
    const section=String(tab.dataset.section||'');
    if(!SECTION_TABS[section])return;
    setTimeout(function(){refreshForSection(section);},250);
  },true);

  window.yayaRefreshDocumentsNow=function(){return refreshTab('documents',true).then(function(ok){if(ok&&typeof render==='function')render();return ok;});};
  window.yayaRefreshAchatsNow=function(){return refreshTab('achats',true).then(function(ok){if(ok&&typeof render==='function')render();return ok;});};
  window.yayaRefreshCommandesNow=function(){return refreshTab('commandes',true).then(function(ok){if(ok&&typeof render==='function')render();return ok;});};
})();
