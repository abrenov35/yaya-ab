(function(){
  'use strict';

  let verifySeq=0;

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

  function getChantierById(cid){
    try{
      return Array.isArray(S.chantiers)
        ? S.chantiers.find(function(c){return String(c.id)===String(cid);})||null
        : null;
    }catch(e){return null;}
  }

  function getChantierByName(name){
    const wanted=normalizeName(name);
    if(!wanted)return null;
    try{
      return Array.isArray(S.chantiers)
        ? S.chantiers.find(function(c){return normalizeName(c&&c.nom)===wanted;})||null
        : null;
    }catch(e){return null;}
  }

  function currentModalChantier(cid){
    const byId=cid?getChantierById(cid):null;
    if(byId)return byId;
    const input=document.getElementById('editChNom');
    return input?getChantierByName(input.value):null;
  }

  function setPlanningBox(stateType,message){
    const state=document.getElementById('editPlanningState');
    const btn=document.getElementById('editPlanningBtn');
    const note=document.getElementById('editPlanningNote');
    if(!state||!btn||!note)return false;

    if(stateType==='checking'){
      state.textContent='Vérification du Planning…';
      state.style.color='var(--muted,#66758a)';
      btn.textContent='Vérification…';
      btn.disabled=true;
      btn.style.opacity='.6';
      note.textContent='Yaya vérifie directement le Planning.';
      return true;
    }

    if(stateType==='present'){
      state.textContent='✓ Présent dans Planning';
      state.style.color='var(--green)';
      btn.textContent='Présent dans Planning';
      btn.disabled=true;
      btn.style.opacity='.6';
      note.textContent=message||'Chantier retrouvé dans Planning.';
      return true;
    }

    if(stateType==='error'){
      state.textContent='Planning non vérifié';
      state.style.color='var(--amber)';
      btn.textContent='Réessayer / rattacher au Planning';
      btn.disabled=false;
      btn.style.opacity='1';
      note.textContent=message||'Impossible de vérifier Planning pour le moment.';
      return true;
    }

    state.textContent='— Pas présent dans Planning';
    state.style.color='var(--amber)';
    btn.textContent='Créer / rattacher au Planning';
    btn.disabled=false;
    btn.style.opacity='1';
    note.textContent=message||'Aucun chantier correspondant trouvé dans Planning.';
    return true;
  }

  async function verifyPlanning(cid){
    const chantier=currentModalChantier(cid);
    const nameInput=document.getElementById('editChNom');
    const nom=String((nameInput&&nameInput.value)||(chantier&&chantier.nom)||'').trim();
    if(!nom||!document.getElementById('editPlanningState'))return;

    const seq=++verifySeq;
    setPlanningBox('checking');

    try{
      if(typeof getChantiersPlanning!=='function')throw new Error('API Planning indisponible');
      const list=await Promise.race([
        getChantiersPlanning(),
        new Promise(function(_,reject){
          setTimeout(function(){reject(new Error('délai de réponse dépassé'));},18000);
        })
      ]);
      if(seq!==verifySeq||!document.getElementById('editPlanningState'))return;
      const match=findPlanningMatch(list,nom);
      if(match){
        if(chantier){
          chantier.planningPresent=true;
          chantier.sourcePlanningId=match.id?String(match.id):chantier.sourcePlanningId||'';
          chantier.planningNom=match.nom||nom;
        }
        setPlanningBox('present','Retrouvé dans Planning : '+(match.nom||nom)+'.');
      }else if(chantier&&(chantier.planningPresent||chantier.sourcePlanningId)){
        setPlanningBox('present','Déjà rattaché au Planning.');
      }else{
        setPlanningBox('absent');
      }
    }catch(err){
      if(seq!==verifySeq||!document.getElementById('editPlanningState'))return;
      if(chantier&&(chantier.planningPresent||chantier.sourcePlanningId)){
        setPlanningBox('present','Déjà rattaché au Planning.');
      }else{
        setPlanningBox('error','Vérification Planning impossible : '+(err&&err.message?err.message:'erreur réseau')+'.');
      }
    }
  }

  function hookOpenFunction(){
    if(typeof window.openExistingChantierModal!=='function')return;
    if(window.openExistingChantierModal.__planningStatusFixedV2)return;
    const original=window.openExistingChantierModal;
    const wrapped=function(cid){
      const result=original.apply(this,arguments);
      setTimeout(function(){verifyPlanning(cid);},0);
      return result;
    };
    wrapped.__planningStatusFixedV2=true;
    window.openExistingChantierModal=wrapped;
  }

  let modalTimer=0;
  let observedPlanningState=null;
  function watchModal(){
    const root=document.getElementById('modalRoot');
    if(!root){setTimeout(watchModal,150);return;}
    new MutationObserver(function(){
      clearTimeout(modalTimer);
      modalTimer=setTimeout(function(){
        hookOpenFunction();
        const planningState=document.getElementById('editPlanningState');
        if(!planningState){
          observedPlanningState=null;
          return;
        }
        // Vérifier une seule fois à l'ouverture de cette modale. Les changements
        // de texte produits par setPlanningBox ne doivent pas relancer la requête.
        if(planningState!==observedPlanningState&&document.getElementById('editChNom')){
          observedPlanningState=planningState;
          verifyPlanning('');
        }
      },10);
    }).observe(root,{childList:true,subtree:true});
  }

  function install(){
    hookOpenFunction();
    watchModal();
    setInterval(hookOpenFunction,1000);
  }

  install();
})();
