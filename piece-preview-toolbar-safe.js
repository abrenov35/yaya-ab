(function(){
  'use strict';

  const STYLE_ID='yaya-piece-preview-toolbar-safe-style-v2';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .piece-preview-overlay{
        box-sizing:border-box!important;
        align-items:flex-start!important;
        justify-content:center!important;
        padding:var(--yaya-piece-safe-top,72px) 8px 8px!important;
        overflow:hidden!important;
      }

      .piece-preview-overlay > .piece-preview-modal{
        box-sizing:border-box!important;
        margin:0 auto!important;
        width:min(90vw,900px)!important;
        height:calc(100vh - var(--yaya-piece-safe-top,72px) - 8px)!important;
        height:calc(100dvh - var(--yaya-piece-safe-top,72px) - 8px)!important;
        max-height:calc(100vh - var(--yaya-piece-safe-top,72px) - 8px)!important;
        max-height:calc(100dvh - var(--yaya-piece-safe-top,72px) - 8px)!important;
        min-height:0!important;
        overflow:hidden!important;
      }

      .piece-preview-overlay .piece-preview-head{
        flex:0 0 auto!important;
        position:relative!important;
        z-index:20!important;
        margin-top:0!important;
        background:#fff!important;
      }

      .piece-preview-overlay .piece-preview-head button{
        position:relative!important;
        z-index:21!important;
      }

      .piece-preview-overlay .piece-preview-stage{
        flex:1 1 auto!important;
        min-height:0!important;
        overflow:hidden!important;
      }

      @media(max-width:640px){
        .piece-preview-overlay{
          padding:var(--yaya-piece-safe-top,64px) 4px 4px!important;
        }

        .piece-preview-overlay > .piece-preview-modal{
          width:calc(100vw - 8px)!important;
          height:calc(100vh - var(--yaya-piece-safe-top,64px) - 4px)!important;
          height:calc(100dvh - var(--yaya-piece-safe-top,64px) - 4px)!important;
          max-height:calc(100vh - var(--yaya-piece-safe-top,64px) - 4px)!important;
          max-height:calc(100dvh - var(--yaya-piece-safe-top,64px) - 4px)!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function visibleTopBarBottom(){
    let bottom=0;
    const selectors=['.hdr','.toolbar','.topbar','header','[data-yaya-toolbar]'];
    const seen=new Set();

    selectors.forEach(function(selector){
      document.querySelectorAll(selector).forEach(function(el){
        if(!el||seen.has(el))return;
        seen.add(el);

        const cs=getComputedStyle(el);
        if(cs.display==='none'||cs.visibility==='hidden')return;

        const r=el.getBoundingClientRect();
        if(r.width<=0||r.height<=0)return;
        if(r.bottom<=0||r.top>20)return;

        const fixedOrSticky=cs.position==='fixed'||cs.position==='sticky';
        if(selector!=='.hdr'&&!fixedOrSticky)return;

        bottom=Math.max(bottom,Math.ceil(r.bottom));
      });
    });

    return bottom;
  }

  function safeTopPx(){
    const barBottom=visibleTopBarBottom();
    const top=(barBottom>0?barBottom:60)+8;
    return Math.max(56,Math.min(top,190));
  }

  function apply(){
    const safeTop=safeTopPx()+'px';
    document.querySelectorAll('.piece-preview-overlay').forEach(function(overlay){
      overlay.style.setProperty('--yaya-piece-safe-top',safeTop);
    });
  }

  function install(){
    installStyle();
    apply();

    new MutationObserver(function(){
      apply();
    }).observe(document.documentElement,{childList:true,subtree:true});

    window.addEventListener('resize',apply,{passive:true});
    window.addEventListener('orientationchange',apply,{passive:true});

    setTimeout(apply,0);
    setTimeout(apply,50);
    setTimeout(apply,200);
    setTimeout(apply,600);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
  else install();
})();
