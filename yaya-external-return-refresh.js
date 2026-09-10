(function(){
  'use strict';

  if(window.__yayaExternalReturnRefreshV5Installed)return;
  window.__yayaExternalReturnRefreshV5Installed=true;
  window.__yayaExternalReturnRefreshV4Installed=true;
  window.__yayaExternalReturnRefreshV3Installed=true;
  window.__yayaExternalReturnRefreshInstalled=true;

  const CACHE_DATA_KEY='YAYA_CACHE_DATA_V2';
  const BURST_DELAYS=[1600,6500];
  const RETRY_IF_BUSY_MS=900;
  const MAX_DEFERRED_RETRIES=10;
  const MIN_HIDDEN_MS=1000;
  const WRITE_COOLDOWN_MS=1400;

  let hiddenAt=0;
  let busy=false;
  let burstSeq=0;
  let timers=[];

  function clearTimers(){
    timers.forEach(function(t){clearTimeout(t);});
    timers=[];
  }

  function signatureFromNotes(notes){
    const m=String(notes==null?'':notes).match(/\[\[YAYA_SIG:(\d{4}-\d{2})\]\]/);
    return m&&m[1]?m[1]:'';
  }

  function normalizeFresh(fresh){
    if(!fresh||typeof fresh!=='object')return fresh;
    if(Array.isArray(fresh.chantiers)){
      let current=[];
      try{current=Array.isArray(S&&S.chantiers)?S.chantiers:[];}catch(e){}
      const byId=new Map(current.map(function(c){return [String(c&&c.id||''),c];}));

      fresh.chantiers.forEach(function(c){
        if(!c)return;
        const previous=byId.get(String(c.id||''));
        const direct=String(c.dateSignature||'').trim();
        const marker=signatureFromNotes(c.notes);
        if(!direct&&marker)c.dateSignature=marker;
        // Ne jamais reprendre une signature absente depuis l'ancien état local.

        if(previous){
          if(!c.sourcePlanningId&&previous.sourcePlanningId)c.sourcePlanningId=previous.sourcePlanningId;
          if(!c.planningNom&&previous.planningNom)c.planningNom=previous.planningNom;
          if(c.planningPresent==null&&previous.planningPresent!=null)c.planningPresent=previous.planningPresent;
        }
      });
    }
    return fresh;
  }

  function canApply(){
    if(document.hidden)return false;
    if(window.yayaHoursPending)return false;
    if(Number(window.__yayaWriteInFlight||0)>0)return false;
    if(Date.now()-Number(window.__yayaLastWriteAt||0)<WRITE_COOLDOWN_MS)return false;
    if(document.body&&document.body.classList.contains('yaya-fiche-inter-open'))return false;

    const root=document.getElementById('modalRoot');
    if(root&&root.children&&root.children.length)return false;

    const el=document.activeElement;
    if(el&&(/^(INPUT|TEXTAREA|SELECT)$/i.test(el.tagName||'')||el.isContentEditable))return false;
    return true;
  }

  async function fallbackFullRefresh(seq,deferred){
    if(typeof apiGet!=='function'){
      if((deferred||0)<MAX_DEFERRED_RETRIES){
        timers.push(setTimeout(function(){refreshNow(seq,(deferred||0)+1);},RETRY_IF_BUSY_MS));
      }
      return;
    }

    busy=true;
    const readStartedAt=Date.now();
    try{
      const fresh=normalizeFresh(await apiGet(true));
      if(seq!==burstSeq||!fresh||typeof fresh!=='object')return;
      if(Number(window.__yayaWriteInFlight||0)>0)return;
      if(Number(window.__yayaLastWriteAt||0)>readStartedAt){
        if((deferred||0)<MAX_DEFERRED_RETRIES){
          timers.push(setTimeout(function(){refreshNow(seq,(deferred||0)+1);},WRITE_COOLDOWN_MS));
        }
        return;
      }

      const x=window.scrollX||0;
      const y=window.scrollY||0;
      S=fresh;
      try{localStorage.setItem(CACHE_DATA_KEY,JSON.stringify(fresh));}catch(e){}
      if(typeof render==='function')render();
      try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed',{detail:{source:'external-return-fallback'}}));}catch(e){}
      requestAnimationFrame(function(){try{window.scrollTo(x,y);}catch(e){}});
    }catch(e){
      console.warn('Actualisation retour externe ignorée :',e);
    }finally{
      busy=false;
    }
  }

  async function refreshNow(seq,deferred){
    if(seq!==burstSeq)return;

    if(busy||!canApply()){
      if((deferred||0)<MAX_DEFERRED_RETRIES){
        timers.push(setTimeout(function(){refreshNow(seq,(deferred||0)+1);},RETRY_IF_BUSY_MS));
      }
      return;
    }

    // Moteur unique : le retour d'une app externe demande désormais le même
    // contrôle meta/delta que la synchro normale, au lieu de lancer un second GET complet.
    if(typeof window.yayaSmartRefreshNow==='function'){
      try{await window.yayaSmartRefreshNow();}catch(e){
        console.warn('Contrôle retour externe ignoré :',e);
      }
      return;
    }

    // Compatibilité de secours si le moteur principal n'est pas encore chargé.
    return fallbackFullRefresh(seq,deferred);
  }

  function scheduleBurst(){
    clearTimers();
    const seq=++burstSeq;
    BURST_DELAYS.forEach(function(delay){
      timers.push(setTimeout(function(){refreshNow(seq,0);},delay));
    });
  }

  document.addEventListener('visibilitychange',function(){
    if(document.hidden){
      hiddenAt=Date.now();
      return;
    }

    const absence=hiddenAt?Date.now()-hiddenAt:0;
    hiddenAt=0;
    if(absence>=MIN_HIDDEN_MS)scheduleBurst();
  });

  /* Fallback seulement si visibilitychange n'a pas traité le retour. */
  window.addEventListener('focus',function(){
    if(document.hidden||!hiddenAt)return;
    const absence=Date.now()-hiddenAt;
    hiddenAt=0;
    if(absence>=MIN_HIDDEN_MS)scheduleBurst();
  });
})();
