// Force la lisibilite du bouton Enregistrer de la note Commandes, y compris sur iPhone/Safari.
(function(){
  'use strict';
  const STYLE_ID='yaya-commandes-note-save-visibility';
  if(document.getElementById(STYLE_ID)) return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    html body .yaya-cmd-native-root .ycn-note-actions button[data-ycn-note-save]{
      background:#0b4f86!important;
      border:1px solid #083f6d!important;
      color:#ffffff!important;
      -webkit-text-fill-color:#ffffff!important;
      opacity:1!important;
      filter:none!important;
      box-shadow:0 2px 6px rgba(11,79,134,.22)!important;
    }
    html body .yaya-cmd-native-root .ycn-note-actions button[data-ycn-note-save]:disabled{
      background:#c6d5e4!important;
      border-color:#7e97b0!important;
      color:#24405f!important;
      -webkit-text-fill-color:#24405f!important;
      opacity:1!important;
      filter:none!important;
      box-shadow:none!important;
    }
  `;
  document.head.appendChild(style);
})();