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

/* =========================================================
   LIEN DIRECT EXTRANET -> YAYA
   Format : ?c=C142#chantiers
========================================================= */
(function(){
  'use strict';

  const params=new URLSearchParams(window.location.search);
  const requestedId=String(params.get('c')||'').trim().toUpperCase();

  if(!/^C\d+$/.test(requestedId))return;

  let opened=false;
  let forcedRefreshDone=false;
  let timer=null;

  function currentChantiers(){
    try{
      return (typeof S!=='undefined' && S && Array.isArray(S.chantiers))
        ? S.chantiers
        : [];
    }catch(e){
      return [];
    }
  }

  function findTarget(){
    return currentChantiers().find(function(c){
      return c &&
        String(c.id||'').trim() &&
        String(c.nom||'').trim() &&
        String(c.id||'').trim().toUpperCase()===requestedId;
    })||null;
  }

  function openTarget(){
    if(opened)return true;

    const chantier=findTarget();
    if(!chantier)return false;

    const id=String(chantier.id);

    try{tab='chantiers';}catch(e){}
    try{
      if(window.location.hash!=='#chantiers'){
        history.replaceState(
          null,
          '',
          window.location.pathname+window.location.search+'#chantiers'
        );
      }
    }catch(e){}

    try{
      focusChantier=id;
      expChantiers.clear();
      expChantiers.add(id);
    }catch(e){
      try{
        if(typeof toggleChantier==='function')toggleChantier(id);
      }catch(_){}
    }

    try{
      if(typeof render==='function')render();
    }catch(e){}

    try{window.scrollTo(0,0);}catch(e){}

    opened=true;
    if(timer)clearInterval(timer);
    return true;
  }

  async function forceFreshChantiersOnce(){
    if(opened||forcedRefreshDone)return;
    forcedRefreshDone=true;

    try{
      if(typeof apiGet!=='function')return;
      const fresh=await apiGet(true);
      if(!fresh||!Array.isArray(fresh.chantiers))return;

      if(typeof S!=='undefined' && S){
        S.chantiers=fresh.chantiers;
      }

      openTarget();
    }catch(e){
      console.warn('Lien chantier Extranet : actualisation impossible',e);
    }
  }

  function attempt(){
    openTarget();
  }

  attempt();
  timer=setInterval(attempt,250);

  // Si le lien est ouvert juste après la création du chantier,
  // on contourne une seule fois un éventuel cache local ancien.
  setTimeout(forceFreshChantiersOnce,1200);

  setTimeout(function(){
    if(timer)clearInterval(timer);
  },15000);

  window.addEventListener('yaya:data-refreshed',attempt);
})();

/* =========================================================
   GARDE ANTI-CHANTIER FANTOME
   Un chantier sans nom OU sans identifiant ne doit jamais
   apparaitre ni pouvoir etre ouvert depuis la page Chantiers.
========================================================= */
(function(){
  'use strict';

  if(typeof renderChantiers!=='function')return;

  const renderChantiersOriginal=renderChantiers;

  function chantierValide(c){
    return !!(
      c &&
      String(c.id||'').trim() &&
      String(c.nom||'').trim()
    );
  }

  renderChantiers=function(){
    let listeOriginale=null;
    let focusOriginal=null;
    let focusInvalide=false;

    try{
      if(typeof S!=='undefined' && S && Array.isArray(S.chantiers)){
        listeOriginale=S.chantiers;

        try{
          if(typeof focusChantier!=='undefined' && focusChantier){
            focusOriginal=focusChantier;
            const cible=listeOriginale.find(function(c){
              return String(c&&c.id||'')===String(focusChantier);
            });
            if(!chantierValide(cible)){
              focusInvalide=true;
              focusChantier=null;
              try{
                if(typeof expChantiers!=='undefined' && expChantiers && typeof expChantiers.delete==='function'){
                  expChantiers.delete(String(focusOriginal));
                }
              }catch(_){}
            }
          }
        }catch(_){}

        S.chantiers=listeOriginale.filter(chantierValide);
      }

      return renderChantiersOriginal.apply(this,arguments);
    }finally{
      if(listeOriginale && typeof S!=='undefined' && S){
        S.chantiers=listeOriginale;
      }

      if(focusInvalide){
        try{
          const url=new URL(window.location.href);
          if(url.searchParams.has('chantier')){
            url.searchParams.delete('chantier');
            history.replaceState(null,'',url.pathname+(url.search||'')+(url.hash||'#chantiers'));
          }
        }catch(_){}
      }
    }
  };

  // Nettoie immédiatement une éventuelle ligne fantôme déjà affichée.
  try{
    if(document.getElementById('pane-chantiers'))renderChantiers();
  }catch(e){
    console.warn('Garde chantier fantôme :',e);
  }
})();

/* =========================================================
   CHARGE LE THEME BLANC / GRIS DE LA PAGE CHANTIERS
========================================================= */
(function(){
  'use strict';
  if(document.querySelector('script[data-yaya-home-white-grey="1"]'))return;
  const s=document.createElement('script');
  s.src='chantier-home-white-grey.js?v=home-grey-'+Date.now();
  s.dataset.yayaHomeWhiteGrey='1';
  document.head.appendChild(s);
})();
