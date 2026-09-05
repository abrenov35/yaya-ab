(function(){
  'use strict';

  if(window.__yayaAutoPlanningCreateInstalled)return;
  window.__yayaAutoPlanningCreateInstalled=true;

  const HIDDEN_GANTT_COLOR='#9CA3AF';
  const SYNC_TIMEOUT_MS=18000;
  let wrapping=false;

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

  function installWrapper(){
    if(wrapping)return;
    const current=window.addChantier;
    if(typeof current!=='function')return false;
    if(current.__yayaAutoPlanningWrapped)return true;

    wrapping=true;
    const wrapped=async function(){
      let before=[];
      try{before=Array.isArray(S&&S.chantiers)?S.chantiers.map(function(c){return String(c.id);}):[];}catch(e){}
      const result=await current.apply(this,arguments);

      let created=null;
      try{
        created=Array.isArray(S&&S.chantiers)
          ?S.chantiers.find(function(c){return before.indexOf(String(c.id))<0;})||null
          :null;
      }catch(e){}

      if(created){
        const confirmed=await confirmCreatedOnYaya(created.id);
        if(confirmed)syncOne(confirmed);
      }
      return result;
    };
    wrapped.__yayaAutoPlanningWrapped=true;
    wrapped.__yayaAutoPlanningOriginal=current;
    window.addChantier=wrapped;
    wrapping=false;
    return true;
  }

  function start(){
    installWrapper();
    setInterval(function(){
      if(typeof window.addChantier==='function'&&!window.addChantier.__yayaAutoPlanningWrapped){
        installWrapper();
      }
    },1200);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
