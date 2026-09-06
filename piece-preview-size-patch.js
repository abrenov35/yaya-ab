(function(){
  'use strict';

  const ROOT_ID='modalRoot';
  let redrawTimer=0;

  function getRoot(){return document.getElementById(ROOT_ID);}
  function isFullscreen(modal){return modal&&modal.dataset.yayaPreviewFullscreen==='1';}
  function delegated(){return !!window.__yayaPiecePreviewDisplayFixInstalled;}

  function requestPdfRedraw(modal,delay){
    if(delegated())return;
    if(!modal||typeof modal.__yayaRedrawPdf!=='function')return;
    clearTimeout(redrawTimer);
    redrawTimer=setTimeout(function(){
      if(delegated())return;
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
    const img=modal.querySelector('.piece-image-stage img,.piece-drive-pages-stage img');
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
    const maxW=Math.max(320,Math.min(900,viewportW-24));
    const maxH=Math.max(360,Math.min(840,viewportH-20));
    const head=modal&&modal.querySelector('.piece-preview-head');
    const headH=Math.max(30,Math.ceil(head&&head.getBoundingClientRect().height||31));

    let ratio=0.7071;
    const piece=visiblePieceRect(modal);
    if(piece&&piece.width>0&&piece.height>0){
      ratio=piece.width/piece.height;
      ratio=Math.max(.45,Math.min(2.2,ratio));
    }

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
      width:Math.min(Math.max(320,viewportW-16),width),
      height:Math.min(Math.max(340,viewportH-12),height)
    };
  }

  function largeGeometry(viewportW,viewportH){
    return {
      width:Math.min(Math.max(620,viewportW-20),1100),
      height:Math.min(Math.max(560,viewportH-12),900)
    };
  }

  function applyModalGeometry(modal){
    if(delegated())return false;
    if(!modal)return false;

    const full=isFullscreen(modal);
    const viewportW=Math.max(320,window.innerWidth);
    const viewportH=Math.max(320,window.innerHeight);
    const mobile=viewportW<=640;
    const normal=normalGeometry(modal,viewportW,viewportH);
    const large=largeGeometry(viewportW,viewportH);

    const wantedW=mobile
      ?Math.max(312,viewportW-8)
      :(full?large.width:normal.width);
    const wantedH=mobile
      ?Math.max(312,viewportH-8)
      :(full?large.height:normal.height);

    const oldW=Math.round(modal.getBoundingClientRect().width||0);
    const oldH=Math.round(modal.getBoundingClientRect().height||0);
    const changed=Math.abs(oldW-wantedW)>3||Math.abs(oldH-wantedH)>3;

    modal.style.setProperty('width',wantedW+'px','important');
    modal.style.setProperty('height',wantedH+'px','important');
    modal.style.setProperty('max-width',mobile?'calc(100vw - 8px)':(full?'calc(100vw - 20px)':'min(900px,calc(100vw - 24px))'),'important');
    modal.style.setProperty('max-height',mobile?'calc(100dvh - 8px)':(full?'calc(100dvh - 12px)':'calc(100dvh - 20px)'),'important');
    modal.style.setProperty('padding',mobile?'5px':(full?'6px':'9px'),'important');
    modal.style.setProperty('border-radius',mobile?'8px':(full?'10px':'14px'),'important');
    modal.style.setProperty('box-shadow','0 18px 55px rgba(15,31,53,.28)','important');

    const overlay=modal.closest('.piece-preview-overlay');
    if(overlay){
      overlay.style.setProperty('padding',mobile?'4px':(full?'6px':'10px'),'important');
      overlay.style.setProperty('align-items','center','important');
      overlay.style.setProperty('justify-content','center','important');
      overlay.style.setProperty('overflow','hidden','important');
    }

    const head=modal.querySelector('.piece-preview-head');
    if(head){
      head.style.setProperty('min-height',mobile?'29px':(full?'27px':'34px'),'important');
      head.style.setProperty('height',mobile?'29px':(full?'27px':'34px'),'important');
      head.style.setProperty('margin',mobile?'0 0 3px':(full?'0 0 3px':'0 0 6px'),'important');
      head.style.setProperty('padding',mobile?'0 3px 2px':(full?'0 3px 2px':'0 3px 4px'),'important');
      head.style.setProperty('font-size',mobile?'13px':(full?'14px':'16px'),'important');
      head.style.setProperty('line-height',mobile?'24px':(full?'24px':'28px'),'important');
    }

    const close=head&&head.querySelector('button');
    if(close){
      close.style.setProperty('padding',mobile?'4px 10px':(full?'4px 10px':'5px 12px'),'important');
      close.style.setProperty('min-height',mobile?'26px':(full?'25px':'29px'),'important');
      close.style.setProperty('height',mobile?'26px':(full?'25px':'29px'),'important');
      close.style.setProperty('font-size',mobile?'11.5px':(full?'11.5px':'12px'),'important');
    }

    const stage=modal.querySelector('.piece-preview-stage');
    if(stage){
      stage.style.setProperty('border-radius',mobile?'6px':(full?'6px':'9px'),'important');
      stage.style.setProperty('background','#edf1f5','important');
      stage.style.setProperty('cursor',full?'default':'zoom-in','important');
    }

    modal.querySelectorAll('.piece-pdf-page,.piece-pdf-page canvas,.piece-image-stage img,.piece-drive-pages-stage img').forEach(function(el){
      el.style.setProperty('cursor',full?'zoom-out':'zoom-in','important');
    });

    const driveHit=modal.querySelector('.yaya-drive-zoom-hit');
    if(driveHit){
      driveHit.style.setProperty('pointer-events',full?'none':'auto','important');
      driveHit.style.setProperty('cursor',full?'default':'zoom-in','important');
    }

    return changed;
  }

  function fitCurrentModal(redrawIfChanged){
    if(delegated())return;
    const root=getRoot();
    if(!root)return;
    const modal=root.querySelector('.piece-preview-modal');
    if(!modal)return;
    const changed=applyModalGeometry(modal);
    if(changed&&redrawIfChanged)requestPdfRedraw(modal,120);
  }

  function toggleFullscreen(modal,force){
    if(delegated())return;
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
      if(delegated())return;
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
      if(delegated())return;
      if(e.target&&e.target.matches&&e.target.matches('.piece-image-stage img')){
        setTimeout(function(){fitCurrentModal(true);},30);
      }
    },true);

    root.addEventListener('keydown',function(e){
      if(delegated())return;
      const target=e.target&&e.target.closest?e.target.closest('.yaya-drive-zoom-hit'):null;
      if(!target||!(e.key==='Enter'||e.key===' '))return;
      const modal=target.closest('.piece-preview-modal');
      if(!modal)return;
      e.preventDefault();
      toggleFullscreen(modal,true);
    });

    window.addEventListener('keydown',function(e){
      if(delegated())return;
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
      if(delegated())return;
      clearTimeout(fitTimer);
      fitTimer=setTimeout(function(){
        if(delegated())return;
        const modal=root.querySelector('.piece-preview-modal');
        if(!modal)return;
        fitCurrentModal(true);
      },55);
    }).observe(root,{childList:true,subtree:true});

    let windowTimer=0;
    window.addEventListener('resize',function(){
      if(delegated())return;
      clearTimeout(windowTimer);
      windowTimer=setTimeout(function(){fitCurrentModal(true);},180);
    },{passive:true});

    fitCurrentModal(false);
  }

  bindInteractions();
  observeModalRoot();
})();
