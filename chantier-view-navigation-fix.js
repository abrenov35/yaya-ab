(function(){
  'use strict';

  function resetChantierSearch(){
    try{if(typeof focusChantier!=='undefined')focusChantier=null;}catch(_){}
    try{if(typeof expChantiers!=='undefined'&&expChantiers&&typeof expChantiers.clear==='function')expChantiers.clear();}catch(_){}
    try{if(typeof filtreChantier!=='undefined')filtreChantier='';}catch(_){}

    const input=document.getElementById('filtreInput');
    if(input){
      input.value='';
      try{input.blur();}catch(_){}
    }

    document.querySelectorAll('#pane-chantiers > .card').forEach(function(card){
      card.style.display='';
    });
  }

  function refreshChantiers(){
    try{
      if(typeof renderChantiers==='function')renderChantiers();
      else if(typeof render==='function')render();
    }catch(err){console.warn('Navigation chantiers :',err);}
  }

  function install(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane){setTimeout(install,150);return;}
    if(pane.dataset.yayaViewNavFix==='1')return;
    pane.dataset.yayaViewNavFix='1';

    pane.addEventListener('click',function(e){
      const btn=e.target&&e.target.closest?e.target.closest('.yaya-suivi-tab'):null;
      if(!btn)return;

      // Quitter immédiatement une fiche chantier ouverte avant d'appliquer la vue.
      resetChantierSearch();

      // Le handler du patch de vues enregistre d'abord la destination.
      // On reconstruit ensuite la liste complète : son MutationObserver
      // réapplique automatiquement Chantiers suivis / documents / tous.
      setTimeout(function(){
        resetChantierSearch();
        refreshChantiers();
      },0);
    },true);

    // Le bouton principal « Chantiers » devient aussi une sortie explicite
    // du mode recherche : il vide le filtre et revient toujours à la liste.
    document.addEventListener('click',function(e){
      const tab=e.target&&e.target.closest
        ?e.target.closest('.hdr .tab[data-tab="chantiers"]')
        :null;
      if(!tab)return;

      resetChantierSearch();

      // Laisser le gestionnaire natif changer d'onglet, puis reconstruire la liste.
      setTimeout(function(){
        resetChantierSearch();
        refreshChantiers();
      },0);
    },true);
  }

  install();
})();
