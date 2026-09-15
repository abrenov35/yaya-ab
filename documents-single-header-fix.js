(function(){
  'use strict';
  if(window.__yayaDocumentsSingleHeaderV2)return;
  window.__yayaDocumentsSingleHeaderV2=true;

  const STYLE_ID='yaya-documents-single-header-v2';
  function install(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers [data-yaya-detail-section="documents"] .yaya-detail-documents-pane > .seclabel,
      #pane-chantiers [data-yaya-detail-section="documents"] .yaya-detail-documents-pane > .section-header,
      #pane-chantiers [data-yaya-detail-section="documents"] .yaya-detail-documents-pane > [class*="section-header"]{
        display:none!important;
      }
    `;
    document.head.appendChild(style);
  }

  function hideDuplicate(){
    document.querySelectorAll('#pane-chantiers [data-yaya-detail-section="documents"] .yaya-detail-documents-pane').forEach(function(pane){
      Array.from(pane.children).forEach(function(el){
        const t=String(el.textContent||'').replace(/\s+/g,' ').trim();
        if(/^\d+\s*-\s*DOCUMENTS$/i.test(t) || /^DOCUMENTS\s*\(\d+\)$/i.test(t)){
          el.style.setProperty('display','none','important');
          el.setAttribute('data-yaya-duplicate-documents-header','1');
        }
      });
    });
  }

  function apply(){install();hideDuplicate();}
  apply();
  const root=document.getElementById('pane-chantiers');
  if(root){let raf=0;new MutationObserver(function(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;hideDuplicate();});}).observe(root,{childList:true,subtree:true});}
  setTimeout(hideDuplicate,100);setTimeout(hideDuplicate,500);
})();
