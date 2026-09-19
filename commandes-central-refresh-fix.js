(function(){
  'use strict';
  if(window.__YAYA_COMMANDES_CENTRAL_REFRESH_FIX_V1)return;
  window.__YAYA_COMMANDES_CENTRAL_REFRESH_FIX_V1=true;

  function patch(){
    const api=window.YayaCommandesNativeEmbed;
    if(!api||typeof api.refresh!=='function')return false;
    if(api.refresh.__yayaCentralRefreshFixV1)return true;

    const original=api.refresh;
    api.refresh=async function(){
      try{
        if(typeof window.yayaRefreshCommandesNow==='function'){
          await window.yayaRefreshCommandesNow();
        }else if(typeof window.yayaRefreshTabsNow==='function'){
          await window.yayaRefreshTabsNow(['commandes']);
        }
      }catch(e){
        console.warn('Yaya Commandes : actualisation centrale impossible',e);
      }
      return original.apply(api,arguments);
    };
    api.refresh.__yayaCentralRefreshFixV1=true;
    api.refresh.__yayaOriginalRefresh=original;
    return true;
  }

  if(!patch()){
    const timer=setInterval(function(){if(patch())clearInterval(timer);},80);
    setTimeout(function(){clearInterval(timer);},30000);
  }
})();