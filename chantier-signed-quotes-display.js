(function(){
  'use strict';

  const STYLE_ID='yaya-signed-quotes-display-style';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .card > .top > b + .num{
        display:none!important;
      }
      .yaya-signed-quote-kpi{
        display:none!important;
      }
    `;
    document.head.appendChild(style);
  }

  function cleanup(){
    installStyle();
    document.querySelectorAll('.yaya-signed-quote-kpi').forEach(function(el){
      el.remove();
    });
  }

  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(function(){
      scheduled=false;
      cleanup();
    });
  }

  function install(){
    cleanup();
    new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
  }

  if(document.body)install();
  else document.addEventListener('DOMContentLoaded',install,{once:true});
})();
