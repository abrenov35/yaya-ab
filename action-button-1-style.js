(function(){
  'use strict';
  const id='yaya-action-buttons-style-v4';
  if(document.getElementById(id))return;

  const style=document.createElement('style');
  style.id=id;
  style.textContent=`
    /* BOUTON 1 — VOIR dans la fiche chantier */
    #pane-chantiers .message-actions button.message-view-btn[onclick*="voirMessageYaya"],
    #pane-chantiers .yaya-document-line > span:last-child button[onclick*="voirPiece"],
    #pane-chantiers :is(.ligM,.ligD) > span:last-child button[onclick*="voirPiece"]{
      width:28px!important;min-width:28px!important;max-width:28px!important;
      height:28px!important;min-height:28px!important;padding:0!important;margin:0 2px!important;
      display:inline-flex!important;align-items:center!important;justify-content:center!important;
      border:1px solid #a9c8e8!important;border-radius:7px!important;background:#f3f8fd!important;
      color:#174d7d!important;box-shadow:0 1px 3px rgba(22,45,73,.14)!important;
      font-size:0!important;line-height:1!important;cursor:pointer!important;vertical-align:middle!important;
    }
    #pane-chantiers .message-actions button.message-view-btn[onclick*="voirMessageYaya"]::before,
    #pane-chantiers .yaya-document-line > span:last-child button[onclick*="voirPiece"]::before,
    #pane-chantiers :is(.ligM,.ligD) > span:last-child button[onclick*="voirPiece"]::before{
      content:"👁"!important;font-size:15px!important;line-height:1!important;
    }
    #pane-chantiers .message-actions button.message-view-btn[onclick*="voirMessageYaya"]:hover,
    #pane-chantiers .yaya-document-line > span:last-child button[onclick*="voirPiece"]:hover,
    #pane-chantiers :is(.ligM,.ligD) > span:last-child button[onclick*="voirPiece"]:hover{
      background:#e9f3fc!important;border-color:#83b2df!important;box-shadow:0 2px 5px rgba(22,45,73,.17)!important;
    }

    /* BOUTON 2 — MODIFIER : même format, pastel vert avec contour */
    #pane-chantiers .message-actions button:not([onclick*="voirMessageYaya"]):not(.x),
    #pane-chantiers .yaya-document-line > span:last-child button:not([onclick*="voirPiece"]):not(.x),
    #pane-chantiers :is(.ligM,.ligD) > span:last-child button:not([onclick*="voirPiece"]):not(.x){
      width:28px!important;min-width:28px!important;max-width:28px!important;
      height:28px!important;min-height:28px!important;padding:0!important;margin:0 2px!important;
      display:inline-flex!important;align-items:center!important;justify-content:center!important;
      border:1px solid #a8d5b5!important;border-radius:7px!important;background:#f2faf4!important;
      color:#26703b!important;box-shadow:0 1px 3px rgba(22,45,73,.14)!important;
      font-size:0!important;line-height:1!important;cursor:pointer!important;vertical-align:middle!important;
    }
    #pane-chantiers .message-actions button:not([onclick*="voirMessageYaya"]):not(.x)::before,
    #pane-chantiers .yaya-document-line > span:last-child button:not([onclick*="voirPiece"]):not(.x)::before,
    #pane-chantiers :is(.ligM,.ligD) > span:last-child button:not([onclick*="voirPiece"]):not(.x)::before{
      content:"✏️"!important;font-size:14px!important;line-height:1!important;
    }
    #pane-chantiers .message-actions button:not([onclick*="voirMessageYaya"]):not(.x):hover,
    #pane-chantiers .yaya-document-line > span:last-child button:not([onclick*="voirPiece"]):not(.x):hover,
    #pane-chantiers :is(.ligM,.ligD) > span:last-child button:not([onclick*="voirPiece"]):not(.x):hover{
      background:#e7f6eb!important;border-color:#82c696!important;box-shadow:0 2px 5px rgba(22,45,73,.17)!important;
    }
  `;
  document.head.appendChild(style);
})();
