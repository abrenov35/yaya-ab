(function(){
  'use strict';

  function normalizeName(value){
    return String(value||'')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toUpperCase().replace(/[^A-Z0-9]+/g,' ')
      .trim().replace(/\s+/g,' ');
  }

  function findPlanningMatch(list,name){
    const wanted=normalizeName(name);
    if(!wanted)return null;
    const exact=(list||[]).find(function(item){
      return normalizeName(item&&item.nom)===wanted;
    });
    if(exact)return exact;
    return (list||[]).find(function(item){
      const candidate=normalizeName(item&&item.nom);
      return candidate && Math.min(candidate.length,wanted.length)>=5 &&
        (candidate.includes(wanted)||wanted.includes(candidate));
    })||null;
  }

  function getChantier(cid){
    try{
      return Array.isArray(S.chantiers)
        ? S.chantiers.find(function(c){return String(c.id)===String(cid);})||null
        : null;
    }catch(e){return null;}
  }

  function setPlanningBox(stateType,message){
    const state=document.getElementById('editPlanningState');
    const btn=document.getElementById('editPlanningBtn');
    const note=document.getElementById('editPlanningNote');
    if(!state||!btn||!note)return;

    if(stateType==='checking'){
      state.textContent='Vérification du Planning…';
      state.style.color='var(--muted,#66758a)';
      btn.textContent='Vérification…';
      btn.disabled=true;
      btn.style.opacity='.6';
      note.textContent='Yaya vérifie directement le Planning.';
      return;
    }

    if(stateType==='present'){
      state.textContent='✓ Présent dans Planning';
      state.style.color='var(--green)';
      btn.textContent='Présent dans Planning';
      btn.disabled=true;
      btn.style.opacity='.6';
      note.textContent=message||'Chantier retrouvé dans Planning.';
      return;
    }

    if(stateType==='error'){
      state.textContent='Planning non vérifié';
      state.style.color='var(--amber)';
      btn.textContent='Réessayer / rattacher au Planning';
      btn.disabled=false;
      btn.style.opacity='1';
      note.textContent=message||'Impossible de vérifier Planning pour le moment.';
      return;
    }

    state.textContent='— Pas présent dans Planning';
    state.style.color='var(--amber)';
    btn.textContent='Créer / rattacher au Planning';
    btn.disabled=false;
    btn.style.opacity='1';
    note.textContent=message||'Aucun chantier correspondant trouvé dans Planning.';
  }

  async function verifyPlanning(cid){
    const chantier=getChantier(cid);
    if(!chantier)return;
    if(typeof getChantiersPlanning!=='function'){
      setPlanningBox('error','API Planning indisponible.');
      return;
    }

    setPlanningBox('checking');
    try{
      const list=await getChantiersPlanning();
      const match=findPlanningMatch(list,chantier.nom);
      if(match){
        chantier.planningPresent=true;
        chantier.sourcePlanningId=match.id?String(match.id):chantier.sourcePlanningId||'';
        chantier.planningNom=match.nom||chantier.nom;
        setPlanningBox('present','Retrouvé dans Planning : '+(match.nom||chantier.nom)+'.');
      }else if(chantier.planningPresent||chantier.sourcePlanningId){
        setPlanningBox('present','Déjà rattaché au Planning.');
      }else{
        setPlanningBox('absent');
      }
    }catch(err){
      if(chantier.planningPresent||chantier.sourcePlanningId){
        setPlanningBox('present','Déjà rattaché au Planning.');
      }else{
        setPlanningBox('error','Vérification Planning impossible : '+(err&&err.message?err.message:'erreur réseau')+'.');
      }
    }
  }

  function install(){
    if(typeof window.openExistingChantierModal!=='function'){
      setTimeout(install,120);
      return;
    }
    if(window.openExistingChantierModal.__planningStatusFixed)return;

    const original=window.openExistingChantierModal;
    const wrapped=function(cid){
      const result=original.apply(this,arguments);
      setTimeout(function(){verifyPlanning(cid);},20);
      return result;
    };
    wrapped.__planningStatusFixed=true;
    window.openExistingChantierModal=wrapped;
  }

  install();
})();
