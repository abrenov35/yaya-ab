(function(){
  'use strict';

  const FLAG='__yayaOneDriveNewTabV5';
  if(window[FLAG])return;
  window[FLAG]=true;

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
    if(!u)return false;

    // Création immédiate d'un nouveau contexte pendant le clic utilisateur.
    // On charge ensuite OneDrive dedans : l'onglet Yaya ne peut pas être remplacé.
    let win=null;
    try{win=window.open('about:blank','_blank');}catch(e){}

    if(win){
      try{win.opener=null;}catch(e){}
      try{win.location.href=u;}catch(e){
        try{win.location.replace(u);}catch(_e){}
      }
      return true;
    }

    // Secours : lien natif target=_blank. Aucune navigation de l'onglet courant.
    try{
      const a=document.createElement('a');
      a.href=u;
      a.target='_blank';
      a.rel='noopener noreferrer';
      a.style.display='none';
      document.body.appendChild(a);
      a.click();
      a.remove();
      return true;
    }catch(e){
      return false;
    }
  }

  function oneDriveUrlFromClick(target){
    if(!(target instanceof Element))return '';

    const dataNode=target.closest('[data-lien],[data-url],[data-href]');
    if(dataNode){
      const vals=[dataNode.dataset.lien,dataNode.dataset.url,dataNode.dataset.href];
      for(const v of vals){if(v&&isOneDriveUrl(v))return String(v);}
    }

    const link=target.closest('a[href]');
    if(link){
      const href=link.getAttribute('href')||link.href||'';
      if(isOneDriveUrl(href))return String(href);
    }

    const onclickNode=target.closest('[onclick]');
    if(onclickNode){
      const raw=String(onclickNode.getAttribute('onclick')||'');
      const m=raw.match(/voirPiece\(\s*(['"])(.*?)\1\s*\)/i);
      if(m&&m[2]){
        const value=m[2].replace(/\\(['"])/g,'$1');
        if(isOneDriveUrl(value))return value;
      }
    }

    return '';
  }

  // Capture AVANT les handlers Yaya : on bloque toute navigation résiduelle
  // et on ouvre seulement le document OneDrive dans un nouvel onglet.
  document.addEventListener('click',function(e){
    const url=oneDriveUrlFromClick(e.target);
    if(!url)return;

    e.preventDefault();
    e.stopPropagation();
    if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
    openExternal(url);
  },true);

  function wrapVoirPiece(){
    if(typeof window.voirPiece!=='function'){
      setTimeout(wrapVoirPiece,120);
      return;
    }
    if(window.voirPiece.__yayaOneDriveNewTabV5)return;

    const previous=window.voirPiece;
    function voirPieceOneDrive(url){
      const u=String(url||'').trim();
      if(u&&isOneDriveUrl(u)){
        openExternal(u);
        return false;
      }
      return previous.apply(this,arguments);
    }
    voirPieceOneDrive.__yayaOneDriveNewTabV5=true;
    window.voirPiece=voirPieceOneDrive;
  }

  wrapVoirPiece();
})();
