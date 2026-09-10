(function(){
  'use strict';

  /*
   * Ce fichier remplace l'ancien rafraîchissement forcé des chantiers.
   * yaya-auto-refresh.js est désormais le seul rafraîchissement périodique.
   * Ici on garde seulement deux protections légères :
   * - signaler une écriture en cours pour éviter qu'un refresh l'écrase visuellement ;
   * - remettre dateSignature depuis [[YAYA_SIG:AAAA-MM]] quand l'API renvoie la
   *   signature historique uniquement dans notes.
   */
  if(window.__yayaRefreshCoordinatorV1Installed)return;
  window.__yayaRefreshCoordinatorV1Installed=true;
  window.__yayaFreshChantiersInstalled=true;

  const CACHE_DATA_KEY='YAYA_CACHE_DATA_V2';

  function signatureFromNotes(notes){
    const m=String(notes==null?'':notes).match(/\[\[YAYA_SIG:(\d{4}-\d{2})\]\]/);
    return m&&m[1]?m[1]:'';
  }

  function normalizeSignatures(){
    try{
      if(typeof S==='undefined'||!S||!Array.isArray(S.chantiers))return false;
      let changed=false;
      S.chantiers.forEach(function(c){
        if(!c)return;
        if(String(c.dateSignature||'').trim())return;
        const sig=signatureFromNotes(c.notes);
        if(!sig)return;
        c.dateSignature=sig;
        changed=true;
      });
      if(changed){
        try{localStorage.setItem(CACHE_DATA_KEY,JSON.stringify(S));}catch(e){}
      }
      return changed;
    }catch(e){return false;}
  }

  function normalizeAndRender(){
    const changed=normalizeSignatures();
    if(changed){
      try{if(typeof render==='function')render();}catch(e){}
    }
  }

  window.yayaNormalizeChantierSignatures=normalizeSignatures;

  function installWriteCoordinator(){
    if(typeof window.apiPost!=='function'){
      setTimeout(installWriteCoordinator,120);
      return;
    }
    if(window.apiPost.__yayaWriteCoordinatorV1)return;

    const original=window.apiPost;

    async function coordinatedApiPost(action,data){
      window.__yayaWriteInFlight=(Number(window.__yayaWriteInFlight)||0)+1;
      try{
        return await original(action,data);
      }finally{
        window.__yayaWriteInFlight=Math.max(0,(Number(window.__yayaWriteInFlight)||1)-1);
        window.__yayaLastWriteAt=Date.now();
        setTimeout(normalizeAndRender,0);
      }
    }

    coordinatedApiPost.__yayaWriteCoordinatorV1=true;
    coordinatedApiPost.__yayaWrappedApiPost=original;
    window.apiPost=coordinatedApiPost;
  }

  installWriteCoordinator();

  window.addEventListener('yaya:data-refreshed',function(){
    requestAnimationFrame(normalizeAndRender);
  });

  [100,500,1500].forEach(function(ms){
    setTimeout(normalizeAndRender,ms);
  });
})();
