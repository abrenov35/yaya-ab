(function(){
  'use strict';
  if(window.__yayaChantierTabsLiveRefreshV3)return;
  window.__yayaChantierTabsLiveRefreshV3=true;

  const CACHE_DATA_KEY='YAYA_CACHE_DATA_V2';
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

  function saveCacheTab(tab,rows){
    try{
      const cached=JSON.parse(localStorage.getItem(CACHE_DATA_KEY)||'{}')||{};
      cached[tab]=rows;
      localStorage.setItem(CACHE_DATA_KEY,JSON.stringify(cached));
    }catch(e){}
  }

  async function getFreshData(){
    try{
      if(typeof apiGet==='function')return await apiGet(true);
    }catch(e){}
    const api=apiEndpoint();
    if(!api)throw new Error('API Yaya indisponible');
    const sep=api.includes('?')?'&':'?';
    const ctrl=new AbortController();
    const timer=setTimeout(()=>ctrl.abort(),15000);
    try{
      const r=await fetch(api+sep+'_yaya_shared='+Date.now(),{method:'GET',cache:'no-store',signal:ctrl.signal});
      const txt=await r.text();
      const j=JSON.parse(txt);
      if(!j||j.ok!==true||!j.data)throw new Error(j&&j.error||'Réponse Yaya invalide');
      return j.data;
    }finally{
      clearTimeout(timer);
    }
  }

  async function refreshTab(tab,force){
    if(inFlight[tab])return inFlight[tab];
    if(!force&&Date.now()-(lastRefresh[tab]||0)<3000)return true;

    inFlight[tab]=(async function(){
      try{
        const data=await getFreshData();
        if(!data||!Array.isArray(data[tab]))throw new Error('Rubrique '+tab+' absente');
        const rows=data[tab];
        if(typeof S!=='undefined'&&S)S[tab]=rows;
        saveCacheTab(tab,rows);
        lastRefresh[tab]=Date.now();
        try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed',{detail:{tabs:[tab],source:'chantier-tab'}}));}catch(e){}
        return true;
      }catch(e){
        console.warn('Yaya '+tab+' · actualisation impossible :',e);
        return false;
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
    setTimeout(function(){refreshForSection(section);},150);
  },true);

  window.yayaRefreshDocumentsNow=function(){return refreshTab('documents',true).then(function(ok){if(ok&&typeof render==='function')render();return ok;});};
  window.yayaRefreshAchatsNow=function(){return refreshTab('achats',true).then(function(ok){if(ok&&typeof render==='function')render();return ok;});};
  window.yayaRefreshCommandesNow=function(){return refreshTab('commandes',true).then(function(ok){if(ok&&typeof render==='function')render();return ok;});};
})();
