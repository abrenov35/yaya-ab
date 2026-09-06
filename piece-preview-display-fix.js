(function(){
  'use strict';

  if(window.__yayaPiecePreviewDisplayFixV4Installed)return;
  window.__yayaPiecePreviewDisplayFixV4Installed=true;
  window.__yayaPiecePreviewDisplayFixInstalled=true;

  const ROOT_ID='modalRoot';
  const STYLE_ID='yaya-piece-preview-display-fix-v4';

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
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        box-sizing:border-box!important;
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
        max-height:100%!important;
        margin:auto!important;
      }
      #${ROOT_ID} .piece-page-indicator{
        pointer-events:none!important;
      }
      #${ROOT_ID} .piece-preview-modal[data-yaya-preview-fullscreen="0"] .piece-pdf-page,
      #${ROOT_ID} .piece-preview-modal:not([data-yaya-preview-fullscreen]) .piece-pdf-page{
        align-items:center!important;
        justify-content:center!important;
      }
      #${ROOT_ID} .piece-preview-modal[data-yaya-preview-fullscreen="1"] .piece-pdf-page{
        justify-content:center!important;
      }
    `;
    document.head.appendChild(style);
  }

  function toolbarBottom(){
    const hdr=document.querySelector('.hdr');
    if(!hdr)return 62;
    const r=hdr.getBoundingClientRect();
    return r.height>0&&r.bottom>0?Math.ceil(r.bottom):62;
  }

  function availableGeometry(){
    const top=toolbarBottom()+10;
    const bottom=8;
    const vh=Math.max(320,window.innerHeight||document.documentElement.clientHeight||0);
    return {
      top:top,
      bottom:bottom,
      height:Math.max(240,vh-top-bottom)
    };
  }

  function contentReady(modal){
    if(!modal)return false;

    const img=modal.querySelector('.piece-image-stage img,.piece-drive-pages-stage img');
    if(img){
      return !!(img.complete&&img.naturalWidth>20&&img.naturalHeight>20);
    }

    const canvas=modal.querySelector('.piece-pdf-page canvas');
    if(canvas){
      return canvas.width>20&&canvas.height>20;
    }

    const frame=modal.querySelector('.yaya-drive-fit-frame');
    if(frame){
      const r=frame.getBoundingClientRect();
      return r.width>120&&r.height>120;
    }

    return false;
  }

  function contentRatio(modal){
    if(!modal)return 0;

    const img=modal.querySelector('.piece-image-stage img,.piece-drive-pages-stage img');
    if(img&&img.naturalWidth>20&&img.naturalHeight>20){
      return Math.max(.35,Math.min(2.8,img.naturalWidth/img.naturalHeight));
    }

    const canvas=modal.querySelector('.piece-pdf-page canvas');
    if(canvas&&canvas.width>20&&canvas.height>20){
      return Math.max(.35,Math.min(2.8,canvas.width/canvas.height));
    }

    const frame=modal.querySelector('.yaya-drive-fit-frame');
    if(frame){
      const r=frame.getBoundingClientRect();
      if(r.width>120&&r.height>120){
        return Math.max(.35,Math.min(2.8,r.width/r.height));
      }
    }

    return 0;
  }

  function normalGeometryFromContent(modal){
    if(!modal||!contentReady(modal))return null;

    const ratio=contentRatio(modal);
    if(!ratio)return null;

    const g=availableGeometry();
    const vw=Math.max(320,window.innerWidth||document.documentElement.clientWidth||0);
    const maxW=Math.max(320,Math.min(900,vw-24));
    const maxH=Math.max(360,Math.min(840,g.height));
    const head=modal.querySelector('.piece-preview-head');
    const headH=Math.max(30,Math.ceil(head&&head.getBoundingClientRect().height||34));
    const stageH=Math.max(300,maxH-headH-18);

    let width=Math.round(stageH*ratio+24);
    let height=maxH;

    if(ratio>1.12){
      width=Math.max(620,Math.min(maxW,width));
      height=Math.min(maxH,Math.round((width-24)/ratio+headH+18));
    }else{
      width=Math.max(500,Math.min(maxW,width));
    }

    return {
      width:Math.round(width),
      height:Math.round(height),
      ratio:ratio
    };
  }

  function rememberNormal(modal,force){
    if(!modal||modal.dataset.yayaPreviewFullscreen==='1')return false;
    if(!force&&modal.dataset.yayaDisplayNormalSource==='content-v4')return true;

    const wanted=normalGeometryFromContent(modal);
    if(!wanted)return false;

    modal.dataset.yayaDisplayNormalSaved='1';
    modal.dataset.yayaDisplayNormalSource='content-v4';
    modal.dataset.yayaDisplayNormalWidth=String(wanted.width);
    modal.dataset.yayaDisplayNormalHeight=String(wanted.height);
    modal.dataset.yayaDisplayContentRatio=String(wanted.ratio.toFixed(4));
    return true;
  }

  function applyGeometry(modal){
    if(!modal)return;

    const overlay=modal.closest('.piece-preview-overlay');
    const g=availableGeometry();
    const full=modal.dataset.yayaPreviewFullscreen==='1';
    const vw=Math.max(320,window.innerWidth||document.documentElement.clientWidth||0);

    if(overlay){
      overlay.style.setProperty('box-sizing','border-box','important');
      overlay.style.setProperty('align-items','flex-start','important');
      overlay.style.setProperty('justify-content','center','important');
      overlay.style.setProperty('padding',g.top+'px 8px '+g.bottom+'px','important');
      overlay.style.setProperty('overflow','hidden','important');
    }

    if(full){
      modal.style.setProperty('width',Math.min(1100,Math.max(320,vw-20))+'px','important');
      modal.style.setProperty('height',g.height+'px','important');
      modal.style.setProperty('max-width','calc(100vw - 20px)','important');
      modal.style.setProperty('max-height',g.height+'px','important');
      modal.style.setProperty('margin','0 auto','important');
    }else{
      if(contentReady(modal)&&modal.dataset.yayaDisplayNormalSource!=='content-v4'){
        rememberNormal(modal,true);
      }

      const savedW=Number(modal.dataset.yayaDisplayNormalWidth)||0;
      const savedH=Number(modal.dataset.yayaDisplayNormalHeight)||0;

      if(savedW>0){
        modal.style.setProperty('width',Math.min(savedW,Math.max(320,vw-24))+'px','important');
      }
      if(savedH>0){
        modal.style.setProperty('height',Math.min(savedH,g.height)+'px','important');
      }

      modal.style.setProperty('max-width','calc(100vw - 24px)','important');
      modal.style.setProperty('max-height',g.height+'px','important');
      modal.style.setProperty('margin','0 auto','important');
    }

    const stage=modal.querySelector('.piece-preview-stage');
    if(stage)stage.style.setProperty('cursor',full?'zoom-out':'zoom-in','important');

    modal.querySelectorAll('.piece-pdf-page,.piece-pdf-page canvas,.piece-image-stage img,.piece-drive-pages-stage img,.yaya-drive-zoom-hit').forEach(function(el){
      el.style.setProperty('cursor',full?'zoom-out':'zoom-in','important');
    });
  }

  function redraw(modal){
    if(!modal||typeof modal.__yayaRedrawPdf!=='function')return;
    setTimeout(function(){
      if(modal.isConnected&&typeof modal.__yayaRedrawPdf==='function'){
        try{modal.__yayaRedrawPdf();}catch(e){}
      }
    },90);
  }

  function settleNormal(modal){
    if(!modal||!modal.isConnected)return;
    if(modal.dataset.yayaPreviewFullscreen==='1')return;

    [0,45,110,220,420,800].forEach(function(delay){
      setTimeout(function(){
        if(!modal.isConnected||modal.dataset.yayaPreviewFullscreen==='1')return;
        if(contentReady(modal))rememberNormal(modal,true);
        applyGeometry(modal);
      },delay);
    });
  }

  function togglePreview(modal){
    if(!modal||modal.dataset.yayaPreviewTransition==='1')return;

    rememberNormal(modal,false);
    const next=modal.dataset.yayaPreviewFullscreen!=='1';
    modal.dataset.yayaPreviewTransition='1';
    modal.dataset.yayaPreviewFullscreen=next?'1':'0';

    applyGeometry(modal);
    redraw(modal);

    setTimeout(function(){
      if(modal)modal.dataset.yayaPreviewTransition='0';
    },420);
  }

  function bind(){
    if(document.documentElement.dataset.yayaDisplayFixBoundV4==='1')return;
    document.documentElement.dataset.yayaDisplayFixBoundV4='1';

    document.addEventListener('click',function(e){
      if(e.button!=null&&e.button!==0)return;
      const target=e.target&&e.target.closest
        ?e.target.closest('#'+ROOT_ID+' .piece-pdf-page,#'+ROOT_ID+' .piece-image-stage img,#'+ROOT_ID+' .piece-drive-pages-stage img,#'+ROOT_ID+' .yaya-drive-zoom-hit')
        :null;
      if(!target)return;

      const modal=target.closest('.piece-preview-modal');
      if(!modal)return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      togglePreview(modal);
    },true);
  }

  function applyAll(){
    const root=document.getElementById(ROOT_ID);
    if(!root)return;

    root.querySelectorAll('.piece-preview-modal').forEach(function(modal){
      if(contentReady(modal))rememberNormal(modal,true);
      applyGeometry(modal);
    });
  }

  function install(){
    installStyle();
    bind();
    applyAll();

    const root=document.getElementById(ROOT_ID);
    if(root){
      root.addEventListener('load',function(e){
        const target=e.target;
        if(!target||!target.matches||!target.matches('.piece-image-stage img,.piece-drive-pages-stage img'))return;
        const modal=target.closest('.piece-preview-modal');
        if(modal)settleNormal(modal);
      },true);

      new MutationObserver(function(){
        requestAnimationFrame(function(){
          applyAll();
          root.querySelectorAll('.piece-preview-modal').forEach(settleNormal);
        });
      }).observe(root,{childList:true,subtree:true});
    }

    window.addEventListener('resize',applyAll,{passive:true});
    window.addEventListener('orientationchange',applyAll,{passive:true});
    setTimeout(applyAll,50);
    setTimeout(applyAll,200);
    setTimeout(applyAll,600);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
