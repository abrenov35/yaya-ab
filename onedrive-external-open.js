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

  function withDownload(url){
    try{
      const u=new URL(String(url||''),window.location.href);
      u.searchParams.set('download','1');
      return u.toString();
    }catch(e){
      const s=String(url||'');
      return s+(s.includes('?')?'&':'?')+'download=1';
    }
  }

  function personalEmbed(url){
    try{
      const u=new URL(String(url||''),window.location.href);
      if((u.hostname||'').toLowerCase()!=='onedrive.live.com')return '';
      if(u.pathname.toLowerCase().includes('/embed'))return u.toString();
      const resid=u.searchParams.get('resid')||u.searchParams.get('id')||'';
      if(!resid)return '';
      const e=new URL('https://onedrive.live.com/embed');
      e.searchParams.set('resid',resid);
      const auth=u.searchParams.get('authkey');
      if(auth)e.searchParams.set('authkey',auth);
      e.searchParams.set('em','2');
      return e.toString();
    }catch(e){return '';}
  }

  function previewCandidates(url){
    const out=[];
    const add=v=>{if(v&&!out.includes(v))out.push(v);};
    const directEmbed=personalEmbed(url);
    add(directEmbed);

    // Lecteur Google : très fiable pour les PDF publics stockés sur OneDrive.
    // Il récupère lui-même la pièce puis l'affiche dans l'iframe, ce qui évite
    // la plupart des blocages CORS/X-Frame rencontrés avec un lien OneDrive brut.
    const download=withDownload(url);
    add('https://docs.google.com/gview?embedded=1&url='+encodeURIComponent(download));

    // Lecteur Office : utile pour Word / Excel / PowerPoint partagés publiquement.
    add('https://view.officeapps.live.com/op/embed.aspx?src='+encodeURIComponent(download));

    // Dernier essai direct : permet à une session Microsoft déjà authentifiée
    // de fonctionner lorsque le document n'est pas accessible publiquement.
    try{
      const u=new URL(String(url||''),window.location.href);
      if((u.hostname||'').toLowerCase().endsWith('.sharepoint.com')){
        u.searchParams.set('web','1');
        add(u.toString());
      }else{
        add(String(url||''));
      }
    }catch(e){add(String(url||''));}
    return out;
  }

  function installStyle(){
    if(document.getElementById('yaya-onedrive-modal-style-v2'))return;
    const st=document.createElement('style');
    st.id='yaya-onedrive-modal-style-v2';
    st.textContent=`
      .yaya-od-overlay{position:fixed;inset:0;z-index:10000;background:rgba(22,45,73,.48);display:flex;align-items:center;justify-content:center;padding:8px;}
      .yaya-od-modal{width:min(92vw,960px);height:min(90dvh,820px);background:#fff;border-radius:12px;box-shadow:0 18px 55px rgba(0,0,0,.30);overflow:hidden;display:flex;flex-direction:column;}
      .yaya-od-head{height:48px;flex:0 0 48px;display:flex;align-items:center;gap:8px;padding:0 10px 0 14px;border-bottom:1px solid rgba(22,45,73,.12);color:#162D49;font:600 13px system-ui,-apple-system,sans-serif;}
      .yaya-od-head b{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .yaya-od-btn{border:1px solid rgba(22,45,73,.22);background:#fff;color:#162D49;border-radius:8px;padding:7px 11px;font:600 12px system-ui,-apple-system,sans-serif;cursor:pointer;}
      .yaya-od-open{background:#174f86;color:#fff;border-color:#174f86;}
      .yaya-od-stage{position:relative;flex:1 1 auto;min-height:0;background:#eef1f5;overflow:hidden;}
      .yaya-od-frame{position:absolute;inset:0;width:100%;height:100%;border:0;background:#fff;}
      .yaya-od-loading{position:absolute;inset:0;z-index:2;display:flex;align-items:center;justify-content:center;padding:20px;background:#eef1f5;color:#162D49;text-align:center;font:600 13px system-ui,-apple-system,sans-serif;}
      .yaya-od-tools{position:absolute;right:10px;bottom:10px;z-index:3;display:flex;gap:7px;}
      .yaya-od-switch{border:1px solid rgba(22,45,73,.22);background:rgba(255,255,255,.94);color:#162D49;border-radius:8px;padding:6px 10px;font:600 11px system-ui,-apple-system,sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.12);}
      @media(max-width:640px){.yaya-od-overlay{padding:3px}.yaya-od-modal{width:calc(100vw - 6px);height:calc(100dvh - 6px);max-width:none;max-height:none;border-radius:8px}.yaya-od-head{height:44px;flex-basis:44px;padding-left:10px}.yaya-od-btn{padding:6px 9px}.yaya-od-tools{right:6px;bottom:6px}}
    `;
    document.head.appendChild(st);
  }

  function showOneDriveModal(url){
    const root=document.getElementById('modalRoot');
    if(!root){openExternal(url);return;}
    installStyle();

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
    external.className='yaya-od-btn yaya-od-open';
    external.type='button';
    external.textContent='Ouvrir';
    external.onclick=function(e){e.stopPropagation();openExternal(url);};
    const close=document.createElement('button');
    close.className='yaya-od-btn';
    close.type='button';
    close.textContent='Fermer';
    close.onclick=function(e){e.stopPropagation();root.replaceChildren();};
    head.append(title,external,close);

    const stage=document.createElement('div');
    stage.className='yaya-od-stage';
    const loading=document.createElement('div');
    loading.className='yaya-od-loading';
    loading.textContent='Chargement de la pièce OneDrive…';
    const frame=document.createElement('iframe');
    frame.className='yaya-od-frame';
    frame.title='Aperçu de la pièce jointe OneDrive';
    frame.allow='fullscreen';
    frame.referrerPolicy='no-referrer-when-downgrade';

    const tools=document.createElement('div');
    tools.className='yaya-od-tools';
    const next=document.createElement('button');
    next.type='button';
    next.className='yaya-od-switch';
    next.textContent='Autre aperçu';
    tools.appendChild(next);
    stage.append(loading,frame,tools);
    modal.append(head,stage);
    overlay.appendChild(modal);
    root.appendChild(overlay);

    overlay.onclick=function(e){if(e.target===overlay)root.replaceChildren();};

    const candidates=previewCandidates(url);
    let index=0;
    let loadTimer=null;

    function loadCandidate(pos){
      if(!candidates.length)return;
      index=(pos+candidates.length)%candidates.length;
      loading.style.display='flex';
      loading.textContent='Chargement de la pièce OneDrive…';
      frame.src='about:blank';
      requestAnimationFrame(()=>{frame.src=candidates[index];});
      clearTimeout(loadTimer);
      loadTimer=setTimeout(()=>{
        if(root.contains(modal))loading.style.display='none';
      },4500);
    }

    frame.addEventListener('load',function(){
      clearTimeout(loadTimer);
      setTimeout(()=>{if(root.contains(modal))loading.style.display='none';},180);
    });
    next.onclick=function(e){e.preventDefault();e.stopPropagation();loadCandidate(index+1);};

    loadCandidate(0);
  }

  function install(){
    if(typeof window.voirPiece!=='function'){
      setTimeout(install,150);
      return;
    }
    if(window.voirPiece.__yayaOneDriveIntegrated)return;

    const previous=window.voirPiece;
    function voirPieceOneDrive(url){
      const u=String(url||'').trim();
      if(u && isOneDriveUrl(u)){
        showOneDriveModal(u);
        return;
      }
      return previous.apply(this,arguments);
    }
    voirPieceOneDrive.__yayaOneDriveIntegrated=true;
    window.voirPiece=voirPieceOneDrive;
  }

  install();
})();
