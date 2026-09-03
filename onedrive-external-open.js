(function(){
  'use strict';

  function isOneDriveUrl(value){
    try{
      const u=new URL(String(value||''),window.location.href);
      const h=(u.hostname||'').toLowerCase();
      return h==='1drv.ms'
        || h==='onedrive.live.com'
        || h.endsWith('.sharepoint.com')
        || h.includes('onedrive');
    }catch(e){
      const s=String(value||'').toLowerCase();
      return s.includes('1drv.ms')
        || s.includes('onedrive.live.com')
        || s.includes('.sharepoint.com');
    }
  }

  function openExternal(url){
    const u=String(url||'').trim();
    if(!u)return;

    // Ouverture explicite dans un nouvel onglet, comme les autres pièces.
    // window.open est appelé directement pendant le clic utilisateur pour
    // éviter que le navigateur remplace l'onglet Yaya courant.
    let opened=null;
    try{
      opened=window.open(u,'_blank','noopener,noreferrer');
    }catch(e){}

    if(opened){
      try{opened.opener=null;}catch(e){}
      return;
    }

    // Secours si window.open est filtré par le navigateur.
    const a=document.createElement('a');
    a.href=u;
    a.target='_blank';
    a.rel='noopener noreferrer';
    a.style.position='fixed';
    a.style.left='-9999px';
    a.style.top='-9999px';
    document.body.appendChild(a);
    a.dispatchEvent(new MouseEvent('click',{
      view:window,
      bubbles:true,
      cancelable:true,
      ctrlKey:true
    }));
    a.remove();
  }

  function install(){
    if(typeof window.voirPiece!=='function'){
      setTimeout(install,150);
      return;
    }
    if(window.voirPiece.__yayaOneDriveDirectV4)return;

    const previous=window.voirPiece;

    function voirPieceOneDrive(url){
      const u=String(url||'').trim();
      if(u&&isOneDriveUrl(u)){
        openExternal(u);
        return false;
      }
      return previous.apply(this,arguments);
    }

    voirPieceOneDrive.__yayaOneDriveDirectV4=true;
    window.voirPiece=voirPieceOneDrive;
  }

  install();
})();
