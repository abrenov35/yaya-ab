(function(){
  'use strict';
  if(window.__yayaViewerPageIsolationV1)return;
  window.__yayaViewerPageIsolationV1=true;

  const STYLE_ID='yaya-viewer-page-isolation-style';
  const root=document.getElementById('modalRoot');
  if(!root)return;

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      body.yaya-viewer-page-open{
        overflow:hidden!important;
      }

      body.yaya-viewer-page-open > *:not(#modalRoot):not(#toast):not(script):not(style):not(link){
        visibility:hidden!important;
        pointer-events:none!important;
      }

      body.yaya-viewer-page-open #modalRoot{
        visibility:visible!important;
        pointer-events:auto!important;
        position:fixed!important;
        inset:0!important;
        width:100vw!important;
        height:100dvh!important;
        z-index:2147483647!important;
        margin:0!important;
        padding:0!important;
        overflow:hidden!important;
        background:#fff!important;
      }

      body.yaya-viewer-page-open #modalRoot .yaya-mail-body-overlay,
      body.yaya-viewer-page-open #modalRoot .piece-preview-overlay{
        position:absolute!important;
        inset:0!important;
        width:100%!important;
        height:100%!important;
        margin:0!important;
        padding:0!important;
        overflow:hidden!important;
        background:#fff!important;
        z-index:1!important;
        display:flex!important;
        align-items:stretch!important;
        justify-content:stretch!important;
      }

      body.yaya-viewer-page-open #modalRoot .yaya-mail-body-modal,
      body.yaya-viewer-page-open #modalRoot .piece-preview-modal{
        width:100%!important;
        max-width:none!important;
        height:100%!important;
        max-height:none!important;
        min-width:0!important;
        min-height:0!important;
        margin:0!important;
        border-radius:0!important;
        box-shadow:none!important;
        overflow:hidden!important;
        box-sizing:border-box!important;
        background:#fff!important;
      }

      body.yaya-viewer-page-open #modalRoot .piece-preview-modal{
        display:flex!important;
        flex-direction:column!important;
        padding:6px!important;
      }

      body.yaya-viewer-page-open #modalRoot .piece-preview-head{
        flex:0 0 auto!important;
        margin:0 0 4px!important;
      }

      body.yaya-viewer-page-open #modalRoot .piece-preview-stage{
        flex:1 1 auto!important;
        min-height:0!important;
        width:100%!important;
        height:auto!important;
        max-height:none!important;
        overflow:hidden!important;
        border-radius:0!important;
      }

      body.yaya-viewer-page-open #modalRoot .yaya-mail-body-modal{
        display:flex!important;
        flex-direction:column!important;
        padding:8px 14px 12px!important;
      }

      body.yaya-viewer-page-open #modalRoot .yaya-mail-body-content{
        flex:1 1 auto!important;
        min-height:0!important;
        max-height:none!important;
      }

      @media(max-width:700px){
        body.yaya-viewer-page-open #modalRoot .piece-preview-modal{padding:3px!important}
        body.yaya-viewer-page-open #modalRoot .yaya-mail-body-modal{padding:5px 7px 7px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function isViewerOpen(){
    return !!root.querySelector(
      '.yaya-mail-body-overlay .yaya-mail-body-modal,'+
      '.piece-preview-overlay .piece-preview-modal'
    );
  }

  function sync(){
    const open=isViewerOpen();
    document.body.classList.toggle('yaya-viewer-page-open',open);
    if(!open){
      try{
        document.documentElement.style.removeProperty('overflow');
        document.body.style.removeProperty('overflow');
      }catch(e){}
    }
  }

  installStyle();

  new MutationObserver(function(){
    requestAnimationFrame(sync);
  }).observe(root,{childList:true,subtree:true});

  window.addEventListener('resize',sync,{passive:true});
  sync();
})();