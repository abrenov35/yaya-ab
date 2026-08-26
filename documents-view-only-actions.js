(function(){
  'use strict';
  const id='yaya-documents-view-only-actions-v1';
  if(document.getElementById(id))return;
  const style=document.createElement('style');
  style.id=id;
  style.textContent=`
    #pane-documents button[onclick*="editDocument"],
    #pane-documents button[onclick*="delDocument"]{
      display:none!important;
    }
  `;
  document.head.appendChild(style);
})();
