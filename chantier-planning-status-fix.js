(function(){
  'use strict';

  // Bloque définitivement l’ancienne passerelle chantier-auto-planning-create.js.
  window.__yayaAutoPlanningCreateInstalled=true;

  if(!document.querySelector('script[data-yaya-planning-bridge-v3]')){
    const script=document.createElement('script');
    script.src='planning-bridge.js?v=bridge-3';
    script.async=false;
    script.setAttribute('data-yaya-planning-bridge-v3','1');
    document.head.appendChild(script);
  }

  const SERGEANT_ID='mtoo0u4ctll0';
  const SERGEANT_NAME='SERGEANT';
  const MARKER='[YAYA_ID:'+SERGEANT_ID+']';
  let repairStarted=false;

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

      const callback='yayaSergeantRepair_'+Date.now()+'_'+Math.random().toString(36).slice(2);
      const script=document.createElement('script');
      let done=false;
      const timer=setTimeout(function(){finish(new Error('Planning ne répond pas'));},18000);

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

  function planningList(response){
    if(Array.isArray(response))return response;
    if(response&&Array.isArray(response.chantiers))return response.chantiers;
    if(response&&response.data&&Array.isArray(response.data.chantiers))return response.data.chantiers;
    return [];
  }

  function findSergeantInPlanning(list){
    const byMarker=(list||[]).find(function(p){
      return String(p&&p.description||'').indexOf(MARKER)!==-1;
    });
    if(byMarker)return byMarker;

    return (list||[]).find(function(p){
      return normalizeName(p&&p.nom)===SERGEANT_NAME;
    })||null;
  }

  function localSergeant(){
    try{
      if(typeof S==='undefined'||!S||!Array.isArray(S.chantiers))return null;
      return S.chantiers.find(function(c){return String(c&&c.id||'')===SERGEANT_ID;})||
        S.chantiers.find(function(c){return normalizeName(c&&c.nom)===SERGEANT_NAME;})||null;
    }catch(e){return null;}
  }

  async function repairSergeant(){
    if(repairStarted)return;
    const chantier=localSergeant();
    if(!chantier)return;

    repairStarted=true;
    try{
      const before=planningList(await jsonpPlanning({action:'getChantiers'}));
      if(findSergeantInPlanning(before))return;

      const date=String(chantier.dateDemarrageEstime||chantier.dateDebut||'');
      const response=await jsonpPlanning({
        action:'createChantier',
        nom:String(chantier.nom||SERGEANT_NAME),
        dateDebut:date,
        dateFin:date,
        description:MARKER,
        couleur:'#9CA3AF',
        dateSignature:String(chantier.dateSignature||''),
        typeChantier:String(chantier.typeChantier||'Rénovation')
      });

      if(!response||!(response.success||response.ok)){
        throw new Error(response&&response.error?response.error:'Création Planning refusée');
      }

      const after=planningList(await jsonpPlanning({action:'getChantiers'}));
      if(!findSergeantInPlanning(after))throw new Error('SERGEANT introuvable après création');

      try{if(typeof toast==='function')toast('SERGEANT recréé dans Planning ✓');}catch(e){}
    }catch(err){
      repairStarted=false;
      console.error('Réparation SERGEANT Planning :',err);
      try{if(typeof toast==='function')toast('Synchronisation SERGEANT vers Planning à reprendre',true);}catch(e){}
    }
  }

  function startRepair(){
    let tries=0;
    const timer=setInterval(function(){
      tries++;
      if(localSergeant()&&planningApi()){
        clearInterval(timer);
        repairSergeant();
      }else if(tries>40){
        clearInterval(timer);
      }
    },250);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startRepair,{once:true});
  else startRepair();
})();
