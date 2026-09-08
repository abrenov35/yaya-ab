(function(){
  'use strict';

  if(window.__yayaExtranetPlanningReconcileV1)return;
  window.__yayaExtranetPlanningReconcileV1=true;

  const EXTRANET_ID=/^C\d+$/i;
  const HIDDEN_COLOR='#9CA3AF';
  const TIMEOUT_MS=18000;
  const done=new Set();
  let running=false;
  let scheduled=false;

  function normalizeName(value){
    return String(value||'')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toUpperCase().replace(/[^A-Z0-9]+/g,' ')
      .trim().replace(/\s+/g,' ');
  }

  function planningApi(){
    try{return String(PLANNING_API||'').trim();}catch(e){return '';}
  }

  function planningList(response){
    if(Array.isArray(response))return response;
    if(response&&Array.isArray(response.chantiers))return response.chantiers;
    if(response&&response.data&&Array.isArray(response.data.chantiers))return response.data.chantiers;
    return [];
  }

  function jsonp(params){
    return new Promise(function(resolve,reject){
      const api=planningApi();
      if(!api){reject(new Error('API Planning indisponible'));return;}

      const callback='yayaExtranetPlanning_'+Date.now()+'_'+Math.random().toString(36).slice(2);
      const script=document.createElement('script');
      let finished=false;
      const timer=setTimeout(function(){finish(new Error('Planning ne répond pas'));},TIMEOUT_MS);

      function finish(err,data){
        if(finished)return;
        finished=true;
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

  function marker(id){
    return '[YAYA_ID:'+String(id||'').trim().toUpperCase()+']';
  }

  function findByMarker(list,id){
    const wanted=marker(id);
    return (list||[]).find(function(p){
      return String(p&&p.description||'').toUpperCase().indexOf(wanted)!==-1;
    })||null;
  }

  function findUniqueByName(list,name){
    const wanted=normalizeName(name);
    if(!wanted)return null;
    const matches=(list||[]).filter(function(p){return normalizeName(p&&p.nom)===wanted;});
    return matches.length===1?matches[0]:null;
  }

  function candidates(){
    try{
      if(typeof S==='undefined'||!S||!Array.isArray(S.chantiers))return [];
      return S.chantiers.filter(function(c){
        const id=String(c&&c.id||'').trim().toUpperCase();
        return EXTRANET_ID.test(id)&&String(c&&c.nom||'').trim()&&!done.has(id);
      });
    }catch(e){return [];}
  }

  function planningId(response){
    return String(response&&(
      response.id||response.chantierId||
      (response.data&&response.data.id)||
      (response.chantier&&response.chantier.id)
    )||'').trim();
  }

  async function createInPlanning(c){
    const id=String(c.id||'').trim().toUpperCase();
    const date=String(c.dateDemarrageEstime||c.dateDemarrage||c.dateDebut||'').slice(0,10);
    const response=await jsonp({
      action:'createChantier',
      nom:String(c.nom||'').trim(),
      dateDebut:date,
      dateFin:date,
      description:marker(id),
      couleur:HIDDEN_COLOR,
      dateSignature:String(c.dateSignature||'').slice(0,10),
      typeChantier:String(c.typeChantier||'Rénovation')
    });

    if(!response||!(response.success||response.ok)){
      throw new Error(response&&response.error?response.error:'Création Planning refusée');
    }

    return {
      id:planningId(response),
      nom:String(c.nom||'').trim(),
      description:marker(id)
    };
  }

  async function reconcile(){
    if(running)return;
    const todo=candidates();
    if(!todo.length)return;
    if(!planningApi())return;

    running=true;
    try{
      let list=planningList(await jsonp({action:'getChantiers'}));

      for(const c of todo){
        const id=String(c.id||'').trim().toUpperCase();
        try{
          let existing=findByMarker(list,id);

          // Protection anti-doublon : si un chantier Planning porte déjà exactement
          // le même nom, on le considère comme déjà présent plutôt que d'en créer un second.
          if(!existing)existing=findUniqueByName(list,c.nom);

          if(existing){
            done.add(id);
            continue;
          }

          const created=await createInPlanning(c);
          list=list.concat([created]);
          done.add(id);
          console.info('Yaya → Planning : chantier Extranet créé',id,c.nom);
        }catch(err){
          console.error('Yaya → Planning : échec chantier Extranet',id,c&&c.nom,err);
        }
      }
    }catch(err){
      console.error('Yaya → Planning : synchronisation Extranet impossible',err);
    }finally{
      running=false;
    }
  }

  function schedule(delay){
    if(scheduled)return;
    scheduled=true;
    setTimeout(function(){
      scheduled=false;
      reconcile();
    },typeof delay==='number'?delay:250);
  }

  schedule(1200);
  setTimeout(function(){schedule(0);},4000);
  window.addEventListener('yaya:data-refreshed',function(){schedule(350);});
  window.addEventListener('focus',function(){schedule(250);});
})();
