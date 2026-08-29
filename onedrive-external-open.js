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
        .yaya-od-modal{width:min(560px,92vw);background:#fff;border-radius:14px;box-shadow:0 18px 55px rgba(0,0,0,.30);overflow:hidden;}
        .yaya-od-head{height:48px;display:flex;align-items:center;gap:8px;padding:0 10px 0 14px;border-bottom:1px solid rgba(22,45,73,.12);color:#162D49;font:600 13px system-ui,-apple-system,sans-serif;}
        .yaya-od-head b{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .yaya-od-btn{border:1px solid rgba(22,45,73,.22);background:#fff;color:#162D49;border-radius:8px;padding:7px 11px;font:600 12px system-ui,-apple-system,sans-serif;cursor:pointer;}
        .yaya-od-stage{min-height:220px;padding:28px;display:flex;align-items:center;justify-content:center;background:#f6f8fb;text-align:center;}
        .yaya-od-card{display:flex;flex-direction:column;align-items:center;gap:14px;max-width:360px;color:#162D49;font:500 14px system-ui,-apple-system,sans-serif;line-height:1.4;}
        .yaya-od-icon{font-size:42px;line-height:1;}
        .yaya-od-open{border:0;background:#174f86;color:#fff;border-radius:10px;padding:11px 18px;font:700 14px system-ui,-apple-system,sans-serif;cursor:pointer;box-shadow:0 4px 12px rgba(23,79,134,.20);}
        .yaya-od-note{font-size:12px;color:#60758b;}
        @media(max-width:640px){.yaya-od-overlay{padding:10px}.yaya-od-modal{width:calc(100vw - 20px)}.yaya-od-stage{min-height:180px;padding:24px 18px}.yaya-od-head{height:44px;padding-left:10px}.yaya-od-btn{padding:6px 9px}}
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
    const close=document.createElement('button');
    close.className='yaya-od-btn';
    close.type='button';
    close.textContent='Fermer';
    close.onclick=function(e){e.stopPropagation();root.replaceChildren();};
    head.append(title,close);

    const stage=document.createElement('div');
    stage.className='yaya-od-stage';
    const card=document.createElement('div');
    card.className='yaya-od-card';
    const icon=document.createElement('div');
    icon.className='yaya-od-icon';
    icon.textContent='☁️';
    const text=document.createElement('div');
    text.textContent='L’aperçu OneDrive intégré peut être bloqué par le navigateur. Ouvrez directement le document.';
    const open=document.createElement('button');
    open.className='yaya-od-open';
    open.type='button';
    open.textContent='Ouvrir le document';
    open.onclick=function(e){e.stopPropagation();openExternal(url);};
    const note=document.createElement('div');
    note.className='yaya-od-note';
    note.textContent='Fonctionne sur iPhone, iPad et PC.';
    card.append(icon,text,open,note);
    stage.appendChild(card);
    modal.append(head,stage);
    overlay.appendChild(modal);
    root.appendChild(overlay);

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
