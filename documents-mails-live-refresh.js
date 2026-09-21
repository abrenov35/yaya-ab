(function(){
  'use strict';
  if(window.__yayaChantierTabsLiveRefreshV10)return;
  window.__yayaChantierTabsLiveRefreshV10=true;
  window.__yayaChantierTabsLiveRefreshV9=true;
  window.__yayaChantierTabsLiveRefreshV8=true;
  window.__yayaChantierTabsLiveRefreshV7=true;
  window.__yayaChantierTabsLiveRefreshV6=true;
  window.__yayaChantierTabsLiveRefreshV5=true;

  const CACHE_DATA_KEY='YAYA_CACHE_DATA_V2';
  const dynamicAliases={};
  let inFlight=null;
  let lastRefresh=0;
  let lastFocus='';
  let documentsInFlight=null;
  let lastDocumentsSignature='';

  function apiEndpoint(){
    try{return (typeof API==='string'&&API)?API.trim():'';}catch(e){return '';}
  }

  function canRefresh(){
    if((Number(window.__yayaWriteInFlight)||0)>0)return false;
    if(document.querySelector('#modalRoot .overlay'))return false;
    if(document.querySelector('[data-yaya-upload-busy="1"],[data-yaya-achat-upload-busy="1"]'))return false;
    return true;
  }

  function normalizeName(v){
    return String(v==null?'':v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\s+/g,' ').trim();
  }

  function canonicalId(v){
    const raw=String(v==null?'':v).trim();
    if(!raw)return '';
    if(dynamicAliases[raw])return String(dynamicAliases[raw]);
    try{
      if(typeof window.yayaCanonicalChantierId==='function'){
        const id=String(window.yayaCanonicalChantierId(raw)||raw);
        return dynamicAliases[id]?String(dynamicAliases[id]):id;
      }
    }catch(e){}
    return raw;
  }

  function buildDynamicAliases(localRows,centralRows){
    const centralByName={};
    (Array.isArray(centralRows)?centralRows:[]).forEach(function(c){
      const name=normalizeName(c&&c.nom);
      const id=String(c&&c.id||'').trim();
      if(!name||!id)return;
      if(!centralByName[name])centralByName[name]=[];
      centralByName[name].push(id);
    });
    (Array.isArray(localRows)?localRows:[]).forEach(function(c){
      const localId=String(c&&c.id||'').trim();
      const name=normalizeName(c&&c.nom);
      const matches=centralByName[name]||[];
      if(localId&&matches.length===1&&localId!==matches[0])dynamicAliases[localId]=matches[0];
    });
  }

  function mergeChantiers(localRows,centralRows){
    buildDynamicAliases(localRows,centralRows);
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
    try{return canonicalId((typeof focusChantier!=='undefined'&&focusChantier)||'');}catch(e){return '';}
  }

  function cardId(card){
    if(!card)return '';
    const nodes=Array.from(card.querySelectorAll('[onclick]'));
    for(const el of nodes){
      const raw=String(el.getAttribute('onclick')||'');
      const m=raw.match(/(?:toggleChantier|delChantier|editMontantDevis|openAvenant|openDocumentModal|openAchat|openExistingChantierModal)\(['\"]([^'\"]+)/);
      if(m&&m[1])return canonicalId(m[1]);
    }
    const focus=currentFocus();
    if(focus&&card.querySelector(':scope > .yaya-detail-section-tabs'))return focus;
    return '';
  }

  function renderDocumentsPane(card,rows){
    const tabs=card.querySelector(':scope > .yaya-detail-section-tabs');
    if(!tabs)return;
    let pane=card.querySelector(':scope > .yaya-detail-documents-pane');
    if(!pane){
      pane=document.createElement('div');
      pane.className='yaya-detail-section-node yaya-detail-documents-pane';
      pane.dataset.section='documents';
      tabs.insertAdjacentElement('afterend',pane);
    }

    pane.dataset.empty=rows.length?'0':'1';
    if(!rows.length){
      if(pane.querySelector('[data-yaya-central-doc="1"]'))pane.innerHTML='';
      return;
    }

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

  function forceDocumentsDom(data){
    if(!data||!Array.isArray(data.documents))return;
    const cards=Array.from(document.querySelectorAll('#pane-chantiers .card:has(> .yaya-detail-section-tabs)'));
    cards.forEach(function(card){
      const cid=cardId(card);
      if(!cid)return;
      const rows=data.documents.filter(function(d){return canonicalId(d&&d.chantierId)===cid&&String(d&&d.type||'').trim().toUpperCase()!=='MAIL';});
      renderDocumentsPane(card,rows);
    });
  }

  function documentsSignature(rows){
    return (Array.isArray(rows)?rows:[]).map(function(d){
      return [
        String(d&&d.id||''),
        String(d&&d.chantierId||''),
        String(d&&d.type||''),
        String(d&&d.date||''),
        String(d&&d.objetMail||d&&d.objet||''),
        String(d&&d.lien||'')
      ].join('|');
    }).join('§');
  }

  async function fetchDocumentsOnly(){
    const api=apiEndpoint();
    if(!api)throw new Error('API Yaya indisponible');
    const sep=api.includes('?')?'&':'?';
    const ctrl=new AbortController();
    const timer=setTimeout(function(){ctrl.abort();},7000);
    try{
      const url=api+sep+'tabs=documents&_yaya_mail_live='+Date.now();
      const r=await fetch(url,{method:'GET',cache:'no-store',signal:ctrl.signal});
      const txt=await r.text();
      const j=JSON.parse(txt);
      if(!j||j.ok!==true||!j.data||!Array.isArray(j.data.documents)){
        throw new Error(j&&j.error||'Documents Yaya indisponibles');
      }
      return j.data.documents;
    }finally{
      clearTimeout(timer);
    }
  }

  async function refreshDocumentsLive(){
    if(documentsInFlight)return documentsInFlight;
    if(document.visibilityState==='hidden'||!canRefresh())return false;

    documentsInFlight=(async function(){
      try{
        const rows=await fetchDocumentsOnly();
        const signature=documentsSignature(rows);

        if(!lastDocumentsSignature){
          try{
            lastDocumentsSignature=documentsSignature(
              typeof S!=='undefined'&&S&&Array.isArray(S.documents)?S.documents:[]
            );
          }catch(e){}
        }

        if(signature===lastDocumentsSignature)return true;

        if(typeof S!=='undefined'&&S)S.documents=rows;
        saveCache({documents:rows});
        lastDocumentsSignature=signature;

        try{
          window.dispatchEvent(new CustomEvent('yaya:data-refreshed',{
            detail:{tabs:['documents'],source:'mail-live'}
          }));
        }catch(e){}

        try{if(typeof render==='function')render();}catch(e){}
        setTimeout(function(){forceDocumentsDom({documents:rows});},100);
        setTimeout(function(){forceDocumentsDom({documents:rows});},350);
        return true;
      }catch(e){
        console.warn('Yaya · actualisation mails/documents impossible :',e);
        return false;
      }
    })();

    try{return await documentsInFlight;}finally{documentsInFlight=null;}
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
    if(!canRefresh())return false;
    if(!force&&Date.now()-lastRefresh<30000)return true;

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
          if(cid&&!S.chantiers.some(function(c){return canonicalId(c&&c.id)===cid;})){
            try{focusChantier=null;}catch(e){}
          }
        }
        saveCache(data);
        lastRefresh=Date.now();
        try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed',{detail:{tabs:['chantiers','documents','achats','commandes'],source:'central'}}));}catch(e){}
        try{if(typeof render==='function')render();}catch(e){}
        setTimeout(function(){forceDocumentsDom(data);},120);
        setTimeout(function(){forceDocumentsDom(data);},420);
        setTimeout(function(){forceDocumentsDom(data);},900);
        return true;
      }catch(e){
        console.warn('Yaya · synchronisation partagée impossible :',e);
        return false;
      }
    })();

    try{return await inFlight;}finally{inFlight=null;}
  }

  function checkFocus(){
    const id=currentFocus();
    if(id&&id!==lastFocus){
      lastFocus=id;
      if(canRefresh())setTimeout(function(){refreshShared(true);},80);
    }else if(!id){
      lastFocus='';
    }
  }

  function bootRefresh(){
    if(!apiEndpoint()||typeof S==='undefined'||!S||typeof render!=='function'){
      setTimeout(bootRefresh,180);
      return;
    }
    if(canRefresh())refreshShared(true);
  }

  document.addEventListener('click',function(e){
    const target=e.target&&e.target.closest?e.target.closest('#pane-chantiers button,#pane-chantiers .yaya-detail-section-tab[data-section]'):null;
    if(!target)return;
    setTimeout(checkFocus,30);
    if(target.matches('.yaya-detail-section-tab[data-section]')&&canRefresh()){
      setTimeout(function(){refreshShared(true);},80);
    }
  },true);

  const pane=document.getElementById('pane-chantiers');
  if(pane){
    let timer=0;
    new MutationObserver(function(){
      clearTimeout(timer);
      timer=setTimeout(function(){checkFocus();if(typeof S!=='undefined'&&S&&Array.isArray(S.documents))forceDocumentsDom({documents:S.documents});},80);
    }).observe(pane,{childList:true,subtree:true});
  }

  window.yayaRefreshSharedNow=function(){return refreshShared(true);};
  window.yayaRefreshChantiersNow=function(){return refreshShared(true);};
  window.yayaRefreshDocumentsNow=function(){return refreshDocumentsLive();};
  window.yayaRefreshAchatsNow=function(){return refreshShared(true);};
  window.yayaRefreshCommandesNow=function(){return refreshShared(true);};

  // Surveillance légère des mails/documents externes.
  // Uniquement lorsque Yaya est visible et qu'aucune écriture/modale n'est active.
  const documentsLiveTimer=setInterval(function(){
    if(document.visibilityState!=='hidden'&&canRefresh())refreshDocumentsLive();
  },10000);

  document.addEventListener('visibilitychange',function(){
    if(document.visibilityState==='visible'&&canRefresh()){
      setTimeout(refreshDocumentsLive,250);
    }
  });

  window.addEventListener('focus',function(){
    if(canRefresh())setTimeout(refreshDocumentsLive,250);
  });

  setTimeout(checkFocus,300);
  setTimeout(bootRefresh,120);
  setTimeout(refreshDocumentsLive,1200);
})();
