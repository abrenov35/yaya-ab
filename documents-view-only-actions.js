(function(){
  'use strict';

  const STYLE_ID='yaya-documents-view-only-css-v1';
  if(document.getElementById(STYLE_ID))return;

  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    /* Page Documents uniquement : lecture seule. */
    #pane-documents button[onclick^="openDocumentModal("],
    #pane-documents button[onclick^="editDocument("],
    #pane-documents button[onclick^="delDocument("]{
      display:none!important;
    }
  `;
  document.head.appendChild(style);
})();
