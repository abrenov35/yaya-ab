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

  function applyModalGeometry(modal){
    if(!modal)return false;

    const full=isFullscreen(modal);
    const viewportW=Math.max(320,window.innerWidth);
    const viewportH=Math.max(320,window.innerHeight);

    const wantedW=full
      ? Math.max(320,viewportW-6)
      : Math.min(Math.max(560,viewportW-24),700);

    const wantedH=full
      ? Math.max(300,viewportH-6)
      : Math.min(Math.max(520,Math.round(viewportH*0.84)),780);

    const oldW=Math.round(modal.getBoundingClientRect().width||0);
    const oldH=Math.round(modal.getBoundingClientRect().height||0);
    const changed=Math.abs(oldW-wantedW)>3||Math.abs(oldH-wantedH)>3;

    modal.style.setProperty('width',wantedW+'px','important');
    modal.style.setProperty('height',wantedH+'px','important');
    modal.style.setProperty('max-width',full?'calc(100vw - 6px)':'calc(100vw - 24px)','important');
    modal.style.setProperty('max-height',full?'calc(100dvh - 6px)':'calc(100dvh - 20px)','important');
    modal.style.setProperty('padding',full?'3px':'7px','important');
    modal.style.setProperty('border-radius',full?'7px':'12px','important');

    const overlay=modal.closest('.piece-preview-overlay');
    if(overlay){
      overlay.style.setProperty('padding',full?'3px':'10px','important');
      overlay.style.setProperty('align-items','center','important');
      overlay.style.setProperty('justify-content','center','important');
    }

    const head=modal.querySelector('.piece-preview-head');
    if(head){
      head.style.setProperty('min-height',full?'22px':'31px','important');
      head.style.setProperty('height',full?'22px':'31px','important');
      head.style.setProperty('margin',full?'0 0 1px':'0 0 4px','important');
      head.style.setProperty('padding',full?'0 2px 1px':'0 2px 4px','important');
      head.style.setProperty('font-size',full?'13px':'15px','important');
      head.style.setProperty('line-height',full?'20px':'26px','important');
    }

    const close=head&&head.querySelector('button');
    if(close){
      close.style.setProperty('padding',full?'2px 8px':'4px 11px','important');
      close.style.setProperty('min-height',full?'20px':'28px','important');
      close.style.setProperty('height',full?'20px':'28px','important');
      close.style.setProperty('font-size',full?'11px':'12px','important');
    }

    const stage=modal.querySelector('.piece-preview-stage');
    if(stage){
      stage.style.setProperty('border-radius',full?'4px':'7px','important');
      stage.style.setProperty('cursor',full?'zoom-out':'zoom-in','important');
    }

    modal.querySelectorAll('.piece-pdf-page canvas').forEach(function(canvas){
      canvas.style.setProperty('cursor',full?'zoom-out':'zoom-in','important');
    });

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
      const canvas=e.target&&e.target.closest?e.target.closest('.piece-pdf-page canvas'):null;
      if(!canvas)return;
      const modal=canvas.closest('.piece-preview-modal');
      if(!modal)return;
      e.preventDefault();
      e.stopPropagation();
      toggleFullscreen(modal);
    },true);

    root.addEventListener('wheel',handleWheel,{capture:true,passive:false});

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

    new MutationObserver(function(){
      requestAnimationFrame(function(){fitCurrentModal(false);});
    }).observe(root,{childList:true});

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
