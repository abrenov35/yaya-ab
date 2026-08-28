(function(){
  'use strict';
  const STYLE_ID='yaya-message-row-compact-fix';
  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      .message-ligne{
        display:grid!important;
        grid-template-columns:110px 110px minmax(0,1fr) 82px auto!important;
        align-items:center!important;
        gap:10px!important;
        min-height:44px!important;
        padding:8px 0!important;
      }
      .message-ligne .message-categorie{
        min-width:0!important;
        max-width:110px!important;
        white-space:nowrap!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
      }
      .message-ligne .message-apercu{
        display:block!important;
        min-width:0!important;
        max-width:100%!important;
        white-space:nowrap!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        line-height:1.25!important;
        font-size:12.5px!important;
      }
      .message-ligne .message-date{
        white-space:nowrap!important;
        text-align:center!important;
      }
      .message-ligne .message-actions{
        display:flex!important;
        align-items:center!important;
        justify-content:flex-end!important;
        white-space:nowrap!important;
      }
      @media(max-width:720px){
        .message-ligne{
          grid-template-columns:88px 90px minmax(150px,1fr) 72px auto!important;
          overflow-x:auto!important;
        }
      }
    `;
    document.head.appendChild(s);
  }
  function clean(){
    document.querySelectorAll('.message-ligne .message-apercu').forEach(el=>{
      el.removeAttribute('style');
    });
  }
  function run(){installStyle();clean();}
  run();
  new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});
})();
