(function(){
  'use strict';

  function fitPreviewModal(){
    const root=document.getElementById('modalRoot');
    if(!root)return;
    const modal=root.querySelector('.piece-preview-modal');
    const canvas=root.querySelector('.piece-pdf-page canvas');
    if(!modal||!canvas)return;

    const viewportMax=Math.max(300,window.innerWidth-8);
    const wanted=Math.min(viewportMax,760);

    let changed=false;
    const currentWidth=Math.round(modal.getBoundingClientRect().width||0);
    if(Math.abs(currentWidth-wanted)>3){
      modal.style.setProperty('width',wanted+'px','important');
      changed=true;
    }

    modal.style.setProperty('max-width','calc(100vw - 8px)','important');
    modal.style.setProperty('height','calc(98dvh - 4px)','important');
    modal.style.setProperty('max-height','calc(100dvh - 4px)','important');
    modal.style.setProperty('padding','5px','important');

    const head=modal.querySelector('.piece-preview-head');
    if(head){
      head.style.setProperty('min-height','28px','important');
      head.style.setProperty('margin','0 0 3px','important');
      head.style.setProperty('padding-bottom','3px','important');
    }

    const stage=modal.querySelector('.piece-preview-stage');
    if(stage){
      stage.style.setProperty('border-radius','6px','important');
    }

    if(changed && modal.dataset.yayaPreviewResize!=='2'){
      modal.dataset.yayaPreviewResize='2';
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
