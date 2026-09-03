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
    const a=document.createElement('a');
    a.href=String(url||'');
    a.target='_blank';
    a.rel='noopener noreferrer';
    a.style.display='none';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function install(){
    if(typeof window.voirPiece!=='function'){
      setTimeout(install,150);
      return;
    }
    if(window.voirPiece.__yayaOneDriveDirectV3)return;

    const previous=window.voirPiece;

    function voirPieceOneDrive(url){
      const u=String(url||'').trim();
      if(u&&isOneDriveUrl(u)){
        // OneDrive Entreprise / SharePoint bloque les liens de partage ordinaires
        // dans les iframes externes. L'ouverture directe conserve la session
        // Microsoft de l'utilisateur et évite l'écran "élément non chargé".
        openExternal(u);
        return;
      }
      return previous.apply(this,arguments);
    }

    voirPieceOneDrive.__yayaOneDriveDirectV3=true;
    window.voirPiece=voirPieceOneDrive;
  }

  install();
})();
