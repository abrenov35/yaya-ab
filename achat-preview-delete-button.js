(function(){
  'use strict';

  const STYLE_ID='yaya-achat-preview-delete-v1';
  const FLAG='__yayaAchatPreviewDeleteWrapped';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .piece-preview-head .yaya-preview-actions{
        margin-left:auto!important;
        display:flex!important;
        align-items:center!important;
        gap:10px!important;
      }
      .piece-preview-head .yaya-achat-preview-delete{
        border:1px solid #f0a39b!important;
        background:#fff5f3!important;
        color:#d92d20!important;
        font-weight:800!important;
      }
      .piece-preview-head .yaya-achat-preview-delete:hover{
        background:#fee4e2!important;
      }
      .piece-preview-head .yaya-achat-preview-delete:disabled{
        opacity:.55!important;
        cursor:default!important;
      }
    `;
    document.head.appendChild(style);
  }

  function linkKey(value){
    const raw=String(value||'').trim();
    if(!raw)return '';
    try{
      const u=new URL(raw,location.href);
      const drive=u.pathname.match(/\/file\/d\/([^/?#]+)/i);
      if(/(?:^|\.)drive\.google\.com$/i.test(u.hostname)&&drive&&drive[1]){
        return 'drive:'+drive[1];
      }
      return (u.origin+u.pathname).replace(/\/$/,'');
    }catch(e){
      return raw.replace(/[?&](?:dl|raw|usp)=[^&#]*/gi,'').replace(/[?&]$/,'');
    }
  }

  function achatByPreviewUrl(){
    const key=linkKey(window.__yayaCurrentPreviewUrl||'');
    if(!key||typeof S==='undefined'||!S||!Array.isArray(S.achats))return null;
    return S.achats.find(function(a){
      return a&&linkKey(a.lien)===key;
    })||null;
  }

  function installVoirPieceWrapper(){
    if(typeof window.voirPiece!=='function')return false;
    if(window.voirPiece[FLAG])return true;

    const original=window.voirPiece;
    const wrapped=function(url){
      window.__yayaCurrentPreviewUrl=String(url||'').trim();
      return original.apply(this,arguments);
    };
    wrapped[FLAG]=true;
    wrapped.__yayaOriginalVoirPiece=original;
    window.voirPiece=wrapped;
    return true;
  }

  function stillExists(id){
    return typeof S!=='undefined'&&S&&Array.isArray(S.achats)&&S.achats.some(function(a){
      return String(a&&a.id||'')===String(id||'');
    });
  }

  function injectDeleteButton(){
    installStyle();
    const root=document.getElementById('modalRoot');
    if(!root)return;
    const head=root.querySelector('.piece-preview-head');
    if(!head)return;
    if(head.querySelector('[data-yaya-achat-preview-delete]'))return;

    const achat=achatByPreviewUrl();
    if(!achat||!achat.id)return;

    const closeButton=Array.from(head.querySelectorAll('button')).find(function(btn){
      return /fermer/i.test(String(btn.textContent||''));
    });
    if(!closeButton)return;

    const actions=document.createElement('span');
    actions.className='yaya-preview-actions';

    const deleteButton=document.createElement('button');
    deleteButton.type='button';
    deleteButton.className='yaya-achat-preview-delete';
    deleteButton.dataset.yayaAchatPreviewDelete='1';
    deleteButton.textContent='Supprimer';
    deleteButton.onclick=async function(event){
      event.preventDefault();
      event.stopPropagation();
      if(deleteButton.disabled)return;
      if(typeof window.delAchat!=='function'){
        try{if(typeof toast==='function')toast('Suppression indisponible. Recharge Yaya puis réessaie.',true);}catch(e){}
        return;
      }

      const id=String(achat.id||'');
      deleteButton.disabled=true;
      try{
        await window.delAchat(id);
        if(!stillExists(id)&&typeof window.closeModal==='function'){
          window.closeModal();
        }
      }finally{
        if(stillExists(id))deleteButton.disabled=false;
      }
    };

    closeButton.remove();
    actions.append(deleteButton,closeButton);
    head.appendChild(actions);
  }

  installStyle();
  installVoirPieceWrapper();

  const root=document.getElementById('modalRoot');
  if(root){
    const observer=new MutationObserver(function(){
      setTimeout(injectDeleteButton,0);
    });
    observer.observe(root,{childList:true,subtree:true});
  }

  setTimeout(function(){installVoirPieceWrapper();injectDeleteButton();},150);
  setTimeout(function(){installVoirPieceWrapper();injectDeleteButton();},600);
})();
