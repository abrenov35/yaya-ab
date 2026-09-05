(function(){
  'use strict';

  const STYLE_ID='yaya-header-fixed-toolbar-v4';
  const HEIGHT_VAR='--yaya-fixed-toolbar-height';

  if(document.getElementById(STYLE_ID))return;

  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    :root{
      ${HEIGHT_VAR}:72px;
    }
    body{
      padding-top:var(${HEIGHT_VAR})!important;
    }
    .hdr{
      position:fixed!important;
      top:0!important;
      left:0!important;
      right:0!important;
      width:100%!important;
      max-width:none!important;
      z-index:900!important;
      box-sizing:border-box!important;
      transform:none!important;
      margin-top:0!important;
    }
    @media(max-width:760px) and (orientation:portrait){
      .hdr{
        position:fixed!important;
        top:0!important;
        left:0!important;
        right:0!important;
      }
    }
  `;
  document.head.appendChild(style);

  let currentHeader=null;
  let resizeObserver=null;
  let raf=0;

  function syncHeight(){
    raf=0;
    const header=document.querySelector('.hdr');
    if(!header)return;

    const height=Math.max(1,Math.ceil(header.getBoundingClientRect().height));
    document.documentElement.style.setProperty(HEIGHT_VAR,height+'px');

    if(header!==currentHeader){
      currentHeader=header;
      if(resizeObserver)resizeObserver.disconnect();
      if('ResizeObserver' in window){
        resizeObserver=new ResizeObserver(scheduleHeight);
        resizeObserver.observe(header);
      }
    }
  }

  function scheduleHeight(){
    if(raf)return;
    raf=requestAnimationFrame(syncHeight);
  }

  scheduleHeight();
  window.addEventListener('resize',scheduleHeight,{passive:true});
  window.addEventListener('orientationchange',function(){
    setTimeout(scheduleHeight,80);
    setTimeout(scheduleHeight,300);
  },{passive:true});

  new MutationObserver(scheduleHeight).observe(document.documentElement,{childList:true,subtree:true});
})();
