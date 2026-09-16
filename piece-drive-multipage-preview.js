(function(){
  'use strict';
  if(window.__yayaPieceDriveMultipagePreviewV1)return;
  window.__yayaPieceDriveMultipagePreviewV1=true;

  function driveId(value){
    const s=String(value||'').trim();
    let m=s.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
    if(m&&m[1])return m[1];
    m=s.match(/[?&]id=([^&#]+)/i);
    return m&&m[1]?decodeURIComponent(m[1]):'';
  }

  function previewUrl(id){
    return 'https://drive.google.com/file/d/'+encodeURIComponent(id)+'/preview';
  }

  function installStyle(){
    if(document.getElementById('yaya-piece-drive-multipage-style'))return;
    const s=document.createElement('style');
    s.id='yaya-piece-drive-multipage-style';
    s.textContent=`
      .piece-preview-stage.yaya-drive-multipage-stage{padding:0!important;overflow:hidden!important;background:#fff!important}
      .piece-preview-stage .yaya-drive-multipage-frame{display:block!important;width:100%!important;height:100%!important;min-height:100%!important;border:0!important;background:#fff!important}
    `;
    document.head.appendChild(s);
  }

  const previous=window.voirPiece;
  if(typeof previous!=='function')return;

  window.voirPiece=function(url){
    const value=String(url||'').trim();
    const id=driveId(value);
    if(!id)return previous.apply(this,arguments);

    const root=document.getElementById('modalRoot');
    if(!root)return previous.apply(this,arguments);

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
    close.onclick=function(){if(typeof window.closeModal==='function')window.closeModal();};

    head.append(title,close);

    const stage=document.createElement('div');
    stage.className='piece-preview-stage yaya-drive-multipage-stage';

    const frame=document.createElement('iframe');
    frame.className='yaya-drive-multipage-frame';
    frame.title='Visualisation du PDF';
    frame.src=previewUrl(id);
    frame.setAttribute('allow','autoplay');
    frame.setAttribute('referrerpolicy','no-referrer-when-downgrade');

    stage.appendChild(frame);
    modal.append(head,stage);
    overlay.appendChild(modal);
    root.appendChild(overlay);
  };

  installStyle();
})();
