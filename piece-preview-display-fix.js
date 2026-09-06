(function(){
  'use strict';

  if(window.__yayaPiecePreviewDisplayFixV6Installed)return;
  window.__yayaPiecePreviewDisplayFixV6Installed=true;
  window.__yayaPiecePreviewDisplayFixInstalled=true;

  const ROOT_ID='modalRoot';
  const STYLE_ID='yaya-piece-preview-display-fix-v6';
  let scanTimer=0;

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #${ROOT_ID} .piece-preview-overlay{
        box-sizing:border-box!important;
        align-items:flex-start!important;
        justify-content:center!important;
        overflow:hidden!important;
      }
      #${ROOT_ID} .piece-preview-modal{
        box-sizing:border-box!important;
        display:flex!important;
        flex-direction:column!important;
        overflow:hidden!important;
        margin:0 auto!important;
      }
      #${ROOT_ID} .piece-preview-head{
        flex:0 0 auto!important;
        position:relative!important;
        z-index:20!important;
        background:#fff!important;
      }
      #${ROOT_ID} .piece-preview-stage{
        flex:1 1 auto!important;
        min-height:0!important;
        min-width:0!important;
        width:100%!important;
        overflow:hidden!important;
      }
      #${ROOT_ID} .piece-image-stage,
      #${ROOT_ID} .piece-drive-pages-stage,
      #${ROOT_ID} .piece-pdf-page{
        box-sizing:border-box!important;
      }
      #${ROOT_ID} .piece-image-stage,
      #${ROOT_ID} .piece-drive-pages-stage{
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
      }
      #${ROOT_ID} .piece-image-stage img,
      #${ROOT_ID} .piece-drive-pages-stage img{
        display:block!important;
        width:100%!important;
        height:100%!important;
        max-width:100%!important;
        max-height:100%!important;
        object-fit:contain!important;
        object-position:center!important;
        margin:auto!important;
      }
      #${ROOT_ID} .piece-pdf-page canvas{
        display:block!important;
        max-width:100%!important;
        margin-left:auto!important;
        margin-right:auto!important;
      }
      #${ROOT_ID} .piece-page-indicator{
        pointer-events:none!important;
      }
      #${ROOT_ID} .piece-preview-stage,
      #${ROOT_ID} .piece-pdf-page,
      #${ROOT_ID} .piece-pdf-page canvas,
      #${ROOT_ID} .piece-image-stage img,
      #${ROOT_ID} .piece-drive-pages-stage img{
        cursor:default!important;
      }
      #${ROOT_ID} .yaya-drive-zoom-hit{
        pointer-events:none!important;
        cursor:default!important;
      }
    `;
    document.head.appendChild(style);
  }

  function viewportSize(){
    const vv=window.visualViewport;
    return {
      width:Math.max(320,Math.round((vv&&vv.width)||window.innerWidth||document.documentElement.clientWidth||0)),
      height:Math.max(320,Math.round((vv&&vv.height)||window.innerHeight||document.documentElement.clientHeight||0))
    };
  }

  function toolbarBottom(){
    const selectors=['.hdr','.toolbar','.topbar','header','[data-yaya-toolbar]'];
    let bottom=0;
    const seen=new Set();

    selectors.forEach(function(selector){
      document.querySelectorAll(selector).forEach(function(el){
        if(!el||seen.has(el))return;
        seen.add(el);

        const cs=getComputedStyle(el);
        if(cs.display==='none'||cs.visibility==='hidden')return;

        const r=el.getBoundingClientRect();
        if(r.width<=0||r.height<=0||r.bottom<=0||r.top>20)return;

        const fixedOrSticky=cs.position==='fixed'||cs.position==='sticky';
        if(selector!=='.hdr'&&!fixedOrSticky)return;
        bottom=Math.max(bottom,Math.ceil(r.bottom));
      });
    });

    return bottom>0?bottom:62;
  }

  function geometry(){
    const vp=viewportSize();
    const mobile=vp.width<=640;
    const top=toolbarBottom()+(mobile?6:10);
    const bottom=mobile?4:8;
    const side=mobile?4:8;
    const availableH=Math.max(240,vp.height-top-bottom);

    return {
      mobile,
      top,
      bottom,
      side,
      width:mobile
        ?Math.max(300,vp.width-(side*2))
        :Math.min(1100,Math.max(320,vp.width-20)),
      height:availableH
    };
  }

  function applySingleView(modal){
    if(!modal)return;

    const g=geometry();
    const overlay=modal.closest('.piece-preview-overlay');

    // Il n'existe plus deux tailles d'aperçu : on démarre directement
    // dans l'ancien affichage n°2 afin d'éviter tout redimensionnement intermédiaire.
    modal.dataset.yayaPreviewFullscreen='1';
    modal.dataset.yayaDisplayMode='single-v6';

    if(overlay){
      overlay.style.setProperty('box-sizing','border-box','important');
      overlay.style.setProperty('align-items','flex-start','important');
      overlay.style.setProperty('justify-content','center','important');
      overlay.style.setProperty('padding',g.top+'px '+g.side+'px '+g.bottom+'px','important');
      overlay.style.setProperty('overflow','hidden','important');
    }

    modal.style.setProperty('box-sizing','border-box','important');
    modal.style.setProperty('width',g.width+'px','important');
    modal.style.setProperty('height',g.height+'px','important');
    modal.style.setProperty('max-width',g.mobile?'calc(100vw - 8px)':'calc(100vw - 20px)','important');
    modal.style.setProperty('max-height',g.height+'px','important');
    modal.style.setProperty('min-height','0','important');
    modal.style.setProperty('margin','0 auto','important');
    modal.style.setProperty('overflow','hidden','important');

    if(g.mobile){
      modal.style.setProperty('padding','5px','important');
      modal.style.setProperty('border-radius','8px','important');
    }

    const stage=modal.querySelector('.piece-preview-stage');
    if(stage){
      stage.style.setProperty('min-height','0','important');
      stage.style.setProperty('width','100%','important');
      stage.style.setProperty('overflow','hidden','important');
      stage.style.setProperty('cursor','default','important');
    }

    modal.querySelectorAll('.piece-pdf-page,.piece-pdf-page canvas,.piece-image-stage img,.piece-drive-pages-stage img').forEach(function(el){
      el.style.setProperty('cursor','default','important');
    });

    const driveHit=modal.querySelector('.yaya-drive-zoom-hit');
    if(driveHit){
      driveHit.style.setProperty('pointer-events','none','important');
      driveHit.style.setProperty('cursor','default','important');
    }
  }

  function scan(){
    const root=document.getElementById(ROOT_ID);
    if(!root)return;
    root.querySelectorAll('.piece-preview-modal').forEach(applySingleView);
  }

  function scheduleScan(){
    clearTimeout(scanTimer);
    scanTimer=setTimeout(scan,0);
  }

  function install(){
    installStyle();

    const root=document.getElementById(ROOT_ID);
    if(!root){
      setTimeout(install,120);
      return;
    }

    new MutationObserver(scheduleScan).observe(root,{childList:true,subtree:true});

    window.addEventListener('resize',scheduleScan,{passive:true});
    window.addEventListener('orientationchange',scheduleScan,{passive:true});
    if(window.visualViewport){
      window.visualViewport.addEventListener('resize',scheduleScan,{passive:true});
    }

    scan();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
