// V46 — une seule fenêtre d’aperçu, identique partout à l’affichage Achats / Charges
(function(){
  'use strict';

  if(window.__yayaPiecePreviewUnifiedV44Installed)return;
  window.__yayaPiecePreviewUnifiedV44Installed=true;

  // Désactive les anciens comportements de redimensionnement à deux tailles.
  window.__yayaPiecePreviewDisplayFixInstalled=true;

  const ROOT_ID='modalRoot';
  const STYLE_ID='yaya-piece-preview-unified-v44';
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
        background:#fff!important;
        border-radius:10px!important;
        padding:7px!important;
        box-shadow:0 18px 55px rgba(15,31,53,.28)!important;
      }

      #${ROOT_ID} .piece-preview-head{
        flex:0 0 auto!important;
        position:relative!important;
        z-index:20!important;
        min-height:31px!important;
        margin:0 0 5px!important;
        padding:0 3px!important;
        background:#fff!important;
        display:flex!important;
        align-items:center!important;
        justify-content:space-between!important;
      }

      #${ROOT_ID} .piece-preview-stage{
        position:relative!important;
        flex:1 1 auto!important;
        min-height:0!important;
        min-width:0!important;
        width:100%!important;
        overflow:hidden!important;
        border-radius:7px!important;
        background:#eef1f5!important;
      }

      #${ROOT_ID} .piece-image-stage,
      #${ROOT_ID} .piece-drive-pages-stage{
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        padding:4px!important;
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

      #${ROOT_ID} .piece-pdf-pages{
        width:100%!important;
        height:100%!important;
        overflow-y:auto!important;
        overflow-x:hidden!important;
      }

      #${ROOT_ID} .piece-pdf-page{
        box-sizing:border-box!important;
        width:100%!important;
        display:flex!important;
        align-items:flex-start!important;
        justify-content:center!important;
        padding:4px!important;
      }

      #${ROOT_ID} .piece-pdf-page canvas{
        display:block!important;
        max-width:100%!important;
        height:auto!important;
        margin:0 auto!important;
        background:#fff!important;
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

      @media(max-width:640px){
        #${ROOT_ID} .piece-preview-modal{
          padding:5px!important;
          border-radius:8px!important;
        }
        #${ROOT_ID} .piece-preview-head{
          min-height:29px!important;
          margin-bottom:3px!important;
          font-size:13px!important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function viewport(){
    const vv=window.visualViewport;
    return {
      width:Math.max(320,Math.round((vv&&vv.width)||window.innerWidth||document.documentElement.clientWidth||0)),
      height:Math.max(320,Math.round((vv&&vv.height)||window.innerHeight||document.documentElement.clientHeight||0))
    };
  }

  function toolbarBottom(){
    let bottom=0;
    const seen=new Set();
    const selectors=['.hdr','.toolbar','.topbar','header','[data-yaya-toolbar]'];

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

    return bottom>0?bottom:60;
  }

  function apply(modal){
    if(!modal)return;

    const vp=viewport();
    const mobile=vp.width<=640;
    const top=mobile?3:6;
    const side=mobile?3:6;
    const bottom=mobile?3:6;
    const width=Math.max(300,vp.width-(side*2));
    const height=Math.max(300,vp.height-top-bottom);

    const overlay=modal.closest('.piece-preview-overlay');
    if(overlay){
      overlay.style.setProperty('padding',top+'px '+side+'px '+bottom+'px','important');
      overlay.style.setProperty('align-items','flex-start','important');
      overlay.style.setProperty('justify-content','center','important');
      overlay.style.setProperty('overflow','hidden','important');
    }

    modal.dataset.yayaPreviewFullscreen='1';
    modal.dataset.yayaPreviewUnified='v46';
    modal.style.setProperty('width',width+'px','important');
    modal.style.setProperty('height',height+'px','important');
    modal.style.setProperty('max-width','calc(100vw - '+(side*2)+'px)','important');
    modal.style.setProperty('max-height',height+'px','important');
    modal.style.setProperty('min-height','0','important');
    modal.style.setProperty('margin','0 auto','important');
    modal.style.setProperty('overflow','hidden','important');

    const stage=modal.querySelector('.piece-preview-stage');
    if(stage){
      stage.style.setProperty('min-height','0','important');
      stage.style.setProperty('width','100%','important');
      stage.style.setProperty('overflow','hidden','important');
    }

    // Certains PDF (notamment issus du module Commande / OneDrive) sont
    // dessinés avant que la grande fenêtre soit appliquée. On force alors
    // un unique recalcul du PDF après mise en plein format, exactement comme
    // pour les pièces ouvertes depuis Achats / Charges.
    if(
      typeof modal.__yayaRedrawPdf==='function' &&
      modal.dataset.yayaUnifiedPdfRedrawn!=='1'
    ){
      modal.dataset.yayaUnifiedPdfRedrawn='1';
      requestAnimationFrame(function(){
        try{
          if(modal.isConnected)modal.__yayaRedrawPdf();
        }catch(e){}
      });
    }
  }

  function scan(){
    const root=document.getElementById(ROOT_ID);
    if(!root)return;
    root.querySelectorAll('.piece-preview-modal').forEach(apply);
  }

  function schedule(){
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

    new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
    window.addEventListener('resize',schedule,{passive:true});
    window.addEventListener('orientationchange',schedule,{passive:true});
    if(window.visualViewport){
      window.visualViewport.addEventListener('resize',schedule,{passive:true});
    }

    scan();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',install,{once:true});
  }else{
    install();
  }
})();
