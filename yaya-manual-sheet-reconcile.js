(function(){
  'use strict';

  if(window.__yayaManualSheetReconcileV1Installed)return;
  window.__yayaManualSheetReconcileV1Installed=true;

  const MOBILE=window.matchMedia&&window.matchMedia('(pointer:coarse)').matches;
  const INTERVAL_MS=MOBILE?600000:900000; // iPhone/iPad 10 min, desktop 15 min.
  const RETRY_MS=15000;
  const WRITE_COOLDOWN_MS=1800;
  const CACHE_DATA_KEY='YAYA_CACHE_DATA_V2';

  let timer=0;
  let running=false;

  function editing(){
    const el=document.activeElement;
    return !!(el&&(el.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/i.test(el.tagName||'')));
  }

  function modalOpen(){
    const root=document.getElementById('modalRoot');
    return !!(root&&root.children&&root.children.length);
  }

  function safe(){
    if(document.hidden)return false;
    if(window.yayaHoursPending)return false;
    if(Number(window.__yayaWriteInFlight||0)>0)return false;
    if(Date.now()-Number(window.__yayaLastWriteAt||0)<WRITE_COOLDOWN_MS)return false;
    if(modalOpen()||editing())return false;
    if(document.body&&document.body.classList.contains('yaya-fiche-inter-open'))return false;
    return true;
  }

  function schedule(delay){
    clearTimeout(timer);
    timer=setTimeout(reconcile,delay);
  }

  async function reconcile(){
    if(running){schedule(RETRY_MS);return;}
    if(typeof window.apiGet!=='function'||typeof window.render!=='function'){
      schedule(RETRY_MS);
      return;
    }
    if(!safe()){
      schedule(RETRY_MS);
      return;
    }

    running=true;
    const startedAt=Date.now();
    try{
      const fresh=await window.apiGet(true);
      if(!fresh||typeof fresh!=='object')return;

      const lastWrite=Number(window.__yayaLastWriteAt||0);
      if(Number(window.__yayaWriteInFlight||0)>0||(lastWrite&&lastWrite>startedAt)){
        schedule(RETRY_MS);
        return;
      }

      if(!safe()){
        schedule(RETRY_MS);
        return;
      }

      const x=window.scrollX||0;
      const y=window.scrollY||0;
      S=fresh;
      try{localStorage.setItem(CACHE_DATA_KEY,JSON.stringify(fresh));}catch(e){}
      window.render();
      try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed',{detail:{source:'manual-sheet-safety'}}));}catch(e){}
      requestAnimationFrame(function(){try{window.scrollTo(x,y);}catch(e){}});
    }catch(err){
      console.warn('Réconciliation Sheet de sécurité ignorée :',err);
    }finally{
      running=false;
      schedule(INTERVAL_MS);
    }
  }

  schedule(INTERVAL_MS);
})();
