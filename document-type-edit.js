(function(){
  'use strict';

  if(window.__yayaDocumentTypeEditV4)return;
  window.__yayaDocumentTypeEditV4=true;

  const STYLE_ID='yaya-document-type-edit-style-v4';

  function installStyle(){
    ['yaya-document-type-edit-style-v1','yaya-document-type-edit-style-v2','yaya-document-type-edit-style-v3'].forEach(function(id){
      const old=document.getElementById(id);if(old)old.remove();
    });
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-row{
        display:grid!important;
        grid-template-columns:minmax(0,1fr) 120px 100px!important;
        align-items:center!important;
        column-gap:14px!important;
        min-height:54px!important;
        padding:9px 12px!important;
        box-sizing:border-box!important;
      }
      #pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-row > strong{
        min-width:0!important;
        display:flex!important;
        align-items:center!important;
        gap:5px 12px!important;
        flex-wrap:wrap!important;
        line-height:1.3!important;
      }
      #pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-row > strong > small{
        display:inline!important;
        margin:0!important;
        color:#596579!important;
        font-size:12px!important;
        font-weight:500!important;
        line-height:1.3!important;
        white-space:normal!important;
        overflow:visible!important;
        text-overflow:clip!important;
      }
      #pane-chantiers .yaya-detail-documents-pane .yaya-detail-charge-hours{
        justify-self:end!important;
        text-align:right!important;
        white-space:nowrap!important;
      }
      #pane-chantiers .yaya-detail-documents-pane .yaya-detail-charge-cost{
        justify-self:end!important;
        text-align:right!important;
        color:#7a8798!important;
        font-size:10.5px!important;
        font-weight:500!important;
        white-space:nowrap!important;
      }
      #pane-chantiers .yaya-detail-documents-pane .yaya-detail-charge-hours[data-yaya-document-edit="1"],
      #pane-chantiers .yaya-detail-documents-pane [data-yaya-document-view-text="1"]{
        cursor:pointer!important;
      }
      #pane-chantiers .yaya-detail-documents-pane .yaya-detail-charge-hours[data-yaya-document-edit="1"]:hover{
        opacity:.72!important;
      }
      #pane-chantiers .yaya-detail-documents-pane [data-yaya-document-view-text="1"]:hover{
        opacity:.72!important;
        text-decoration:none!important;
      }
      #pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-edit,
      #pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-view{
        display:none!important;
      }
      #pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-delete{
        display:none!important;
      }
      @media(max-width:640px){
        #pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-row{
          grid-template-columns:minmax(0,1fr) 88px 74px!important;
          column-gap:8px!important;
          min-height:52px!important;
          padding:8px 9px!important;
        }
        #pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-row > strong{
          gap:4px 8px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function prepareViewText(row){
    const text=row.querySelector('strong');
    const view=row.querySelector('.yaya-detail-document-view');
    if(!text)return;

    if(view && !view.disabled){
      text.dataset.yayaDocumentViewText='1';
      text.setAttribute('role','button');
      text.setAttribute('tabindex','0');
      text.setAttribute('title','Voir le document');
      text.setAttribute('aria-label','Voir le document');
    }else{
      delete text.dataset.yayaDocumentViewText;
      text.removeAttribute('role');
      text.removeAttribute('tabindex');
      text.removeAttribute('aria-label');
      text.removeAttribute('title');
    }
  }

  function patch(){
    installStyle();

    document.querySelectorAll('#pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-row').forEach(function(row){
      const edit=row.querySelector('.yaya-detail-document-edit[data-doc-id]');
      const view=row.querySelector('.yaya-detail-document-view');
      const del=row.querySelector('.yaya-detail-document-delete');
      const type=row.querySelector('.yaya-detail-charge-hours');
      const id=String(edit&&edit.dataset.docId||'').trim();

      if(type&&id){
        type.dataset.yayaDocumentEdit='1';
        type.dataset.docId=id;
        type.setAttribute('role','button');
        type.setAttribute('tabindex','0');
        type.setAttribute('title','Modifier le document');
        type.setAttribute('aria-label','Modifier le document');
      }

      if(edit){
        edit.style.setProperty('display','none','important');
        edit.setAttribute('aria-hidden','true');
      }
      if(view){
        view.style.setProperty('display','none','important');
        view.setAttribute('aria-hidden','true');
        view.tabIndex=-1;
      }
      if(del){
        del.style.setProperty('display','none','important');
        del.setAttribute('aria-hidden','true');
        del.tabIndex=-1;
      }

      prepareViewText(row);
    });
  }

  function stop(event){
    if(!event)return;
    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
  }

  function openEdit(type,event){
    const id=String(type&&type.dataset&&type.dataset.docId||'').trim();
    if(!id)return;
    stop(event);

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

  function openView(text,event){
    const row=text&&text.closest?text.closest('.yaya-detail-document-row'):null;
    const view=row?row.querySelector('.yaya-detail-document-view'):null;
    if(!view||view.disabled)return;
    const id=String(view.dataset.docId||'').trim();
    const url=String(view.dataset.lien||'').trim();
    stop(event);
    if(id){
      try{
        if(view.dataset.mailLinked==='1'&&window.yayaUnifiedV4Viewer&&
            window.yayaUnifiedV4Viewer.openMail(id))return;
        if(typeof window.yayaOpenUnifiedDocument==='function'&&
            window.yayaOpenUnifiedDocument(id,url))return;
      }catch(err){console.warn('Ouverture du document',err);}
    }
    try{view.click();}catch(e){}
  }

  document.addEventListener('click',function(event){
    const type=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers .yaya-detail-documents-pane .yaya-detail-charge-hours[data-yaya-document-edit="1"]')
      :null;
    if(type){openEdit(type,event);return;}

    const text=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers .yaya-detail-documents-pane [data-yaya-document-view-text="1"], #pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-row:not(.yaya-detail-market-row) .yaya-document-field-2')
      :null;
    if(text)openView(text,event);
  },true);

  document.addEventListener('keydown',function(event){
    if(event.key!=='Enter'&&event.key!==' ')return;
    const type=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers .yaya-detail-documents-pane .yaya-detail-charge-hours[data-yaya-document-edit="1"]')
      :null;
    if(type){openEdit(type,event);return;}

    const text=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers .yaya-detail-documents-pane [data-yaya-document-view-text="1"], #pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-row:not(.yaya-detail-market-row) .yaya-document-field-2')
      :null;
    if(text)openView(text,event);
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
