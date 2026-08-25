(function(){
  'use strict';

  function fitPreviewModal(){
    const root=document.getElementById('modalRoot');
    if(!root)return;
    const modal=root.querySelector('.piece-preview-modal');
    const canvas=root.querySelector('.piece-pdf-page canvas');
    if(!modal||!canvas)return;

    const viewportMax=Math.max(320,window.innerWidth-4);
    const wanted=Math.min(viewportMax,860);

    let changed=false;
    const currentWidth=Math.round(modal.getBoundingClientRect().width||0);
    if(Math.abs(currentWidth-wanted)>3){
      modal.style.setProperty('width',wanted+'px','important');
      changed=true;
    }

    modal.style.setProperty('max-width','calc(100vw - 4px)','important');
    modal.style.setProperty('height','calc(100dvh - 2px)','important');
    modal.style.setProperty('max-height','calc(100dvh - 2px)','important');
    modal.style.setProperty('padding','3px','important');
    modal.style.setProperty('border-radius','8px','important');

    const overlay=modal.closest('.piece-preview-overlay');
    if(overlay){
      overlay.style.setProperty('padding','1px','important');
      overlay.style.setProperty('align-items','center','important');
    }

    const head=modal.querySelector('.piece-preview-head');
    if(head){
      head.style.setProperty('min-height','22px','important');
      head.style.setProperty('height','22px','important');
      head.style.setProperty('margin','0 0 1px','important');
      head.style.setProperty('padding','0 2px 1px','important');
      head.style.setProperty('font-size','13px','important');
      head.style.setProperty('line-height','20px','important');
    }

    const close=head&&head.querySelector('button');
    if(close){
      close.style.setProperty('padding','2px 8px','important');
      close.style.setProperty('min-height','20px','important');
      close.style.setProperty('height','20px','important');
      close.style.setProperty('font-size','11px','important');
      close.style.setProperty('line-height','14px','important');
    }

    const stage=modal.querySelector('.piece-preview-stage');
    if(stage){
      stage.style.setProperty('border-radius','4px','important');
    }

    if(changed && modal.dataset.yayaPreviewResize!=='3'){
      modal.dataset.yayaPreviewResize='3';
      setTimeout(function(){
        window.dispatchEvent(new Event('resize'));
      },70);
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
