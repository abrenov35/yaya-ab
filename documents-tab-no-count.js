(function(){
  'use strict';
  const id='yaya-documents-tab-no-count';
  if(document.getElementById(id))return;
  const style=document.createElement('style');
  style.id=id;
  style.textContent='.yaya-detail-section-tab[data-section="documents"] small{display:none!important;}';
  document.head.appendChild(style);
})();
