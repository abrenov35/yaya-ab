(function(){
  'use strict';

  const VIEW_KEY='yaya.chantiers.view';
  const STYLE_ID='yaya-single-chantier-list-v1';

  function forceAll(){
    try{localStorage.setItem(VIEW_KEY,'all');}catch(e){}
    document.querySelectorAll('#pane-chantiers .yaya-suivi-tabs').forEach(function(el){el.remove();});
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent='#pane-chantiers .yaya-suivi-tabs{display:none!important}';
    document.head.appendChild(style);
  }

  function install(){
    installStyle();
    forceAll();

    try{
      if(typeof render==='function')render();
    }catch(e){}

    const obs=new MutationObserver(function(){
      forceAll();
    });
    obs.observe(document.documentElement,{childList:true,subtree:true});

    window.addEventListener('yaya:data-refreshed',function(){
      forceAll();
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
