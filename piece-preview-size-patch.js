(function(){
  'use strict';

  function fitPreviewModal(){
    const root=document.getElementById('modalRoot');
    if(!root)return;
    const modal=root.querySelector('.piece-preview-modal');
    const canvas=root.querySelector('.piece-pdf-page canvas');
    if(!modal||!canvas)return;

    const pageWidth=Math.ceil(canvas.getBoundingClientRect().width||0);
    if(pageWidth<120)return;

    const viewportMax=Math.max(280,window.innerWidth-12);
    const wanted=Math.min(viewportMax,Math.max(pageWidth+58,610));

    let changed=false;
    const currentWidth=Math.round(modal.getBoundingClientRect().width||0);
    if(Math.abs(currentWidth-wanted)>3){
      modal.style.setProperty('width',wanted+'px','important');
      changed=true;
    }
    modal.style.setProperty('max-width','calc(100vw - 12px)','important');
    modal.style.setProperty('height','min(94dvh,820px)','important');
    modal.style.setProperty('max-height','calc(100dvh - 12px)','important');

    if(changed && modal.dataset.yayaPreviewResize!=='1'){
      modal.dataset.yayaPreviewResize='1';
      setTimeout(function(){
        window.dispatchEvent(new Event('resize'));
      },60);
    }
  }

  let timer=0;
  function scheduleFit(){
    clearTimeout(timer);
    timer=setTimeout(function(){
      requestAnimationFrame(fitPreviewModal);
    },40);
  }

  function observe(){
    const root=document.getElementById('modalRoot');
    if(!root){setTimeout(observe,250);return;}
    new MutationObserver(scheduleFit).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['style','width','height']});
    window.addEventListener('resize',scheduleFit,{passive:true});
    scheduleFit();
  }

  observe();
})();
