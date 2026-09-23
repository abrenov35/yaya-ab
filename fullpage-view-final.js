(function(){
  'use strict';
  if(window.__yayaFullpageViewFinalV1)return;
  window.__yayaFullpageViewFinalV1=true;

  const STYLE_ID='yaya-fullpage-view-final-style';
  const root=document.getElementById('modalRoot');
  if(!root)return;

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      #modalRoot.yaya-fullpage-view-active{
        position:fixed!important;
        inset:0!important;
        width:100vw!important;
        height:100dvh!important;
        z-index:2147483646!important;
        margin:0!important;
        padding:0!important;
        overflow:hidden!important;
        pointer-events:auto!important;
      }

      #modalRoot.yaya-fullpage-view-active .piece-preview-overlay,
      #modalRoot.yaya-fullpage-view-active .yaya-mail-body-overlay{
        position:absolute!important;
        inset:0!important;
        width:100vw!important;
        height:100dvh!important;
        z-index:1!important;
        margin:0!important;
        padding:0!important;
        border:0!important;
        border-radius:0!important;
        background:#fff!important;
        display:flex!important;
        align-items:stretch!important;
        justify-content:stretch!important;
        overflow:hidden!important;
      }

      #modalRoot.yaya-fullpage-view-active .piece-preview-modal,
      #modalRoot.yaya-fullpage-view-active .yaya-mail-body-modal{
        position:relative!important;
        inset:auto!important;
        width:100vw!important;
        min-width:100vw!important;
        max-width:none!important;
        height:100dvh!important;
        min-height:100dvh!important;
        max-height:none!important;
        margin:0!important;
        border-radius:0!important;
        box-shadow:none!important;
        overflow:hidden!important;
        box-sizing:border-box!important;
        background:#fff!important;
        display:flex!important;
        flex-direction:column!important;
      }

      #modalRoot.yaya-fullpage-view-active .piece-preview-modal{
        padding:6px!important;
      }

      #modalRoot.yaya-fullpage-view-active .piece-preview-head{
        flex:0 0 auto!important;
        min-height:48px!important;
        margin:0 0 4px!important;
        box-sizing:border-box!important;
        background:#fff!important;
      }

      #modalRoot.yaya-fullpage-view-active .piece-preview-stage{
        flex:1 1 auto!important;
        min-width:0!important;
        min-height:0!important;
        width:100%!important;
        height:auto!important;
        max-height:none!important;
        margin:0!important;
        border-radius:0!important;
        overflow:hidden!important;
        box-sizing:border-box!important;
      }

      #modalRoot.yaya-fullpage-view-active .piece-pdf-pages{
        height:100%!important;
        max-height:none!important;
      }

      #modalRoot.yaya-fullpage-view-active .yaya-mail-body-modal{
        padding:8px 14px 12px!important;
      }

      #modalRoot.yaya-fullpage-view-active .yaya-mail-body-content{
        flex:1 1 auto!important;
        min-height:0!important;
        max-height:none!important;
      }

      @media(max-width:700px){
        #modalRoot.yaya-fullpage-view-active .piece-preview-modal{padding:3px!important}
        #modalRoot.yaya-fullpage-view-active .yaya-mail-body-modal{padding:5px 7px 7px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function forcePiece(modal){
    const overlay=modal.closest('.piece-preview-overlay,.overlay');
    if(overlay){
      overlay.style.setProperty('position','absolute','important');
      overlay.style.setProperty('inset','0','important');
      overlay.style.setProperty('width','100vw','important');
      overlay.style.setProperty('height','100dvh','important');
      overlay.style.setProperty('padding','0','important');
      overlay.style.setProperty('margin','0','important');
      overlay.style.setProperty('overflow','hidden','important');
      overlay.style.setProperty('background','#fff','important');
      overlay.style.setProperty('align-items','stretch','important');
      overlay.style.setProperty('justify-content','stretch','important');
    }

    modal.dataset.yayaPreviewFullscreen='1';
    modal.style.setProperty('position','relative','important');
    modal.style.setProperty('width','100vw','important');
    modal.style.setProperty('height','100dvh','important');
    modal.style.setProperty('max-width','none','important');
    modal.style.setProperty('max-height','none','important');
    modal.style.setProperty('min-width','100vw','important');
    modal.style.setProperty('min-height','100dvh','important');
    modal.style.setProperty('margin','0','important');
    modal.style.setProperty('border-radius','0','important');
    modal.style.setProperty('box-shadow','none','important');
    modal.style.setProperty('overflow','hidden','important');
    modal.style.setProperty('display','flex','important');
    modal.style.setProperty('flex-direction','column','important');

    const head=modal.querySelector('.piece-preview-head');
    if(head){
      head.style.setProperty('flex','0 0 auto','important');
      head.style.setProperty('min-height','48px','important');
      head.style.setProperty('margin','0 0 4px','important');
    }

    const stage=modal.querySelector('.piece-preview-stage');
    if(stage){
      stage.style.setProperty('flex','1 1 auto','important');
      stage.style.setProperty('min-width','0','important');
      stage.style.setProperty('min-height','0','important');
      stage.style.setProperty('width','100%','important');
      stage.style.setProperty('height','auto','important');
      stage.style.setProperty('max-height','none','important');
      stage.style.setProperty('overflow','hidden','important');
      stage.style.setProperty('border-radius','0','important');
    }
  }

  function sync(){
    const mail=root.querySelector('.yaya-mail-body-overlay .yaya-mail-body-modal');
    const piece=root.querySelector('.piece-preview-overlay .piece-preview-modal,.overlay .piece-preview-modal');
    const active=!!(mail||piece);

    root.classList.toggle('yaya-fullpage-view-active',active);

    if(active){
      try{
        document.documentElement.style.setProperty('overflow','hidden','important');
        document.body.style.setProperty('overflow','hidden','important');
      }catch(e){}
      if(piece)forcePiece(piece);
    }else{
      try{
        document.documentElement.style.removeProperty('overflow');
        document.body.style.removeProperty('overflow');
      }catch(e){}
    }
  }

  installStyle();
  const obs=new MutationObserver(function(){requestAnimationFrame(sync);});
  obs.observe(root,{childList:true,subtree:true});
  window.addEventListener('resize',sync,{passive:true});
  sync();
})();