(function(){
  'use strict';

  const previousVoirPiece=window.voirPiece;
  if(typeof previousVoirPiece!=='function')return;

  function isDropbox(value){
    try{
      const u=new URL(String(value||''));
      return /(^|\.)dropbox\.com$/i.test(u.hostname)||/(^|\.)dropboxusercontent\.com$/i.test(u.hostname);
    }catch(e){
      return /dropbox\.com|dropboxusercontent\.com/i.test(String(value||''));
    }
  }

  function directDropboxUrl(value){
    try{
      const u=new URL(String(value||''));
      if(/(^|\.)dropbox\.com$/i.test(u.hostname))u.hostname='dl.dropboxusercontent.com';
      u.searchParams.delete('dl');
      u.searchParams.delete('raw');
      u.searchParams.delete('st');
      return u.toString();
    }catch(e){
      return String(value||'')
        .replace(/^https?:\/\/(?:www\.)?dropbox\.com/i,'https://dl.dropboxusercontent.com')
        .replace(/([?&])(dl|raw|st)=[^&]*/gi,'$1')
        .replace(/[?&]$/,'');
    }
  }

  function makeFrameFallback(root,src){
    root.replaceChildren();
    const overlay=document.createElement('div');
    overlay.className='overlay piece-preview-overlay';
    overlay.onclick=e=>{if(e.target===overlay&&typeof window.closeModal==='function')window.closeModal();};

    const modal=document.createElement('div');
    modal.className='modal piece-modal piece-preview-modal';
    const head=document.createElement('h5');
    head.className='piece-preview-head';
    const title=document.createElement('span');
    title.textContent='Pièce jointe';
    const close=document.createElement('button');
    close.type='button';
    close.textContent='Fermer';
    close.onclick=()=>window.closeModal();
    head.append(title,close);

    const stage=document.createElement('div');
    stage.className='piece-preview-stage';
    const frame=document.createElement('iframe');
    frame.title='Pièce Dropbox';
    frame.src=src;
    frame.style.width='100%';
    frame.style.height='100%';
    frame.style.border='0';
    frame.referrerPolicy='no-referrer';
    stage.appendChild(frame);
    modal.append(head,stage);
    overlay.appendChild(modal);
    root.appendChild(overlay);
  }

  function watchBlob(root,blobUrl){
    const obs=new MutationObserver(()=>{
      if(!root.children.length){
        try{URL.revokeObjectURL(blobUrl);}catch(e){}
        obs.disconnect();
      }
    });
    obs.observe(root,{childList:true});
  }

  window.voirPiece=async function(value){
    const original=String(value||'').trim();
    if(!original||!isDropbox(original))return previousVoirPiece(original);

    const root=document.getElementById('modalRoot');
    if(!root)return previousVoirPiece(original);
    const direct=directDropboxUrl(original);

    try{
      const response=await fetch(direct,{method:'GET',mode:'cors',cache:'no-store',credentials:'omit'});
      if(!response.ok)throw new Error('Dropbox HTTP '+response.status);
      const type=String(response.headers.get('content-type')||'').toLowerCase();
      if(type.includes('text/html'))throw new Error('Dropbox a renvoyé une page HTML');
      const blob=await response.blob();
      if(!blob.size)throw new Error('Fichier Dropbox vide');
      const blobUrl=URL.createObjectURL(blob);
      watchBlob(root,blobUrl);
      return previousVoirPiece(blobUrl);
    }catch(e){
      console.warn('Lecture directe Dropbox indisponible, fallback dropboxusercontent :',e);
      makeFrameFallback(root,direct);
    }
  };
})();
