(function(){
  'use strict';
  if(window.__yayaDocumentUnifiedViewerV2)return;
  window.__yayaDocumentUnifiedViewerV2=true;
  window.__yayaDocumentUnifiedViewerV1=true;

  const ROW_SELECTOR=[
    '#pane-documents .achligne.ligR[data-id]',
    '#pane-chantiers .yaya-detail-document-row',
    '#pane-chantiers .yaya-detail-documents-pane .yaya-detail-document-row'
  ].join(',');

  function text(value){return String(value==null?'':value).trim();}
  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});}
  function docs(){try{return typeof S!=='undefined'&&S&&Array.isArray(S.documents)?S.documents:[];}catch(e){return [];}}
  function doc(id){id=text(id);return docs().find(function(row){return text(row&&row.id)===id;})||null;}

  function rowId(row){
    if(!row)return '';
    const values=[row.dataset&&row.dataset.id,row.dataset&&row.dataset.rowId,row.dataset&&row.dataset.documentId,row.dataset&&row.dataset.docId];
    for(const value of values){if(text(value))return text(value);}
    const nested=row.querySelector('[data-row-id],[data-document-id],[data-doc-id],[data-id]');
    if(nested){
      const value=nested.dataset.rowId||nested.dataset.documentId||nested.dataset.docId||nested.dataset.id;
      if(text(value))return text(value);
    }
    const raw=[].map.call(row.querySelectorAll('[onclick]'),function(el){return String(el.getAttribute('onclick')||'');}).join(' ');
    const match=raw.match(/(?:voirPiece|editDocument|delDocument)\(['"]([^'"]+)/i);
    return match&&match[1]?text(match[1]):'';
  }

  function rowUrl(row,d){
    const link=row&&row.querySelector('[data-lien]');
    const dataUrl=text(link&&link.getAttribute('data-lien'));
    if(dataUrl)return dataUrl;
    const raw=row?[].map.call(row.querySelectorAll('[onclick]'),function(el){return String(el.getAttribute('onclick')||'');}).join(' '):'';
    const match=raw.match(/voirPiece\(['"]([^'"]+)/i);
    if(match&&match[1])return text(match[1]);
    return text(d&&(d.lienPieceJointe||d.pieceJointeUrl||d.attachmentUrl||d.fichierUrl||d.fileUrl||d.oneDriveWebUrl||d.dropboxUrl||d.lien));
  }

  function titleFor(d){
    return text(d&&(d.pieceNom||d.nomFichier||d.filename||d.nom||d.titre||d.objet||d.sujet))||'Document';
  }

  function isMail(row,d){
    if(row&&row.classList.contains('yaya-detail-mail-row'))return true;
    const upper=function(v){return text(v).toUpperCase();};
    return !!(d&&(upper(d.type)==='MAIL'||upper(d.origine)==='MAIL'||upper(d.origineMail)==='MAIL'||d.contenuMail||d.corpsMail||d.objetMail||d.mailSubject||d.emailSubject));
  }

  function directDownloadUrl(value){
    const raw=text(value);if(!raw)return '';
    const drive=raw.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
    if(drive)return 'https://drive.usercontent.google.com/download?id='+encodeURIComponent(drive[1])+'&export=download&confirm=t';
    try{
      const url=new URL(raw,window.location.href);
      if(/(?:^|\.)dropbox\.com$/i.test(url.hostname)){url.searchParams.delete('raw');url.searchParams.set('dl','1');}
      else if(/(?:1drv\.ms|onedrive\.live\.com|sharepoint\.com)$/i.test(url.hostname))url.searchParams.set('download','1');
      return url.toString();
    }catch(e){return raw;}
  }

  function clearPreviewState(){
    window.__yayaPreviewDocumentId='';
    window.__yayaUnifiedPreviewDocumentId='';
    window.__yayaUnifiedPreviewUrl='';
  }

  function closePreview(){
    clearPreviewState();
    try{if(typeof window.closeModal==='function'){window.closeModal();return;}}catch(e){}
    const root=document.getElementById('modalRoot');if(root)root.replaceChildren();
  }

  function openDocumentEditor(id){
    id=text(id);closePreview();
    setTimeout(function(){
      try{if(id&&typeof window.editDocument==='function'){window.editDocument(id);return;}}catch(e){}
      try{if(id&&typeof globalThis.editDocument==='function')globalThis.editDocument(id);}catch(e){}
    },0);
  }

  function deleteDocument(id){
    id=text(id);closePreview();
    setTimeout(function(){
      try{if(id&&typeof window.delDocument==='function'){window.delDocument(id);return;}}catch(e){}
      try{if(id&&typeof delDocument==='function')delDocument(id);}catch(e){}
    },0);
  }

  function download(url){
    const href=directDownloadUrl(url);if(!href)return;
    const a=document.createElement('a');a.href=href;a.target='_blank';a.rel='noopener';a.download='';
    (document.body||document.documentElement).appendChild(a);a.click();a.remove();
  }

  function installStyle(){
    if(document.getElementById('yaya-document-unified-viewer-style'))return;
    const style=document.createElement('style');style.id='yaya-document-unified-viewer-style';
    style.textContent=`
      #modalRoot .piece-preview-head.yaya-document-unified-head{display:grid!important;grid-template-columns:minmax(140px,1fr) auto!important;gap:12px!important;align-items:center!important;padding:4px 2px 9px!important}
      #modalRoot .yaya-document-unified-title{min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;font-size:15px!important;font-weight:800!important;color:#162d49!important}
      #modalRoot .yaya-document-unified-actions{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:8px!important}
      #modalRoot .yaya-document-unified-actions button{min-height:38px!important;padding:0 14px!important;border-radius:8px!important;font-size:12.5px!important;font-weight:800!important;cursor:pointer!important;white-space:nowrap!important}
      #modalRoot .yaya-document-action-edit{border:1px solid #9fc0df!important;background:#eef6ff!important;color:#245d91!important}
      #modalRoot .yaya-document-action-download{border:1px solid #207342!important;background:#2e854f!important;color:#fff!important}
      #modalRoot .yaya-document-action-delete{border:1px solid #e6a29c!important;background:#fff3f2!important;color:#c62820!important}
      #modalRoot .yaya-document-action-close{border:1px solid #c7d2df!important;background:#fff!important;color:#233b55!important}
      #modalRoot .yaya-document-unified-modal .piece-preview-head>.yaya-download,
      #modalRoot .yaya-document-unified-modal .piece-preview-head>.yaya-preview-download-top,
      #modalRoot .yaya-document-unified-modal .piece-preview-head>.yaya-preview-download-direct{display:none!important}
      @media(max-width:700px){
        #modalRoot .piece-preview-head.yaya-document-unified-head{grid-template-columns:1fr!important}
        #modalRoot .yaya-document-unified-actions{justify-content:flex-start!important;overflow-x:auto!important;padding-bottom:2px!important}
        #modalRoot .yaya-document-unified-actions button{min-height:34px!important;padding:0 10px!important;font-size:11.5px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function normalizeToolbar(modal){
    if(!modal||!modal.isConnected)return;
    const id=text(window.__yayaUnifiedPreviewDocumentId||window.__yayaPreviewDocumentId);
    if(!id)return;
    modal.classList.add('yaya-document-unified-modal');
    const d=doc(id),url=text(window.__yayaUnifiedPreviewUrl)||rowUrl(null,d);
    const head=modal.querySelector('.piece-preview-head');if(!head)return;
    if(head.classList.contains('yaya-document-unified-head')&&head.querySelectorAll('.yaya-document-unified-actions > button').length===4)return;
    head.classList.add('yaya-document-unified-head');
    head.replaceChildren();

    const title=document.createElement('span');title.className='yaya-document-unified-title';title.textContent=titleFor(d);
    const actions=document.createElement('span');actions.className='yaya-document-unified-actions';
    const edit=document.createElement('button');edit.type='button';edit.className='yaya-document-action-edit';edit.textContent='Modifier';edit.onclick=function(e){e.preventDefault();e.stopPropagation();openDocumentEditor(id);};
    const get=document.createElement('button');get.type='button';get.className='yaya-document-action-download';get.textContent='Télécharger';get.disabled=!url;get.onclick=function(e){e.preventDefault();e.stopPropagation();download(url);};
    const del=document.createElement('button');del.type='button';del.className='yaya-document-action-delete';del.textContent='Supprimer';del.onclick=function(e){e.preventDefault();e.stopPropagation();deleteDocument(id);};
    const close=document.createElement('button');close.type='button';close.className='yaya-document-action-close';close.textContent='Fermer';close.onclick=function(e){e.preventDefault();e.stopPropagation();closePreview();};
    actions.append(edit,get,del,close);head.append(title,actions);
  }

  function showWithoutAttachment(id,d){
    const root=document.getElementById('modalRoot');if(!root)return false;
    root.innerHTML='<div class="overlay piece-preview-overlay"><div class="modal piece-modal piece-preview-modal"><h5 class="piece-preview-head"></h5><div class="piece-preview-stage"><div class="piece-preview-loading">Aucun fichier joint à ce document.</div></div></div></div>';
    normalizeToolbar(root.querySelector('.piece-preview-modal'));
    return true;
  }

  function openUnified(id,url){
    id=text(id);url=text(url);if(!id)return false;
    window.__yayaPreviewDocumentId=id;
    window.__yayaUnifiedPreviewDocumentId=id;
    window.__yayaUnifiedPreviewUrl=url;
    if(!url)return showWithoutAttachment(id,doc(id));
    try{if(typeof window.voirPiece==='function'){window.voirPiece(url);return true;}}catch(e){}
    try{if(typeof voirPiece==='function'){voirPiece(url);return true;}}catch(e){}
    window.open(url,'_blank','noopener');return true;
  }

  document.addEventListener('click',function(event){
    if(event.__yayaDocumentRouteHandled)return;
    const row=event.target&&event.target.closest?event.target.closest(ROW_SELECTOR):null;if(!row)return;
    if(event.target.closest('button,a,input,select,textarea,label'))return;
    const id=rowId(row);if(!id)return;
    const d=doc(id);if(isMail(row,d))return;
    const url=rowUrl(row,d);
    event.preventDefault();event.stopPropagation();
    openUnified(id,url);
  },true);

  const root=document.getElementById('modalRoot');
  if(root)new MutationObserver(function(){
    const modal=root.querySelector('.piece-preview-modal');if(modal)requestAnimationFrame(function(){normalizeToolbar(modal);});
  }).observe(root,{childList:true,subtree:true});

  installStyle();
  window.yayaOpenUnifiedDocument=openUnified;
})();
