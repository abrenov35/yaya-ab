(function(){
  'use strict';

  const STYLE_ID='yaya-layout-centering-fix-v1';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      html,body{
        width:100%!important;
        max-width:100%!important;
        overflow-x:hidden!important;
      }

      .hdr{
        width:100%!important;
        max-width:100vw!important;
        min-width:0!important;
        overflow-x:auto!important;
        overflow-y:hidden!important;
        overscroll-behavior-x:contain!important;
        -webkit-overflow-scrolling:touch!important;
        scrollbar-width:none!important;
      }
      .hdr::-webkit-scrollbar{display:none!important}
      .hdr > .brand,
      .hdr > .tabs,
      .hdr > #yayaReloadBtn,
      .hdr > .sync{
        flex-shrink:0!important;
      }

      body > .body{
        width:min(980px,calc(100% - 24px))!important;
        max-width:980px!important;
        min-width:0!important;
        margin-left:auto!important;
        margin-right:auto!important;
      }

      #pane-chantiers,
      #pane-chantiers > .card{
        max-width:100%!important;
        min-width:0!important;
      }
    `;
    document.head.appendChild(style);
  }

  function resetPageHorizontalScroll(){
    if(window.scrollX)window.scrollTo(0,window.scrollY);
  }

  function install(){
    installStyle();
    requestAnimationFrame(resetPageHorizontalScroll);
    window.addEventListener('resize',resetPageHorizontalScroll,{passive:true});
    window.addEventListener('orientationchange',function(){setTimeout(resetPageHorizontalScroll,80);},{passive:true});
  }

  if(document.body)install();
  else document.addEventListener('DOMContentLoaded',install,{once:true});
})();
