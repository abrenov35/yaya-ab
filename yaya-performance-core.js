(function(){
  'use strict';
  if(window.__yayaPerformanceCoreV2)return;
  window.__yayaPerformanceCoreV2=true;
  window.__yayaPerformanceCoreV1=true;

  /*
   * Performance core V2:
   * - un seul rafraîchissement réseau en arrière-plan ;
   * - aucun rerender si les données serveur n'ont pas changé ;
   * - aucun GET de contrôle inutile après un démarrage déjà frais ;
   * - aucun rafraîchissement pendant une saisie, une modale ou une écriture en attente.
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

  // Empêche les anciens modules de lancer plusieurs GET / render concurrents.
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
    if(window.yayaHoursPending)return true;
    if(document.querySelector('[data-yaya-upload-busy="1"],[data-yaya-achat-upload-busy="1"]'))return true;
    return false;
  }

  function userBusy(){return activeEditor()||modalOpen()||writingBusy();}
  function userIdle(){return !userBusy()&&(Date.now()-lastInteraction)>1200;}

  function serializeData(data){
    try{return JSON.stringify(data);}catch(e){return '';}
  }

  // Retourne true uniquement si le cache a réellement changé.
  function saveCache(data){
    if(!data||typeof data!=='object')return false;
    const raw=serializeData(data);
    if(!raw)return true;
    try{
      const previous=localStorage.getItem(CACHE_DATA_KEY);
      if(previous===raw)return false;
      localStorage.setItem(CACHE_DATA_KEY,raw);
      return true;
    }catch(e){return true;}
  }

  function applyFreshData(data,renderNow,forceApply){
    if(!data||typeof data!=='object')return false;
    const changed=saveCache(data);

    // En arrière-plan, si le serveur renvoie exactement les mêmes données,
    // on ne touche ni à S ni au DOM. C'est le gain principal sur les navigations.
    if(!forceApply&&!changed)return true;

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
        if(!manual&&(userBusy()||(Date.now()-lastInteraction)<700)){
          saveCache(data);
          window.__yayaDeferredFreshDataAt=Date.now();
          return true;
        }

        const ok=applyFreshData(data,true,!!manual);
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

    // Si le démarrage vient déjà du réseau, ne pas refaire immédiatement le même GET.
    if(window.__yayaCachedBoot===false)return;

    const run=function(){
      if(userIdle())refreshNow(false);
      else if(bootAttempts<8)setTimeout(scheduleBootRefresh,2200);
    };

    if(typeof requestIdleCallback==='function')requestIdleCallback(run,{timeout:2200});
    else setTimeout(run,900);
  }

  // Synchronisation légère des DOCUMENTS externes (ex. Yaya Mail).
  // On ne recharge pas tout Yaya : un GET limité à ?tabs=documents, uniquement
  // si l'onglet est visible, l'utilisateur n'est pas en saisie et aucune écriture locale n'attend.
  const DOCUMENTS_POLL_MS=10000;
  const PENDING_DOCUMENTS_KEY='YAYA_PENDING_DOCUMENT_UPSERT_V1';
  let documentsPollInFlight=false;
  let lastDocumentsSignature='';

  function documentsPendingLocally(){
    try{
      const raw=localStorage.getItem(PENDING_DOCUMENTS_KEY);
      if(!raw)return false;
      const parsed=JSON.parse(raw);
      return !!(parsed&&parsed.items&&Object.keys(parsed.items).length);
    }catch(e){return false;}
  }

  function documentsSignature(rows){
    try{return JSON.stringify(Array.isArray(rows)?rows:[]);}
    catch(e){return '';}
  }

  function saveDocumentsCache(rows){
    try{
      const cached=JSON.parse(localStorage.getItem(CACHE_DATA_KEY)||'{}')||{};
      cached.documents=rows;
      localStorage.setItem(CACHE_DATA_KEY,JSON.stringify(cached));
    }catch(e){}
  }

  async function fetchDocumentsOnly(){
    let api='';
    try{api=(typeof API==='string'&&API)?API:'';}catch(e){}
    if(!api)throw new Error('API Yaya indisponible');
    const sep=api.includes('?')?'&':'?';
    const ctrl=new AbortController();
    const timer=setTimeout(()=>ctrl.abort(),6500);
    try{
      const r=await fetch(api+sep+'tabs=documents&_yaya_docs_live='+Date.now(),{
        method:'GET',cache:'no-store',signal:ctrl.signal
      });
      const txt=await r.text();
      const j=JSON.parse(txt);
      if(!j||!j.ok)throw new Error(j&&j.error||'Réponse documents invalide');
      return (j.data&&Array.isArray(j.data.documents))?j.data.documents:null;
    }finally{clearTimeout(timer);}
  }

  async function refreshDocumentsLight(){
    if(documentsPollInFlight)return false;
    if(document.hidden||userBusy()||documentsPendingLocally())return false;
    if((Date.now()-lastInteraction)<1200)return false;

    documentsPollInFlight=true;
    try{
      const rows=await fetchDocumentsOnly();
      if(!rows)return false;

      const signature=documentsSignature(rows);
      if(!lastDocumentsSignature){
        try{lastDocumentsSignature=documentsSignature((typeof S!=='undefined'&&S&&S.documents)||[]);}catch(e){}
      }
      if(signature===lastDocumentsSignature)return true;

      // Vérification tardive : ne jamais remplacer l'état pendant une saisie/écriture.
      if(userBusy()||documentsPendingLocally())return false;

      if(typeof S!=='undefined'&&S)S.documents=rows;
      lastDocumentsSignature=signature;
      saveDocumentsCache(rows);

      // Le rendu ne se produit que lorsqu'un document a réellement changé.
      try{if(typeof render==='function')render();}catch(e){}
      try{
        window.dispatchEvent(new CustomEvent('yaya:data-refreshed',{
          detail:{tabs:['documents'],source:'documents-light-sync'}
        }));
      }catch(e){}
      return true;
    }catch(err){
      console.warn('Yaya documents · contrôle léger différé :',err);
      return false;
    }finally{
      documentsPollInFlight=false;
    }
  }

  function scheduleDocumentsPoll(){
    setTimeout(async function tick(){
      await refreshDocumentsLight();
      setTimeout(tick,DOCUMENTS_POLL_MS);
    },DOCUMENTS_POLL_MS);
  }

  // Démarrage cache d'abord : contrôle serveur seulement une fois l'interface disponible.
  setTimeout(scheduleBootRefresh,1800);
  scheduleDocumentsPoll();

  // Au retour sur Yaya, un seul contrôle documents après stabilisation de la fenêtre.
  window.addEventListener('focus',function(){setTimeout(refreshDocumentsLight,700);});
  document.addEventListener('visibilitychange',function(){
    if(!document.hidden)setTimeout(refreshDocumentsLight,700);
  });

  setTimeout(function(){
    const old=document.getElementById('yaya-central-authority-overlay');
    if(old)old.remove();
  },0);
})();
