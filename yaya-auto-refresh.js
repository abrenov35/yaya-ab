(function(){
  'use strict';

  // Synchronisation automatique volontairement désactivée.
  // Les lectures initiales et les enregistrements manuels restent disponibles.
  window.__YAYA_AUTO_SYNC_STOPPED=true;
  window.__yayaSmartRefreshInstalled=true;
  window.yayaSmartRefreshNow=async function(){return null;};
})();

// Fiche chantier : un seul onglet visuel « Documents & mails ».
// Les données Documents et Mail restent séparées en arrière-plan.
// Important : aucune MutationObserver ici afin d'éviter le scintillement de la fiche.
(function(){
  'use strict';

  const STYLE_ID='yaya-documents-mails-merged-v2';

  function installStyle(){
    let style=document.getElementById(STYLE_ID);
    if(!style){
      style=document.createElement('style');
      style.id=STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent=`
      /* Le bouton Mail séparé disparaît définitivement. */
      #pane-chantiers#pane-chantiers#pane-chantiers .card > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="mail"]{
        display:none!important;
      }

      /* Le bouton Documents garde sa mécanique native mais affiche le libellé commun. */
      #pane-chantiers#pane-chantiers#pane-chantiers .card > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="documents"] > strong{
        font-size:0!important;
      }
      #pane-chantiers#pane-chantiers#pane-chantiers .card > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="documents"] > strong::after{
        content:'Documents & mails'!important;
        font-size:12px!important;
        font-weight:700!important;
        line-height:1.15!important;
        white-space:nowrap!important;
      }
      #pane-chantiers#pane-chantiers#pane-chantiers .card > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="documents"] > small{
        display:none!important;
      }

      /* Quand Documents & mails est actif, afficher les DEUX contenus. */
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-detail-documents-pane[data-empty="0"],
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-detail-mails-pane[data-empty="0"]{
        display:block!important;
      }

      /* Sécurité pendant la migration d'un ancien état mémorisé sur « Mail ». */
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="mail"] > .yaya-detail-documents-pane[data-empty="0"],
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="mail"] > .yaya-detail-mails-pane[data-empty="0"]{
        display:block!important;
      }

      /* Ne jamais afficher les anciens messages vides à côté d'un contenu existant. */
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-detail-empty-pane[data-section="mail"],
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="mail"] > .yaya-detail-empty-pane[data-section="mail"]{
        display:none!important;
      }
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="documents"]:has(> .yaya-detail-mails-pane[data-empty="0"]) > .yaya-detail-empty-pane[data-section="documents"],
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="mail"]:has(> .yaya-detail-mails-pane[data-empty="0"]) > .yaya-detail-empty-pane[data-section="documents"]{
        display:none!important;
      }

      @media(max-width:640px){
        #pane-chantiers#pane-chantiers#pane-chantiers .card > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="documents"] > strong::after{
          font-size:11px!important;
        }
      }
    `;
  }

  // Une ancienne fiche peut avoir mémorisé l'onglet « Mail ».
  // On la rebascule une seule fois vers « Documents » via le bouton natif :
  // cela met aussi à jour le stockage utilisé par Yaya sans boucle DOM.
  function migrateOldMailState(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;

    pane.querySelectorAll('.card[data-yaya-detail-section="mail"]').forEach(card=>{
      const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
      const docTab=tabs&&tabs.querySelector('.yaya-detail-section-tab[data-section="documents"]');
      if(!docTab)return;
      try{docTab.click();}catch(e){}
    });
  }

  function refresh(){
    installStyle();
    migrateOldMailState();
  }

  refresh();
  setTimeout(refresh,150);
  setTimeout(refresh,500);
  setTimeout(refresh,1200);
  setTimeout(refresh,2500);
  window.addEventListener('yaya:data-refreshed',()=>setTimeout(refresh,0));
  window.addEventListener('hashchange',()=>setTimeout(refresh,0));
})();
