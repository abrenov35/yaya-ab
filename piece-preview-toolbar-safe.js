(function(){
  'use strict';

  if(window.__yayaPiecePreviewToolbarSafeInstalled)return;
  window.__yayaPiecePreviewToolbarSafeInstalled=true;

  const STYLE_ID='yaya-piece-preview-toolbar-safe-style-v3';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .piece-preview-overlay{
        box-sizing:border-box!important;
        align-items:flex-start!important;
        justify-content:center!important;
        overflow:hidden!important;
      }
      .piece-preview-overlay > .piece-preview-modal{
        box-sizing:border-box!important;
        margin:0 auto!important;
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
    const top=(barBottom>0?barBottom:60)+10;
    return Math.max(58,Math.min(top,190));
  }

  function apply(){
    const top=safeTopPx();
    const bottom=8;
    const available='calc(100dvh - '+top+'px - '+bottom+'px)';

    document.querySelectorAll('.piece-preview-overlay').forEach(function(overlay){
      overlay.style.setProperty('box-sizing','border-box','important');
      overlay.style.setProperty('align-items','flex-start','important');
      overlay.style.setProperty('justify-content','center','important');
      overlay.style.setProperty('padding',top+'px 8px '+bottom+'px','important');
      overlay.style.setProperty('overflow','hidden','important');
      overlay.style.setProperty('--yaya-piece-safe-top',top+'px');

      const modal=overlay.querySelector(':scope > .piece-preview-modal');
      if(!modal)return;

      modal.style.setProperty('box-sizing','border-box','important');
      modal.style.setProperty('margin','0 auto','important');
      modal.style.setProperty('width','min(90vw,900px)','important');
      modal.style.setProperty('height',available,'important');
      modal.style.setProperty('max-height',available,'important');
      modal.style.setProperty('min-height','0','important');
      modal.style.setProperty('overflow','hidden','important');
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
