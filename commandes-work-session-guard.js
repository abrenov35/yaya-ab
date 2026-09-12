(function(){
  'use strict';

  if(window.__YAYA_COMMANDES_WORK_SESSION_GUARD_V1)return;
  window.__YAYA_COMMANDES_WORK_SESSION_GUARD_V1=true;

  let installed=false;
  let deferred=false;
  let originalRender=null;

  function commandeActive(){
    try{
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

  function install(){
    if(installed)return;
    if(typeof window.render!=='function'){
      setTimeout(install,60);
      return;
    }

    if(window.render.__yayaCommandesWorkGuard){
      installed=true;
      return;
    }

    originalRender=window.render;

    function guardedRender(){
      if(commandeActive()){
        deferred=true;
        window.__YAYA_COMMANDES_RENDER_DEFERRED=true;
        return false;
      }
      return originalRender.apply(this,arguments);
    }

    guardedRender.__yayaCommandesWorkGuard=true;
    guardedRender.__yayaOriginalRender=originalRender;
    window.render=guardedRender;
    installed=true;
  }

  function flushAfterLeavingCommande(){
    if(!deferred)return;
    setTimeout(function(){
      if(commandeActive())return;
      deferred=false;
      window.__YAYA_COMMANDES_RENDER_DEFERRED=false;
      try{window.render();}catch(e){}
    },80);
  }

  document.addEventListener('click',function(e){
    const btn=e.target&&e.target.closest&&e.target.closest('.yaya-detail-section-tab[data-section]');
    if(!btn)return;
    if(String(btn.dataset.section||'')!=='commandes'){
      flushAfterLeavingCommande();
    }
  },true);

  window.addEventListener('hashchange',flushAfterLeavingCommande);

  install();
  [100,400,1000].forEach(function(ms){setTimeout(install,ms);});

  window.__YAYA_COMMANDES_WORK_SESSION_GUARD_VERSION='1.0-no-parent-rerender';
})();
