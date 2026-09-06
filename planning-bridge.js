(function(){
  'use strict';

  if(window.__yayaPlanningBridgeV2)return;
  window.__yayaPlanningBridgeV2=true;
  window.__yayaPlanningBridgeV1=true;

  const HIDDEN_GANTT_COLOR='#9CA3AF';
  const SYNC_TIMEOUT_MS=18000;

  function normalizeName(value){
    return String(value||'')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toUpperCase().replace(/[^A-Z0-9]+/g,' ')
      .trim().replace(/\s+/g,' ');
  }

  function planningApi(){
    try{return String(PLANNING_API||'').trim();}catch(e){return '';}
  }

  function jsonpPlanning(params){
    return new Promise(function(resolve,reject){
      const api=planningApi();
      if(!api){reject(new Error('API Planning indisponible'));return;}

      const callback='yayaPlanningBridge_'+Date.now()+'_'+Math.random().toString(36).slice(2);
      const script=document.createElement('script');
      let fini=false;
      const timer=setTimeout(function(){finish(new Error('Planning ne répond pas'));},SYNC_TIMEOUT_MS);

      function finish(err,data){
        if(fini)return;
        fini=true;
        clearTimeout(timer);
        if(script.parentNode)script.remove();
        try{delete window[callback];}catch(e){window[callback]=undefined;}
        if(err)reject(err);else resolve(data);
      }

      window[callback]=function(data){finish(null,data);};
      script.onerror=function(){finish(new Error('Impossible de joindre Planning'));};
      const query=new URLSearchParams(Object.assign({},params,{callback:callback,_ts:String(Date.now())}));
      script.src=api+'?'+query.toString();
      script.async=true;
      document.head.appendChild(script);
    });
  }

  function planningList(response){
    if(Array.isArray(response))return response;
    if(response&&Array.isArray(response.chantiers))return response.chantiers;
    if(response&&response.data&&Array.isArray(response.data.chantiers))return response.data.chantiers;
    return [];
  }

  function planningIdFromResponse(response){
    return String(
      response&&(
        response.id||
        response.chantierId||
        (response.data&&response.data.id)||
        (response.chantier&&response.chantier.id)
      )||''
    ).trim();
  }

  function markerFor(localId){
    return '[YAYA_ID:'+String(localId||'').trim()+']';
  }

  function matchByIdentity(list,localId,name){
    const marker=markerFor(localId);
    const byMarker=(list||[]).filter(function(p){
      return String(p&&p.description||'').indexOf(marker)!==-1;
    });
    if(byMarker.length===1)return byMarker[0];
    if(byMarker.length>1)throw new Error('Plusieurs chantiers Planning portent le même identifiant Yaya');

    const wanted=normalizeName(name);
    if(!wanted)return null;
    const exact=(list||[]).filter(function(p){return normalizeName(p&&p.nom)===wanted;});
    if(exact.length===1)return exact[0];
    if(exact.length>1)throw new Error('Plusieurs chantiers Planning portent ce nom');
    return null;
  }

  async function ensurePlanning(localChantier){
    if(!localChantier||!localChantier.id||!localChantier.nom)return null;

    const first=planningList(await jsonpPlanning({action:'getChantiers'}));
    let existing=matchByIdentity(first,localChantier.id,localChantier.nom);
    let planningId=existing&&existing.id?String(existing.id):'';
    let planningName=existing&&existing.nom?String(existing.nom):String(localChantier.nom);

    if(!planningId){
      const date=String(localChantier.dateDemarrageEstime||localChantier.dateDebut||'');
      const response=await jsonpPlanning({
        action:'createChantier',
        nom:String(localChantier.nom||''),
        dateDebut:date,
        dateFin:date,
        description:markerFor(localChantier.id),
        couleur:HIDDEN_GANTT_COLOR,
        dateSignature:String(localChantier.dateSignature||''),
        typeChantier:String(localChantier.typeChantier||'Rénovation')
      });

      if(!response||!(response.success||response.ok)){
        throw new Error(response&&response.error?response.error:'Création Planning refusée');
      }

      planningId=planningIdFromResponse(response);

      if(!planningId){
        const second=planningList(await jsonpPlanning({action:'getChantiers'}));
        existing=matchByIdentity(second,localChantier.id,localChantier.nom);
        planningId=existing&&existing.id?String(existing.id):'';
        planningName=existing&&existing.nom?String(existing.nom):planningName;
      }
    }

    if(!planningId)throw new Error('Identifiant Planning introuvable');

    localChantier.planningPresent=true;
    localChantier.sourcePlanningId=planningId;
    localChantier.planningNom=planningName;

    try{
      window.dispatchEvent(new CustomEvent('yaya:planning-linked',{
        detail:{yayaId:String(localChantier.id),planningId:planningId}
      }));
    }catch(e){}

    return {planningId:planningId,planningName:planningName};
  }

  function cleanupCreateModal(){
    const planningToggle=document.getElementById('chPlanningToggle');
    if(planningToggle&&planningToggle.parentElement){
      planningToggle.parentElement.style.setProperty('display','none','important');
    }

    const demarrage=document.getElementById('chDemarrage');
    if(demarrage){
      const bloc=demarrage.closest('label')||demarrage.parentElement;
      if(bloc)bloc.style.setProperty('display','none','important');
    }
  }

  function observeCreateModal(){
    cleanupCreateModal();
    const root=document.getElementById('modalRoot');
    if(!root){setTimeout(observeCreateModal,120);return;}
    if(root.dataset.yayaPlanningBridgeV2Observed==='1')return;
    root.dataset.yayaPlanningBridgeV2Observed='1';
    new MutationObserver(cleanupCreateModal).observe(root,{childList:true,subtree:true});
  }

  function makeAutomaticAdd(){
    const automaticAdd=async function(){
      const nomEl=document.getElementById('chNom');
      const sigEl=document.getElementById('chSignature');
      const demEl=document.getElementById('chDemarrage');
      const mtEl=document.getElementById('chMarcheHT');
      if(!nomEl||!sigEl||!demEl||!mtEl)return;

      const nom=String(nomEl.value||'').trim();
      const dateSignature=String(sigEl.value||'').trim();
      const dateDemarrageEstime=String(demEl.value||'').trim();
      const brut=String(mtEl.value||'').trim().replace(/\s/g,'').replace(',','.');

      if(!nom){if(typeof toast==='function')toast('Indique le nom du chantier',true);nomEl.focus();return;}
      if(!/^\d{4}-\d{2}$/.test(dateSignature)){if(typeof toast==='function')toast('Indique le mois et l’année de signature',true);sigEl.focus();return;}
      if(brut===''){if(typeof toast==='function')toast('Indique le chiffre d’affaires HT',true);mtEl.focus();return;}

      const montantMarcheHT=Number(brut);
      if(!Number.isFinite(montantMarcheHT)||montantMarcheHT<0){
        if(typeof toast==='function')toast('Chiffre d’affaires HT invalide',true);
        mtEl.focus();
        return;
      }

      const btn=document.getElementById('chCreateBtn');
      if(btn){btn.disabled=true;btn.textContent='Création…';}

      const chantier={
        id:typeof uid==='function'?uid():('ch_'+Date.now()),
        nom:nom,
        numero:'',
        montantDevisHT:0,
        montantMarcheHT:montantMarcheHT,
        dateSignature:dateSignature,
        dateDemarrageEstime:dateDemarrageEstime||'',
        statut:'En cours',
        notes:''
      };

      try{
        S.chantiers.push(chantier);
        try{if(expChantiers&&typeof expChantiers.clear==='function')expChantiers.clear();}catch(e){}
        try{tab='chantiers';}catch(e){}
        if(typeof closeModal==='function')closeModal();
        if(typeof render==='function')render();

        const ok=await apiPost('setChantiers',S.chantiers);
        if(!ok)throw new Error('Enregistrement Yaya refusé');

        if(typeof toast==='function')toast('Chantier créé dans Yaya ✓');

        ensurePlanning(chantier)
          .then(function(){
            if(typeof toast==='function')toast('Chantier créé dans Yaya et Planning ✓');
          })
          .catch(function(err){
            console.error('Passerelle Yaya -> Planning :',err);
            if(typeof toast==='function')toast('Chantier créé dans Yaya — Planning à synchroniser',true);
          });
      }catch(err){
        try{S.chantiers=S.chantiers.filter(function(c){return String(c.id)!==String(chantier.id);});}catch(e){}
        if(typeof render==='function')render();
        if(typeof toast==='function')toast('Création du chantier impossible : '+(err&&err.message?err.message:'erreur'),true);
      }finally{
        const liveBtn=document.getElementById('chCreateBtn');
        if(liveBtn){liveBtn.disabled=false;liveBtn.textContent='Créer le chantier';}
      }
    };

    automaticAdd.__yayaPlanningBridgeAdd=true;
    automaticAdd.__yayaAutomaticPlanningAdd=true;
    return automaticAdd;
  }

  function installAutomaticAdd(){
    const current=window.addChantier;
    if(typeof current!=='function'){setTimeout(installAutomaticAdd,120);return;}
    if(current.__yayaPlanningBridgeAdd)return;
    if(!window.__yayaLegacyAddChantier)window.__yayaLegacyAddChantier=current;
    window.addChantier=makeAutomaticAdd();
  }

  observeCreateModal();
  installAutomaticAdd();
})();
