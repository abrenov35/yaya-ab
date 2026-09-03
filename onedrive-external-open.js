(function(){
  'use strict';

  const FLAG='__yayaOneDriveModalPreviewV1';
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

      // OneDrive personnel : lorsqu'un identifiant de fichier est présent,
      // on utilise directement le lecteur Microsoft prévu pour l'intégration.
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

      // OneDrive Entreprise / SharePoint : action=embedview ouvre le lecteur
      // Microsoft en lecture intégrée au lieu de la page de partage classique.
      u.searchParams.delete('download');
      u.searchParams.set('action','embedview');
      return u.toString();
    }catch(e){
      return raw+(raw.includes('?')?'&':'?')+'action=embedview';
    }
  }

  function openFull(url){
    const u=String(url||'').trim();
    if(!u)return;
    try{
      const w=window.open(u,'_blank','noopener,noreferrer');
      if(w){try{w.opener=null;}catch(e){} return;}
    }catch(e){}

    const a=document.createElement('a');
    a.href=u;
    a.target='_blank';
    a.rel='noopener noreferrer';
    a.style.display='none';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function installStyle(){
    if(document.getElementById('yaya-onedrive-modal-preview-style'))return;
    const style=document.createElement('style');
    style.id='yaya-onedrive-modal-preview-style';
    style.textContent=`
      .yaya-od-preview-overlay{
        position:fixed;inset:0;z-index:10000;
        display:flex;align-items:center;justify-content:center;
        padding:12px;background:rgba(22,45,73,.46);
      }
      .yaya-od-preview-modal{
        width:min(76vw,720px);height:min(74dvh,580px);
        max-width:720px;max-height:580px;
        display:flex;flex-direction:column;overflow:hidden;
        background:#fff;border-radius:12px;
        box-shadow:0 16px 48px rgba(0,0,0,.28);
      }
      .yaya-od-preview-head{
        flex:0 0 46px;min-height:46px;
        display:flex;align-items:center;gap:8px;
        padding:0 10px 0 14px;
        border-bottom:1px solid rgba(22,45,73,.13);
        color:#162D49;font:600 13px system-ui,-apple-system,sans-serif;
      }
      .yaya-od-preview-head b{
        flex:1;min-width:0;white-space:nowrap;
        overflow:hidden;text-overflow:ellipsis;
      }
      .yaya-od-preview-btn{
        border:1px solid rgba(22,45,73,.22);
        background:#fff;color:#162D49;border-radius:8px;
        padding:6px 11px;font:600 12px system-ui,-apple-system,sans-serif;
        cursor:pointer;
      }
      .yaya-od-preview-open{
        background:#174f86;color:#fff;border-color:#174f86;
      }
      .yaya-od-preview-stage{
        position:relative;flex:1 1 auto;min-height:0;
        background:#eef1f5;overflow:hidden;
      }
      .yaya-od-preview-frame{
        position:absolute;inset:0;width:100%;height:100%;
        border:0;background:#fff;
      }
      .yaya-od-preview-loading{
        position:absolute;inset:0;z-index:2;
        display:flex;align-items:center;justify-content:center;
        padding:18px;background:#eef1f5;color:#162D49;
        text-align:center;font:600 12.5px system-ui,-apple-system,sans-serif;
      }
      @media(max-width:640px){
        .yaya-od-preview-overlay{padding:5px;}
        .yaya-od-preview-modal{
          width:calc(100vw - 10px);height:calc(100dvh - 10px);
          max-width:none;max-height:none;border-radius:9px;
        }
        .yaya-od-preview-head{flex-basis:44px;min-height:44px;padding-left:10px;}
        .yaya-od-preview-btn{padding:6px 9px;}
      }
    `;
    document.head.appendChild(style);
  }

  function showModal(url){
    const root=document.getElementById('modalRoot');
    if(!root)return false;

    installStyle();
    root.replaceChildren();

    const overlay=document.createElement('div');
    overlay.className='yaya-od-preview-overlay';

    const modal=document.createElement('div');
    modal.className='yaya-od-preview-modal';

    const head=document.createElement('div');
    head.className='yaya-od-preview-head';

    const title=document.createElement('b');
    title.textContent='Pièce jointe OneDrive';

    const open=document.createElement('button');
    open.type='button';
    open.className='yaya-od-preview-btn yaya-od-preview-open';
    open.textContent='Ouvrir';
    open.onclick=function(e){e.preventDefault();e.stopPropagation();openFull(url);};

    const close=document.createElement('button');
    close.type='button';
    close.className='yaya-od-preview-btn';
    close.textContent='Fermer';
    close.onclick=function(e){e.preventDefault();e.stopPropagation();root.replaceChildren();};

    head.append(title,open,close);

    const stage=document.createElement('div');
    stage.className='yaya-od-preview-stage';

    const loading=document.createElement('div');
    loading.className='yaya-od-preview-loading';
    loading.textContent='Chargement de la pièce…';

    const frame=document.createElement('iframe');
    frame.className='yaya-od-preview-frame';
    frame.title='Aperçu de la pièce jointe OneDrive';
    frame.allow='fullscreen';
    frame.referrerPolicy='no-referrer-when-downgrade';
    frame.src=embedUrl(url);
    frame.onload=function(){setTimeout(function(){loading.style.display='none';},120);};

    stage.append(loading,frame);
    modal.append(head,stage);
    overlay.appendChild(modal);
    root.appendChild(overlay);

    overlay.onclick=function(e){if(e.target===overlay)root.replaceChildren();};
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

  // On intercepte le clic avant les anciens handlers pour que l'œil OneDrive
  // ouvre toujours la modale et jamais directement un autre onglet.
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
    if(window.voirPiece.__yayaOneDriveModalPreviewV1)return;

    const previous=window.voirPiece;
    function voirPieceOneDrive(url){
      const u=String(url||'').trim();
      if(u&&isOneDriveUrl(u)){
        showModal(u);
        return false;
      }
      return previous.apply(this,arguments);
    }
    voirPieceOneDrive.__yayaOneDriveModalPreviewV1=true;
    window.voirPiece=voirPieceOneDrive;
  }

  wrapVoirPiece();
})();
