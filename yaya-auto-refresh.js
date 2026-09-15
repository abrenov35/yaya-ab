(function(){
  'use strict';

  // V8 — sécurité persistance.
  // Les rafraîchissements automatiques Achats/Documents sont désactivés :
  // ils pouvaient remplacer l'état local S par une lecture serveur concurrente.
  // Une actualisation reste possible uniquement à la demande de l'utilisateur.
  const WATCHED=['achats','documents'];
  const CACHE_DATA_KEY='YAYA_CACHE_DATA_V2';
  const CACHE_META_KEY='YAYA_CACHE_META_V2';

  function getApi(){try{return (typeof API==='string'&&API)?API:'';}catch(e){return '';}}

  async function fetchJson(params){
    const api=getApi();if(!api)throw new Error('API Yaya indisponible');
    const sep=api.includes('?')?'&':'?';
    const ctrl=new AbortController();
    const timer=setTimeout(()=>ctrl.abort(),7000);
    try{
      const r=await fetch(api+sep+params+'&_yaya_live='+Date.now(),{method:'GET',cache:'no-store',signal:ctrl.signal});
      const txt=await r.text();const j=JSON.parse(txt);
      if(!j||!j.ok)throw new Error(j&&j.error||'Réponse Yaya invalide');
      return j;
    }finally{clearTimeout(timer);}
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

  async function refreshTabsManual(tabs){
    const wanted=(Array.isArray(tabs)&&tabs.length?tabs:WATCHED).filter(tab=>WATCHED.includes(tab));
    const updated=[];
    for(const tab of wanted){
      try{
        const j=await fetchJson('tabs='+encodeURIComponent(tab));
        const rows=j&&j.data&&Array.isArray(j.data[tab])?j.data[tab]:null;
        if(!rows)continue;
        if(typeof S!=='undefined'&&S)S[tab]=rows;
        saveCacheTab(tab,rows,j.meta);
        updated.push(tab);
      }catch(e){console.warn('Yaya '+tab+' · actualisation manuelle impossible :',e);}
    }
    if(updated.length){
      try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed',{detail:{tabs:updated,source:'manual'}}));}catch(e){}
      try{if(typeof render==='function')render();}catch(e){}
    }
    return updated.length>0;
  }

  // Aucun setInterval, aucun premier GET différé, aucun refresh au retour d'onglet.
  window.__YAYA_AUTO_SYNC_STOPPED=true;
  window.__yayaSmartRefreshInstalled=true;
  window.yayaSmartRefreshNow=function(){return refreshTabsManual(WATCHED);};
})();

// Fiche chantier : un seul onglet visuel « Documents & mails ».
(function(){
  'use strict';
  const STYLE_ID='yaya-documents-mails-merged-v2';
  function installStyle(){let style=document.getElementById(STYLE_ID);if(!style){style=document.createElement('style');style.id=STYLE_ID;document.head.appendChild(style);}style.textContent=`
      #pane-chantiers#pane-chantiers#pane-chantiers .card > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="mail"]{display:none!important}
      #pane-chantiers#pane-chantiers#pane-chantiers .card > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="documents"] > strong{font-size:0!important}
      #pane-chantiers#pane-chantiers#pane-chantiers .card > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="documents"] > strong::after{content:'Documents & mails'!important;font-size:12px!important;font-weight:700!important;line-height:1.15!important;white-space:nowrap!important}
      #pane-chantiers#pane-chantiers#pane-chantiers .card > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="documents"] > small{display:none!important}
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-detail-documents-pane[data-empty="0"],#pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-detail-mails-pane[data-empty="0"],#pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="mail"] > .yaya-detail-documents-pane[data-empty="0"],#pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="mail"] > .yaya-detail-mails-pane[data-empty="0"]{display:block!important}
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-detail-empty-pane[data-section="mail"],#pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="mail"] > .yaya-detail-empty-pane[data-section="mail"]{display:none!important}
      @media(max-width:640px){#pane-chantiers#pane-chantiers#pane-chantiers .card > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="documents"] > strong::after{font-size:11px!important}}
    `;}
  function migrateOldMailState(){const pane=document.getElementById('pane-chantiers');if(!pane)return;pane.querySelectorAll('.card[data-yaya-detail-section="mail"]').forEach(card=>{const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');const docTab=tabs&&tabs.querySelector('.yaya-detail-section-tab[data-section="documents"]');if(docTab)try{docTab.click();}catch(e){}});}
  function refresh(){installStyle();migrateOldMailState();}refresh();setTimeout(refresh,250);window.addEventListener('yaya:data-refreshed',()=>setTimeout(refresh,80));window.addEventListener('hashchange',()=>setTimeout(refresh,80));
})();

// Le bouton « Actualiser » force toujours une lecture serveur fraîche.
(function(){
  'use strict';
  function installFreshReload(){if(typeof window.reload!=='function'){setTimeout(installFreshReload,150);return;}if(window.reload.__yayaForceFreshV723)return;const originalReload=window.reload;const wrappedReload=async function(){const originalApiGet=window.apiGet;if(typeof originalApiGet!=='function')return originalReload.apply(this,arguments);const freshApiGet=function(forceNetwork){return originalApiGet(forceNetwork===undefined?true:forceNetwork);};window.apiGet=freshApiGet;try{return await originalReload.apply(this,arguments);}finally{if(window.apiGet===freshApiGet)window.apiGet=originalApiGet;}};wrappedReload.__yayaForceFreshV723=true;wrappedReload.__yayaOriginalReload=originalReload;window.reload=wrappedReload;}installFreshReload();setTimeout(installFreshReload,500);
})();
