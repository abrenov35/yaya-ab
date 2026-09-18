(function(){
'use strict';
// Fonction de scroll chantier retirée.
// Nettoyage défensif des classes/styles ajoutés par les anciennes versions.
document.querySelectorAll('#pane-chantiers .card').forEach(function(card){
  card.classList.remove(
    'yaya-two-block-fit','yaya-two-block-long',
    'yaya-three-block-fit','yaya-three-block-long'
  );
  card.style.removeProperty('--yaya-detail-sticky-top');
  card.style.removeProperty('--yaya-tabs-sticky-height');
  card.style.removeProperty('--yaya-action-sticky-height');
  card.querySelectorAll('.yaya-page-hidden').forEach(function(el){
    el.classList.remove('yaya-page-hidden');
  });
  card.querySelectorAll('[data-yaya-page-anchor],[data-yaya-page-start]').forEach(function(el){
    el.removeAttribute('data-yaya-page-anchor');
    el.removeAttribute('data-yaya-page-start');
  });
  card.querySelectorAll(':scope > .yaya-block-page-indicator').forEach(function(el){el.remove();});
});
['yaya-chantier-two-block-viewport-v1','yaya-chantier-two-block-viewport-v2',
 'yaya-chantier-three-block-viewport-v3','yaya-chantier-three-block-viewport-v4',
 'yaya-chantier-three-block-viewport-v5','yaya-chantier-three-block-viewport-v6',
 'yaya-chantier-three-block-viewport-v7'].forEach(function(id){
   var el=document.getElementById(id); if(el)el.remove();
 });
window.__YAYA_CHANTIER_SCROLL_REMOVED='1';
})();