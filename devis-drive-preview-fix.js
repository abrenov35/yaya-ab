(function(){
  'use strict';
  if(window.__yayaDevisDrivePreviewDirectV5)return;
  window.__yayaDevisDrivePreviewDirectV5=true;

  function driveId(value){
    const s=String(value||'').trim();
    let m=s.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
    if(m&&m[1])return m[1];
    m=s.match(/[?&]id=([^&#]+)/i);
    return m&&m[1]?decodeURIComponent(m[1]):'';
  }

  function previewDriveUrl(id){
    return 'https://drive.google.com/file/d/'+encodeURIComponent(id)+'/preview';
  }

  function downloadDriveUrl(id){
    return 'https://drive.usercontent.google.com/download?id='+encodeURIComponent(id)+'&export=download&confirm=t';
  }

  function installStyle(){
    if(document.getElementById('yaya-devis-drive-preview-direct-style'))return;
    const s=document.createElement('style');
    s.id='yaya-devis-drive-preview-direct-style';
    s.textContent=`
      #yayaDevisViewer .ydd-actions .ydd-btn.primary[data-add]{background:#0057a8!important;border-color:#0057a8!important;color:#fff!important;opacity:1!important;filter:none!important;box-shadow:0 2px 6px rgba(0,87,168,.25)!important}
      #yayaDevisViewer .ydd-view{position:relative!important;background:#fff!important}
      #yayaDevisViewer .ydd-frame{width:100%!important;height:100%!important;border:0!important;background:#fff!important;display:block!important}
      #yayaDevisViewer .ydd-download{position:absolute;right:10px;bottom:10px;z-index:20;display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:0 14px;border-radius:8px;background:#003d7a;color:#fff!important;text-decoration:none;font-size:12px;font-weight:800;box-shadow:0 2px 8px rgba(15,23,42,.22)}
      #yayaDevisViewer .ydd-download:active{transform:translateY(1px)}
    `;
    document.head.appendChild(s);
  }

  function ensureDownloadButton(view,id){
    if(!view||!id)return;
    view.querySelectorAll('.ydd-open-drive').forEach(function(el){el.remove();});
    let a=view.querySelector('.ydd-download');
    if(!a){
      a=document.createElement('a');
      a.className='ydd-download';
      a.rel='noopener';
      a.textContent='Télécharger';
      a.setAttribute('download','');
      view.appendChild(a);
    }
    a.href=downloadDriveUrl(id);
  }

  function upgradeFrame(frame){
    if(!frame||!frame.isConnected)return;
    const src=String(frame.getAttribute('src')||frame.src||'').trim();
    const id=driveId(src);
    if(!id)return;

    const view=frame.closest('.ydd-view');
    if(!view)return;

    ensureDownloadButton(view,id);

    const preview=previewDriveUrl(id);
    if(String(frame.getAttribute('src')||'')!==preview){
      frame.src=preview;
    }
    frame.setAttribute('allow','autoplay');
    frame.setAttribute('referrerpolicy','no-referrer-when-downgrade');
    frame.dataset.yayaDrivePreview='1';
  }

  function recoverOldError(box){
    if(!box||!box.isConnected)return;
    const view=box.closest('.ydd-view');
    if(!view)return;
    const link=box.querySelector('a[href]');
    const id=driveId(link&&link.href);
    if(!id)return;

    const frame=document.createElement('iframe');
    frame.className='ydd-frame';
    frame.title='Visualisation du devis';
    frame.src=previewDriveUrl(id);
    frame.setAttribute('allow','autoplay');
    frame.setAttribute('referrerpolicy','no-referrer-when-downgrade');
    view.replaceChildren(frame);
    ensureDownloadButton(view,id);
  }

  function scan(root){
    const scope=root&&root.nodeType===1?root:document;
    if(scope.matches&&scope.matches('#yayaDevisViewer .ydd-frame'))upgradeFrame(scope);
    if(scope.matches&&scope.matches('#yayaDevisViewer .ydd-drive-error'))recoverOldError(scope);
    if(scope.querySelectorAll){
      scope.querySelectorAll('#yayaDevisViewer .ydd-frame').forEach(upgradeFrame);
      scope.querySelectorAll('#yayaDevisViewer .ydd-drive-error').forEach(recoverOldError);
    }
  }

  function install(){
    installStyle();
    scan(document);
    new MutationObserver(function(mutations){
      for(const m of mutations){
        for(const node of m.addedNodes){
          if(node&&node.nodeType===1)scan(node);
        }
      }
    }).observe(document.documentElement,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
