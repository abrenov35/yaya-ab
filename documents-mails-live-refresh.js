(function(){
  'use strict';
  if(window.__yayaDocumentsMailsLiveRefreshV1)return;
  window.__yayaDocumentsMailsLiveRefreshV1=true;

  const CACHE_DATA_KEY='YAYA_CACHE_DATA_V2';
  const CACHE_META_KEY='YAYA_CACHE_META_V2';
  let inFlight=null;
  let lastRefresh=0;

  function apiEndpoint(){
    try{return (typeof API==='string'&&API)?API.trim():'';}catch(e){return '';}
  }

  function saveCache(rows,meta){
    try{
      const cached=JSON.parse(localStorage.getItem(CACHE_DATA_KEY)||'{}')||{};
      cached.documents=rows;
      localStorage.setItem(CACHE_DATA_KEY,JSON.stringify(cached));
      if(meta&&typeof meta==='object'){
        const oldMeta=JSON.parse(localStorage.getItem(CACHE_META_KEY)||'{}')||{};
        const merged={...oldMeta,...meta,tabs:{...(oldMeta.tabs||{}),...(meta.tabs||{})}};
        localStorage.setItem(CACHE_META_KEY,JSON.stringify(merged));
      }
    }catch(e){}
  }

  async function refreshDocuments(force){
    if(inFlight)return inFlight;
    if(!force&&Date.now()-lastRefresh<3000)return true;
    const api=apiEndpoint();
    if(!api)return false;

    inFlight=(async function(){
      const sep=api.includes('?')?'&':'?';
      const ctrl=new AbortController();
      const timer=setTimeout(()=>ctrl.abort(),10000);
      try{
        const r=await fetch(api+sep+'tabs=documents&_yaya_docs='+Date.now(),{
          method:'GET',
          cache:'no-store',
          signal:ctrl.signal
        });
        const txt=await r.text();
        const j=JSON.parse(txt);
        if(!j||j.ok!==true||!j.data||!Array.isArray(j.data.documents)){
          throw new Error(j&&j.error||'Réponse documents invalide');
        }
        const rows=j.data.documents;
        if(typeof S!=='undefined'&&S)S.documents=rows;
        saveCache(rows,j.meta);
        lastRefresh=Date.now();
        try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed',{detail:{tabs:['documents'],source:'documents-tab'}}));}catch(e){}
        try{if(typeof render==='function')render();}catch(e){}
        return true;
      }catch(e){
        console.warn('Yaya documents/mails · actualisation impossible :',e);
        return false;
      }finally{
        clearTimeout(timer);
      }
    })();

    try{return await inFlight;}finally{inFlight=null;}
  }

  document.addEventListener('click',function(e){
    const tab=e.target&&e.target.closest?e.target.closest('#pane-chantiers .yaya-detail-section-tab[data-section="documents"]'):null;
    if(!tab)return;
    setTimeout(function(){refreshDocuments(true);},0);
  },true);

  window.yayaRefreshDocumentsNow=function(){return refreshDocuments(true);};
})();
