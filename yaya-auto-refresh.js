(function(){
  'use strict';

  // V205.788 — synchronisation légère des données alimentées par Yaya Mail.
  // Achats + Charges reposent sur S.achats.
  // Documents + Mails reposent sur S.documents.
  // Toutes les 2 s, on lit seulement les révisions ; seules les tables modifiées sont rechargées.
  const POLL_MS=2000;
  const WATCHED=['achats','documents'];
  const CACHE_DATA_KEY='YAYA_CACHE_DATA_V2';
  const CACHE_META_KEY='YAYA_CACHE_META_V2';
  let busy=false;
  let timer=null;
  const lastRev={achats:'',documents:''};

  function getApi(){
    try{
      return (typeof API==='string'&&API)?API:'';
    }catch(e){
      return '';
    }
  }

  function readCachedRevisions(){
    try{
      const raw=localStorage.getItem(CACHE_META_KEY);
      const meta=raw?JSON.parse(raw):null;
      WATCHED.forEach(tab=>{
        lastRev[tab]=String(meta&&meta.tabs&&meta.tabs[tab]||'');
      });
    }catch(e){}
  }

  async function fetchJson(params){
    const api=getApi();
    if(!api)throw new Error('API Yaya indisponible');
    const sep=api.includes('?')?'&':'?';
    const url=api+sep+params+'&_yaya_live='+Date.now();
    const ctrl=new AbortController();
    const timeout=setTimeout(()=>ctrl.abort(),8000);
    try{
      const r=await fetch(url,{method:'GET',cache:'no-store',signal:ctrl.signal});
      const txt=await r.text();
      const j=JSON.parse(txt);
      if(!j||!j.ok)throw new Error(j&&j.error||'Réponse Yaya invalide');
      return j;
    }finally{
      clearTimeout(timeout);
    }
  }

  function saveCacheTab(tab,rows,meta){
    try{
      const raw=localStorage.getItem(CACHE_DATA_KEY);
      const cached=raw?JSON.parse(raw):{};
      if(cached&&typeof cached==='object'){
        cached[tab]=rows;
        localStorage.setItem(CACHE_DATA_KEY,JSON.stringify(cached));
      }

      if(meta&&typeof meta==='object'){
        let oldMeta={};
        try{oldMeta=JSON.parse(localStorage.getItem(CACHE_META_KEY)||'{}')||{};}catch(e){}
        const merged={...oldMeta,...meta,tabs:{...(oldMeta.tabs||{}),...(meta.tabs||{})}};
        localStorage.setItem(CACHE_META_KEY,JSON.stringify(merged));
      }
    }catch(e){}
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

          if(typeof S!=='undefined'&&S){
            S[tab]=rows;
          }

          saveCacheTab(tab,rows,j.meta);
          if(j.meta&&j.meta.tabs){
            lastRev[tab]=String(j.meta.tabs[tab]||lastRev[tab]||'');
          }
          updated.push(tab);
        }catch(e){
          console.warn('Yaya '+tab+' · actualisation différée :',e);
        }
      }

      if(updated.length&&typeof render==='function'){
        const y=window.scrollY;
        render();
        try{window.scrollTo(0,y);}catch(e){}
      }

      if(updated.length){
        try{
          window.dispatchEvent(new CustomEvent('yaya:data-refreshed',{detail:{tabs:updated,source:'live-yaya-mail'}}));
        }catch(e){}
      }
      return updated.length>0;
    }finally{
      busy=false;
    }
  }

  async function poll(){
    if(document.hidden||busy)return;
    busy=true;
    try{
      const j=await fetchJson('mode=meta');
      const metaTabs=j&&j.meta&&j.meta.tabs||{};
      const changed=[];

      WATCHED.forEach(tab=>{
        const rev=String(metaTabs[tab]||'');
        if(!rev)return;
        if(!lastRev[tab]){
          lastRev[tab]=rev;
          return;
        }
        if(rev!==lastRev[tab])changed.push(tab);
      });

      if(changed.length){
        busy=false;
        await refreshTabs(changed);
      }
    }catch(e){
      console.warn('Yaya Mail · contrôle des révisions différé :',e);
    }finally{
      busy=false;
    }
  }

  readCachedRevisions();
  window.__YAYA_AUTO_SYNC_STOPPED=false;
  window.__yayaSmartRefreshInstalled=true;
  window.yayaSmartRefreshNow=function(){return refreshTabs(WATCHED);};

  // Au démarrage, on corrige immédiatement un éventuel cache ancien.
  setTimeout(()=>refreshTabs(WATCHED),700);
  timer=setInterval(poll,POLL_MS);

  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden)setTimeout(poll,100);
  });
})();

// Fiche chantier : un seul onglet visuel « Documents & mails ».
// Les données Documents et Mail restent séparées en arrière-plan.
// Important : aucune MutationObserver ici afin d'éviter le scintillement de la fiche.
(function(){
  'use strict';

  const STYLE_ID='yaya-documents-mails-merged-v2';

  function installStyle(){
    let style=document.getElementById(STYLE_ID);
    if(!style){
      style=document.createElement('style');
      style.id=STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent=`
      /* Le bouton Mail séparé disparaît définitivement. */
      #pane-chantiers#pane-chantiers#pane-chantiers .card > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="mail"]{
        display:none!important;
      }

      /* Le bouton Documents garde sa mécanique native mais affiche le libellé commun. */
      #pane-chantiers#pane-chantiers#pane-chantiers .card > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="documents"] > strong{
        font-size:0!important;
      }
      #pane-chantiers#pane-chantiers#pane-chantiers .card > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="documents"] > strong::after{
        content:'Documents & mails'!important;
        font-size:12px!important;
        font-weight:700!important;
        line-height:1.15!important;
        white-space:nowrap!important;
      }
      #pane-chantiers#pane-chantiers#pane-chantiers .card > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="documents"] > small{
        display:none!important;
      }

      /* Quand Documents & mails est actif, afficher les DEUX contenus. */
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-detail-documents-pane[data-empty="0"],
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-detail-mails-pane[data-empty="0"]{
        display:block!important;
      }

      /* Sécurité pendant la migration d'un ancien état mémorisé sur « Mail ». */
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="mail"] > .yaya-detail-documents-pane[data-empty="0"],
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="mail"] > .yaya-detail-mails-pane[data-empty="0"]{
        display:block!important;
      }

      /* Ne jamais afficher les anciens messages vides à côté d'un contenu existant. */
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="documents"] > .yaya-detail-empty-pane[data-section="mail"],
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="mail"] > .yaya-detail-empty-pane[data-section="mail"]{
        display:none!important;
      }
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="documents"]:has(> .yaya-detail-mails-pane[data-empty="0"]) > .yaya-detail-empty-pane[data-section="documents"],
      #pane-chantiers#pane-chantiers#pane-chantiers .card[data-yaya-detail-section="mail"]:has(> .yaya-detail-mails-pane[data-empty="0"]) > .yaya-detail-empty-pane[data-section="documents"]{
        display:none!important;
      }

      @media(max-width:640px){
        #pane-chantiers#pane-chantiers#pane-chantiers .card > .yaya-detail-section-tabs > .yaya-detail-section-tab[data-section="documents"] > strong::after{
          font-size:11px!important;
        }
      }
    `;
  }

  // Une ancienne fiche peut avoir mémorisé l'onglet « Mail ».
  // On la rebascule une seule fois vers « Documents » via le bouton natif :
  // cela met aussi à jour le stockage utilisé par Yaya sans boucle DOM.
  function migrateOldMailState(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return;

    pane.querySelectorAll('.card[data-yaya-detail-section="mail"]').forEach(card=>{
      const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
      const docTab=tabs&&tabs.querySelector('.yaya-detail-section-tab[data-section="documents"]');
      if(!docTab)return;
      try{docTab.click();}catch(e){}
    });
  }

  function refresh(){
    installStyle();
    migrateOldMailState();
  }

  refresh();
  setTimeout(refresh,150);
  setTimeout(refresh,500);
  setTimeout(refresh,1200);
  setTimeout(refresh,2500);
  window.addEventListener('yaya:data-refreshed',()=>setTimeout(refresh,0));
  window.addEventListener('hashchange',()=>setTimeout(refresh,0));
})();

// V205.723 : le bouton « Actualiser » doit réellement relire le serveur.
// Au premier affichage Yaya peut utiliser son cache local pour rester rapide ;
// mais un appel manuel à reload() ne doit jamais relire ce même cache périmé.
(function(){
  'use strict';

  function installFreshReload(){
    if(typeof window.reload!=='function'){
      setTimeout(installFreshReload,120);
      return;
    }
    if(window.reload.__yayaForceFreshV723)return;

    const originalReload=window.reload;
    const wrappedReload=async function(){
      const originalApiGet=window.apiGet;
      if(typeof originalApiGet!=='function'){
        return originalReload.apply(this,arguments);
      }

      const freshApiGet=function(forceNetwork){
        return originalApiGet(forceNetwork===undefined?true:forceNetwork);
      };

      window.apiGet=freshApiGet;
      try{
        return await originalReload.apply(this,arguments);
      }finally{
        if(window.apiGet===freshApiGet)window.apiGet=originalApiGet;
      }
    };

    wrappedReload.__yayaForceFreshV723=true;
    wrappedReload.__yayaOriginalReload=originalReload;
    window.reload=wrappedReload;
  }

  installFreshReload();
  setTimeout(installFreshReload,300);
  setTimeout(installFreshReload,900);
})();
