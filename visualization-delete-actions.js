(function(){
  'use strict';
  if(window.__yayaVisualizationDeleteActionsV3)return;
  window.__yayaVisualizationDeleteActionsV3=true;

  const STYLE_ID='yaya-visualization-delete-actions-v3';
  let currentTarget=null;

  function text(v){return String(v==null?'':v).trim();}
  function docs(){try{return (typeof S!=='undefined'&&S&&Array.isArray(S.documents))?S.documents:[];}catch(e){return [];}}
  function achats(){try{return (typeof S!=='undefined'&&S&&Array.isArray(S.achats))?S.achats:[];}catch(e){return [];}}

  function normalizeUrl(v){
    const s=text(v);if(!s)return '';
    try{
      const u=new URL(s,location.href);u.hash='';
      const drive=u.pathname.match(/\/file\/d\/([^/?#]+)/i);
      if(/(?:^|\.)drive\.google\.com$/i.test(u.hostname)&&drive&&drive[1])return 'drive:'+drive[1];
      u.searchParams.delete('raw');
      u.searchParams.delete('dl');
      u.searchParams.delete('usp');
      const q=u.searchParams.toString();
      return u.origin+u.pathname+(q?'?'+q:'');
    }catch(e){return s.replace(/[?&](?:raw|dl|usp)=[^&#]*/gi,'').replace(/[?&]$/,'');}
  }

  function documentUrls(d){
    if(!d)return [];
    return [d.lien,d.lienPieceJointe,d.pieceJointeUrl,d.attachmentUrl,d.fichierUrl,d.fileUrl,d.oneDriveWebUrl,d.dropboxUrl]
      .map(normalizeUrl).filter(Boolean);
  }

  function achatUrls(a){
    if(!a)return [];
    return [a.lien,a.lienPieceJointe,a.pieceJointeUrl,a.attachmentUrl,a.fichierUrl,a.fileUrl,a.oneDriveWebUrl,a.dropboxUrl]
      .map(normalizeUrl).filter(Boolean);
  }

  function findDocumentByUrl(url){
    const target=normalizeUrl(url);if(!target)return null;
    return docs().find(d=>documentUrls(d).includes(target))||null;
  }

  function findAchatByUrl(url){
    const target=normalizeUrl(url);if(!target)return null;
    return achats().find(a=>achatUrls(a).includes(target))||null;
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

  function deleteAchat(id){
    id=text(id);if(!id)return;
    closeModalSafe();
    setTimeout(function(){
      try{if(typeof window.delAchat==='function'){window.delAchat(id);return;}}catch(e){}
      try{if(typeof delAchat==='function')delAchat(id);}catch(e){}
    },0);
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #modalRoot .piece-preview-head .yaya-view-delete-btn{
        min-height:34px!important;padding:0 13px!important;margin-left:auto!important;margin-right:8px!important;
        border:1px solid #e5a39d!important;border-radius:8px!important;background:#fff3f2!important;
        color:#c92b22!important;font-weight:800!important;cursor:pointer!important;white-space:nowrap!important;
      }
    `;
    document.head.appendChild(style);
  }

  function enhancePreview(){
    const root=document.getElementById('modalRoot');if(!root||!currentTarget||!currentTarget.id)return;
    root.querySelectorAll('.piece-preview-modal').forEach(function(modal){
      const head=modal.querySelector('.piece-preview-head');
      if(!head)return;
      let btn=head.querySelector('.yaya-view-delete-btn');
      if(!btn){
        btn=document.createElement('button');
        btn.type='button';
        btn.className='yaya-view-delete-btn';
        btn.textContent='Supprimer';
        const close=[...head.querySelectorAll('button')].find(b=>/fermer|×|close/i.test(String(b.textContent||b.getAttribute('aria-label')||'')));
        if(close)head.insertBefore(btn,close);else head.appendChild(btn);
      }
      btn.dataset.yayaDeleteType=currentTarget.type;
      btn.dataset.yayaDeleteId=currentTarget.id;
    });
  }

  document.addEventListener('click',function(e){
    const btn=e.target&&e.target.closest?e.target.closest('.yaya-view-delete-btn'):null;
    if(!btn)return;
    e.preventDefault();e.stopPropagation();
    const type=text(btn.dataset.yayaDeleteType);
    const id=text(btn.dataset.yayaDeleteId);
    if(type==='achat')deleteAchat(id);
    else if(type==='document')deleteDocument(id);
  },true);

  function wrapVoirPiece(){
    const current=window.voirPiece;
    if(typeof current!=='function'||current.__yayaVisualizationDeleteWrappedV3)return;
    const wrapped=function(url){
      const a=findAchatByUrl(url);
      const d=findDocumentByUrl(url);
      currentTarget=a&&a.id?{type:'achat',id:String(a.id)}:(d&&d.id?{type:'document',id:String(d.id)}:null);
      const result=current.apply(this,arguments);
      requestAnimationFrame(enhancePreview);
      return result;
    };
    wrapped.__yayaVisualizationDeleteWrappedV3=true;
    window.voirPiece=wrapped;
  }

  installStyle();
  wrapVoirPiece();

  const root=document.getElementById('modalRoot');
  if(root){
    let raf=0;
    new MutationObserver(function(){
      if(raf)return;
      raf=requestAnimationFrame(function(){raf=0;enhancePreview();});
    }).observe(root,{childList:true,subtree:true});
  }

  setTimeout(wrapVoirPiece,250);
  setTimeout(wrapVoirPiece,1000);
  enhancePreview();
})();
