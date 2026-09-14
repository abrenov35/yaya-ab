(function(){
  'use strict';

  // Resynchronisation automatique au retour d'une autre application désactivée.
  window.__YAYA_EXTERNAL_RETURN_SYNC_STOPPED=true;
  window.__yayaExternalReturnRefreshV5Installed=true;
  window.__yayaExternalReturnRefreshV4Installed=true;
  window.__yayaExternalReturnRefreshV3Installed=true;
  window.__yayaExternalReturnRefreshInstalled=true;

  // Plusieurs anciens modules resynchronisent l'URL lors de mutations DOM.
  // Ne rien écrire dans l'historique lorsque l'URL ET l'état sont déjà identiques.
  // Cela supprime une opération coûteuse qui pouvait se répéter pendant les ouvertures de fenêtres.
  if(!window.__yayaHistoryReplaceStateFastV1){
    window.__yayaHistoryReplaceStateFastV1=true;
    const original=history.replaceState.bind(history);
    history.replaceState=function(state,title,url){
      if(url!=null&&state===history.state){
        try{
          const next=new URL(String(url),window.location.href);
          if(next.href===window.location.href)return;
        }catch(e){}
      }
      return original(state,title,url);
    };
  }
})();
