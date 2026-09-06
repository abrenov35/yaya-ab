(function(){
  'use strict';

  const STYLE_ID='yaya-piece-preview-toolbar-safe-style';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .piece-preview-overlay{
        padding:var(--yaya-piece-safe-top,8px) 8px 8px!important;
        align-items:center!important;
        justify-content:center!important;
      }
      .piece-preview-overlay > .piece-preview-modal{
        height:auto!important;
        max-height:calc(100vh - var(--yaya-piece-safe-top,8px) - 8px)!important;
        max-height:calc(100dvh - var(--yaya-piece-safe-top,8px) - 8px)!important;
      }
      .piece-preview-overlay .piece-preview-head{
        flex:0 0 auto!important;
        position:relative!important;
        z-index:2!important;
      }
      .piece-preview-overlay .piece-preview-stage{
        flex:1 1 auto!important;
        min-height:0!important;
      }
      @media(max-width:640px){
        .piece-preview-overlay{
          padding:var(--yaya-piece-safe-top,6px) 4px 4px!important;
        }
        .piece-preview-overlay > .piece-preview-modal{
          width:calc(100vw - 8px)!important;
          height:auto!important;
          max-height:calc(100vh - var(--yaya-piece-safe-top,6px) - 4px)!important;
          max-height:calc(100dvh - var(--yaya-piece-safe-top,6px) - 4px)!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function safeTopPx(){
    let top=8;
    const hdr=document.querySelector('.hdr');
    if(hdr){
      const r=hdr.getBoundingClientRect();
      if(r.height>0&&r.bottom>0)top=Math.ceil(r.bottom)+8;
    }
    return Math.max(8,Math.min(top,180));
  }

  function apply(){
    document.querySelectorAll('.piece-preview-overlay').forEach(function(overlay){
      overlay.style.setProperty('--yaya-piece-safe-top',safeTopPx()+'px');
    });
  }

  function install(){
    installStyle();
    apply();
    new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
    window.addEventListener('resize',apply,{passive:true});
    setTimeout(apply,50);
    setTimeout(apply,200);
    setTimeout(apply,600);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
  else install();
})();
