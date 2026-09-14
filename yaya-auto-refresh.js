(function(){
  'use strict';

  // Synchronisation Yaya Mail à faible priorité.
  // Objectif : aucune requête ni render() pendant que l'opérateur clique, saisit ou ouvre une fenêtre.
  const POLL_MS=12000;
  const FIRST_SYNC_MS=3500;
  const USER_IDLE_MS=1800;
  const WATCHED=['achats','documents'];
  const CACHE_DATA_KEY='YAYA_CACHE_DATA_V2';
  const CACHE_META_KEY='YAYA_CACHE_META_V2';

  let busy=false;
  let renderTimer=0;
  let lastUserActivity=Date.now();
  const lastRev={achats:'',documents:''};

  function activity(){lastUserActivity=Date.now();}
  document.addEventListener('pointerdown',activity,{capture:true,passive:true});
  document.addEventListener('keydown',activity,{capture:true,passive:true});
  document.addEventListener('touchstart',activity,{capture:true,passive:true});

  function operatorBusy(){
    if(document.hidden)return true;
    if(Date.now()-lastUserActivity<USER_IDLE_MS)return true;
    if(Number(window.__yayaWriteInFlight)||0)return true;
    if(document.querySelector('#modalRoot .overlay,#modalRoot .modal'))return true;
    const a=document.activeElement;
    if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))return true;
    return false;
  }

  function getApi(){
    try{return (typeof API==='string'&&API)?API:'';}catch(e){return '';}
  }

  function readCachedRevisions(){
    try{
      const raw=localStorage.getItem(CACHE_META_KEY);
      const meta=raw?JSON.parse(raw):null;
      WATCHED.forEach(tab=>{lastRev[tab]=String(meta&&meta.tabs&&meta.tabs[tab]||'');});
    }catch(e){}
  }

  async function fetchJson(params){
    const api=getApi();
    if(!api)throw new Error('API Yaya indisponible');
    const sep=api.includes('?')?'&':'?';
    const ctrl=new AbortController();
    const timer=setTimeout(()=>ctrl.abort(),7000);
    try{
      const r=await fetch(api+sep+params+'&_yaya_live='+Date.now(),{method:'GET',cache:'no-store',signal:ctrl.signal});
      const txt=await r.text();
      const j=JSON.parse(txt);
      if(!j||!j.ok)throw new Error(j&&j.error||'Réponse Yaya invalide');
      return j;
    }finally{clearTimeout(timer);}
  }

  function saveCacheTab(tab,rows,meta){
    try{
      const cached=JSON.parse(localStorage.getItem(CACHE_DATA_KEY)||'{}')||{};
      cached[tab]=rows;
      localStorage.setItem(CACHE_DATA_KEY,JSON.stringify(cached));
      if(meta&&typeof meta==='object'){
        const oldMeta=JSON.parse(localStorage.getItem(CACHE_META_KEY)||'{}')||{};
        const merged={...oldMeta,...meta,tabs:{...(oldMeta.tabs||{}),...(meta.tabs||{})}};
        localStorage.setItem(CACHE_META_KEY,JSON.stringify(merged));
      }
    }catch(e){}
  }

  function renderWhenIdle(){
    if(renderTimer)return;
    const attempt=function(){
      renderTimer=0;
      if(operatorBusy()){
        renderTimer=setTimeout(attempt,700);
        return;
      }
      const run=function(){
        if(operatorBusy()){
          renderTimer=setTimeout(attempt,700);
          return;
        }
        try{
          const y=window.scrollY;
          if(typeof render==='function')render();
          window.scrollTo(0,y);
        }catch(e){}
      };
      if('requestIdleCallback' in window)requestIdleCallback(run,{timeout:1200});
      else setTimeout(run,0);
    };
    renderTimer=setTimeout(attempt,450);
  }

  async function refreshTabs(tabs){
    if(busy)return false;
    const wanted=(Array.isArray(tabs)&&tabs.length?tabs:WATCHED).filter(tab=>WATCHED.includes(tab));
    if(!wanted.length)return false;
    busy=true;
    const updated=[];
    try{
      for(const tab of wanted){
        try{
          const j=await fetchJson('tabs='+encodeURIComponent(tab));
          const rows=j&&j.data&&Array.isArray(j.data[tab])?j.data[tab]:null;
          if(!rows)continue;
          if(typeof S!=='undefined'&&S)S[tab]=rows;
          saveCacheTab(tab,rows,j.meta);
          if(j.meta&&j.meta.tabs)lastRev[tab]=String(j.meta.tabs[tab]||lastRev[tab]||'');
          updated.push(tab);
        }catch(e){console.warn('Yaya '+tab+' · actualisation différée :',e);}
      }
      if(updated.length){
        try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed',{detail:{tabs:updated,source:'live-yaya-mail'}}));}catch(e){}
        renderWhenIdle();
      }
      return updated.length>0;
    }finally{busy=false;}
  }

  async function poll(){
    if(busy||operatorBusy())return;
    busy=true;
    try{
      const j=await fetchJson('mode=meta');
      const metaTabs=j&&j.meta&&j.meta.tabs||{};
      const changed=[];
      WATCHED.forEach(tab=>{
        const rev=String(metaTabs[tab]||'');
        if(!rev)return;
        if(!lastRev[tab]){lastRev[tab]=rev;return;}
        if(rev!==lastRev[tab])changed.push(tab);
      });
      if(changed.length){busy=false;await refreshTabs(changed);}
    }catch(e){
      console.warn('Yaya Mail · contrôle différé :',e);
    }finally{busy=false;}
  }

  readCachedRevisions();
  window.__YAYA_AUTO_SYNC_STOPPED=false;
  window.__yayaSmartRefreshInstalled=true;
  window.yayaSmartRefreshNow=function(){return refreshTabs(WATCHED);};

  setTimeout(function(){if(!operatorBusy())refreshTabs(WATCHED);},FIRST_SYNC_MS);
  setInterval(poll,POLL_MS);
  document.addEventListener('visibilitychange',function(){
    if(!document.hidden)setTimeout(poll,1200);
  });
})();

// Fiche chantier : un seul onglet visuel « Documents & mails ».
(function(){
  'use strict';
  const STYLE_ID='yaya-documents-mails-merged-v2';

  function installStyle(){
    let style=document.getElementById(STYLE_ID);
    if(!style){style=document.createElement('style');style.id=STYLE_ID;document.head.appendChild(style);}
    style.textContent=`
      #pane-chantiers#pane-chantiers#pane-chantiers .card > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="mail"]{display:none!important}
      #pane-chantiers#pane-chantiers#pane-chantiers .card > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="documents"] > strong{font-size:0!important}
      #pane-chantiers#pane-chantiers#pane-chantiers .card > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="documents"] > strong::after{content:'Documents & mails'!important;font-size:12px!important;font-weight:700!important;line-height:1.15!important;white-space:nowrap!important}
      #pane-chantiers#pane-chantiers#pane-chantiers .card > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="documents"] > small{display:none!important}
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-detail-documents-pane[data-empty="0"],
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-detail-mails-pane[data-empty="0"],
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="mail"] > .yaya-detail-documents-pane[data-empty="0"],
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="mail"] > .yaya-detail-mails-pane[data-empty="0"]{display:block!important}
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-detail-empty-pane[data-section="mail"],
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="mail"] > .yaya-detail-empty-pane[data-section="mail"]{display:none!important}
      @media(max-width:640px){#pane-chantiers#pane-chantiers#pane-chantiers .card > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="documents"] > strong::after{font-size:11px!important}}
    `;
  }

  function migrateOldMailState(){
    const pane=document.getElementById('pane-chantiers');if(!pane)return;
    pane.querySelectorAll('.card[data-yaya-detail-section="mail"]').forEach(card=>{
      const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
      const docTab=tabs&&tabs.querySelector('.yaya-detail-section-tab[data-section="documents"]');
      if(docTab)try{docTab.click();}catch(e){}
    });
  }

  function refresh(){installStyle();migrateOldMailState();}
  refresh();
  setTimeout(refresh,250);
  window.addEventListener('yaya:data-refreshed',()=>setTimeout(refresh,80));
  window.addEventListener('hashchange',()=>setTimeout(refresh,80));
})();

// Le bouton « Actualiser » force toujours une lecture serveur fraîche.
(function(){
  'use strict';
  function installFreshReload(){
    if(typeof window.reload!=='function'){setTimeout(installFreshReload,150);return;}
    if(window.reload.__yayaForceFreshV723)return;
    const originalReload=window.reload;
    const wrappedReload=async function(){
      const originalApiGet=window.apiGet;
      if(typeof originalApiGet!=='function')return originalReload.apply(this,arguments);
      const freshApiGet=function(forceNetwork){return originalApiGet(forceNetwork===undefined?true:forceNetwork);};
      window.apiGet=freshApiGet;
      try{return await originalReload.apply(this,arguments);}
      finally{if(window.apiGet===freshApiGet)window.apiGet=originalApiGet;}
    };
    wrappedReload.__yayaForceFreshV723=true;
    wrappedReload.__yayaOriginalReload=originalReload;
    window.reload=wrappedReload;
  }
  installFreshReload();
  setTimeout(installFreshReload,500);
})();
