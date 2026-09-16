(function(){
  'use strict';
  if(window.__yayaChantierTabsLiveRefreshV4)return;
  window.__yayaChantierTabsLiveRefreshV4=true;

  const CACHE_DATA_KEY='YAYA_CACHE_DATA_V2';
  let inFlight=null;
  let lastRefresh=0;
  let lastFocus='';

  function apiEndpoint(){
    try{return (typeof API==='string'&&API)?API.trim():'';}catch(e){return '';}
  }

  function saveCache(data){
    try{
      const cached=JSON.parse(localStorage.getItem(CACHE_DATA_KEY)||'{}')||{};
      ['documents','achats','commandes'].forEach(function(tab){
        if(Array.isArray(data[tab]))cached[tab]=data[tab];
      });
      localStorage.setItem(CACHE_DATA_KEY,JSON.stringify(cached));
    }catch(e){}
  }

  async function fetchShared(){
    const api=apiEndpoint();
    if(!api)throw new Error('API Yaya indisponible');
    const sep=api.includes('?')?'&':'?';
    const ctrl=new AbortController();
    const timer=setTimeout(function(){ctrl.abort();},15000);
    try{
      const url=api+sep+'tabs=documents,achats,commandes&_yaya_shared='+Date.now();
      const r=await fetch(url,{method:'GET',cache:'no-store',signal:ctrl.signal});
      const txt=await r.text();
      const j=JSON.parse(txt);
      if(!j||j.ok!==true||!j.data)throw new Error(j&&j.error||'Réponse Yaya invalide');
      return j.data;
    }finally{
      clearTimeout(timer);
    }
  }

  async function refreshShared(force){
    if(inFlight)return inFlight;
    if(!force&&Date.now()-lastRefresh<3000)return true;

    inFlight=(async function(){
      try{
        let data=await fetchShared();
        if(!Array.isArray(data.documents)||!Array.isArray(data.achats)){
          if(typeof apiGet==='function')data=await apiGet(true);
        }
        if(!data||!Array.isArray(data.documents)||!Array.isArray(data.achats)){
          throw new Error('Données partagées incomplètes');
        }
        if(typeof S!=='undefined'&&S){
          S.documents=data.documents;
          S.achats=data.achats;
          if(Array.isArray(data.commandes))S.commandes=data.commandes;
        }
        saveCache(data);
        lastRefresh=Date.now();
        try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed',{detail:{tabs:['documents','achats','commandes'],source:'chantier-open'}}));}catch(e){}
        try{if(typeof render==='function')render();}catch(e){}
        return true;
      }catch(e){
        console.warn('Yaya · synchronisation partagée impossible :',e);
        return false;
      }
    })();

    try{return await inFlight;}finally{inFlight=null;}
  }

  function currentFocus(){
    try{return String((typeof focusChantier!=='undefined'&&focusChantier)||'');}catch(e){return '';}
  }

  function checkFocus(){
    const id=currentFocus();
    if(id&&id!==lastFocus){
      lastFocus=id;
      setTimeout(function(){refreshShared(true);},80);
    }else if(!id){
      lastFocus='';
    }
  }

  document.addEventListener('click',function(e){
    const target=e.target&&e.target.closest?e.target.closest('#pane-chantiers button,#pane-chantiers .yaya-detail-section-tab[data-section]'):null;
    if(!target)return;
    setTimeout(checkFocus,30);
    if(target.matches('.yaya-detail-section-tab[data-section]')){
      setTimeout(function(){refreshShared(true);},80);
    }
  },true);

  const pane=document.getElementById('pane-chantiers');
  if(pane){
    let timer=0;
    new MutationObserver(function(){
      clearTimeout(timer);
      timer=setTimeout(checkFocus,40);
    }).observe(pane,{childList:true,subtree:true});
  }

  window.addEventListener('focus',function(){if(currentFocus())refreshShared(false);});
  document.addEventListener('visibilitychange',function(){if(!document.hidden&&currentFocus())refreshShared(false);});

  window.yayaRefreshSharedNow=function(){return refreshShared(true);};
  window.yayaRefreshDocumentsNow=function(){return refreshShared(true);};
  window.yayaRefreshAchatsNow=function(){return refreshShared(true);};
  window.yayaRefreshCommandesNow=function(){return refreshShared(true);};

  setTimeout(checkFocus,300);
})();
