(function(){
  'use strict';
  if(window.__yayaPerformanceCoreV1)return;
  window.__yayaPerformanceCoreV1=true;

  /*
   * Performance core:
   * - one background refresh only, when the user is idle;
   * - never re-render while a modal / input is being edited;
   * - keep explicit manual refresh functions;
   * - disable the two older live-sync modules that duplicated GET + render work.
   */
  window.__yayaCentralAuthorityV2=true;
  window.__yayaCentralAuthorityV1=true;
  window.__yayaChantierTabsLiveRefreshV9=true;
  window.__yayaChantierTabsLiveRefreshV8=true;
  window.__yayaChantierTabsLiveRefreshV7=true;
  window.__yayaChantierTabsLiveRefreshV6=true;
  window.__yayaChantierTabsLiveRefreshV5=true;
  window.__YAYA_PERF_MODE=true;

  function addScriptMarker(attr,id){
    if(id&&document.getElementById(id))return;
    if(attr&&document.querySelector('script['+attr+']'))return;
    const s=document.createElement('script');
    s.type='application/json';
    if(id)s.id=id;
    if(attr)s.setAttribute(attr,'1');
    (document.head||document.documentElement).appendChild(s);
  }

  // Empêche les chargements réseau en double. Les fonctions utiles sont remplacées plus bas.
  addScriptMarker(null,'yaya-shared-tabs-live-sync');
  addScriptMarker('data-yaya-central-authority-loader');
  addScriptMarker('data-yaya-shared-data-sync-loader-v9');
  addScriptMarker('data-yaya-mail-force-loader');

  const TABS=['chantiers','salaries','heures','achats','avenants','documents','validations','commandes','DEVIS'];
  const CACHE_DATA_KEY='YAYA_CACHE_DATA_V2';
  let inFlight=null;
  let lastInteraction=Date.now();
  let bootAttempts=0;

  function toastSafe(message,isError){
    try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}
  }

  function markInteraction(){lastInteraction=Date.now();}
  document.addEventListener('pointerdown',markInteraction,{capture:true,passive:true});
  document.addEventListener('keydown',markInteraction,true);
  document.addEventListener('input',markInteraction,true);
  document.addEventListener('focusin',markInteraction,true);

  function activeEditor(){
    const a=document.activeElement;
    if(a&&a.matches&&a.matches('input:not([type="hidden"]):not([type="button"]):not([type="submit"]):not([type="file"]),textarea,select,[contenteditable="true"]'))return true;
    return false;
  }

  function modalOpen(){
    return !!document.querySelector(
      '#modalRoot .overlay,'+
      '.yaya-commande-edit-overlay,.yaya-commande-create-overlay,'+
      '.yaya-devis-fast-overlay,.yaya-finance-edit-overlay,'+
      '.yaya-document-create-overlay,.yaya-document-edit-overlay,'+
      '.ycn-modal.show,.piece-preview-overlay,'+
      '[role="dialog"][aria-modal="true"]'
    );
  }

  function writingBusy(){
    if((Number(window.__yayaWriteInFlight)||0)>0)return true;
    if(document.querySelector('[data-yaya-upload-busy="1"],[data-yaya-achat-upload-busy="1"]'))return true;
    return false;
  }

  function userBusy(){return activeEditor()||modalOpen()||writingBusy();}
  function userIdle(){return !userBusy()&&(Date.now()-lastInteraction)>1200;}

  function saveCache(data){
    if(!data||typeof data!=='object')return;
    try{localStorage.setItem(CACHE_DATA_KEY,JSON.stringify(data));}catch(e){}
  }

  function applyFreshData(data,renderNow){
    if(!data||typeof data!=='object')return false;
    saveCache(data);

    if(typeof S!=='undefined'&&S){
      TABS.forEach(function(tab){
        if(Array.isArray(data[tab]))S[tab]=data[tab];
      });
    }

    if(renderNow){
      try{if(typeof render==='function')render();}catch(e){}
      try{
        window.dispatchEvent(new CustomEvent('yaya:data-refreshed',{
          detail:{tabs:TABS.slice(),source:'performance-core'}
        }));
      }catch(e){}
    }
    return true;
  }

  async function getFreshData(){
    if(typeof apiGet!=='function')throw new Error('API Yaya indisponible');
    return await apiGet(true);
  }

  async function refreshNow(manual){
    if(inFlight)return inFlight;
    if(manual&&userBusy()){
      toastSafe('Ferme la fenêtre en cours avant d’actualiser.',true);
      return false;
    }
    if(!manual&&!userIdle())return false;

    inFlight=(async function(){
      try{
        const data=await getFreshData();

        // Si l’utilisateur a commencé à saisir pendant le GET, on met seulement le cache à jour.
        // Aucun render ne vient alors ralentir ou remplacer la modale en cours.
        if(!manual&&(userBusy()||(Date.now()-lastInteraction)<700)){
          saveCache(data);
          window.__yayaDeferredFreshDataAt=Date.now();
          return true;
        }

        const ok=applyFreshData(data,true);
        if(manual&&ok)toastSafe('Données actualisées ✓');
        return ok;
      }catch(err){
        if(manual)toastSafe('Actualisation impossible — réessayer',true);
        else console.warn('Yaya performance · actualisation différée :',err);
        return false;
      }
    })();

    try{return await inFlight;}finally{inFlight=null;}
  }

  // API commune : un seul GET central au lieu de plusieurs rafraîchissements concurrents.
  window.yayaCentralSyncNow=function(){return refreshNow(true);};
  window.yayaRefreshSharedNow=function(){return refreshNow(true);};
  window.yayaRefreshChantiersNow=function(){return refreshNow(true);};
  window.yayaRefreshDocumentsNow=function(){return refreshNow(true);};
  window.yayaRefreshAchatsNow=function(){return refreshNow(true);};
  window.yayaRefreshCommandesNow=function(){return refreshNow(true);};

  function scheduleBootRefresh(){
    bootAttempts++;
    if(typeof apiGet!=='function'||typeof render!=='function'||typeof S==='undefined'||!S){
      if(bootAttempts<12)setTimeout(scheduleBootRefresh,350);
      return;
    }

    const run=function(){
      if(userIdle())refreshNow(false);
      else if(bootAttempts<8)setTimeout(scheduleBootRefresh,2200);
    };

    if(typeof requestIdleCallback==='function')requestIdleCallback(run,{timeout:2200});
    else setTimeout(run,900);
  }

  // Laisse d’abord l’interface apparaître et devenir saisissable.
  setTimeout(scheduleBootRefresh,1800);

  // Nettoyage d’un éventuel ancien écran bloquant resté dans le DOM.
  setTimeout(function(){
    const old=document.getElementById('yaya-central-authority-overlay');
    if(old)old.remove();
  },0);
})();
