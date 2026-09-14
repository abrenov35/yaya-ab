(function(){
  'use strict';
  if(window.__yayaVisualizationDeleteActionsV1)return;
  window.__yayaVisualizationDeleteActionsV1=true;

  const STYLE_ID='yaya-visualization-delete-actions-v1';
  let currentDocumentId='';

  function text(v){return String(v==null?'':v).trim();}

  function docs(){
    try{return (typeof S!=='undefined'&&S&&Array.isArray(S.documents))?S.documents:[];}catch(e){return [];}
  }

  function normalizeUrl(v){
    const s=text(v);if(!s)return '';
    try{
      const u=new URL(s,location.href);
      u.hash='';
      return u.toString().replace(/[?&](?:raw|dl)=\d+/gi,'').replace(/[?&]$/,'');
    }catch(e){return s;}
  }

  function documentUrl(d){
    if(!d)return [];
    return [d.lien,d.lienPieceJointe,d.pieceJointeUrl,d.attachmentUrl,d.fichierUrl,d.fileUrl,d.oneDriveWebUrl,d.dropboxUrl]
      .map(normalizeUrl).filter(Boolean);
  }

  function findDocumentByUrl(url){
    const target=normalizeUrl(url);if(!target)return null;
    return docs().find(function(d){return documentUrl(d).includes(target);})||null;
  }

  function closeModalSafe(){
    try{if(typeof window.closeModal==='function')window.closeModal();else if(typeof closeModal==='function')closeModal();}catch(e){}
  }

  function deleteDocument(id){
    id=text(id);if(!id)return;
    closeModalSafe();
    setTimeout(function(){
      try{if(typeof window.delDocument==='function'){window.delDocument(id);return;}}catch(e){}
      try{if(typeof delDocument==='function')delDocument(id);}catch(e){}
    },0);
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #modalRoot .yaya-view-delete-btn{
        min-height:34px!important;padding:0 13px!important;border:1px solid #e5a39d!important;
        border-radius:8px!important;background:#fff3f2!important;color:#c92b22!important;
        font-weight:800!important;cursor:pointer!important;white-space:nowrap!important;
      }
      #modalRoot .piece-preview-head .yaya-view-delete-btn{margin-left:auto!important;margin-right:8px!important}
      #modalRoot .yaya-document-read-modal > h5 .yaya-view-delete-btn,
      #modalRoot .yaya-mail-body-modal > h5 .yaya-view-delete-btn,
      #modalRoot .message-modal > h5 .yaya-view-delete-btn{margin-left:auto!important;margin-right:8px!important}
    `;
    document.head.appendChild(style);
  }

  function addDeleteToHead(modal,id){
    id=text(id);if(!modal||!id)return;
    const head=modal.querySelector(':scope > h5,.piece-preview-head');
    if(!head||head.querySelector('.yaya-view-delete-btn'))return;
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='yaya-view-delete-btn';
    btn.textContent='Supprimer';
    btn.dataset.yayaDeleteDocument=id;
    const close=[...head.querySelectorAll('button')].find(function(b){return /fermer|×|close/i.test(String(b.textContent||b.getAttribute('aria-label')||''));});
    if(close)head.insertBefore(btn,close);else head.appendChild(btn);
  }

  function enhance(){
    const root=document.getElementById('modalRoot');if(!root)return;

    root.querySelectorAll('.yaya-document-read-modal').forEach(function(modal){
      const existing=modal.querySelector('[data-yaya-doc-delete]');
      const id=text(existing&&existing.getAttribute('data-yaya-doc-delete'));
      if(id)addDeleteToHead(modal,id);
    });

    root.querySelectorAll('.yaya-mail-body-modal,.message-modal').forEach(function(modal){
      const existing=modal.querySelector('[data-yaya-mail-delete],.yaya-mail-read-delete');
      let id=text(existing&&existing.getAttribute('data-yaya-mail-delete'));
      if(!id){
        try{id=text(window.__yayaLastMailReadId||'');}catch(e){}
      }
      if(id)addDeleteToHead(modal,id);
    });

    root.querySelectorAll('.piece-preview-modal').forEach(function(modal){
      if(currentDocumentId)addDeleteToHead(modal,currentDocumentId);
    });
  }

  document.addEventListener('click',function(e){
    const btn=e.target&&e.target.closest?e.target.closest('.yaya-view-delete-btn'):null;
    if(!btn)return;
    e.preventDefault();e.stopPropagation();
    deleteDocument(btn.dataset.yayaDeleteDocument);
  },true);

  function wrapVoirPiece(){
    const current=window.voirPiece;
    if(typeof current!=='function'||current.__yayaVisualizationDeleteWrapped)return;
    const wrapped=function(url){
      const d=findDocumentByUrl(url);
      currentDocumentId=d&&d.id?String(d.id):'';
      const result=current.apply(this,arguments);
      requestAnimationFrame(enhance);
      return result;
    };
    wrapped.__yayaVisualizationDeleteWrapped=true;
    window.voirPiece=wrapped;
  }

  installStyle();
  wrapVoirPiece();

  const root=document.getElementById('modalRoot');
  if(root){
    let raf=0;
    new MutationObserver(function(){
      if(raf)return;
      raf=requestAnimationFrame(function(){raf=0;enhance();});
    }).observe(root,{childList:true,subtree:true});
  }

  setTimeout(wrapVoirPiece,250);
  setTimeout(wrapVoirPiece,1000);
  enhance();
})();
