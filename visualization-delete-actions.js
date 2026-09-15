(function(){
  'use strict';
  if(window.__yayaVisualizationDeleteActionsV4)return;
  window.__yayaVisualizationDeleteActionsV4=true;

  const STYLE_ID='yaya-visualization-delete-actions-v4';
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
      u.searchParams.delete('raw');u.searchParams.delete('dl');u.searchParams.delete('usp');
      const q=u.searchParams.toString();return u.origin+u.pathname+(q?'?'+q:'');
    }catch(e){return s.replace(/[?&](?:raw|dl|usp)=[^&#]*/gi,'').replace(/[?&]$/,'');}
  }

  function documentUrls(d){return d?[d.lien,d.lienPieceJointe,d.pieceJointeUrl,d.attachmentUrl,d.fichierUrl,d.fileUrl,d.oneDriveWebUrl,d.dropboxUrl].map(normalizeUrl).filter(Boolean):[];}
  function achatUrls(a){return a?[a.lien,a.lienPieceJointe,a.pieceJointeUrl,a.attachmentUrl,a.fichierUrl,a.fileUrl,a.oneDriveWebUrl,a.dropboxUrl].map(normalizeUrl).filter(Boolean):[];}
  function findDocumentByUrl(url){const target=normalizeUrl(url);return target?(docs().find(d=>documentUrls(d).includes(target))||null):null;}
  function findAchatByUrl(url){const target=normalizeUrl(url);return target?(achats().find(a=>achatUrls(a).includes(target))||null):null;}

  function closeModalSafe(){try{if(typeof window.closeModal==='function')window.closeModal();else if(typeof closeModal==='function')closeModal();}catch(e){}}
  function deleteDocument(id){id=text(id);if(!id)return;closeModalSafe();setTimeout(()=>{try{if(typeof window.delDocument==='function'){window.delDocument(id);return;}}catch(e){}try{if(typeof delDocument==='function')delDocument(id);}catch(e){}},0);}
  function deleteAchat(id){id=text(id);if(!id)return;closeModalSafe();setTimeout(()=>{try{if(typeof window.delAchat==='function'){window.delAchat(id);return;}}catch(e){}try{if(typeof delAchat==='function')delAchat(id);}catch(e){}},0);}

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');style.id=STYLE_ID;
    style.textContent=`
      #modalRoot .yaya-view-delete-btn{min-height:34px!important;padding:0 13px!important;margin-left:auto!important;margin-right:8px!important;border:1px solid #e5a39d!important;border-radius:8px!important;background:#fff3f2!important;color:#c92b22!important;font-weight:800!important;cursor:pointer!important;white-space:nowrap!important}
      #modalRoot .yaya-piece-inline-delete{display:none!important}
    `;
    document.head.appendChild(style);
  }

  function isPiecesModal(modal){
    const title=text(modal&&modal.querySelector('h5,h4,h3')?.textContent);
    return /visualisation\s+des\s+pi[eè]ces/i.test(title);
  }

  function inlineDeletes(modal){
    return [...modal.querySelectorAll('button')].filter(b=>/^[×x✕❌]$/i.test(text(b.textContent)));
  }

  function selectedInlineDelete(modal,deletes){
    let idx=Number(modal.dataset.yayaPieceSelected||0);
    for(let i=0;i<deletes.length;i++){
      const tab=deletes[i].previousElementSibling;
      if(tab&&(tab.classList.contains('active')||tab.classList.contains('selected')||tab.getAttribute('aria-selected')==='true')){idx=i;break;}
    }
    return deletes[Math.max(0,Math.min(idx,deletes.length-1))]||null;
  }

  function enhancePiecesModal(modal){
    if(!isPiecesModal(modal))return;
    const deletes=inlineDeletes(modal);
    deletes.forEach((b,i)=>{
      b.classList.add('yaya-piece-inline-delete');
      const tab=b.previousElementSibling;
      if(tab&&!tab.dataset.yayaPieceTracked){
        tab.dataset.yayaPieceTracked='1';
        tab.addEventListener('click',()=>{modal.dataset.yayaPieceSelected=String(i);},{passive:true});
      }
    });
    if(!deletes.length)return;

    const head=modal.querySelector('h5,h4,h3')||modal.firstElementChild;if(!head)return;
    let btn=head.querySelector('.yaya-view-delete-btn');
    if(!btn){
      btn=document.createElement('button');btn.type='button';btn.className='yaya-view-delete-btn';btn.textContent='Supprimer';
      const close=[...head.querySelectorAll('button')].find(b=>/fermer|close/i.test(text(b.textContent||b.getAttribute('aria-label'))));
      if(close)head.insertBefore(btn,close);else head.appendChild(btn);
    }
    btn.dataset.yayaProxyPieceDelete='1';
  }

  function enhancePreview(){
    const root=document.getElementById('modalRoot');if(!root)return;
    root.querySelectorAll('.modal').forEach(enhancePiecesModal);
    if(!currentTarget||!currentTarget.id)return;
    root.querySelectorAll('.piece-preview-modal').forEach(modal=>{
      const head=modal.querySelector('.piece-preview-head');if(!head)return;
      let btn=head.querySelector('.yaya-view-delete-btn');
      if(!btn){btn=document.createElement('button');btn.type='button';btn.className='yaya-view-delete-btn';btn.textContent='Supprimer';const close=[...head.querySelectorAll('button')].find(b=>/fermer|×|close/i.test(text(b.textContent||b.getAttribute('aria-label'))));if(close)head.insertBefore(btn,close);else head.appendChild(btn);}
      btn.dataset.yayaDeleteType=currentTarget.type;btn.dataset.yayaDeleteId=currentTarget.id;
    });
  }

  document.addEventListener('click',function(e){
    const btn=e.target&&e.target.closest?e.target.closest('.yaya-view-delete-btn'):null;if(!btn)return;
    if(btn.dataset.yayaProxyPieceDelete==='1'){
      e.preventDefault();e.stopPropagation();
      const modal=btn.closest('.modal');const deletes=modal?inlineDeletes(modal):[];const target=modal?selectedInlineDelete(modal,deletes):null;
      if(target)target.click();
      return;
    }
    e.preventDefault();e.stopPropagation();
    const type=text(btn.dataset.yayaDeleteType),id=text(btn.dataset.yayaDeleteId);
    if(type==='achat')deleteAchat(id);else if(type==='document')deleteDocument(id);
  },true);

  function wrapVoirPiece(){
    const current=window.voirPiece;if(typeof current!=='function'||current.__yayaVisualizationDeleteWrappedV4)return;
    const wrapped=function(url){const a=findAchatByUrl(url),d=findDocumentByUrl(url);currentTarget=a&&a.id?{type:'achat',id:String(a.id)}:(d&&d.id?{type:'document',id:String(d.id)}:null);const result=current.apply(this,arguments);requestAnimationFrame(enhancePreview);return result;};
    wrapped.__yayaVisualizationDeleteWrappedV4=true;window.voirPiece=wrapped;
  }

  installStyle();wrapVoirPiece();
  const root=document.getElementById('modalRoot');if(root){let raf=0;new MutationObserver(()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;enhancePreview();});}).observe(root,{childList:true,subtree:true});}
  setTimeout(wrapVoirPiece,250);setTimeout(wrapVoirPiece,1000);enhancePreview();
})();
