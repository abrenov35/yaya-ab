// Masque uniquement les 4 cartes KPI en haut de l'onglet Commandes
// et renforce la lisibilite du bouton Enregistrer des notes, notamment sur iPhone.
(function(){
  'use strict';
  const STYLE_ID='yaya-commandes-hide-kpis';
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    .ycn-kpis{display:none!important;}
    .yaya-cmd-native-root .ycn-note-actions [data-ycn-note-save]{
      background:#0b4f86!important;
      border:1px solid #083f6d!important;
      color:#fff!important;
      opacity:1!important;
      box-shadow:0 2px 6px rgba(11,79,134,.22)!important;
    }
    .yaya-cmd-native-root .ycn-note-actions [data-ycn-note-save]:disabled{
      background:#d7e3ef!important;
      border-color:#9fb3c8!important;
      color:#304b67!important;
      opacity:1!important;
      box-shadow:none!important;
    }
  `;
  document.head.appendChild(style);
})();
