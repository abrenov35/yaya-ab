(function(){
  'use strict';
  const id='yaya-action-buttons-style-v7';
  if(document.getElementById(id))return;

  const style=document.createElement('style');
  style.id=id;
  style.textContent=`
    /* Alignement : les 3 actions occupent toujours les mêmes colonnes.
       S'il manque l'oeil, crayon et croix restent en colonnes 2 et 3. */
    #pane-chantiers .message-actions,
    #pane-chantiers .yaya-document-line > span:last-child,
    #pane-chantiers :is(.ligM,.ligD) > span:last-child{
      display:grid!important;
      grid-template-columns:28px 28px 28px!important;
      column-gap:6px!important;
      align-items:center!important;
      justify-content:end!important;
    }

    /* BOUTON 1 — VOIR */
    #pane-chantiers .message-actions button.message-view-btn[onclick*="voirMessageYaya"],
    #pane-chantiers .yaya-document-line > span:last-child button[onclick*="voirPiece"],
    #pane-chantiers :is(.ligM,.ligD) > span:last-child button[onclick*="voirPiece"]{
      grid-column:1!important;width:28px!important;min-width:28px!important;max-width:28px!important;height:28px!important;min-height:28px!important;padding:0!important;margin:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;border:1px solid #a9c8e8!important;border-radius:7px!important;background:#f3f8fd!important;color:#174d7d!important;box-shadow:0 1px 3px rgba(22,45,73,.14)!important;font-size:0!important;line-height:1!important;cursor:pointer!important;
    }
    #pane-chantiers .message-actions button.message-view-btn[onclick*="voirMessageYaya"]::before,
    #pane-chantiers .yaya-document-line > span:last-child button[onclick*="voirPiece"]::before,
    #pane-chantiers :is(.ligM,.ligD) > span:last-child button[onclick*="voirPiece"]::before{content:"👁"!important;font-size:15px!important;line-height:1!important;}
    #pane-chantiers .message-actions button.message-view-btn[onclick*="voirMessageYaya"]:hover,
    #pane-chantiers .yaya-document-line > span:last-child button[onclick*="voirPiece"]:hover,
    #pane-chantiers :is(.ligM,.ligD) > span:last-child button[onclick*="voirPiece"]:hover{background:#e9f3fc!important;border-color:#83b2df!important;box-shadow:0 2px 5px rgba(22,45,73,.17)!important;}

    /* BOUTON 2 — MODIFIER */
    #pane-chantiers .message-actions button:not([onclick*="voirMessageYaya"]):not(.x):not([onclick*="supprim" i]),
    #pane-chantiers .yaya-document-line > span:last-child button:not([onclick*="voirPiece"]):not(.x):not([onclick*="supprim" i]),
    #pane-chantiers :is(.ligM,.ligD) > span:last-child button:not([onclick*="voirPiece"]):not(.x):not([onclick*="supprim" i]){
      grid-column:2!important;width:28px!important;min-width:28px!important;max-width:28px!important;height:28px!important;min-height:28px!important;padding:0!important;margin:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;border:1px solid #a8d5b5!important;border-radius:7px!important;background:#f2faf4!important;color:#26703b!important;box-shadow:0 1px 3px rgba(22,45,73,.14)!important;font-size:0!important;line-height:1!important;cursor:pointer!important;
    }
    #pane-chantiers .message-actions button:not([onclick*="voirMessageYaya"]):not(.x):not([onclick*="supprim" i])::before,
    #pane-chantiers .yaya-document-line > span:last-child button:not([onclick*="voirPiece"]):not(.x):not([onclick*="supprim" i])::before,
    #pane-chantiers :is(.ligM,.ligD) > span:last-child button:not([onclick*="voirPiece"]):not(.x):not([onclick*="supprim" i])::before{content:"✏️"!important;font-size:14px!important;line-height:1!important;}
    #pane-chantiers .message-actions button:not([onclick*="voirMessageYaya"]):not(.x):not([onclick*="supprim" i]):hover,
    #pane-chantiers .yaya-document-line > span:last-child button:not([onclick*="voirPiece"]):not(.x):not([onclick*="supprim" i]):hover,
    #pane-chantiers :is(.ligM,.ligD) > span:last-child button:not([onclick*="voirPiece"]):not(.x):not([onclick*="supprim" i]):hover{background:#e7f6eb!important;border-color:#82c696!important;box-shadow:0 2px 5px rgba(22,45,73,.17)!important;}

    /* BOUTON 3 — SUPPRIMER */
    #pane-chantiers .message-actions button.x,
    #pane-chantiers .yaya-document-line > span:last-child button.x,
    #pane-chantiers :is(.ligM,.ligD) > span:last-child button.x,
    #pane-chantiers .message-actions button[onclick*="supprim" i],
    #pane-chantiers .yaya-document-line > span:last-child button[onclick*="supprim" i],
    #pane-chantiers :is(.ligM,.ligD) > span:last-child button[onclick*="supprim" i]{
      grid-column:3!important;width:28px!important;min-width:28px!important;max-width:28px!important;height:28px!important;min-height:28px!important;padding:0!important;margin:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;border:1px solid #e6a7a7!important;border-radius:7px!important;background:#fff3f3!important;color:#c83c3c!important;box-shadow:0 1px 3px rgba(22,45,73,.14)!important;font-size:0!important;line-height:1!important;cursor:pointer!important;
    }
    #pane-chantiers .message-actions button.x::before,
    #pane-chantiers .yaya-document-line > span:last-child button.x::before,
    #pane-chantiers :is(.ligM,.ligD) > span:last-child button.x::before,
    #pane-chantiers .message-actions button[onclick*="supprim" i]::before,
    #pane-chantiers .yaya-document-line > span:last-child button[onclick*="supprim" i]::before,
    #pane-chantiers :is(.ligM,.ligD) > span:last-child button[onclick*="supprim" i]::before{content:"❌"!important;display:block!important;font-size:13px!important;font-weight:700!important;line-height:1!important;}
    #pane-chantiers .message-actions button.x:hover,
    #pane-chantiers .yaya-document-line > span:last-child button.x:hover,
    #pane-chantiers :is(.ligM,.ligD) > span:last-child button.x:hover,
    #pane-chantiers button[onclick*="supprim" i]:hover{background:#fde7e7!important;border-color:#dc8585!important;box-shadow:0 2px 5px rgba(22,45,73,.17)!important;}
  `;
  document.head.appendChild(style);
})();
