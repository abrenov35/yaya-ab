(function(){
  'use strict';

  if(window.__yayaAutoPlanningCreateInstalled)return;
  window.__yayaAutoPlanningCreateInstalled=true;

  const HIDDEN_GANTT_COLOR='#9CA3AF';
  const SYNC_TIMEOUT_MS=18000;
  const UI_STYLE_ID='yaya-auto-planning-ui-style';

  function installUiStyle(){
    if(document.getElementById(UI_STYLE_ID))return;
    const style=document.createElement('style');
    style.id=UI_STYLE_ID;
    style.textContent='.yaya-planning-box{display:none!important;}';
    document.head.appendChild(style);
  }

  function hidePlanningUi(){
    const toggle=document.getElementById('chPlanningToggle');
    if(toggle&&toggle.parentElement){
      toggle.parentElement.style.setProperty('display','none','important');
    }
    document.querySelectorAll('.yaya-planning-box').forEach(function(box){
      box.style.setProperty('display','none','important');
    });

    const demarrage=document.getElementById('chDemarrage');
    if(demarrage){
      const bloc=demarrage.closest('label')||demarrage.parentElement;
      if(bloc)bloc.style.setProperty('display','none','important');
    }
  }

  function installUiCleanup(){
    installUiStyle();
    hidePlanningUi();
    if(!document.body){
      setTimeout(installUiCleanup,100);
      return;
    }
    const observer=new MutationObserver(hidePlanningUi);
    observer.observe(document.body,{childList:true,subtree:true});
  }

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
      const callback='yayaAutoPlanning_'+Date.now()+'_'+Math.random().toString(36).slice(2);
      const script=document.createElement('script');
      let done=false;
      const timer=setTimeout(function(){finish(new Error('Planning ne répond pas'));},SYNC_TIMEOUT_MS);

      function finish(err,data){
        if(done)return;
        done=true;
        clearTimeout(timer);
        if(script.parentNode)script.parentNode.removeChild(script);
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

  async function findPlanningByName(name){
    const response=await jsonpPlanning({action:'getChantiers'});
    const list=Array.isArray(response)?response:(Array.isArray(response&&response.chantiers)?response.chantiers:[]);
    const wanted=normalizeName(name);
    if(!wanted)return null;
    const matches=list.filter(function(c){return normalizeName(c&&c.nom)===wanted;});
    if(!matches.length)return null;
    matches.sort(function(a,b){return Number(b&&b.id||0)-Number(a&&a.id||0);});
    return matches[0]||null;
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

  async function persistPlanningLink(localId,planningId,planningName){
    let chantier=null;
    try{
      chantier=Array.isArray(S&&S.chantiers)
        ?S.chantiers.find(function(c){return String(c.id)===String(localId);})||null
        :null;
    }catch(e){}
    if(!chantier||!planningId)return false;

    chantier.planningPresent=true;
    chantier.sourcePlanningId=String(planningId);
    chantier.planningNom=planningName||chantier.nom||'';

    try{
      const ok=await apiPost('setChantiers',S.chantiers);
      if(ok&&typeof render==='function')render();
      return !!ok;
    }catch(e){return false;}
  }

  async function syncOne(localChantier){
    if(!localChantier||!localChantier.id||!localChantier.nom)return;
    if(localChantier.sourcePlanningId||localChantier.planningPresent)return;

    try{
      let existing=await findPlanningByName(localChantier.nom);
      let planningId=existing&&existing.id?String(existing.id):'';
      let planningName=existing&&existing.nom?existing.nom:localChantier.nom;

      if(!planningId){
        const date=String(localChantier.dateDemarrageEstime||localChantier.dateDebut||'');
        const response=await jsonpPlanning({
          action:'createChantier',
          nom:String(localChantier.nom||''),
          dateDebut:date,
          dateFin:date,
          description:'',
          couleur:HIDDEN_GANTT_COLOR,
          dateSignature:String(localChantier.dateSignature||''),
          typeChantier:String(localChantier.typeChantier||'Rénovation')
        });
        if(!response||!(response.success||response.ok)){
          throw new Error(response&&response.error?response.error:'Création Planning refusée');
        }
        planningId=planningIdFromResponse(response);
        if(!planningId){
          existing=await findPlanningByName(localChantier.nom);
          planningId=existing&&existing.id?String(existing.id):'';
          planningName=existing&&existing.nom?existing.nom:planningName;
        }
      }

      if(!planningId)throw new Error('Identifiant Planning introuvable');
      const linked=await persistPlanningLink(localChantier.id,planningId,planningName);
      if(!linked)throw new Error('Lien Planning non enregistré dans Yaya');
      if(typeof toast==='function')toast('Chantier créé dans Yaya et Planning ✓');
    }catch(err){
      console.error('Création automatique Planning :',err);
      if(typeof toast==='function')toast('Chantier créé dans Yaya — synchronisation Planning à reprendre',true);
    }
  }

  async function confirmCreatedOnYaya(localId){
    try{
      if(typeof apiGet!=='function')return null;
      const fresh=await apiGet(true);
      const list=Array.isArray(fresh&&fresh.chantiers)?fresh.chantiers:[];
      return list.find(function(c){return String(c.id)===String(localId);})||null;
    }catch(e){return null;}
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
      if(!Number.isFinite(montantMarcheHT)||montantMarcheHT<0){if(typeof toast==='function')toast('Chiffre d’affaires HT invalide',true);mtEl.focus();return;}

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
        notes:'',
        planningPresent:false,
        sourcePlanningId:''
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

        const confirmed=await confirmCreatedOnYaya(chantier.id);
        syncOne(confirmed||chantier);
      }catch(err){
        try{S.chantiers=S.chantiers.filter(function(c){return String(c.id)!==String(chantier.id);});}catch(e){}
        if(typeof render==='function')render();
        if(typeof toast==='function')toast('Création du chantier impossible : '+(err&&err.message?err.message:'erreur'),true);
      }finally{
        const liveBtn=document.getElementById('chCreateBtn');
        if(liveBtn){liveBtn.disabled=false;liveBtn.textContent='Créer le chantier';}
      }
    };
    automaticAdd.__yayaAutomaticPlanningAdd=true;
    return automaticAdd;
  }

  function installAutomaticAdd(){
    const current=window.addChantier;
    if(typeof current!=='function')return false;
    if(current.__yayaAutomaticPlanningAdd)return true;
    if(!window.__yayaLegacyAddChantier)window.__yayaLegacyAddChantier=current;
    window.addChantier=makeAutomaticAdd();
    return true;
  }

  function start(){
    installUiCleanup();
    installAutomaticAdd();
    setInterval(function(){
      hidePlanningUi();
      if(typeof window.addChantier==='function'&&!window.addChantier.__yayaAutomaticPlanningAdd){
        installAutomaticAdd();
      }
    },1000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
