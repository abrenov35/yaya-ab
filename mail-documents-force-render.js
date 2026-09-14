(function(){
  'use strict';

  // Désactivé volontairement : le rendu mails/documents est déjà pris en charge
  // par chantier-detail-section-tabs-mail-wrapper.js.
  // Cette ancienne couche observait tout #pane-chantiers et recalculait toutes
  // les fiches à chaque mutation DOM, ce qui ralentissait boutons et navigation.
  window.__yayaForceMailDocumentsV1=true;
  window.__yayaForceMailDocumentsDisabledForPerformance=true;
})();
