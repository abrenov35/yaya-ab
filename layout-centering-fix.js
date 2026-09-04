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

  function centerAchatModals(){
    const modals=new Set();

    document.querySelectorAll('.achat-edit-modal').forEach(function(modal){
      modals.add(modal);
    });

    ['acCh','acType','acFour','acMt'].forEach(function(id){
      const field=document.getElementById(id);
      const modal=field&&field.closest('.modal');
      if(modal)modals.add(modal);
    });

    modals.forEach(function(modal){
      const overlay=modal.closest('.overlay');
      if(!overlay)return;
      overlay.style.setProperty('align-items','center','important');
      overlay.style.setProperty('justify-content','center','important');
      overlay.style.setProperty('padding','16px','important');
    });
  }

  function install(){
    if(window.matchMedia&&window.matchMedia('(max-width:760px)').matches)return;
    installStyle();
    centerAchatModals();
    requestAnimationFrame(resetPageHorizontalScroll);
    window.addEventListener('resize',resetPageHorizontalScroll,{passive:true});
    window.addEventListener('orientationchange',function(){setTimeout(resetPageHorizontalScroll,80);},{passive:true});

    const observer=new MutationObserver(centerAchatModals);
    observer.observe(document.documentElement,{childList:true,subtree:true});
  }

  if(document.body)install();
  else document.addEventListener('DOMContentLoaded',install,{once:true});
})();
