(function(){
  'use strict';

  if(window.__yayaHoursActiveChantiersFilterV1)return;
  window.__yayaHoursActiveChantiersFilterV1=true;

  function norm(value){
    return String(value==null?'':value)
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/\s+/g,' ')
      .trim()
      .toUpperCase();
  }

  function isActiveChantier(c){
    if(!c||!c.id)return false;

    const name=norm(c.nom||c.name||'');
    const status=norm(c.statut||c.status||'');

    // Le pseudo-chantier YAYA désactivé ne doit jamais être proposé dans les heures.
    if(name==='YAYA')return false;

    // Même règle que l'ancienne saisie journalière, étendue aux variantes usuelles.
    if(status==='TERMINE'||status==='ARCHIVE'||status==='DESACTIVE'||status==='INACTIF')return false;
    if(c.archive===true||c.archived===true||c.disabled===true||c.active===false)return false;

    return true;
  }

  function activeProjects(){
    try{
      if(typeof S==='undefined'||!S||!Array.isArray(S.chantiers))return [];
      return S.chantiers.filter(isActiveChantier);
    }catch(e){
      return [];
    }
  }

  // La modale hebdomadaire appelle yayaProjects() pour construire sa liste.
  window.yayaProjects=activeProjects;
  try{yayaProjects=activeProjects;}catch(e){}

  // Sécurité pour une modale déjà ouverte au moment d'un rafraîchissement.
  function cleanOpenHoursSelects(){
    const allowed=new Set(activeProjects().map(function(c){return String(c.id);}));
    document.querySelectorAll('#yayaWeekRows select.yaya-week-select').forEach(function(select){
      Array.from(select.options).forEach(function(option){
        const value=String(option.value||'');
        if(!value||value.indexOf('MOTIF:')===0)return;
        if(!allowed.has(value))option.remove();
      });
    });
  }

  window.addEventListener('yaya:data-refreshed',function(){setTimeout(cleanOpenHoursSelects,0);});
  document.addEventListener('click',function(e){
    if(e.target&&e.target.closest&&e.target.closest('#pane-heures,.yaya-week-modal')){
      setTimeout(cleanOpenHoursSelects,0);
    }
  },true);
})();
