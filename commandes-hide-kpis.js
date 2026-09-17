// Masque uniquement les 4 cartes KPI en haut de l'onglet Commandes.
(function(){
  'use strict';
  const STYLE_ID='yaya-commandes-hide-kpis';
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent='.ycn-kpis{display:none!important;}';
  document.head.appendChild(style);
})();
