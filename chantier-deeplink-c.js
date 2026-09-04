(function(){
  'use strict';

  const params=new URLSearchParams(window.location.search);
  const requestedId=String(params.get('c')||'').trim().toUpperCase();

  // Nouveau format commun Extranet ↔ Yaya : C + numéro, ex. C142.
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
      return String(c&&c.id||'').trim().toUpperCase()===requestedId;
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
        history.replaceState(null,'',window.location.pathname+window.location.search+'#chantiers');
      }
    }catch(e){}

    try{
      focusChantier=id;
      expChantiers.clear();
      expChantiers.add(id);
    }catch(e){
      if(typeof window.toggleChantier==='function')window.toggleChantier(id);
      else if(typeof toggleChantier==='function')toggleChantier(id);
    }

    if(typeof window.render==='function')window.render();
    else if(typeof render==='function')render();

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
    if(openTarget())return;
  }

  // Le script est injecté après le cœur de Yaya : on attend simplement que les données soient prêtes.
  attempt();
  timer=setInterval(attempt,250);

  // Un lien peut être ouvert juste après la création du chantier : dans ce cas,
  // on force une lecture réseau une seule fois pour éviter qu'un cache local ancien masque Cxxx.
  setTimeout(forceFreshChantiersOnce,1200);

  // Sécurité : ne pas laisser tourner le polling indéfiniment si l'ID n'existe pas.
  setTimeout(function(){
    if(timer)clearInterval(timer);
  },15000);

  window.addEventListener('yaya:data-refreshed',attempt);
})();
