(function(){
  'use strict';

  const MOBILE=window.matchMedia&&window.matchMedia('(pointer:coarse)').matches;
  const INTERVAL_MS=MOBILE?90000:60000;
  const MIN_GAP_MS=5000;
  const START_GRACE_MS=12000;
  const installedAt=Date.now();
  let busy=false;
  let lastRun=0;
  let lastSnapshot='';
  let lastInteraction=0;
  let wakeTimer=0;

  ['pointerdown','touchstart','keydown','scroll'].forEach(function(type){
    window.addEventListener(type,function(){lastInteraction=Date.now();},{passive:true,capture:true});
  });

  function snapshot(data){
    try{return JSON.stringify(data||{});}catch(e){return '';}
  }

  function chantierKey(value){
    return String(value||'')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();
  }

  function preservePlanningData(fresh){
    if(!fresh||!Array.isArray(fresh.chantiers))return fresh;
    let current=[];
    try{current=Array.isArray(S.chantiers)?S.chantiers:[];}catch(e){}
    const byId=new Map(current.map(c=>[String(c.id||''),c]));
    const byName=new Map();
    current.forEach(c=>{
      const key=chantierKey(c&&c.nom);
      if(key&&!byName.has(key))byName.set(key,c);
    });
    fresh.chantiers.forEach(c=>{
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
    if(root&&root.children&&root.children.length)return true;
    return !!document.querySelector('.overlay,.modal[style*="display: block"],.modal.show');
  }

  function editing(){
    const el=document.activeElement;
    if(!el)return false;
    if(el.isContentEditable)return true;
    return /^(INPUT|TEXTAREA|SELECT)$/i.test(el.tagName||'');
  }

  function ficheInterOpen(){
    return document.body.classList.contains('yaya-fiche-inter-open');
  }

  function loaderVisible(){
    const loader=document.getElementById('loader');
    if(!loader)return false;
    try{
      const cs=getComputedStyle(loader);
      return cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity||1)!==0;
    }catch(e){return true;}
  }

  function safeToRefresh(){
    if(Date.now()-lastInteraction<3000)return false;
    if(window.yayaHoursPending)return false;
    if(Date.now()-installedAt<START_GRACE_MS)return false;
    if(loaderVisible())return false;
    if(document.hidden)return false;
    if(modalOpen())return false;
    if(editing())return false;
    if(ficheInterOpen())return false;
    return true;
  }

  async function refreshIfNeeded(force){
    if(busy||!safeToRefresh())return;
    const now=Date.now();
    if(now-lastRun<MIN_GAP_MS)return;
    if(typeof apiGet!=='function'||typeof render!=='function')return;

    busy=true;
    lastRun=now;
    try{
      if(!lastSnapshot&&typeof S!=='undefined')lastSnapshot=snapshot(S);
      const fresh=preservePlanningData(await apiGet());
      const nextSnapshot=snapshot(fresh);
      if(!nextSnapshot||nextSnapshot===lastSnapshot)return;

      S=fresh;
      lastSnapshot=nextSnapshot;
      render();
      try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed'));}catch(e){}
    }catch(err){
      if(!(err&&err.name==='AbortError'))console.warn('Actualisation automatique Yaya ignorée :',err);
    }finally{
      busy=false;
    }
  }

  function scheduleWakeRefresh(){
    clearTimeout(wakeTimer);
    wakeTimer=setTimeout(function(){refreshIfNeeded(true);},650);
  }

  function install(){
    if(typeof apiGet!=='function'||typeof render!=='function'){
      setTimeout(install,250);
      return;
    }

    try{if(typeof S!=='undefined')lastSnapshot=snapshot(S);}catch(e){}

    setInterval(function(){refreshIfNeeded(false);},INTERVAL_MS);

    document.addEventListener('visibilitychange',function(){
      if(!document.hidden)scheduleWakeRefresh();
    });

    window.addEventListener('focus',scheduleWakeRefresh);
  }

  install();
})();
