(function(){
  'use strict';
  if(window.__yayaChantierTabsLiveRefreshV6)return;
  window.__yayaChantierTabsLiveRefreshV6=true;
  window.__yayaChantierTabsLiveRefreshV5=true;

  const CACHE_DATA_KEY='YAYA_CACHE_DATA_V2';
  let inFlight=null;
  let lastRefresh=0;
  let lastFocus='';

  function apiEndpoint(){
    try{return (typeof API==='string'&&API)?API.trim():'';}catch(e){return '';}
  }

  function canonicalId(v){
    try{return typeof window.yayaCanonicalChantierId==='function'?String(window.yayaCanonicalChantierId(v)||''):String(v==null?'':v);}catch(e){return String(v==null?'':v);}
  }

  function mergeChantiers(localRows,centralRows){
    const localById={};
    (Array.isArray(localRows)?localRows:[]).forEach(function(c){
      const id=canonicalId(c&&c.id);
      if(id)localById[id]=c;
    });
    return centralRows.map(function(c){
      const id=canonicalId(c&&c.id);
      return Object.assign({},localById[id]||{},c||{},id:id||String(c&&c.id||''));
    });
  }

  function saveCache(data){
    try{
      const cached=JSON.parse(localStorage.getItem(CACHE_DATA_KEY)||'{}')||{};
      ['chantiers','documents','achats','commandes'].forEach(function(tab){
        if(Array.isArray(data[tab]))cached[tab]=data[tab];
      });
      localStorage.setItem(CACHE_DATA_KEY,JSON.stringify(cached));
    }catch(e){}
  }

  function escHtml(v){
    const el=document.createElement('div');
    el.textContent=String(v==null?'':v);
    return el.innerHTML;
  }

  function currentFocus(){
    try{return String((typeof focusChantier!=='undefined'&&focusChantier)||'');}catch(e){return '';}
  }

  function forceDocumentsDom(data){
    const cid=currentFocus();
    if(!cid||!data||!Array.isArray(data.documents))return;
    const rows=data.documents.filter(function(d){return canonicalId(d&&d.chantierId)===canonicalId(cid);});
    if(!rows.length)return;

    const cards=Array.from(document.querySelectorAll('#pane-chantiers .card'));
    const card=cards.find(function(c){
      const onclick=Array.from(c.querySelectorAll('[onclick]')).map(function(x){return String(x.getAttribute('onclick')||'');}).join(' ');
      return onclick.indexOf("'"+cid+"'")>=0||onclick.indexOf('"'+cid+'"')>=0;
    })||cards[0];
    if(!card)return;

    const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
    if(!tabs)return;
    let pane=card.querySelector(':scope > .yaya-detail-documents-pane');
    if(!pane){
      pane=document.createElement('div');
      pane.className='yaya-detail-section-node yaya-detail-documents-pane';
      pane.dataset.section='documents';
      tabs.insertAdjacentElement('afterend',pane);
    }

    pane.dataset.empty='0';
    pane.innerHTML=rows.slice().sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''));}).map(function(d){
      const date=String(d.date||'').slice(0,10).split('-').reverse().join('/');
      const lien=String(d.lien||'');
      const titre=String(d.sujet||d.titre||'Document');
      const detail=String(d.titre||'');
      return '<div class="yaya-detail-document-row" data-yaya-central-doc="1">'
        +'<strong>'+escHtml(titre)+(detail&&detail!==titre?'<small>'+escHtml(detail)+'</small>':'')+'</strong>'
        +'<span class="yaya-detail-charge-hours">'+escHtml(d.type||'Document')+'</span>'
        +'<span class="yaya-detail-charge-cost">'+escHtml(date||'—')+'</span>'
        +'<button type="button" class="yaya-detail-document-view" data-lien="'+escHtml(lien)+'"'+(lien?'':' disabled')+'>Voir</button>'
      +'</div>';
    }).join('');

    pane.querySelectorAll('.yaya-detail-document-view:not(:disabled)').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.preventDefault();e.stopPropagation();
        const lien=String(btn.dataset.lien||'');
        if(lien&&typeof voirPiece==='function')voirPiece(lien);
      });
    });

    const empty=card.querySelector(':scope > .yaya-detail-empty-pane[data-section="documents"]');
    if(empty)empty.dataset.empty='0';
  }

  async function fetchShared(){
    const api=apiEndpoint();
    if(!api)throw new Error('API Yaya indisponible');
    const sep=api.includes('?')?'&':'?';
    const ctrl=new AbortController();
    const timer=setTimeout(function(){ctrl.abort();},15000);
    try{
      const url=api+sep+'tabs=chantiers,documents,achats,commandes&_yaya_shared='+Date.now();
      const r=await fetch(url,{method:'GET',cache:'no-store',signal:ctrl.signal});
      const txt=await r.text();
      const j=JSON.parse(txt);
      if(!j||j.ok!==true||!j.data)throw new Error(j&&j.error||'Réponse Yaya invalide');
      return j.data;
    }finally{
      clearTimeout(timer);
    }
  }

  async function refreshShared(force){
    if(inFlight)return inFlight;
    if(!force&&Date.now()-lastRefresh<3000)return true;

    inFlight=(async function(){
      try{
        let data=await fetchShared();
        if(!Array.isArray(data.chantiers)||!data.chantiers.length||!Array.isArray(data.documents)||!Array.isArray(data.achats)){
          if(typeof apiGet==='function')data=await apiGet(true);
        }
        if(!data||!Array.isArray(data.chantiers)||!data.chantiers.length||!Array.isArray(data.documents)||!Array.isArray(data.achats)){
          throw new Error('Données partagées incomplètes');
        }
        if(typeof S!=='undefined'&&S){
          data.chantiers=mergeChantiers(S.chantiers,data.chantiers);
          S.chantiers=data.chantiers;
          S.documents=data.documents;
          S.achats=data.achats;
          if(Array.isArray(data.commandes))S.commandes=data.commandes;
          const cid=currentFocus();
          if(cid&&!S.chantiers.some(function(c){return canonicalId(c&&c.id)===canonicalId(cid);})){
            try{focusChantier=null;}catch(e){}
          }
        }
        saveCache(data);
        lastRefresh=Date.now();
        try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed',{detail:{tabs:['chantiers','documents','achats','commandes'],source:'central'}}));}catch(e){}
        try{if(typeof render==='function')render();}catch(e){}
        setTimeout(function(){forceDocumentsDom(data);},180);
        return true;
      }catch(e){
        console.warn('Yaya · synchronisation partagée impossible :',e);
        try{if(typeof toast==='function')toast('Synchronisation Sheet impossible : '+String(e&&e.message||e),true);}catch(_){ }
        return false;
      }
    })();

    try{return await inFlight;}finally{inFlight=null;}
  }

  function checkFocus(){
    const id=currentFocus();
    if(id&&id!==lastFocus){
      lastFocus=id;
      setTimeout(function(){refreshShared(true);},80);
    }else if(!id){
      lastFocus='';
    }
  }

  function bootRefresh(){
    if(!apiEndpoint()||typeof S==='undefined'||!S||typeof render!=='function'){
      setTimeout(bootRefresh,180);
      return;
    }
    refreshShared(true);
  }

  document.addEventListener('click',function(e){
    const target=e.target&&e.target.closest?e.target.closest('#pane-chantiers button,#pane-chantiers .yaya-detail-section-tab[data-section]'):null;
    if(!target)return;
    setTimeout(checkFocus,30);
    if(target.matches('.yaya-detail-section-tab[data-section]')){
      setTimeout(function(){refreshShared(true);},80);
    }
  },true);

  const pane=document.getElementById('pane-chantiers');
  if(pane){
    let timer=0;
    new MutationObserver(function(){
      clearTimeout(timer);
      timer=setTimeout(checkFocus,40);
    }).observe(pane,{childList:true,subtree:true});
  }

  window.addEventListener('focus',function(){refreshShared(false);});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)refreshShared(false);});

  window.yayaRefreshSharedNow=function(){return refreshShared(true);};
  window.yayaRefreshChantiersNow=function(){return refreshShared(true);};
  window.yayaRefreshDocumentsNow=function(){return refreshShared(true);};
  window.yayaRefreshAchatsNow=function(){return refreshShared(true);};
  window.yayaRefreshCommandesNow=function(){return refreshShared(true);};

  setTimeout(checkFocus,300);
  setTimeout(bootRefresh,120);
})();
