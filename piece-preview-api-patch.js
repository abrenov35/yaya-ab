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
    overlay.className='overlay yaya-drive-direct-overlay';
    overlay.style.cssText='display:flex;align-items:center;justify-content:center;padding:8px;overflow:hidden;';

    const modal=document.createElement('div');
    modal.className='modal yaya-drive-direct-modal';
    modal.style.cssText='display:flex;flex-direction:column;width:min(700px,calc(100vw - 20px));height:min(78dvh,720px);max-width:calc(100vw - 20px);max-height:calc(100dvh - 20px);padding:8px;border-radius:10px;overflow:hidden;';

    const head=document.createElement('div');
    head.style.cssText='flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:32px;margin:0 0 5px;padding:0 2px;';

    const title=document.createElement('strong');
    title.textContent='Pièce jointe';
    title.style.cssText='font-size:14px;';

    const actions=document.createElement('div');
    actions.style.cssText='display:flex;align-items:center;gap:6px;';

    const reduce=document.createElement('button');
    reduce.type='button';
    reduce.textContent='Réduire';
    reduce.style.cssText='display:none;padding:5px 10px;min-height:28px;border-radius:7px;';

    const close=document.createElement('button');
    close.type='button';
    close.textContent='Fermer';
    close.style.cssText='padding:5px 10px;min-height:28px;border-radius:7px;';

    actions.append(reduce,close);
    head.append(title,actions);

    const stage=document.createElement('div');
    stage.className='yaya-drive-direct-stage';
    stage.style.cssText='position:relative;flex:1 1 auto;min-height:0;min-width:0;width:100%;overflow:hidden;border-radius:7px;background:#111;';

    const loading=document.createElement('div');
    loading.textContent='Chargement du document…';
    loading.style.cssText='position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;background:#111;z-index:1;';

    const iframe=document.createElement('iframe');
    iframe.className='yaya-drive-direct-frame';
    iframe.src='https://drive.google.com/file/d/'+encodeURIComponent(id)+'/preview';
    iframe.setAttribute('allow','autoplay');
    iframe.setAttribute('allowfullscreen','true');
    iframe.setAttribute('loading','eager');
    iframe.setAttribute('title','Pièce jointe');
    iframe.style.cssText='position:absolute;inset:0;display:block;width:100%;height:100%;border:0;background:#111;z-index:2;';

    const zoomHit=document.createElement('button');
    zoomHit.type='button';
    zoomHit.setAttribute('aria-label','Agrandir la pièce jointe');
    zoomHit.setAttribute('title','Cliquer pour agrandir');
    zoomHit.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:3;border:0;padding:0;margin:0;background:transparent;cursor:zoom-in;';

    let full=false;

    function setFull(next){
      full=!!next;
      if(full){
        modal.style.setProperty('width','calc(100vw - 8px)','important');
        modal.style.setProperty('height','calc(100dvh - 8px)','important');
        modal.style.setProperty('max-width','none','important');
        modal.style.setProperty('max-height','none','important');
        modal.style.setProperty('padding','4px','important');
        modal.style.setProperty('border-radius','7px','important');
        overlay.style.setProperty('padding','4px','important');
        reduce.style.display='inline-flex';
        zoomHit.style.pointerEvents='none';
        zoomHit.style.cursor='default';
      }else{
        modal.style.setProperty('width','min(700px,calc(100vw - 20px))','important');
        modal.style.setProperty('height','min(78dvh,720px)','important');
        modal.style.setProperty('max-width','calc(100vw - 20px)','important');
        modal.style.setProperty('max-height','calc(100dvh - 20px)','important');
        modal.style.setProperty('padding','8px','important');
        modal.style.setProperty('border-radius','10px','important');
        overlay.style.setProperty('padding','8px','important');
        reduce.style.display='none';
        zoomHit.style.pointerEvents='auto';
        zoomHit.style.cursor='zoom-in';
      }
    }

    iframe.addEventListener('load',function(){loading.style.display='none';},{once:true});
    zoomHit.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();setFull(true);});
    reduce.addEventListener('click',function(){setFull(false);});
    close.addEventListener('click',function(){if(typeof window.closeModal==='function')window.closeModal();});
    overlay.addEventListener('click',function(e){if(e.target===overlay&&typeof window.closeModal==='function')window.closeModal();});

    const onKey=function(e){
      if(e.key!=='Escape'||!root.contains(modal))return;
      if(full){e.preventDefault();setFull(false);}
    };
    window.addEventListener('keydown',onKey);

    const cleanup=new MutationObserver(function(){
      if(!root.contains(modal)){
        window.removeEventListener('keydown',onKey);
        cleanup.disconnect();
      }
    });
    cleanup.observe(root,{childList:true});

    stage.append(loading,iframe,zoomHit);
    modal.append(head,stage);
    overlay.appendChild(modal);
    root.appendChild(overlay);
  }

  window.voirPiece=function(url){
    const value=String(url||'').trim();
    if(!value)return;

    const id=driveIdFromUrl(value);
    if(!id)return previousVoirPiece(value);

    const root=document.getElementById('modalRoot');
    if(!root)return previousVoirPiece(value);

    // Drive direct : aucun Apps Script, aucun Base64, aucun PDF.js.
    // Cette modale est autonome pour éviter les conflits avec les anciens patches.
    makeDriveModal(root,id);
  };
})();
