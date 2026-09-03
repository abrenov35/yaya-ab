(function(){
  'use strict';

  if(window.__yayaExternalReturnRefreshInstalled)return;
  window.__yayaExternalReturnRefreshInstalled=true;

  const CACHE_DATA_KEY='YAYA_CACHE_DATA_V2';
  let lastRun=0;
  let hiddenAt=0;
  let timer=0;
  let busy=false;

  function canApply(){
    if(document.hidden)return false;
    const root=document.getElementById('modalRoot');
    if(root&&root.children&&root.children.length)return false;
    const el=document.activeElement;
    if(el&&(/^(INPUT|TEXTAREA|SELECT)$/i.test(el.tagName||'')||el.isContentEditable))return false;
    return true;
  }

  async function refreshNow(){
    if(busy||!canApply())return;
    const now=Date.now();
    if(now-lastRun<2500)return;
    if(typeof apiGet!=='function')return;

    busy=true;
    lastRun=now;
    try{
      const fresh=await apiGet(true);
      if(!fresh||typeof fresh!=='object')return;
      const x=window.scrollX||0;
      const y=window.scrollY||0;
      S=fresh;
      try{localStorage.setItem(CACHE_DATA_KEY,JSON.stringify(fresh));}catch(e){}
      if(typeof render==='function')render();
      try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed'));}catch(e){}
      requestAnimationFrame(function(){try{window.scrollTo(x,y);}catch(e){}});
    }catch(e){
      console.warn('Actualisation retour Gmail ignorée :',e);
    }finally{
      busy=false;
    }
  }

  function schedule(){
    clearTimeout(timer);
    timer=setTimeout(refreshNow,550);
  }

  document.addEventListener('visibilitychange',function(){
    if(document.hidden){hiddenAt=Date.now();return;}
    if(!hiddenAt||Date.now()-hiddenAt>700)schedule();
  });

  window.addEventListener('focus',schedule);
})();
