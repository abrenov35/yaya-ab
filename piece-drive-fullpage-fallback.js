(function(){
  'use strict';

  const STYLE_ID='yaya-drive-fullpage-fallback-v1';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #modalRoot .yaya-drive-fit-overlay{
        align-items:center!important;
        justify-content:center!important;
        padding:8px!important;
        overflow:hidden!important;
      }
      #modalRoot .yaya-drive-fit-modal{
        width:min(90vw,900px)!important;
        height:min(88dvh,760px)!important;
        max-width:900px!important;
        max-height:88dvh!important;
        padding:9px!important;
        display:flex!important;
        flex-direction:column!important;
        overflow:hidden!important;
      }
      #modalRoot .yaya-drive-fit-modal > h5{
        flex:0 0 auto!important;
        min-height:32px!important;
        margin:0 0 6px!important;
        align-items:center!important;
      }
      #modalRoot .yaya-drive-fit-stage{
        position:relative!important;
        flex:1 1 auto!important;
        min-height:0!important;
        min-width:0!important;
        width:100%!important;
        overflow:hidden!important;
        border-radius:8px!important;
        background:#111!important;
      }
      #modalRoot iframe.yaya-drive-fit-frame{
        position:absolute!important;
        margin:0!important;
        border:0!important;
        border-radius:0!important;
        transform-origin:0 0!important;
        background:#111!important;
      }
      @media(max-width:640px){
        #modalRoot .yaya-drive-fit-overlay{padding:4px!important;}
        #modalRoot .yaya-drive-fit-modal{
          width:calc(100vw - 8px)!important;
          height:calc(100dvh - 8px)!important;
          max-width:none!important;
          max-height:none!important;
          padding:5px!important;
          border-radius:8px!important;
        }
        #modalRoot .yaya-drive-fit-modal > h5{min-height:29px!important;margin-bottom:3px!important;}
      }
      @media(max-height:520px) and (orientation:landscape){
        #modalRoot .yaya-drive-fit-overlay{padding:2px!important;}
        #modalRoot .yaya-drive-fit-modal{
          width:calc(100vw - 4px)!important;
          height:calc(100dvh - 4px)!important;
          max-width:none!important;
          max-height:none!important;
          padding:3px!important;
          border-radius:6px!important;
        }
        #modalRoot .yaya-drive-fit-modal > h5{min-height:25px!important;margin-bottom:2px!important;font-size:13px!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function isDrivePreview(frame){
    const src=String(frame&&frame.getAttribute('src')||'').toLowerCase();
    return src.includes('drive.google.com/file/d/')&&src.includes('/preview');
  }

  function fit(stage,frame){
    if(!stage||!frame||!stage.isConnected||!frame.isConnected)return;
    const w=Math.max(1,stage.clientWidth);
    const h=Math.max(1,stage.clientHeight);

    // Le viewer Drive ajuste sa page principalement à la largeur. On lui donne
    // une grande hauteur logique, puis on réduit visuellement tout le viewer.
    // Ainsi une feuille A4 complète tient dans la hauteur réelle de la modale.
    const logicalPageWidth=Math.max(220,w-60);
    const logicalPageHeight=logicalPageWidth*1.41421356;
    const chromeAllowance=90;
    let scale=(h-8)/Math.max(1,logicalPageHeight+chromeAllowance);
    scale=Math.min(0.72,Math.max(0.24,scale));

    const logicalHeight=Math.ceil(h/scale);
    const visibleWidth=w*scale;
    const left=Math.max(0,(w-visibleWidth)/2);

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
    const frames=[...root.querySelectorAll('iframe')];
    const frame=frames.find(isDrivePreview);
    if(!frame)return;

    const modal=frame.closest('.modal');
    if(!modal)return;
    const overlay=modal.closest('.overlay');
    if(overlay)overlay.classList.add('yaya-drive-fit-overlay');
    modal.classList.add('yaya-drive-fit-modal');

    let stage=modal.querySelector('.yaya-drive-fit-stage');
    if(!stage){
      stage=document.createElement('div');
      stage.className='yaya-drive-fit-stage';
      frame.parentNode.insertBefore(stage,frame);
      stage.appendChild(frame);
    }
    frame.classList.add('yaya-drive-fit-frame');

    requestAnimationFrame(()=>fit(stage,frame));
    setTimeout(()=>fit(stage,frame),120);
    setTimeout(()=>fit(stage,frame),450);
  }

  let resizeTimer=null;
  window.addEventListener('resize',()=>{
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(prepare,80);
  },{passive:true});

  const obs=new MutationObserver(()=>prepare());
  obs.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(prepare,80);
})();
