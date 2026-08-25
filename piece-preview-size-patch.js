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

    const viewportMax=Math.max(280,window.innerWidth-16);
    const wanted=Math.min(viewportMax,pageWidth+46);
    modal.style.setProperty('width',wanted+'px','important');
    modal.style.setProperty('max-width','calc(100vw - 16px)','important');
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
