(function(){
'use strict';
if(window.__yayaFullscreenViewersV1)return;
window.__yayaFullscreenViewersV1=true;

const ID='yaya-fullscreen-viewers-v1';
if(document.getElementById(ID))return;

const s=document.createElement('style');
s.id=ID;
s.textContent=`
/* Lecteur générique de pièces */
#modalRoot .piece-preview-overlay{
  inset:0!important;
  padding:0!important;
  align-items:stretch!important;
  justify-content:stretch!important;
  background:#fff!important;
}
#modalRoot .piece-preview-modal{
  width:100vw!important;
  height:100dvh!important;
  max-width:none!important;
  max-height:none!important;
  margin:0!important;
  padding:6px!important;
  border-radius:0!important;
  box-shadow:none!important;
}
#modalRoot .piece-preview-head{
  min-height:40px!important;
  margin:0 0 4px!important;
}
#modalRoot .piece-preview-stage{
  border-radius:0!important;
}

/* Lecteur Commandes */
#ycnIframePiecesV4{
  inset:0!important;
  padding:0!important;
  align-items:stretch!important;
  justify-content:stretch!important;
  background:#fff!important;
}
#ycnIframePiecesV4 .v4-card{
  width:100vw!important;
  height:100dvh!important;
  max-width:none!important;
  max-height:none!important;
  border-radius:0!important;
  box-shadow:none!important;
}
#ycnIframePiecesV4 .v4-head{
  min-height:42px!important;
  padding:7px 10px!important;
}
#ycnIframePiecesV4 .v4-tabs{
  padding:6px 9px!important;
}

/* Lecteur Devis */
#yayaDevisViewer{
  inset:0!important;
  padding:0!important;
  align-items:stretch!important;
  justify-content:stretch!important;
  background:#fff!important;
}
#yayaDevisViewer .ydd-modal.docs{
  width:100vw!important;
  max-width:none!important;
  height:100dvh!important;
  max-height:none!important;
  margin:0!important;
  border-radius:0!important;
  box-shadow:none!important;
}
#yayaDevisViewer .ydd-head{
  min-height:44px!important;
  padding:7px 10px!important;
}
#yayaDevisViewer .ydd-tabs{
  padding:5px 8px 0!important;
}

/* Ancien lecteur Commandes éventuel */
#yayaCmdPreviewModalV2{
  inset:0!important;
  padding:0!important;
}
#yayaCmdPreviewModalV2 .ycp-card{
  width:100vw!important;
  height:100dvh!important;
  max-width:none!important;
  max-height:none!important;
  border-radius:0!important;
  box-shadow:none!important;
}

/* Lecteur Photos uniquement */
#modalRoot .yaya-photo-view-overlay{
  inset:0!important;
  padding:0!important;
  align-items:stretch!important;
  justify-content:stretch!important;
  background:#fff!important;
}
#modalRoot .yaya-photo-view-modal{
  width:100vw!important;
  height:100dvh!important;
  max-width:none!important;
  max-height:none!important;
  margin:0!important;
  padding:6px!important;
  border-radius:0!important;
  box-shadow:none!important;
  overflow:hidden!important;
  display:flex!important;
  flex-direction:column!important;
}
#modalRoot .yaya-photo-view-modal .yaya-photo-view-stage{
  flex:1 1 auto!important;
  min-height:0!important;
}
#modalRoot .yaya-photo-view-modal .yaya-photo-view-img{
  height:100%!important;
  max-height:none!important;
}

@media(max-width:640px){
  #modalRoot .piece-preview-modal,
  #modalRoot .yaya-photo-view-modal{
    padding:3px!important;
  }
}
`;
document.head.appendChild(s);
})();