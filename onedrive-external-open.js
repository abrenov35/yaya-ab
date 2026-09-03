(function(){
  'use strict';

  const FLAG='__yayaOneDriveModalPreviewV2';
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

  function embedUrl(value){
    const raw=String(value||'').trim();
    if(!raw)return '';

    try{
      const u=new URL(raw,window.location.href);
      const host=(u.hostname||'').toLowerCase();

      if(host==='onedrive.live.com'){
        if(u.pathname.toLowerCase().includes('/embed'))return u.toString();
        const resid=u.searchParams.get('resid')||u.searchParams.get('id')||'';
        if(resid){
          const e=new URL('https://onedrive.live.com/embed');
          e.searchParams.set('resid',resid);
          const auth=u.searchParams.get('authkey');
          if(auth)e.searchParams.set('authkey',auth);
          e.searchParams.set('em','2');
          return e.toString();
        }
      }

      u.searchParams.delete('download');
      u.searchParams.set('action','embedview');
      return u.toString();
    }catch(e){
      return raw+(raw.includes('?')?'&':'?')+'action=embedview';
    }
  }

  function installStyle(){
    if(document.getElementById('yaya-onedrive-modal-preview-style-v2'))return;
    const style=document.createElement('style');
    style.id='yaya-onedrive-modal-preview-style-v2';
    style.textContent=`
      #modalRoot .yaya-od-preview-stage{
        position:relative!important;
        background:#eef1f5!important;
        overflow:hidden!important;
      }
      #modalRoot .yaya-od-preview-frame{
        position:absolute!important;
        inset:0!important;
        width:100%!important;
        height:100%!important;
        border:0!important;
        background:#fff!important;
      }
      #modalRoot .yaya-od-preview-loading{
        position:absolute!important;
        inset:0!important;
        z-index:4!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        padding:18px!important;
        background:#eef1f5!important;
        color:#162D49!important;
        text-align:center!important;
        font:600 12.5px system-ui,-apple-system,sans-serif!important;
      }
      #modalRoot .yaya-drive-zoom-hit{
        position:absolute!important;
        inset:0!important;
        z-index:3!important;
        border:0!important;
        padding:0!important;
        margin:0!important;
        background:transparent!important;
        cursor:zoom-in!important;
      }
    `;
    document.head.appendChild(style);
  }

  function showModal(url){
    const root=document.getElementById('modalRoot');
    if(!root)return false;

    installStyle();
    root.replaceChildren();

    // Même structure/classes que le lecteur Google/Dropbox.
    // piece-preview-size-patch.js gère alors automatiquement :
    // petite modale -> clic sur la pièce -> grand aperçu.
    const overlay=document.createElement('div');
    overlay.className='overlay piece-preview-overlay';

    const modal=document.createElement('div');
    modal.className='modal piece-modal piece-preview-modal';
    modal.dataset.yayaPreviewFullscreen='0';

    const head=document.createElement('h5');
    head.className='piece-preview-head';

    const title=document.createElement('span');
    title.textContent='Pièce jointe';

    const close=document.createElement('button');
    close.type='button';
    close.textContent='Fermer';
    close.onclick=function(e){
      e.preventDefault();
      e.stopPropagation();
      if(typeof window.closeModal==='function')window.closeModal();
      else root.replaceChildren();
    };

    head.append(title,close);

    const stage=document.createElement('div');
    stage.className='piece-preview-stage yaya-od-preview-stage';

    const loading=document.createElement('div');
    loading.className='yaya-od-preview-loading';
    loading.textContent='Chargement de la pièce…';

    const frame=document.createElement('iframe');
    frame.className='yaya-od-preview-frame';
    frame.title='Aperçu de la pièce jointe OneDrive';
    frame.allow='fullscreen';
    frame.referrerPolicy='no-referrer-when-downgrade';
    frame.src=embedUrl(url);
    frame.onload=function(){
      setTimeout(function(){
        if(loading.isConnected)loading.style.display='none';
      },120);
    };

    // Un iframe ne remonte pas ses clics au parent. Cette zone transparente
    // reproduit donc le clic d'agrandissement des aperçus Google/Dropbox.
    const zoomHit=document.createElement('button');
    zoomHit.type='button';
    zoomHit.className='yaya-drive-zoom-hit';
    zoomHit.setAttribute('aria-label','Agrandir la pièce jointe');
    zoomHit.title='Cliquer pour agrandir';

    stage.append(loading,frame,zoomHit);
    modal.append(head,stage);
    overlay.appendChild(modal);
    root.appendChild(overlay);

    overlay.onclick=function(e){
      if(e.target===overlay){
        if(typeof window.closeModal==='function')window.closeModal();
        else root.replaceChildren();
      }
    };

    return true;
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

  document.addEventListener('click',function(e){
    const url=oneDriveUrlFromClick(e.target);
    if(!url)return;

    e.preventDefault();
    e.stopPropagation();
    if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
    showModal(url);
  },true);

  function wrapVoirPiece(){
    if(typeof window.voirPiece!=='function'){
      setTimeout(wrapVoirPiece,120);
      return;
    }
    if(window.voirPiece.__yayaOneDriveModalPreviewV2)return;

    const previous=window.voirPiece;
    function voirPieceOneDrive(url){
      const u=String(url||'').trim();
      if(u&&isOneDriveUrl(u)){
        showModal(u);
        return false;
      }
      return previous.apply(this,arguments);
    }
    voirPieceOneDrive.__yayaOneDriveModalPreviewV2=true;
    window.voirPiece=voirPieceOneDrive;
  }

  wrapVoirPiece();
})();
