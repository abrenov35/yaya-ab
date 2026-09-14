(function(){
  'use strict';

  // V205.784 — synchronisation légère des achats.
  // Toutes les 2 s, on lit uniquement les révisions Yaya.
  // Si la révision achats change, on recharge uniquement l'onglet achats.
  const POLL_MS=2000;
  const CACHE_DATA_KEY='YAYA_CACHE_DATA_V2';
  const CACHE_META_KEY='YAYA_CACHE_META_V2';
  let busy=false;
  let lastAchatsRev='';
  let timer=null;

  function getApi(){
    try{
      return (typeof API==='string'&&API)?API:'';
    }catch(e){
      return '';
    }
  }

  function cacheRev(){
    try{
      const raw=localStorage.getItem(CACHE_META_KEY);
      const meta=raw?JSON.parse(raw):null;
      return String(meta&&meta.tabs&&meta.tabs.achats||'');
    }catch(e){
      return '';
    }
  }

  async function fetchJson(params){
    const api=getApi();
    if(!api)throw new Error('API Yaya indisponible');
    const sep=api.includes('?')?'&':'?';
    const url=api+sep+params+'&_yaya_live='+Date.now();
    const ctrl=new AbortController();
    const timeout=setTimeout(()=>ctrl.abort(),8000);
    try{
      const r=await fetch(url,{method:'GET',cache:'no-store',signal:ctrl.signal});
      const txt=await r.text();
      const j=JSON.parse(txt);
      if(!j||!j.ok)throw new Error(j&&j.error||'Réponse Yaya invalide');
      return j;
    }finally{
      clearTimeout(timeout);
    }
  }

  function saveCacheAchats(achats,meta){
    try{
      const raw=localStorage.getItem(CACHE_DATA_KEY);
      const cached=raw?JSON.parse(raw):{};
      if(cached&&typeof cached==='object'){
        cached.achats=achats;
        localStorage.setItem(CACHE_DATA_KEY,JSON.stringify(cached));
      }
      if(meta&&meta.tabs){
        localStorage.setItem(CACHE_META_KEY,JSON.stringify(meta));
      }
    }catch(e){}
  }

  async function refreshAchats(){
    if(busy)return false;
    busy=true;
    try{
      const j=await fetchJson('tabs=achats');
      const achats=j&&j.data&&Array.isArray(j.data.achats)?j.data.achats:null;
      if(!achats)return false;

      if(typeof S!=='undefined'&&S){
        S.achats=achats;
      }

      saveCacheAchats(achats,j.meta);
      if(j.meta&&j.meta.tabs){
        lastAchatsRev=String(j.meta.tabs.achats||lastAchatsRev||'');
      }

      if(typeof render==='function'){
        const y=window.scrollY;
        render();
        try{window.scrollTo(0,y);}catch(e){}
      }

      try{
        window.dispatchEvent(new CustomEvent('yaya:data-refreshed',{detail:{tabs:['achats'],source:'live-achats'}}));
      }catch(e){}
      return true;
    }catch(e){
      console.warn('Yaya achats · actualisation différée :',e);
      return false;
    }finally{
      busy=false;
    }
  }

  async function poll(){
    if(document.hidden||busy)return;
    busy=true;
    try{
      const j=await fetchJson('mode=meta');
      const rev=String(j&&j.meta&&j.meta.tabs&&j.meta.tabs.achats||'');
      if(!rev)return;
      if(!lastAchatsRev){
        lastAchatsRev=rev;
        return;
      }
      if(rev!==lastAchatsRev){
        busy=false;
        await refreshAchats();
      }
    }catch(e){
      console.warn('Yaya achats · contrôle révision différé :',e);
    }finally{
      busy=false;
    }
  }

  lastAchatsRev=cacheRev();
  window.__YAYA_AUTO_SYNC_STOPPED=false;
  window.__yayaSmartRefreshInstalled=true;
  window.yayaSmartRefreshNow=refreshAchats;

  // Une lecture achats au démarrage garantit que même un cache ancien est corrigé.
  setTimeout(refreshAchats,700);
  timer=setInterval(poll,POLL_MS);

  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden)setTimeout(poll,100);
  });
})();

// Fiche chantier : un seul onglet visuel « Documents & mails ».
// Les données Documents et Mail restent séparées en arrière-plan.
// Important : aucune MutationObserver ici afin d'éviter le scintillement de la fiche.
(function(){
  'use strict';

  const STYLE_ID='yaya-documents-mails-merged-v2';

  function installStyle(){
    let style=document.getElementById(STYLE_ID);
    if(!style){
      style=document.createElement('style');
      style.id=STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent=`
      /* Le bouton Mail séparé disparaît définitivement. */
      #pane-chantiers#pane-chantiers#pane-chantiers .card > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="mail"]{
        display:none!important;
      }

      /* Le bouton Documents garde sa mécanique native mais affiche le libellé commun. */
      #pane-chantiers#pane-chantiers#pane-chantiers .card > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="documents"] > strong{
        font-size:0!important;
      }
      #pane-chantiers#pane-chantiers#pane-chantiers .card > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="documents"] > strong::after{
        content:'Documents & mails'!important;
        font-size:12px!important;
        font-weight:700!important;
        line-height:1.15!important;
        white-space:nowrap!important;
      }
      #pane-chantiers#pane-chantiers#pane-chantiers .card > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="documents"] > small{
        display:none!important;
      }

      /* Quand Documents & mails est actif, afficher les DEUX contenus. */
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-detail-documents-pane[data-empty="0"],
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-detail-mails-pane[data-empty="0"]{
        display:block!important;
      }

      /* Sécurité pendant la migration d'un ancien état mémorisé sur « Mail ». */
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="mail"] > .yaya-detail-documents-pane[data-empty="0"],
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="mail"] > .yaya-detail-mails-pane[data-empty="0"]{
        display:block!important;
      }

      /* Ne jamais afficher les anciens messages vides à côté d'un contenu existant. */
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-detail-empty-pane[data-section="mail"],
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="mail"] > .yaya-detail-empty-pane[data-section="mail"]{
        display:none!important;
      }
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="documents"]:has(> .yaya-detail-mails-pane[data-empty="0"]) > .yaya-detail-empty-pane[data-section="documents"],
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="mail"]:has(> .yaya-detail-mails-pane[data-empty="0"]) > .yaya-detail-empty-pane[data-section="documents"]{
        display:none!important;
      }

      @media(max-width:640px){
        #pane-chantiers#pane-chantiers#pane-chantiers .card > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="documents"] > strong::after{
          font-size:11px!important;
        }
      }
    `;
  }

  // Une ancienne fiche peut avoir mémorisé l'onglet « Mail ».
  // On la rebascule une seule fois vers « Documents » via le bouton natif :
  // cela met aussi à jour le stockage utilisé par Yaya sans boucle DOM.
  function migrateOldMailState(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;

    pane.querySelectorAll('.card[data-yaya-detail-section="mail"]').forEach(card=>{
      const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
      const docTab=tabs&&tabs.querySelector('.yaya-detail-section-tab[data-section="documents"]');
      if(!docTab)return;
      try{docTab.click();}catch(e){}
    });
  }

  function refresh(){
    installStyle();
    migrateOldMailState();
  }

  refresh();
  setTimeout(refresh,150);
  setTimeout(refresh,500);
  setTimeout(refresh,1200);
  setTimeout(refresh,2500);
  window.addEventListener('yaya:data-refreshed',()=>setTimeout(refresh,0));
  window.addEventListener('hashchange',()=>setTimeout(refresh,0));
})();

// V205.723 : le bouton « Actualiser » doit réellement relire le serveur.
// Au premier affichage Yaya peut utiliser son cache local pour rester rapide ;
// mais un appel manuel à reload() ne doit jamais relire ce même cache périmé.
(function(){
  'use strict';

  function installFreshReload(){
    if(typeof window.reload!=='function'){
      setTimeout(installFreshReload,120);
      return;
    }
    if(window.reload.__yayaForceFreshV723)return;

    const originalReload=window.reload;
    const wrappedReload=async function(){
      const originalApiGet=window.apiGet;
      if(typeof originalApiGet!=='function'){
        return originalReload.apply(this,arguments);
      }

      const freshApiGet=function(forceNetwork){
        return originalApiGet(forceNetwork===undefined?true:forceNetwork);
      };

      window.apiGet=freshApiGet;
      try{
        return await originalReload.apply(this,arguments);
      }finally{
        if(window.apiGet===freshApiGet)window.apiGet=originalApiGet;
      }
    };

    wrappedReload.__yayaForceFreshV723=true;
    wrappedReload.__yayaOriginalReload=originalReload;
    window.reload=wrappedReload;
  }

  installFreshReload();
  setTimeout(installFreshReload,300);
  setTimeout(installFreshReload,900);
})();
