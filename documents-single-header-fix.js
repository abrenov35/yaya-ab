(function(){
  'use strict';
  if(window.__yayaDocumentsSingleHeaderV1)return;
  window.__yayaDocumentsSingleHeaderV1=true;

  const STYLE_ID='yaya-documents-single-header-v1';
  function install(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-detail-documents-pane > .seclabel,
      #pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-detail-documents-pane > .section-header,
      #pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-detail-documents-pane > [class*="section-header"]{
        display:none!important;
      }
    `;
    document.head.appendChild(style);
  }

  install();
})();
