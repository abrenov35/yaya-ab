(function(){
  'use strict';

  if(window.__yayaSmartRefreshInstalled)return;
  window.__yayaSmartRefreshInstalled=true;

  const MOBILE=window.matchMedia&&window.matchMedia('(pointer:coarse)').matches;
  const META_INTERVAL_MS=MOBILE?90000:60000;
  const FALLBACK_FULL_INTERVAL_MS=MOBILE?360000:240000;
  const START_GRACE_MS=1200;
  const APPLY_IDLE_MS=2200;
  const CACHE=window.__yayaCache||null;
  const rawFetch=window.__yayaNativeFetch||window.fetch.bind(window);

  let busy=false;
  let metaSupported=null;
  let lastCheck=0;
  let lastFull=0;
  let lastInteraction=0;
  let pendingData=null;
  let pendingMeta=null;
  let applyTimer=0;
  let wrappedPost=false;

  ['pointerdown','touchstart','keydown','scroll'].forEach(function(type){
    window.addEventListener(type,function(){lastInteraction=Date.now();},{passive:true,capture:true});
  });

  function apiUrl(){
    try{return typeof API!=='undefined'?String(API||''):'';}catch(e){return '';}
  }

  function validData(data){
    return !!(data&&typeof data==='object'&&Array.isArray(data.chantiers));
  }

  function fixDate(value){
    const s=String(value||'');
    if(!s)return '';
    if(s.includes('T')){
      try{
        const d=new Date(s);
        d.setMinutes(d.getMinutes()-d.getTimezoneOffset());
        return d.toISOString().slice(0,10);
      }catch(e){return s.slice(0,10);}
    }
    return s.slice(0,10);
  }

  function normalize(data){
    data=data&&typeof data==='object'?data:{};
    data.chantiers=Array.isArray(data.chantiers)?data.chantiers:[];
    data.salaries=Array.isArray(data.salaries)?data.salaries:[];
    data.heures=Array.isArray(data.heures)?data.heures:[];
    data.achats=Array.isArray(data.achats)?data.achats:[];
    data.avenants=Array.isArray(data.avenants)?data.avenants:[];
    data.documents=Array.isArray(data.documents)?data.documents:[];
    data.validations=Array.isArray(data.validations)?data.validations:[];
    if(!Array.isArray(data.commandes))data.commandes=[];

    data.chantiers.forEach(function(c){c.montantDevisHT=Number(c.montantDevisHT)||0;});
    data.salaries.forEach(function(s){
      s.heuresContrat=Number(s.heuresContrat)||0;
      s.tauxHoraire=Number(s.tauxHoraire)||0;
      s.type=s.type||'Salarié';
    });
    data.achats.forEach(function(a){
      if(a.typeDoc==='Devis fournisseur')a.typeDoc='Devis';
      a.montantHT=Number(a.montantHT)||0;
      a.date=fixDate(a.date);
    });
    data.heures.forEach(function(h){
      h.heures=Number(h.heures)||0;
      h.jour=Number(h.jour)||0;
      h.semaine=fixDate(h.semaine);
      h.taux=(h.taux===''||h.taux==null)?null:Number(h.taux);
    });
    const seen=new Set();
    data.heures=data.heures.filter(function(h){
      const k=[h.semaine,h.salarieId,h.jour,h.type,h.ref,h.heures,h.taux].join('|');
      if(seen.has(k))return false;
      seen.add(k);return true;
    });
    data.avenants.forEach(function(v){v.montantHT=Number(v.montantHT)||0;v.date=fixDate(v.date);});
    data.validations.forEach(function(v){v.semaine=fixDate(v.semaine);});
    return data;
  }

  function chantierKey(value){
    return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();
  }

  function preserveLocalFields(fresh){
    if(!fresh||!Array.isArray(fresh.chantiers))return fresh;
    let current=[];
    try{current=Array.isArray(S.chantiers)?S.chantiers:[];}catch(e){}
    const byId=new Map(current.map(function(c){return [String(c.id||''),c];}));
    const byName=new Map();
    current.forEach(function(c){const key=chantierKey(c&&c.nom);if(key&&!byName.has(key))byName.set(key,c);});
    fresh.chantiers.forEach(function(c){
      const previous=byId.get(String(c.id||''))||byName.get(chantierKey(c.nom));
      if(!previous)return;
      if(!c.dateSignature&&previous.dateSignature)c.dateSignature=previous.dateSignature;
      if(!c.sourcePlanningId&&previous.sourcePlanningId)c.sourcePlanningId=previous.sourcePlanningId;
      if(!c.planningNom&&previous.planningNom)c.planningNom=previous.planningNom;
      if(c.planningPresent==null&&previous.planningPresent!=null)c.planningPresent=previous.planningPresent;
    });
    return fresh;
  }

  function modalOpen(){
    const root=document.getElementById('modalRoot');
    return !!(root&&root.children&&root.children.length);
  }

  function editing(){
    const el=document.activeElement;
    if(!el)return false;
    if(el.isContentEditable)return true;
    return /^(INPUT|TEXTAREA|SELECT)$/i.test(el.tagName||'');
  }

  function safeToApply(){
    if(document.hidden)return false;
    if(Date.now()-lastInteraction<APPLY_IDLE_MS)return false;
    if(window.yayaHoursPending)return false;
    if(modalOpen()||editing())return false;
    if(document.body.classList.contains('yaya-fiche-inter-open'))return false;
    return true;
  }

  function saveCache(data,meta){
    if(CACHE&&typeof CACHE.write==='function')CACHE.write(data,meta||null);
  }

  function mergePartial(base,partial){
    const next=Object.assign({},base||{});
    Object.keys(partial||{}).forEach(function(name){next[name]=partial[name];});
    return next;
  }

  function sameJson(a,b){
    try{return JSON.stringify(a)===JSON.stringify(b);}catch(e){return false;}
  }

  function applyPending(){
    clearTimeout(applyTimer);
    if(!pendingData)return;
    if(!safeToApply()){
      applyTimer=setTimeout(applyPending,1000);
      return;
    }

    let current=null;
    try{current=S;}catch(e){}
    const fresh=normalize(preserveLocalFields(pendingData));
    pendingData=null;

    if(current&&sameJson(current,fresh)){
      saveCache(fresh,pendingMeta);
      pendingMeta=null;
      return;
    }

    const x=window.scrollX||0;
    const y=window.scrollY||0;
    try{
      S=fresh;
      saveCache(S,pendingMeta);
      pendingMeta=null;
      if(typeof render==='function')render();
      requestAnimationFrame(function(){try{window.scrollTo(x,y);}catch(e){}});
      try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed'));}catch(e){}
    }catch(e){
      console.warn('Application silencieuse Yaya ignorée :',e);
    }
  }

  function queueApply(data,meta){
    if(!validData(data))return;
    pendingData=data;
    pendingMeta=meta||pendingMeta;
    applyPending();
  }

  async function getJson(url){
    const ctrl=new AbortController();
    const timer=setTimeout(function(){ctrl.abort();},18000);
    try{
      const r=await rawFetch(url,{method:'GET',cache:'no-store',signal:ctrl.signal});
      const text=await r.text();
      const json=JSON.parse(text);
      if(!json||json.ok!==true)throw new Error(json&&json.error?json.error:'Réponse Yaya invalide');
      return json;
    }finally{clearTimeout(timer);}
  }

  function cachedMeta(){
    try{const c=CACHE&&CACHE.read?CACHE.read():null;return c&&c.meta?c.meta:null;}catch(e){return null;}
  }

  function changedTabs(serverMeta,localMeta){
    const server=serverMeta&&serverMeta.tabs?serverMeta.tabs:{};
    const local=localMeta&&localMeta.tabs?localMeta.tabs:{};
    const names=Object.keys(server);
    if(!names.length)return [];
    if(!localMeta||!Object.keys(local).length)return names;
    return names.filter(function(name){return String(server[name]||'0')!==String(local[name]||'0');});
  }

  async function refreshFull(){
    const api=apiUrl();
    if(!api)return;
    const sep=api.includes('?')?'&':'?';
    const json=await getJson(api+sep+'_yaya_force=1&_yaya_bg='+Date.now());
    lastFull=Date.now();
    if(validData(json.data))queueApply(json.data,json.meta||null);
  }

  async function smartCheck(force){
    if(busy)return;
    const now=Date.now();
    const minGap=force?5000:META_INTERVAL_MS;
    if(now-lastCheck<minGap)return;
    const api=apiUrl();
    if(!api)return;

    busy=true;
    lastCheck=now;
    try{
      if(metaSupported===false){
        if(now-lastFull>=FALLBACK_FULL_INTERVAL_MS)await refreshFull();
        return;
      }

      const sep=api.includes('?')?'&':'?';
      const metaJson=await getJson(api+sep+'mode=meta&_yaya_meta='+Date.now());

      // Ancien serveur : il ignore mode=meta et renvoie encore toute la base.
      // On exploite ce résultat une fois, puis on espace fortement les lectures complètes.
      if(!metaJson.meta||!metaJson.meta.tabs){
        metaSupported=false;
        if(validData(metaJson.data)){
          lastFull=Date.now();
          queueApply(metaJson.data,null);
        }
        return;
      }

      metaSupported=true;
      const localMeta=cachedMeta();
      const changed=changedTabs(metaJson.meta,localMeta);
      if(!changed.length){
        if(CACHE&&CACHE.patch)CACHE.patch({checkedAt:Date.now(),meta:metaJson.meta});
        return;
      }

      // Premier passage après activation du serveur différentiel : si aucune
      // version locale n'existe encore, on sécurise avec une lecture complète unique.
      if(!localMeta||!localMeta.tabs){
        await refreshFull();
        return;
      }

      const url=api+sep+'tabs='+encodeURIComponent(changed.join(','))+'&_yaya_delta='+Date.now();
      const deltaJson=await getJson(url);
      let current={};
      try{current=S||{};}catch(e){}
      const merged=mergePartial(current,deltaJson.data||{});
      queueApply(merged,deltaJson.meta||metaJson.meta);
    }catch(err){
      if(!(err&&err.name==='AbortError'))console.warn('Synchronisation Yaya en arrière-plan ignorée :',err);
    }finally{busy=false;}
  }

  function wrapApiPost(){
    if(wrappedPost)return;
    if(typeof window.apiPost!=='function')return;
    const original=window.apiPost;
    if(original.__yayaCacheWrapped){wrappedPost=true;return;}

    const wrapped=async function(){
      const result=await original.apply(this,arguments);
      if(result){
        try{if(typeof S!=='undefined')saveCache(S,cachedMeta());}catch(e){}
      }
      return result;
    };
    wrapped.__yayaCacheWrapped=true;
    wrapped.__yayaOriginal=original;
    window.apiPost=wrapped;
    try{apiPost=wrapped;}catch(e){}
    wrappedPost=true;
  }

  function install(){
    if(typeof render!=='function'){
      setTimeout(install,250);
      return;
    }

    wrapApiPost();

    // Si l'écran vient d'être affiché depuis le cache, on contrôle la source
    // réelle presque immédiatement, mais sans bloquer l'opérateur.
    if(window.__yayaStartedFromCache){
      setTimeout(function(){smartCheck(true);},START_GRACE_MS);
    }

    setInterval(function(){smartCheck(false);},META_INTERVAL_MS);

    document.addEventListener('visibilitychange',function(){
      if(!document.hidden)setTimeout(function(){smartCheck(true);},700);
    });
    window.addEventListener('focus',function(){setTimeout(function(){smartCheck(true);},700);});

    // Le wrapper apiPost peut être remplacé par certains patches chargés après.
    setInterval(wrapApiPost,5000);
  }

  install();
})();
