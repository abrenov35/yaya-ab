(function(){
  'use strict';

  // IMPORTANT: ce fichier ne doit plus remplacer window.voirPiece.
  // piece-preview-api-patch.js est le lecteur principal : il récupère le
  // fichier Drive via l'API Yaya et affiche PDF/images sans iframe Drive.
  // L'ancien override présent ici était chargé APRES ce lecteur et le
  // remplaçait par un iframe /preview, ce qui provoquait la modale vide.

  const STYLE_ID='yaya-drive-fullpage-fallback-v3';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #modalRoot .piece-preview-stage > iframe{
        width:100%!important;
        height:100%!important;
        min-height:0!important;
        border:0!important;
        display:block!important;
        background:#fff!important;
      }
    `;
    document.head.appendChild(style);
  }

  if(!document.querySelector('script[data-yaya-devis-download-toolbar]')){
    const script=document.createElement('script');
    script.src='devis-viewer-download-toolbar.js?v=1';
    script.dataset.yayaDevisDownloadToolbar='1';
    document.head.appendChild(script);
  }
})();
