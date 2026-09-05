(function(){
  'use strict';

  if(window.__yayaFreshChantiersInstalled)return;
  window.__yayaFreshChantiersInstalled=true;

  const CACHE_DATA_KEY='YAYA_CACHE_DATA_V2';
  const MIN_GAP_MS=45000;
  const PERIODIC_MS=300000;

  let busy=false;
  let lastRun=0;
  let pendingTimer=0;

  function key(value){
    return String(value||'')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g,' ')
      .trim();
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

  function preservePlanning(fresh,current){
    fresh=Array.isArray(fresh)?fresh:[];
    current=Array.isArray(current)?current:[];

    const byId=new Map(current.map(function(c){
      return [String(c&&c.id||''),c];
    }));
    const byName=new Map();

    current.forEach(function(c){
      const k=key(c&&c.nom);
      if(k&&!byName.has(k))byName.set(k,c);
    });

    fresh.forEach(function(c){
      const previous=
        byId.get(String(c&&c.id||'')) ||
        byName.get(key(c&&c.nom));

      if(!previous)return;
      if(!c.dateSignature&&previous.dateSignature)c.dateSignature=previous.dateSignature;
      if(!c.sourcePlanningId&&previous.sourcePlanningId)c.sourcePlanningId=previous.sourcePlanningId;
      if(!c.planningNom&&previous.planningNom)c.planningNom=previous.planningNom;
      if(c.planningPresent==null&&previous.planningPresent!=null)c.planningPresent=previous.planningPresent;
    });

    return fresh;
  }

  function safeToApply(){
    if(document.hidden)return false;
    if(window.yayaHoursPending)return false;

    const root=document.getElementById('modalRoot');
    if(root&&root.children&&root.children.length)return false;

    const active=document.activeElement;
    if(active&&/^(INPUT|TEXTAREA|SELECT)$/i.test(active.tagName||''))return false;

    return true;
  }

  function saveCache(){
    try{
      if(typeof S!=='undefined'&&S&&typeof S==='object'){
        localStorage.setItem(CACHE_DATA_KEY,JSON.stringify(S));
        if(window.__yayaCache&&typeof window.__yayaCache.write==='function'){
          window.__yayaCache.write(S,null);
        }
      }
    }catch(e){}
  }

  function applyFresh(data){
    if(!data||!Array.isArray(data.chantiers))return;

    let current=[];
    try{current=Array.isArray(S&&S.chantiers)?S.chantiers:[];}catch(e){}

    const fresh=preservePlanning(data.chantiers,current);
    fresh.forEach(function(c){
      c.montantDevisHT=Number(c.montantDevisHT)||0;
    });

    const freshAvenants=Array.isArray(data.avenants)
      ?data.avenants.map(function(v){
        const row=Object.assign({},v||{});
        row.montantHT=Number(row.montantHT)||0;
        row.date=fixDate(row.date);
        return row;
      })
      :null;

    try{
      S.chantiers=fresh;
      if(freshAvenants)S.avenants=freshAvenants;
      saveCache();
      if(typeof render==='function')render();
      try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed'));}catch(e){}
    }catch(e){
      console.warn('Rafraichissement chantiers/devis ignore :',e);
    }
  }

  function queueApply(data){
    clearTimeout(pendingTimer);

    const run=function(){
      if(!safeToApply()){
        pendingTimer=setTimeout(run,900);
        return;
      }
      applyFresh(data);
    };

    run();
  }

  function apiUrl(){
    try{return typeof API!=='undefined'?String(API||''):'';}catch(e){return '';}
  }

  async function directRead(){
    const api=apiUrl();
    if(!api)throw new Error('API Yaya indisponible');

    const sep=api.includes('?')?'&':'?';
    const url=api+sep+'tabs=chantiers%2Cavenants&_yaya_fresh='+Date.now();
    const ctrl=new AbortController();
    const timer=setTimeout(function(){ctrl.abort();},18000);

    try{
      const r=await fetch(url,{method:'GET',cache:'no-store',signal:ctrl.signal});
      const text=await r.text();
      const json=JSON.parse(text);
      if(!json||json.ok!==true)throw new Error(json&&json.error?json.error:'Réponse Yaya invalide');
      const data=json.data||{};
      if(!Array.isArray(data.chantiers))throw new Error('Liste chantiers absente');
      return data;
    }finally{
      clearTimeout(timer);
    }
  }

  async function refresh(force){
    const now=Date.now();
    if(busy)return;
    if(!force&&now-lastRun<MIN_GAP_MS)return;

    busy=true;
    lastRun=now;

    try{
      let fresh;
      try{
        fresh=await directRead();
      }catch(directErr){
        if(typeof apiGet!=='function')throw directErr;
        fresh=await apiGet(true);
      }
      queueApply(fresh);
    }catch(e){
      console.warn('Lecture reseau chantiers/devis impossible :',e);
    }finally{
      busy=false;
    }
  }

  function start(){
    setTimeout(function(){refresh(true);},500);

    document.addEventListener('visibilitychange',function(){
      if(!document.hidden)setTimeout(function(){refresh(false);},400);
    });

    window.addEventListener('focus',function(){
      setTimeout(function(){refresh(false);},400);
    });

    setInterval(function(){refresh(false);},PERIODIC_MS);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',start,{once:true});
  }else{
    start();
  }
})();
