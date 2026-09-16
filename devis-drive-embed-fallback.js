(function(){
  'use strict';
  if(window.__yayaDevisDriveEmbedFallbackV1)return;
  window.__yayaDevisDriveEmbedFallbackV1=true;

  function driveId(value){
    const s=String(value||'').trim();
    let m=s.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
    if(m)return m[1];
    m=s.match(/[?&]id=([^&#]+)/i);
    return m?decodeURIComponent(m[1]):'';
  }

  function installStyle(){
    if(document.getElementById('yaya-devis-drive-embed-fallback-style'))return;
    const s=document.createElement('style');
    s.id='yaya-devis-drive-embed-fallback-style';
    s.textContent=`
      #yayaDevisViewer .ydd-drive-embed-fallback{width:100%;height:100%;border:0;background:#fff;display:block}
    `;
    document.head.appendChild(s);
  }

  function upgrade(){
    document.querySelectorAll('#yayaDevisViewer .ydd-drive-error').forEach(function(box){
      const view=box.closest('.ydd-view');
      if(!view||view.dataset.yayaDriveEmbedFallback==='1')return;
      const link=box.querySelector('a[href]');
      const url=String(link&&link.href||'');
      const id=driveId(url);
      if(!id)return;

      view.dataset.yayaDriveEmbedFallback='1';
      const frame=document.createElement('iframe');
      frame.className='ydd-drive-embed-fallback';
      frame.title='Aperçu du devis';
      frame.src='https://drive.google.com/file/d/'+encodeURIComponent(id)+'/preview';
      frame.setAttribute('allow','autoplay');
      frame.setAttribute('referrerpolicy','no-referrer-when-downgrade');
      view.replaceChildren(frame);
    });
  }

  function install(){
    installStyle();
    upgrade();
    new MutationObserver(upgrade).observe(document.documentElement,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
