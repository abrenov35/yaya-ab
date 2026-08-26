(function(){
  'use strict';

  const STYLE_ID='yaya-create-chantier-search-line-removed';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-chantier-search-line,
      #pane-chantiers #filtreInput,
      #pane-chantiers #yayaCreateChantierBtn,
      #pane-chantiers #yayaCreateChantierWrap{
        display:none!important;
      }
    `;
    document.head.appendChild(style);
  }

  function clean(){
    installStyle();
    try{filtreChantier='';}catch(e){}

    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;

    pane.querySelectorAll('.yaya-chantier-search-line').forEach(function(el){el.remove();});
    pane.querySelectorAll('#filtreInput').forEach(function(el){el.remove();});
    pane.querySelectorAll('#yayaCreateChantierBtn').forEach(function(el){el.remove();});
    pane.querySelectorAll('#yayaCreateChantierWrap').forEach(function(el){el.remove();});
  }

  clean();
  setTimeout(clean,50);
  setTimeout(clean,250);
  setTimeout(clean,1000);

  const obs=new MutationObserver(function(){clean();});
  obs.observe(document.documentElement,{childList:true,subtree:true});
})();
