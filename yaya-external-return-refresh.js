(function(){
  'use strict';

  if(window.__yayaExternalReturnRefreshInstalled)return;
  window.__yayaExternalReturnRefreshInstalled=true;

  const CACHE_DATA_KEY='YAYA_CACHE_DATA_V2';
  const BURST_DELAYS=[650,2200,5500,10000];
  const RETRY_IF_BUSY_MS=900;
  const MAX_DEFERRED_RETRIES=12;

  let hiddenAt=0;
  let busy=false;
  let burstSeq=0;
  let timers=[];

  function clearTimers(){
    timers.forEach(function(t){clearTimeout(t);});
    timers=[];
  }

  function canApply(){
    if(document.hidden)return false;
    if(window.yayaHoursPending)return false;
    if(document.body&&document.body.classList.contains('yaya-fiche-inter-open'))return false;

    const root=document.getElementById('modalRoot');
    if(root&&root.children&&root.children.length)return false;

    const el=document.activeElement;
    if(el&&(/^(INPUT|TEXTAREA|SELECT)$/i.test(el.tagName||'')||el.isContentEditable))return false;
    return true;
  }

  async function refreshNow(seq,deferred){
    if(seq!==burstSeq)return;

    if(busy||!canApply()){
      if((deferred||0)<MAX_DEFERRED_RETRIES){
        timers.push(setTimeout(function(){refreshNow(seq,(deferred||0)+1);},RETRY_IF_BUSY_MS));
      }
      return;
    }

    if(typeof apiGet!=='function'){
      if((deferred||0)<MAX_DEFERRED_RETRIES){
        timers.push(setTimeout(function(){refreshNow(seq,(deferred||0)+1);},RETRY_IF_BUSY_MS));
      }
      return;
    }

    busy=true;
    try{
      // Lecture réseau complète volontaire : le Gmail Add-on peut terminer son écriture
      // quelques secondes après le retour de l'utilisateur dans Yaya. Le burst ci-dessus
      // relit donc plusieurs fois la source de vérité au lieu de supposer que 550 ms suffisent.
      const fresh=await apiGet(true);
      if(seq!==burstSeq||!fresh||typeof fresh!=='object')return;

      const x=window.scrollX||0;
      const y=window.scrollY||0;
      S=fresh;
      try{localStorage.setItem(CACHE_DATA_KEY,JSON.stringify(fresh));}catch(e){}
      if(typeof render==='function')render();
      try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed',{detail:{source:'external-return'}}));}catch(e){}
      requestAnimationFrame(function(){try{window.scrollTo(x,y);}catch(e){}});
    }catch(e){
      console.warn('Actualisation retour Gmail ignorée :',e);
    }finally{
      busy=false;
    }
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
    if(absence>300)scheduleBurst();
  });

  // Certains navigateurs déclenchent focus sans visibilitychange fiable.
  // Un burst est donc aussi armé au focus, mais les timers précédents sont remplacés.
  window.addEventListener('focus',function(){
    if(document.hidden)return;
    scheduleBurst();
  });
})();
