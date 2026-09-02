(function(){
  'use strict';

  const ROOT_ID='modalRoot';
  let redrawTimer=0;

  function getRoot(){return document.getElementById(ROOT_ID);}
  function isFullscreen(modal){return modal&&modal.dataset.yayaPreviewFullscreen==='1';}

  function requestPdfRedraw(modal,delay){
    if(!modal||typeof modal.__yayaRedrawPdf!=='function')return;
    clearTimeout(redrawTimer);
    redrawTimer=setTimeout(function(){
      if(modal&&typeof modal.__yayaRedrawPdf==='function')modal.__yayaRedrawPdf(0);
    },Number(delay)||100);
  }

  function visiblePieceRect(modal){
    if(!modal)return null;
    const canvas=modal.querySelector('.piece-pdf-page canvas');
    if(canvas){
      const r=canvas.getBoundingClientRect();
      if(r.width>=120&&r.height>=120)return r;
    }
    const img=modal.querySelector('.piece-image-stage img');
    if(img&&img.complete){
      const r=img.getBoundingClientRect();
      if(r.width>=120&&r.height>=120)return r;
    }
    const frame=modal.querySelector('.yaya-drive-fit-frame');
    if(frame){
      const r=frame.getBoundingClientRect();
      if(r.width>=120&&r.height>=120)return r;
    }
    return null;
  }

  function normalGeometry(modal,viewportW,viewportH){
    let storedW=Number(modal.dataset.yayaNormalWidth)||0;
    let storedH=Number(modal.dataset.yayaNormalHeight)||0;

    if(!storedW||!storedH){
      const piece=visiblePieceRect(modal);
      if(piece){
        const head=modal.querySelector('.piece-preview-head');
        const headH=Math.max(28,Math.ceil(head&&head.getBoundingClientRect().height||31));
        storedW=Math.ceil(piece.width+30);
        storedH=Math.ceil(piece.height+headH+22);
        storedW=Math.max(380,storedW);
        storedH=Math.max(440,storedH);
        modal.dataset.yayaNormalWidth=String(storedW);
        modal.dataset.yayaNormalHeight=String(storedH);
        modal.dataset.yayaPieceFitted='1';
      }
    }

    if(!storedW)storedW=Math.min(Math.max(560,viewportW-24),700);
    if(!storedH)storedH=Math.min(Math.max(520,Math.round(viewportH*0.84)),780);

    return {
      width:Math.min(Math.max(320,viewportW-16),storedW),
      height:Math.min(Math.max(300,viewportH-12),storedH)
    };
  }

  function largeGeometry(viewportW,viewportH){
    return {
      width:Math.min(Math.max(620,viewportW-10),1160),
      height:Math.min(Math.max(560,viewportH-8),920)
    };
  }

  function applyModalGeometry(modal){
    if(!modal)return false;

    const full=isFullscreen(modal);
    const viewportW=Math.max(320,window.innerWidth);
    const viewportH=Math.max(320,window.innerHeight);
    const normal=normalGeometry(modal,viewportW,viewportH);
    const large=largeGeometry(viewportW,viewportH);

    const wantedW=full?large.width:normal.width;
    const wantedH=full?large.height:normal.height;

    const oldW=Math.round(modal.getBoundingClientRect().width||0);
    const oldH=Math.round(modal.getBoundingClientRect().height||0);
    const changed=Math.abs(oldW-wantedW)>3||Math.abs(oldH-wantedH)>3;

    modal.style.setProperty('width',wantedW+'px','important');
    modal.style.setProperty('height',wantedH+'px','important');
    modal.style.setProperty('max-width',full?'calc(100vw - 10px)':'calc(100vw - 16px)','important');
    modal.style.setProperty('max-height',full?'calc(100dvh - 8px)':'calc(100dvh - 12px)','important');
    modal.style.setProperty('padding',full?'4px':'7px','important');
    modal.style.setProperty('border-radius',full?'9px':'12px','important');

    const overlay=modal.closest('.piece-preview-overlay');
    if(overlay){
      overlay.style.setProperty('padding',full?'4px':'6px','important');
      overlay.style.setProperty('align-items','center','important');
      overlay.style.setProperty('justify-content','center','important');
    }

    const head=modal.querySelector('.piece-preview-head');
    if(head){
      head.style.setProperty('min-height',full?'25px':'31px','important');
      head.style.setProperty('height',full?'25px':'31px','important');
      head.style.setProperty('margin',full?'0 0 2px':'0 0 4px','important');
      head.style.setProperty('padding',full?'0 3px 2px':'0 2px 4px','important');
      head.style.setProperty('font-size',full?'14px':'15px','important');
      head.style.setProperty('line-height',full?'22px':'26px','important');
    }

    const close=head&&head.querySelector('button');
    if(close){
      close.style.setProperty('padding',full?'3px 9px':'4px 11px','important');
      close.style.setProperty('min-height',full?'23px':'28px','important');
      close.style.setProperty('height',full?'23px':'28px','important');
      close.style.setProperty('font-size',full?'11px':'12px','important');
    }

    const stage=modal.querySelector('.piece-preview-stage');
    if(stage){
      stage.style.setProperty('border-radius',full?'5px':'7px','important');
      stage.style.setProperty('cursor',full?'default':'zoom-in','important');
    }

    modal.querySelectorAll('.piece-pdf-page,.piece-pdf-page canvas,.piece-image-stage img,.piece-drive-pages-stage img').forEach(function(el){
      el.style.setProperty('cursor',full?'zoom-out':'zoom-in','important');
    });

    // Avec le lecteur Drive direct, les clics restent à l'intérieur de l'iframe.
    // Cette couche capte uniquement le premier clic pour agrandir la vue, puis
    // se désactive afin de laisser l'iframe Drive totalement utilisable.
    const driveHit=modal.querySelector('.yaya-drive-zoom-hit');
    if(driveHit){
      driveHit.style.setProperty('pointer-events',full?'none':'auto','important');
      driveHit.style.setProperty('cursor',full?'default':'zoom-in','important');
    }

    return changed;
  }

  function fitCurrentModal(redrawIfChanged){
    const root=getRoot();
    if(!root)return;
    const modal=root.querySelector('.piece-preview-modal');
    if(!modal)return;
    const changed=applyModalGeometry(modal);
    if(changed&&redrawIfChanged)requestPdfRedraw(modal,120);
  }

  function toggleFullscreen(modal,force){
    if(!modal||modal.dataset.yayaPreviewTransition==='1')return;

    const next=typeof force==='boolean'?force:!isFullscreen(modal);
    modal.dataset.yayaPreviewTransition='1';
    modal.dataset.yayaPreviewFullscreen=next?'1':'0';

    applyModalGeometry(modal);
    requestPdfRedraw(modal,120);

    setTimeout(function(){
      if(modal)modal.dataset.yayaPreviewTransition='0';
    },360);
  }

  let wheelLock=false;
  function handleWheel(e){
    const viewer=e.target&&e.target.closest?e.target.closest('.piece-pdf-pages'):null;
    if(!viewer||Math.abs(e.deltaY)<3)return;

    const modal=viewer.closest('.piece-preview-modal');
    if(modal&&isFullscreen(modal))return;

    e.preventDefault();
    e.stopImmediatePropagation();
    if(wheelLock)return;

    const pages=viewer.querySelectorAll('.piece-pdf-page');
    if(pages.length<2)return;

    const h=Math.max(1,viewer.clientHeight);
    const current=Math.max(0,Math.min(pages.length-1,Math.round(viewer.scrollTop/h)));
    const next=Math.max(0,Math.min(pages.length-1,current+(e.deltaY>0?1:-1)));
    if(next===current)return;

    wheelLock=true;
    viewer.scrollTo({top:next*h,behavior:'smooth'});
    setTimeout(function(){wheelLock=false;},280);
  }

  function bindInteractions(){
    const root=getRoot();
    if(!root){setTimeout(bindInteractions,250);return;}
    if(root.dataset.yayaPreviewInteractions==='1')return;
    root.dataset.yayaPreviewInteractions='1';

    root.addEventListener('click',function(e){
      const target=e.target&&e.target.closest?e.target.closest('.piece-pdf-page,.piece-image-stage img,.piece-drive-pages-stage img,.yaya-drive-zoom-hit'):null;
      if(!target)return;
      const modal=target.closest('.piece-preview-modal');
      if(!modal)return;
      e.preventDefault();
      e.stopPropagation();
      toggleFullscreen(modal);
    },true);

    root.addEventListener('wheel',handleWheel,{capture:true,passive:false});

    root.addEventListener('load',function(e){
      if(e.target&&e.target.matches&&e.target.matches('.piece-image-stage img')){
        setTimeout(function(){fitCurrentModal(false);},30);
      }
    },true);

    root.addEventListener('keydown',function(e){
      const target=e.target&&e.target.closest?e.target.closest('.yaya-drive-zoom-hit'):null;
      if(!target||!(e.key==='Enter'||e.key===' '))return;
      const modal=target.closest('.piece-preview-modal');
      if(!modal)return;
      e.preventDefault();
      toggleFullscreen(modal,true);
    });

    window.addEventListener('keydown',function(e){
      if(e.key!=='Escape')return;
      const modal=root.querySelector('.piece-preview-modal');
      if(modal&&isFullscreen(modal)){
        e.preventDefault();
        toggleFullscreen(modal,false);
      }
    });
  }

  function observeModalRoot(){
    const root=getRoot();
    if(!root){setTimeout(observeModalRoot,250);return;}

    let fitTimer=0;
    new MutationObserver(function(){
      clearTimeout(fitTimer);
      fitTimer=setTimeout(function(){
        const modal=root.querySelector('.piece-preview-modal');
        if(!modal)return;
        if(!isFullscreen(modal)&&modal.dataset.yayaPieceFitted!=='1'&&visiblePieceRect(modal)){
          fitCurrentModal(false);
        }else if(!modal.dataset.yayaBaseGeometryApplied){
          modal.dataset.yayaBaseGeometryApplied='1';
          fitCurrentModal(false);
        }
      },45);
    }).observe(root,{childList:true,subtree:true});

    let windowTimer=0;
    window.addEventListener('resize',function(){
      clearTimeout(windowTimer);
      windowTimer=setTimeout(function(){fitCurrentModal(true);},220);
    },{passive:true});

    fitCurrentModal(false);
  }

  bindInteractions();
  observeModalRoot();
})();
