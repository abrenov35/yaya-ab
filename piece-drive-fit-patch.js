(function(){
  'use strict';

  const STYLE_ID='yaya-piece-drive-fit-style';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .piece-drive-fit-overlay{align-items:center!important;justify-content:center!important;padding:8px!important;overflow:hidden!important;}
      .piece-drive-fit-modal{width:min(90vw,860px)!important;height:min(84dvh,700px)!important;max-width:860px!important;max-height:84dvh!important;padding:10px!important;display:flex!important;flex-direction:column!important;overflow:hidden!important;}
      .piece-drive-fit-modal h5{flex:0 0 auto!important;margin:0 0 6px!important;min-height:32px!important;align-items:center!important;}
      .piece-drive-fit-stage{position:relative!important;flex:1 1 auto!important;min-height:0!important;min-width:0!important;width:100%!important;overflow:hidden!important;border-radius:8px!important;background:#eef1f5!important;}
      .piece-drive-fit-frame{position:absolute!important;top:0!important;margin:0!important;border:0!important;border-radius:0!important;background:#111!important;transform-origin:0 0!important;}
      @media(max-width:640px){
        .piece-drive-fit-overlay{padding:5px!important;}
        .piece-drive-fit-modal{width:calc(100vw - 10px)!important;height:calc(100dvh - 10px)!important;max-width:none!important;max-height:none!important;padding:6px!important;border-radius:9px!important;}
        .piece-drive-fit-modal h5{margin-bottom:4px!important;min-height:30px!important;}
      }
      @media(max-height:520px) and (orientation:landscape){
        .piece-drive-fit-overlay{padding:2px!important;}
        .piece-drive-fit-modal{width:calc(100vw - 4px)!important;height:calc(100dvh - 4px)!important;max-width:none!important;max-height:none!important;padding:4px!important;border-radius:6px!important;}
        .piece-drive-fit-modal h5{min-height:26px!important;margin-bottom:2px!important;font-size:13px!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function isDrivePreview(frame){
    const src=String(frame&&frame.src||'').toLowerCase();
    return src.includes('drive.google.com/file/d/')&&src.includes('/preview');
  }

  function fit(stage,frame){
    if(!stage||!frame||!stage.isConnected||!frame.isConnected)return;
    const w=Math.max(1,stage.clientWidth);
    const h=Math.max(1,stage.clientHeight);

    // Le lecteur Drive force généralement un affichage proche de "ajuster à la largeur".
    // On agrandit donc sa hauteur logique puis on réduit visuellement l'ensemble du lecteur
    // pour qu'une page A4 portrait complète tienne dans la hauteur disponible.
    const logicalPageWidth=Math.max(220,w-70);
    const logicalPageHeight=logicalPageWidth*1.41421356;
    const chromeAllowance=70;
    let scale=h/Math.max(1,logicalPageHeight+chromeAllowance);
    scale=Math.min(0.82,Math.max(0.26,scale));

    const logicalHeight=Math.ceil(h/scale);
    const visualWidth=w*scale;
    const left=Math.max(0,(w-visualWidth)/2);

    frame.style.setProperty('width',w+'px','important');
    frame.style.setProperty('height',logicalHeight+'px','important');
    frame.style.setProperty('left',left+'px','important');
    frame.style.setProperty('top','0','important');
    frame.style.setProperty('transform','scale('+scale+')','important');
    frame.style.setProperty('transform-origin','0 0','important');
  }

  function prepare(){
    const root=document.getElementById('modalRoot');
    if(!root)return;
    const modal=root.querySelector('.piece-modal:not(.piece-preview-modal)');
    if(!modal)return;
    const frame=modal.querySelector('iframe.piece-frame,iframe');
    if(!frame||!isDrivePreview(frame))return;

    const overlay=modal.closest('.overlay');
    if(overlay)overlay.classList.add('piece-drive-fit-overlay');
    modal.classList.add('piece-drive-fit-modal');

    let stage=modal.querySelector('.piece-drive-fit-stage');
    if(!stage){
      stage=document.createElement('div');
      stage.className='piece-drive-fit-stage';
      frame.parentNode.insertBefore(stage,frame);
      stage.appendChild(frame);
    }
    frame.classList.add('piece-drive-fit-frame');

    requestAnimationFrame(()=>fit(stage,frame));
    setTimeout(()=>fit(stage,frame),180);
  }

  let resizeTimer=null;
  window.addEventListener('resize',()=>{
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(prepare,80);
  },{passive:true});

  const obs=new MutationObserver(()=>prepare());
  obs.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(prepare,100);
})();
