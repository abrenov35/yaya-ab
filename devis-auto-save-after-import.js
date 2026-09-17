(function(){
  'use strict';
  if(window.__yayaDevisAutoSaveAfterImportV1)return;
  window.__yayaDevisAutoSaveAfterImportV1=true;

  function bind(modal){
    if(!modal||modal.dataset.yayaAutoSaveBound==='1')return;
    modal.dataset.yayaAutoSaveBound='1';

    const state=modal.querySelector('.ydd-state');
    const saveBtn=modal.querySelector('[data-save]');
    const importBtn=modal.querySelector('[data-import]');
    if(!state||!saveBtn)return;

    // L'enregistrement devient automatique : on garde le bouton dans le DOM
    // pour réutiliser exactement le circuit existant, mais on ne l'affiche plus.
    saveBtn.style.setProperty('display','none','important');

    let saved=false;

    function sync(){
      const text=String(state.textContent||'').trim();
      const loading=/Import en cours/i.test(text);

      if(importBtn){
        importBtn.disabled=loading||saved;
        importBtn.style.opacity=(loading||saved)?'.55':'1';
      }

      // En cas d'échec, on autorise un nouvel essai dans la même modale.
      if(/Import impossible|Fichier trop lourd|Document vide|illisible/i.test(text)){
        saved=false;
        if(importBtn){importBtn.disabled=false;importBtn.style.opacity='1';}
        return;
      }

      if(saved||!/Pi[eè]ce jointe enregistr[eé]e/i.test(text))return;
      saved=true;

      // Le handler existant data-save enregistre le devis, ferme la modale
      // puis rouvre la liste avec le nouveau devis. On le déclenche automatiquement.
      setTimeout(function(){
        if(!modal.isConnected)return;
        try{saveBtn.click();}
        catch(e){
          saved=false;
          if(importBtn){importBtn.disabled=false;importBtn.style.opacity='1';}
        }
      },80);
    }

    new MutationObserver(sync).observe(state,{childList:true,subtree:true,characterData:true});
    sync();
  }

  function scan(){
    bind(document.getElementById('yayaDevisAdd'));
  }

  scan();
  new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});
})();

// Devis partagés : la source centrale (Google Sheet / API) est autoritaire.
// localStorage n'est qu'un cache d'affichage. Les devis sont relus au démarrage
// et chaque fois que Yaya revient au premier plan sur un autre appareil.
(function(){
  'use strict';
  if(window.__yayaDevisSharedSyncV1)return;
  window.__yayaDevisSharedSyncV1=true;

  const CACHE_DATA_KEY='YAYA_CACHE_DATA_V2';
  let inFlight=null;
  let lastSync=0;
  let timer=0;

  function apiEndpoint(){
    try{return (typeof API==='string'&&API)?API.trim():'';}catch(e){return '';}
  }

  function modalOuverte(){
    try{
      if(document.querySelector('#modalRoot .overlay'))return true;
      const modal=document.getElementById('yayaDevisAdd');
      if(modal&&modal.isConnected&&getComputedStyle(modal).display!=='none')return true;
    }catch(e){}
    return false;
  }

  function canSync(){
    if(!apiEndpoint())return false;
    if(typeof S==='undefined'||!S)return false;
    if((Number(window.__yayaWriteInFlight)||0)>0)return false;
    if(modalOuverte())return false;
    return true;
  }

  function saveCentralCache(data){
    try{
      const cached=JSON.parse(localStorage.getItem(CACHE_DATA_KEY)||'{}')||{};
      if(Array.isArray(data.chantiers))cached.chantiers=data.chantiers;
      if(Array.isArray(data.avenants))cached.avenants=data.avenants;
      localStorage.setItem(CACHE_DATA_KEY,JSON.stringify(cached));
    }catch(e){}
  }

  async function fetchCentral(){
    const api=apiEndpoint();
    if(!api)throw new Error('API Yaya indisponible');
    const sep=api.includes('?')?'&':'?';
    const ctrl=new AbortController();
    const abortTimer=setTimeout(function(){ctrl.abort();},12000);
    try{
      const url=api+sep+'tabs=chantiers,avenants&_yaya_devis='+Date.now();
      const r=await fetch(url,{method:'GET',cache:'no-store',signal:ctrl.signal});
      const txt=await r.text();
      const j=JSON.parse(txt);
      if(!j||j.ok!==true||!j.data)throw new Error(j&&j.error||'Réponse Yaya invalide');
      return j.data;
    }finally{
      clearTimeout(abortTimer);
    }
  }

  async function syncCentral(force){
    if(inFlight)return inFlight;
    if(!canSync())return false;
    if(!force&&Date.now()-lastSync<5000)return true;

    inFlight=(async function(){
      try{
        let data=await fetchCentral();
        if(!data||!Array.isArray(data.chantiers)||!Array.isArray(data.avenants)){
          if(typeof apiGet==='function')data=await apiGet(true);
        }
        if(!data||!Array.isArray(data.chantiers)||!Array.isArray(data.avenants)){
          throw new Error('Données Devis centrales incomplètes');
        }

        // Ne jamais fusionner aveuglément le cache local dans le serveur :
        // cela pourrait ressusciter un ancien devis supprimé sur un autre poste.
        S.chantiers=data.chantiers;
        S.avenants=data.avenants;
        saveCentralCache(data);
        lastSync=Date.now();

        try{
          window.dispatchEvent(new CustomEvent('yaya:data-refreshed',{
            detail:{tabs:['chantiers','avenants'],source:'central-devis'}
          }));
        }catch(e){}
        try{if(typeof render==='function')render();}catch(e){}
        return true;
      }catch(e){
        console.warn('Yaya Devis · synchronisation centrale impossible :',e);
        return false;
      }
    })();

    try{return await inFlight;}finally{inFlight=null;}
  }

  function schedule(force,delay){
    clearTimeout(timer);
    timer=setTimeout(function(){
      if(canSync())syncCentral(force);
      else setTimeout(function(){if(canSync())syncCentral(force);},900);
    },Number(delay)||180);
  }

  window.yayaRefreshDevisNow=function(){return syncCentral(true);};

  window.addEventListener('focus',function(){schedule(true,220);});
  window.addEventListener('pageshow',function(){schedule(true,260);});
  document.addEventListener('visibilitychange',function(){
    if(!document.hidden)schedule(true,220);
  });

  // Premier contrôle serveur : le cache local peut afficher immédiatement,
  // puis cette lecture remplace les devis par la version centrale partagée.
  setTimeout(function(){schedule(true,0);},420);
  setTimeout(function(){schedule(false,0);},2600);
})();
