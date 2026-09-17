// Onglet Commande : aucun compteur/chiffre affiche a cote du libelle.
// Version legere : CSS uniquement, sans observer global du DOM.
(function(){
  'use strict';
  if(window.__YAYA_COMMANDE_TAB_NO_COUNT_FINAL_V2)return;
  window.__YAYA_COMMANDE_TAB_NO_COUNT_FINAL_V2=true;

  const STYLE_ID='yaya-commande-tab-no-count-final-style-v2';
  if(document.getElementById(STYLE_ID))return;

  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    #pane-chantiers .yaya-detail-section-tabs .yaya-detail-section-tab[data-section="commandes"] > small,
    #pane-chantiers .yaya-detail-section-tabs .yaya-detail-section-tab[data-section="commandes"] > span,
    #pane-chantiers .yaya-detail-section-tabs .yaya-detail-section-tab.yaya-commande-tab-contrast > small,
    #pane-chantiers .yaya-detail-section-tabs .yaya-detail-section-tab.yaya-commande-tab-contrast > span{
      display:none!important;
      visibility:hidden!important;
      width:0!important;
      min-width:0!important;
      height:0!important;
      margin:0!important;
      padding:0!important;
      border:0!important;
    }
  `;
  document.head.appendChild(style);
})();
