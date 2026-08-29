(function(){
  'use strict';

  function isOneDriveUrl(value){
    try{
      const u=new URL(String(value||''),window.location.href);
      const h=(u.hostname||'').toLowerCase();
      return h==='1drv.ms' || h==='onedrive.live.com' || h.endsWith('.sharepoint.com') || h.includes('onedrive');
    }catch(e){
      const s=String(value||'').toLowerCase();
      return s.includes('1drv.ms') || s.includes('onedrive.live.com') || s.includes('.sharepoint.com');
    }
  }

  function withDownload(url){
    try{
      const u=new URL(url);
      u.searchParams.set('download','1');
      return u.toString();
    }catch(e){
      return url+(String(url).includes('?')?'&':'?')+'download=1';
    }
  }

  function openExternal(url){
    const a=document.createElement('a');
    a.href=url;
    a.target='_blank';
    a.rel='noopener noreferrer';
    a.style.display='none';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function showOneDriveModal(url){
    const root=document.getElementById('modalRoot');
    if(!root){openExternal(url);return;}

    if(!document.getElementById('yaya-onedrive-modal-style')){
      const st=document.createElement('style');
      st.id='yaya-onedrive-modal-style';
      st.textContent=`
        .yaya-od-overlay{position:fixed;inset:0;z-index:10000;background:rgba(22,45,73,.48);display:flex;align-items:center;justify-content:center;padding:18px;}
        .yaya-od-modal{width:min(760px,88vw);height:min(72vh,720px);background:#fff;border-radius:14px;box-shadow:0 18px 55px rgba(0,0,0,.30);display:flex;flex-direction:column;overflow:hidden;transition:width .15s ease,height .15s ease,border-radius .15s ease;}
        .yaya-od-modal.full{width:calc(100vw - 12px);height:calc(100dvh - 12px);border-radius:8px;}
        .yaya-od-head{height:46px;flex:0 0 46px;display:flex;align-items:center;gap:8px;padding:0 10px 0 14px;border-bottom:1px solid rgba(22,45,73,.12);color:#162D49;font:600 13px system-ui,-apple-system,sans-serif;}
        .yaya-od-head b{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .yaya-od-btn{border:1px solid rgba(22,45,73,.22);background:#fff;color:#162D49;border-radius:8px;padding:6px 10px;font:600 12px system-ui,-apple-system,sans-serif;cursor:pointer;}
        .yaya-od-stage{position:relative;flex:1;min-height:0;background:#eef1f5;}
        .yaya-od-frame{display:block;width:100%;height:100%;border:0;background:#fff;}
        .yaya-od-expand-hit{position:absolute;inset:0;z-index:2;cursor:zoom-in;background:transparent;}
        .yaya-od-modal.full .yaya-od-expand-hit{display:none;}
        .yaya-od-hint{position:absolute;left:50%;bottom:12px;z-index:3;transform:translateX(-50%);padding:6px 10px;border-radius:16px;background:rgba(22,45,73,.82);color:#fff;font:600 11px system-ui,-apple-system,sans-serif;pointer-events:none;}
        .yaya-od-modal.full .yaya-od-hint{display:none;}
        @media(max-width:640px){.yaya-od-overlay{padding:8px}.yaya-od-modal{width:94vw;height:68dvh}.yaya-od-head{height:42px;flex-basis:42px;padding-left:10px}.yaya-od-btn{padding:5px 8px}.yaya-od-modal.full{width:calc(100vw - 6px);height:calc(100dvh - 6px)}}
      `;
      document.head.appendChild(st);
    }

    root.replaceChildren();
    const overlay=document.createElement('div');
    overlay.className='yaya-od-overlay';
    const modal=document.createElement('div');
    modal.className='yaya-od-modal';
    const head=document.createElement('div');
    head.className='yaya-od-head';
    const title=document.createElement('b');
    title.textContent='Pièce jointe OneDrive';
    const external=document.createElement('button');
    external.className='yaya-od-btn';
    external.type='button';
    external.textContent='Ouvrir OneDrive';
    external.onclick=function(e){e.stopPropagation();openExternal(url);};
    const expand=document.createElement('button');
    expand.className='yaya-od-btn';
    expand.type='button';
    expand.textContent='⛶ Agrandir';
    const close=document.createElement('button');
    close.className='yaya-od-btn';
    close.type='button';
    close.textContent='Fermer';
    close.onclick=function(e){e.stopPropagation();root.replaceChildren();};
    head.append(title,external,expand,close);

    const stage=document.createElement('div');
    stage.className='yaya-od-stage';
    const frame=document.createElement('iframe');
    frame.className='yaya-od-frame';
    frame.src=withDownload(url);
    frame.setAttribute('title','Pièce jointe OneDrive');
    frame.setAttribute('loading','eager');
    const hit=document.createElement('div');
    hit.className='yaya-od-expand-hit';
    hit.title='Cliquer pour agrandir';
    const hint=document.createElement('div');
    hint.className='yaya-od-hint';
    hint.textContent='Cliquer pour agrandir';
    stage.append(frame,hit,hint);
    modal.append(head,stage);
    overlay.appendChild(modal);
    root.appendChild(overlay);

    function toggleFull(force){
      const full=typeof force==='boolean'?force:!modal.classList.contains('full');
      modal.classList.toggle('full',full);
      expand.textContent=full?'↙ Réduire':'⛶ Agrandir';
    }
    hit.onclick=function(){toggleFull(true);};
    expand.onclick=function(e){e.stopPropagation();toggleFull();};
    overlay.onclick=function(e){if(e.target===overlay)root.replaceChildren();};
  }

  function install(){
    if(typeof window.voirPiece!=='function'){
      setTimeout(install,150);
      return;
    }
    if(window.voirPiece.__yayaOneDriveExternal)return;

    const previous=window.voirPiece;
    function voirPieceOneDrive(url){
      const u=String(url||'').trim();
      if(u && isOneDriveUrl(u)){
        showOneDriveModal(u);
        return;
      }
      return previous.apply(this,arguments);
    }
    voirPieceOneDrive.__yayaOneDriveExternal=true;
    window.voirPiece=voirPieceOneDrive;
  }

  install();
})();
