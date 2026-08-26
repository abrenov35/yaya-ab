(function(){
  'use strict';

  function install(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane){setTimeout(install,150);return;}
    if(pane.dataset.yayaViewNavFix==='1')return;
    pane.dataset.yayaViewNavFix='1';

    pane.addEventListener('click',function(e){
      const btn=e.target&&e.target.closest?e.target.closest('.yaya-suivi-tab'):null;
      if(!btn)return;

      // Quitter immédiatement une fiche chantier ouverte avant d'appliquer la vue.
      try{if(typeof focusChantier!=='undefined')focusChantier=null;}catch(_){}
      try{if(typeof expChantiers!=='undefined'&&expChantiers&&typeof expChantiers.clear==='function')expChantiers.clear();}catch(_){}
      try{if(typeof filtreChantier!=='undefined')filtreChantier='';}catch(_){}

      // Le handler du patch de vues enregistre d'abord la destination.
      // On reconstruit ensuite la liste complète : son MutationObserver
      // réapplique automatiquement Chantiers suivis / documents / tous.
      setTimeout(function(){
        try{
          const input=document.getElementById('filtreInput');
          if(input)input.value='';
          if(typeof renderChantiers==='function')renderChantiers();
          else if(typeof render==='function')render();
        }catch(err){console.warn('Navigation vues chantiers :',err);}
      },0);
    },true);
  }

  install();
})();
