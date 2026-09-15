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

  // Fiche chantier : le bouton Commande reste sans compteur.
  const styleId='yaya-commande-tab-no-count-v1';
  if(!document.getElementById(styleId)){
    const style=document.createElement('style');
    style.id=styleId;
    style.textContent=`
      #pane-chantiers .card:has(> .yaya-detail-section-tabs) .yaya-detail-section-tab[data-section="commandes"] small{
        display:none!important;
      }
      #pane-chantiers .yaya-detail-section-tab[data-section="commandes"] small[data-yaya-count]::after{
        content:none!important;
        display:none!important;
      }
    `;
    document.head.appendChild(style);
  }
})();
