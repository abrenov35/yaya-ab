(function(){
  'use strict';

  if(window.__YAYA_COMMANDES_WORK_SESSION_GUARD_V2)return;
  window.__YAYA_COMMANDES_WORK_SESSION_GUARD_V2=true;
  window.__YAYA_COMMANDES_WORK_SESSION_GUARD_V1=true;

  let deferred=false;
  let lastEnsureTimer=0;

  function commandeActive(){
    try{
      if(window.__YAYA_COMMANDES_SESSION_ACTIVE===true)return true;

      const frame=document.querySelector('#pane-chantiers .yaya-ab-commandes-frame');
      if(frame&&frame.isConnected)return true;

      return !!document.querySelector(
        '#pane-chantiers .card[data-yaya-detail-section="commandes"],'+
        '#pane-chantiers .yaya-detail-section-tab[data-section="commandes"].on,'+
        '#pane-chantiers .yaya-detail-section-tab[data-section="commandes"].active,'+
        '#pane-chantiers .yaya-detail-section-tab[data-section="commandes"][aria-selected="true"]'
      );
    }catch(e){
      return false;
    }
  }

  function blockRender(name,fn){
    function guarded(){
      if(commandeActive()){
        deferred=true;
        window.__YAYA_COMMANDES_RENDER_DEFERRED=true;
        window.__YAYA_COMMANDES_BLOCKED_RENDER=name;
        return false;
      }
      return fn.apply(this,arguments);
    }

    guarded.__yayaCommandesWorkGuardV2=true;
    guarded.__yayaCommandesGuardedName=name;
    guarded.__yayaOriginalRender=fn;
    return guarded;
  }

  function ensureOne(name){
    const current=window[name];
    if(typeof current!=='function')return;
    if(current.__yayaCommandesWorkGuardV2)return;
    window[name]=blockRender(name,current);
  }

  function ensureGuards(){
    ensureOne('render');
    ensureOne('renderChantiers');
  }

  function scheduleEnsure(){
    clearTimeout(lastEnsureTimer);
    lastEnsureTimer=setTimeout(ensureGuards,0);
  }

  function flushAfterLeavingCommande(){
    if(commandeActive())return;
    if(!deferred)return;

    deferred=false;
    window.__YAYA_COMMANDES_RENDER_DEFERRED=false;
    window.__YAYA_COMMANDES_BLOCKED_RENDER='';

    setTimeout(function(){
      if(commandeActive()){
        deferred=true;
        window.__YAYA_COMMANDES_RENDER_DEFERRED=true;
        return;
      }
      ensureGuards();
      try{
        if(typeof window.render==='function')window.render();
      }catch(e){
        console.warn('Rendu Yaya différé ignoré',e);
      }
    },60);
  }

  document.addEventListener('click',function(e){
    const detail=e.target&&e.target.closest&&e.target.closest('.yaya-detail-section-tab[data-section]');
    if(detail){
      const key=String(detail.dataset.section||'');
      if(key==='commandes'){
        window.__YAYA_COMMANDES_SESSION_ACTIVE=true;
        ensureGuards();
        return;
      }

      if(window.__YAYA_COMMANDES_SESSION_ACTIVE===true){
        window.__YAYA_COMMANDES_SESSION_ACTIVE=false;
        setTimeout(flushAfterLeavingCommande,0);
      }
      return;
    }

    const mainTab=e.target&&e.target.closest&&e.target.closest('.tab[data-tab]');
    if(mainTab&&String(mainTab.dataset.tab||'')!=='chantiers'&&window.__YAYA_COMMANDES_SESSION_ACTIVE===true){
      window.__YAYA_COMMANDES_SESSION_ACTIVE=false;
      setTimeout(flushAfterLeavingCommande,0);
    }
  },true);

  window.addEventListener('hashchange',function(){
    try{
      if(location.hash&&location.hash!=='#chantiers'&&window.__YAYA_COMMANDES_SESSION_ACTIVE===true){
        window.__YAYA_COMMANDES_SESSION_ACTIVE=false;
      }
    }catch(e){}
    flushAfterLeavingCommande();
  });

  /*
   * Plusieurs correctifs Yaya remplacent encore render/renderChantiers après
   * le chargement de ce fichier. On revérifie uniquement les références de
   * fonctions, sans toucher au DOM ni lancer de synchronisation.
   */
  ensureGuards();
  [0,50,150,400,1000,2000].forEach(function(ms){setTimeout(ensureGuards,ms);});
  setInterval(ensureGuards,1000);
  window.addEventListener('load',scheduleEnsure,{once:true});

  window.__YAYA_COMMANDES_WORK_SESSION_GUARD_VERSION='2.0-render-and-renderChantiers-lock';
})();
