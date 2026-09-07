(function(){
  'use strict';

  if(window.__yayaDocumentTypeEditV1)return;
  window.__yayaDocumentTypeEditV1=true;

  const STYLE_ID='yaya-document-type-edit-style-v1';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-detail-documents-pane .yaya-detail-charge-hours[data-yaya-document-edit="1"]{
        cursor:pointer!important;
      }
      #pane-chantiers .yaya-detail-documents-pane .yaya-detail-charge-hours[data-yaya-document-edit="1"]:hover{
        opacity:.72!important;
      }
      #pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-edit{
        display:none!important;
      }
    `;
    document.head.appendChild(style);
  }

  function patch(){
    installStyle();

    document.querySelectorAll('#pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-row').forEach(function(row){
      const edit=row.querySelector('.yaya-detail-document-edit[data-doc-id]');
      const type=row.querySelector('.yaya-detail-charge-hours');
      const id=String(edit&&edit.dataset.docId||'').trim();
      if(!type||!id)return;

      type.dataset.yayaDocumentEdit='1';
      type.dataset.docId=id;
      type.setAttribute('role','button');
      type.setAttribute('tabindex','0');
      type.setAttribute('title','Modifier le document');
      type.setAttribute('aria-label','Modifier le document');

      edit.style.setProperty('display','none','important');
      edit.setAttribute('aria-hidden','true');
    });
  }

  function openEdit(type,event){
    const id=String(type&&type.dataset&&type.dataset.docId||'').trim();
    if(!id)return;

    if(event){
      event.preventDefault();
      event.stopPropagation();
      if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
    }

    try{
      if(typeof window.editDocument==='function'){
        window.editDocument(id);
        return;
      }
      if(typeof editDocument==='function')editDocument(id);
    }catch(err){
      try{if(typeof toast==='function')toast('Modification du document indisponible',true);}catch(e){}
    }
  }

  document.addEventListener('click',function(event){
    const type=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers .yaya-detail-documents-pane .yaya-detail-charge-hours[data-yaya-document-edit="1"]')
      :null;
    if(type)openEdit(type,event);
  },true);

  document.addEventListener('keydown',function(event){
    if(event.key!=='Enter'&&event.key!==' ')return;
    const type=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers .yaya-detail-documents-pane .yaya-detail-charge-hours[data-yaya-document-edit="1"]')
      :null;
    if(type)openEdit(type,event);
  },true);

  let raf=0;
  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(function(){raf=0;patch();});
  }

  schedule();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',schedule);
})();
