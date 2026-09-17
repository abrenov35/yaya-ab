// Commandes : affichage local immédiat puis resynchronisation automatique avec la base.
(function(){
  'use strict';
  if(window.__YAYA_COMMANDES_AUTO_SYNC_V1)return;
  window.__YAYA_COMMANDES_AUTO_SYNC_V1=true;

  let patched=false;
  let timer=0;
  let lastRun=0;

  function scheduleSync(api){
    clearTimeout(timer);
    timer=setTimeout(function(){
      if(!api||typeof api.refresh!=='function')return;
      const now=Date.now();
      if(now-lastRun<1200)return;
      lastRun=now;
      Promise.resolve(api.refresh()).catch(function(){});
    },120);
  }

  function patch(){
    const api=window.YayaCommandesNativeEmbed;
    if(!api||patched)return !!api;
    patched=true;

    if(typeof api.mount==='function'){
      const originalMount=api.mount;
      api.mount=function(){
        const out=originalMount.apply(api,arguments);
        scheduleSync(api);
        return out;
      };
    }

    if(typeof api.setChantier==='function'){
      const originalSetChantier=api.setChantier;
      api.setChantier=function(){
        const out=originalSetChantier.apply(api,arguments);
        scheduleSync(api);
        return out;
      };
    }

    // Si le module était déjà monté avant le chargement de ce correctif.
    if(document.querySelector('.yaya-cmd-native-root'))scheduleSync(api);
    return true;
  }

  if(!patch()){
    const poll=setInterval(function(){
      if(patch())clearInterval(poll);
    },80);
    setTimeout(function(){clearInterval(poll);},30000);
  }
})();
