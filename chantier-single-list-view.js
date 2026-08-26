(function(){
  'use strict';

  const VIEW_KEY='yaya.chantiers.view';
  const STYLE_ID='yaya-single-chantier-list-v2';

  function forceAll(){
    try{localStorage.setItem(VIEW_KEY,'all');}catch(e){}
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* La toolbar Chantiers est l'unique navigation vers la liste */
      #pane-chantiers .yaya-suivi-tabs{
        display:none!important;
      }

      /* Les trois actions d'ajout ont exactement le même niveau visuel */
      #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > .btnp,
      #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > .chantier-expense-btn,
      #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > button[onclick*="openDocumentModal"]{
        background:#fff!important;
        color:#244A73!important;
        border:1px solid #CBD5E1!important;
        box-shadow:none!important;
      }

      #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > .btnp:hover,
      #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > .chantier-expense-btn:hover,
      #pane-chantiers .card:has(> .yaya-detail-section-tabs) .chantier-fin-toolbar > button[onclick*="openDocumentModal"]:hover{
        background:#F4F7FA!important;
        border-color:#B8C7D8!important;
      }
    `;
    document.head.appendChild(style);
  }

  function apply(){
    installStyle();
    forceAll();
  }

  /* Exécution immédiate : compatible avec le chargeur document.write() de Yaya */
  apply();

  /* Les autres patches peuvent rerender la page après nous : on réaffirme seulement l'état, sans modifier le DOM. */
  const obs=new MutationObserver(function(){ forceAll(); });
  obs.observe(document.documentElement,{childList:true,subtree:true});

  window.addEventListener('yaya:data-refreshed',apply);
  window.addEventListener('pageshow',apply);
  setTimeout(apply,0);
  setTimeout(apply,250);
  setTimeout(apply,1000);
})();
