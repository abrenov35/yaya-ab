(function(){
  'use strict';

  // L'ancien moteur de rendu reste désactivé pour les performances.
  window.__yayaForceMailDocumentsV1=true;
  window.__yayaForceMailDocumentsDisabledForPerformance=true;

  // Charger le correctif de persistance après mail-edit-sync-fix.js.
  // setTimeout garantit que les scripts statiques suivants ont fini de s'installer.
  setTimeout(function(){
    if(window.__yayaMailEditPersistV2)return;
    const existing=document.querySelector('script[data-yaya-mail-persist-v2]');
    if(existing)return;
    const script=document.createElement('script');
    script.src='mail-edit-persist-v2.js?v=2';
    script.dataset.yayaMailPersistV2='1';
    script.async=false;
    document.head.appendChild(script);
  },0);
})();
