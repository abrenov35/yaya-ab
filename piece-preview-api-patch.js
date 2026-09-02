(function(){
  'use strict';

  const previousVoirPiece=window.voirPiece;
  if(typeof previousVoirPiece!=='function')return;

  function driveIdFromUrl(value){
    const s=String(value||'').trim();
    let m=s.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
    if(m)return m[1];
    m=s.match(/[?&]id=([^&#]+)/i);
    return m?decodeURIComponent(m[1]):'';
  }

  function makeDriveModal(root,id){
    root.replaceChildren();

    const overlay=document.createElement('div');
    overlay.className='overlay piece-preview-overlay';
    overlay.onclick=function(e){
      if(e.target===overlay&&typeof window.closeModal==='function')window.closeModal();
    };

    const modal=document.createElement('div');
    modal.className='modal piece-modal piece-preview-modal';

    const head=document.createElement('h5');
    head.className='piece-preview-head';

    const title=document.createElement('span');
    title.textContent='Pièce jointe';

    const close=document.createElement('button');
    close.type='button';
    close.textContent='Fermer';
    close.onclick=function(){
      if(typeof window.closeModal==='function')window.closeModal();
    };

    head.append(title,close);

    const stage=document.createElement('div');
    stage.className='piece-preview-stage yaya-drive-fit-stage';

    const iframe=document.createElement('iframe');
    iframe.className='yaya-drive-fit-frame';
    iframe.src='https://drive.google.com/file/d/'+encodeURIComponent(id)+'/preview';
    iframe.setAttribute('allow','autoplay');
    iframe.setAttribute('loading','eager');
    iframe.setAttribute('title','Pièce jointe');
    iframe.style.cssText='width:100%;height:100%;border:0;background:#111;';

    stage.appendChild(iframe);
    modal.append(head,stage);
    overlay.appendChild(modal);
    root.appendChild(overlay);

    return iframe;
  }

  window.voirPiece=function(url){
    const value=String(url||'').trim();
    if(!value)return;

    const id=driveIdFromUrl(value);
    if(!id){
      return previousVoirPiece(value);
    }

    const root=document.getElementById('modalRoot');
    if(!root){
      return previousVoirPiece(value);
    }

    // Lecture directe Drive : aucun passage par Apps Script,
    // aucun Base64 et aucun rendu PDF.js page par page.
    makeDriveModal(root,id);
  };
})();
