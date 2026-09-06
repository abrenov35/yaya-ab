(function(){
  'use strict';

  if(window.__yayaSmartRefreshInstalled)return;
  window.__yayaSmartRefreshInstalled=true;

  const MOBILE=window.matchMedia&&window.matchMedia('(pointer:coarse)').matches;
  const META_INTERVAL_MS=MOBILE?90000:60000;
  const FALLBACK_FULL_INTERVAL_MS=MOBILE?900000:600000;
  const START_GRACE_MS=window.__yayaCachedBoot?350:2500;
  const APPLY_IDLE_MS=2200;
  const CACHE_DATA_KEY='YAYA_CACHE_DATA_V2';
  const CACHE_META_KEY='YAYA_CACHE_META_V2';

  let busy=false;
  let metaSupported=null;
  let lastCheck=0;
  let lastFull=Date.now();
  let lastInteraction=0;
  let lastMeta=(window.__yayaCachedMeta&&window.__yayaCachedMeta.tabs)?window.__yayaCachedMeta:null;
  let pendingData=null;
  let pendingMeta=null;
  let applyTimer=0;

  ['pointerdown','touchstart','keydown','scroll'].forEach(function(type){
    window.addEventListener(type,function(){lastInteraction=Date.now();},{passive:true,capture:true});
  });

  function apiUrl(){
    try{return typeof API!=='undefined'?String(API||''):'';}catch(e){return '';}
  }

  function saveCache(data,meta){
    try{
      if(!data||typeof data!=='object')return;
      localStorage.setItem(CACHE_DATA_KEY,JSON.stringify(data));
      if(meta&&meta.tabs)localStorage.setItem(CACHE_META_KEY,JSON.stringify(meta));
    }catch(e){
      // Quota ou stockage privé : Yaya continue normalement sans cache.
    }
  }

  function persistCurrent(){
    let current=null;
    try{current=S;}catch(e){}
    if(current&&typeof current==='object')saveCache(current,lastMeta);
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

  function normalizeTab(name,value){
    const rows=Array.isArray(value)?value:[];

    if(name==='chantiers'){
      rows.forEach(function(c){c.montantDevisHT=Number(c.montantDevisHT)||0;});
    }else if(name==='salaries'){
      rows.forEach(function(s){
        s.heuresContrat=Number(s.heuresContrat)||0;
        s.tauxHoraire=Number(s.tauxHoraire)||0;
        s.type=s.type||'Salarié';
      });
    }else if(name==='achats'){
      rows.forEach(function(a){
        if(a.typeDoc==='Devis fournisseur')a.typeDoc='Devis';
        a.montantHT=Number(a.montantHT)||0;
        a.date=fixDate(a.date);
      });
    }else if(name==='heures'){
      rows.forEach(function(h){
        h.heures=Number(h.heures)||0;
        h.jour=Number(h.jour)||0;
        h.semaine=fixDate(h.semaine);
        h.taux=(h.taux===''||h.taux==null)?null:Number(h.taux);
      });
      const seen=new Set();
      return rows.filter(function(h){
        const k=[h.semaine,h.salarieId,h.jour,h.type,h.ref,h.heures,h.taux].join('|');
        if(seen.has(k))return false;
        seen.add(k);
        return true;
      });
    }else if(name==='avenants'){
      rows.forEach(function(v){v.montantHT=Number(v.montantHT)||0;v.date=fixDate(v.date);});
    }else if(name==='validations'){
      rows.forEach(function(v){v.semaine=fixDate(v.semaine);});
    }

    return rows;
  }

  function chantierKey(value){
    return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();
  }

  function preservePlanningData(fresh,current){
    if(!Array.isArray(fresh))return fresh;
    current=Array.isArray(current)?current:[];

    const byId=new Map(current.map(function(c){return [String(c.id||''),c];}));
    const nameCounts=new Map();

    current.forEach(function(c){
      const key=chantierKey(c&&c.nom);
      if(key)nameCounts.set(key,(nameCounts.get(key)||0)+1);
    });

    const byName=new Map();
    current.forEach(function(c){
      const key=chantierKey(c&&c.nom);
      if(key&&nameCounts.get(key)===1)byName.set(key,c);
    });

    fresh.forEach(function(c){
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

  function loaderVisible(){
    const loader=document.getElementById('loader');
    if(!loader)return false;
    try{
      const cs=getComputedStyle(loader);
      return cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity||1)!==0;
    }catch(e){return true;}
  }

  function safeToApply(){
    if(document.hidden)return false;
    if(loaderVisible())return false;
    if(Date.now()-lastInteraction<APPLY_IDLE_MS)return false;
    if(window.yayaHoursPending)return false;
    if(modalOpen()||editing())return false;
    if(document.body.classList.contains('yaya-fiche-inter-open'))return false;
    return true;
  }

  function mergePartial(partial){
    let current={};
    try{current=S||{};}catch(e){}
    const next=Object.assign({},current);

    Object.keys(partial||{}).forEach(function(name){
      let value=normalizeTab(name,partial[name]);
      if(name==='chantiers')value=preservePlanningData(value,current.chantiers);
      next[name]=value;
    });

    return next;
  }

  function applyPending(){
    clearTimeout(applyTimer);
    if(!pendingData)return;
    if(!safeToApply()){
      applyTimer=setTimeout(applyPending,900);
      return;
    }

    const next=pendingData;
    const metaForCache=pendingMeta||lastMeta;
    pendingData=null;
    pendingMeta=null;
    const x=window.scrollX||0;
    const y=window.scrollY||0;

    try{
      S=next;
      if(typeof render==='function')render();
      saveCache(next,metaForCache);
      requestAnimationFrame(function(){try{window.scrollTo(x,y);}catch(e){}});
      try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed'));}catch(e){}
    }catch(e){
      console.warn('Mise à jour Yaya en arrière-plan ignorée :',e);
    }
  }

  function queuePartial(partial,meta){
    pendingData=mergePartial(partial);
    if(meta&&meta.tabs)pendingMeta=meta;
    applyPending();
  }

  async function getJson(url){
    const ctrl=new AbortController();
    const timer=setTimeout(function(){ctrl.abort();},18000);
    try{
      const r=await fetch(url,{method:'GET',cache:'no-store',signal:ctrl.signal});
      const text=await r.text();
      const json=JSON.parse(text);
      if(!json||json.ok!==true)throw new Error(json&&json.error?json.error:'Réponse Yaya invalide');
      return json;
    }finally{
      clearTimeout(timer);
    }
  }

  function changedTabs(serverMeta,localMeta){
    const server=serverMeta&&serverMeta.tabs?serverMeta.tabs:{};
    const local=localMeta&&localMeta.tabs?localMeta.tabs:{};
    return Object.keys(server).filter(function(name){
      return String(server[name]||'0')!==String(local[name]||'0');
    });
  }

  async function fullRefreshInBackground(){
    if(typeof apiGet!=='function')return;
    const fresh=await apiGet(true);
    lastFull=Date.now();
    if(fresh&&typeof fresh==='object')queuePartial(fresh,lastMeta);
  }

  async function smartCheck(force){
    if(busy||loaderVisible())return;

    const now=Date.now();
    const minGap=force?300:META_INTERVAL_MS;
    if(now-lastCheck<minGap)return;

    const api=apiUrl();
    if(!api)return;

    busy=true;
    lastCheck=now;

    try{
      if(metaSupported===false){
        if(now-lastFull>=FALLBACK_FULL_INTERVAL_MS){
          await fullRefreshInBackground();
        }
        return;
      }

      const sep=api.includes('?')?'&':'?';
      const metaJson=await getJson(api+sep+'mode=meta&_yaya_meta='+Date.now());

      if(!metaJson.meta||!metaJson.meta.tabs){
        metaSupported=false;
        await fullRefreshInBackground();
        return;
      }

      metaSupported=true;

      // Si le démarrage vient du cache, lastMeta contient la révision du cache.
      // On compare donc immédiatement avec le serveur et on ne lit que les onglets modifiés.
      if(!lastMeta){
        lastMeta=metaJson.meta;
        saveCache((function(){try{return S;}catch(e){return null;}})(),lastMeta);
        return;
      }

      const changed=changedTabs(metaJson.meta,lastMeta);
      if(!changed.length){
        lastMeta=metaJson.meta;
        saveCache((function(){try{return S;}catch(e){return null;}})(),lastMeta);
        return;
      }

      const deltaUrl=api+sep+'tabs='+encodeURIComponent(changed.join(','))+'&_yaya_delta='+Date.now();
      const deltaJson=await getJson(deltaUrl);
      const nextMeta=deltaJson.meta&&deltaJson.meta.tabs?deltaJson.meta:metaJson.meta;
      lastMeta=nextMeta;
      if(deltaJson.data&&typeof deltaJson.data==='object'){
        queuePartial(deltaJson.data,nextMeta);
      }

    }catch(err){
      if(metaSupported===null&&window.__yayaCachedBoot){
        try{
          await fullRefreshInBackground();
          metaSupported=false;
        }catch(_fallbackErr){}
      }
      if(!(err&&err.name==='AbortError'))console.warn('Synchronisation Yaya en arrière-plan ignorée :',err);
    }finally{
      busy=false;
    }
  }

  function install(){
    if(typeof render!=='function'||typeof apiGet!=='function'){
      setTimeout(install,250);
      return;
    }

    const waitInitial=function(){
      if(loaderVisible()){
        setTimeout(waitInitial,300);
        return;
      }
      setTimeout(function(){smartCheck(true);},START_GRACE_MS);
      setInterval(function(){smartCheck(false);},META_INTERVAL_MS);
    };
    waitInitial();

    document.addEventListener('visibilitychange',function(){
      if(document.hidden){persistCurrent();return;}
      setTimeout(function(){smartCheck(true);},700);
    });
    window.addEventListener('focus',function(){setTimeout(function(){smartCheck(true);},700);});
    window.addEventListener('pagehide',persistCurrent);
    setInterval(persistCurrent,30000);
  }

  install();
})();
