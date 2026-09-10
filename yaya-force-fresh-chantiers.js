(function(){
  'use strict';

  /*
   * Coordinateur léger de stabilité.
   * L'ancien refresh forcé des chantiers est volontairement supprimé :
   * yaya-auto-refresh.js reste le seul rafraîchissement périodique.
   *
   * Ici :
   * - les écritures sont mises en file au lieu de se télescoper ;
   * - un refresh sait qu'une sauvegarde est en attente/en cours ;
   * - dateSignature est restaurée depuis [[YAYA_SIG:AAAA-MM]] si nécessaire.
   */
  if(window.__yayaRefreshCoordinatorV2Installed)return;
  window.__yayaRefreshCoordinatorV2Installed=true;
  window.__yayaRefreshCoordinatorV1Installed=true;
  window.__yayaFreshChantiersInstalled=true;

  const CACHE_DATA_KEY='YAYA_CACHE_DATA_V2';
  let writeQueue=Promise.resolve();

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

  function snapshotData(data){
    try{
      if(typeof structuredClone==='function')return structuredClone(data);
    }catch(e){}
    try{return JSON.parse(JSON.stringify(data));}catch(e){return data;}
  }

  window.yayaNormalizeChantierSignatures=normalizeSignatures;

  function installWriteCoordinator(){
    if(typeof window.apiPost!=='function'){
      setTimeout(installWriteCoordinator,120);
      return;
    }
    if(window.apiPost.__yayaWriteCoordinatorV2)return;

    const original=window.apiPost;

    function coordinatedApiPost(action,data){
      const frozenData=snapshotData(data);
      window.__yayaWriteInFlight=(Number(window.__yayaWriteInFlight)||0)+1;

      const execute=async function(){
        try{
          return await original(action,frozenData);
        }finally{
          window.__yayaWriteInFlight=Math.max(0,(Number(window.__yayaWriteInFlight)||1)-1);
          window.__yayaLastWriteAt=Date.now();
          setTimeout(normalizeAndRender,0);
        }
      };

      const task=writeQueue.then(execute,execute);
      writeQueue=task.catch(function(){return false;});
      return task;
    }

    coordinatedApiPost.__yayaWriteCoordinatorV2=true;
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
