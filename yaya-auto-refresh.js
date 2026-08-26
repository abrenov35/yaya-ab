(function(){
  'use strict';

  const INTERVAL_MS=20000;
  const MIN_GAP_MS=4000;
  const START_GRACE_MS=12000;
  const installedAt=Date.now();
  let busy=false;
  let lastRun=0;
  let lastSnapshot='';

  function snapshot(data){
    try{return JSON.stringify(data||{});}catch(e){return '';}
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
    if(!force&&now-lastRun<MIN_GAP_MS)return;
    if(typeof apiGet!=='function'||typeof render!=='function')return;

    busy=true;
    lastRun=now;
    try{
      if(!lastSnapshot&&typeof S!=='undefined')lastSnapshot=snapshot(S);
      const fresh=await apiGet();
      const nextSnapshot=snapshot(fresh);
      if(!nextSnapshot||nextSnapshot===lastSnapshot)return;

      S=fresh;
      lastSnapshot=nextSnapshot;
      render();
      try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed'));}catch(e){}
    }catch(err){
      // Un échec d'actualisation silencieux ne doit jamais bloquer Yaya.
      if(!(err&&err.name==='AbortError'))console.warn('Actualisation automatique Yaya ignorée :',err);
    }finally{
      busy=false;
    }
  }

  function install(){
    if(typeof apiGet!=='function'||typeof render!=='function'){
      setTimeout(install,250);
      return;
    }

    try{if(typeof S!=='undefined')lastSnapshot=snapshot(S);}catch(e){}

    setInterval(function(){refreshIfNeeded(false);},INTERVAL_MS);

    document.addEventListener('visibilitychange',function(){
      if(!document.hidden)setTimeout(function(){refreshIfNeeded(true);},500);
    });

    window.addEventListener('focus',function(){
      setTimeout(function(){refreshIfNeeded(true);},500);
    });
  }

  install();
})();
