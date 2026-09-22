(function(){
  'use strict';
  if(window.__yayaDocumentsBackgroundSyncV3)return;
  window.__yayaDocumentsBackgroundSyncV3=true;
  window.__yayaDocumentsBackgroundSyncV2=true;
  window.__yayaDocumentsBackgroundSyncV1=true;

  const PENDING_KEY='YAYA_PENDING_DOCUMENT_UPSERT_V1';
  const CACHE_KEY='YAYA_CACHE_DATA_V2';
  let workerBusy=false;
  let installTries=0;
  let lastWarnAt=0;

  function clone(v){
    try{return JSON.parse(JSON.stringify(v));}
    catch(e){return v&&typeof v==='object'?Object.assign({},v):v;}
  }

  function docs(){
    try{return (typeof S!=='undefined'&&S&&Array.isArray(S.documents))?S.documents:[];}
    catch(e){return [];}
  }

  function idOf(d){return String(d&&d.id||'').trim();}
  function stable(d){
    try{return JSON.stringify(d||{});}
    catch(e){return String(d);}
  }
  function mapSnapshot(rows){
    const m=new Map();
    (Array.isArray(rows)?rows:[]).forEach(function(d){const id=idOf(d);if(id)m.set(id,stable(d));});
    return m;
  }

  function readPending(){
    try{
      const p=JSON.parse(localStorage.getItem(PENDING_KEY)||'{"items":{},"removes":{}}');
      if(!p||typeof p!=='object')return {items:{},removes:{}};
      if(!p.items||typeof p.items!=='object')p.items={};
      if(!p.removes||typeof p.removes!=='object')p.removes={};
      return p;
    }catch(e){return {items:{},removes:{}};}
  }

  function writePending(store){
    try{
      const items=store&&store.items||{};
      const removes=store&&store.removes||{};
      if(!Object.keys(items).length&&!Object.keys(removes).length)localStorage.removeItem(PENDING_KEY);
      else localStorage.setItem(PENDING_KEY,JSON.stringify({items:items,removes:removes}));
    }catch(e){}
  }

  function queueDoc(doc){
    const id=idOf(doc);if(!id)return;
    const store=readPending();
    delete store.removes[id];
    store.items[id]={token:Date.now()+'_'+Math.random().toString(36).slice(2),savedAt:Date.now(),doc:clone(doc)};
    writePending(store);
  }

  function queueRemove(id){
    id=String(id||'').trim();if(!id)return;
    const store=readPending();
    delete store.items[id];
    store.removes[id]={token:Date.now()+'_'+Math.random().toString(36).slice(2),savedAt:Date.now()};
    writePending(store);
  }

  function queueChanged(captured,beforeMap){
    if(!Array.isArray(captured))return false;
    let changed=false;
    captured.forEach(function(d){
      const id=idOf(d);if(!id)return;
      if(!beforeMap.has(id)||beforeMap.get(id)!==stable(d)){
        queueDoc(d);
        changed=true;
      }
    });
    return changed;
  }

  function mergeById(baseRows,pendingStore){
    const map=new Map();
    (Array.isArray(baseRows)?baseRows:[]).forEach(function(d){const id=idOf(d);if(id)map.set(id,clone(d));});
    Object.values(pendingStore&&pendingStore.items||{}).forEach(function(item){
      const d=item&&item.doc,id=idOf(d);if(id)map.set(id,clone(d));
    });
    Object.keys(pendingStore&&pendingStore.removes||{}).forEach(function(id){map.delete(String(id));});
    return Array.from(map.values());
  }

  function persistCacheNow(){
    try{
      const raw=localStorage.getItem(CACHE_KEY);
      const cache=raw?JSON.parse(raw):{};
      if(!cache||typeof cache!=='object')return;
      cache.documents=docs().map(clone);
      localStorage.setItem(CACHE_KEY,JSON.stringify(cache));
    }catch(e){}
  }

  function persistCacheSoon(){
    const run=persistCacheNow;
    if(typeof requestIdleCallback==='function')requestIdleCallback(run,{timeout:1200});
    else setTimeout(run,0);
  }

  function mergePendingIntoLocal(){
    try{
      if(typeof S==='undefined'||!S||!Array.isArray(S.documents))return;
      S.documents=mergeById(S.documents,readPending());
      persistCacheSoon();
    }catch(e){}
  }

  function toastSafe(msg,err){try{if(typeof toast==='function')toast(msg,!!err);}catch(e){}}
  function markWrite(delta){window.__yayaWriteInFlight=Math.max(0,(Number(window.__yayaWriteInFlight)||0)+delta);}

  async function worker(){
    if(workerBusy)return;
    const snapshot=readPending();
    if(!Object.keys(snapshot.items||{}).length&&!Object.keys(snapshot.removes||{}).length)return;
    if(typeof window.apiGet!=='function'||typeof window.apiPost!=='function')return;

    workerBusy=true;markWrite(1);
    try{
      // IMPORTANT : ne jamais réécrire tout l'onglet documents.
      // Yaya Mail peut ajouter un mail/PJ en parallèle ; un setDocuments
      // global pourrait écraser une ligne arrivée entre-temps.
      const items=Object.values(snapshot.items||{});
      for(const item of items){
        const d=item&&item.doc;
        const id=idOf(d);
        if(!id)continue;

        // Tant que l'API backend historique n'est pas totalement migrée,
        // on remplace une ligne de façon atomique : suppression ciblée puis
        // ajout ciblé en chemin append sécurisé.
        const removed=await window.apiPost('deleteDocument',{id:id});
        if(!removed)throw new Error('suppression préalable document refusée : '+id);

        const safeDoc=Object.assign({},d,{origine:'GMAIL_ADDON'});
        const saved=await window.apiPost('addDocument',safeDoc);
        if(!saved)throw new Error('écriture document refusée : '+id);
      }

      const removeIds=Object.keys(snapshot.removes||{});
      for(const id of removeIds){
        const ok=await window.apiPost('deleteDocument',{id:String(id)});
        if(!ok)throw new Error('suppression document refusée : '+id);
      }

      const latest=readPending();
      Object.keys(snapshot.items||{}).forEach(function(id){
        const oldItem=snapshot.items[id],newItem=latest.items&&latest.items[id];
        if(oldItem&&newItem&&oldItem.token===newItem.token)delete latest.items[id];
      });
      Object.keys(snapshot.removes||{}).forEach(function(id){
        const oldItem=snapshot.removes[id],newItem=latest.removes&&latest.removes[id];
        if(oldItem&&newItem&&oldItem.token===newItem.token)delete latest.removes[id];
      });
      writePending(latest);

      if(Object.keys(latest.items||{}).length||Object.keys(latest.removes||{}).length)setTimeout(worker,0);
      else toastSafe('Document enregistré ✓',false);
    }catch(err){
      console.warn('Yaya documents — synchronisation arrière-plan en attente :',err);
      const now=Date.now();
      if(now-lastWarnAt>30000){lastWarnAt=now;toastSafe('Document enregistré localement — synchronisation en attente',true);}
    }finally{
      markWrite(-1);workerBusy=false;
    }
  }

  function interceptSetDocuments(originalFn,marker){
    if(typeof originalFn!=='function'||originalFn[marker])return originalFn;
    const wrapped=function(){
      const before=mapSnapshot(docs());
      const originalPost=window.apiPost;
      let captured=null;
      const fakePost=async function(action,data){
        if(String(action)==='setDocuments'&&Array.isArray(data)){
          captured=data.map(clone);
          return true;
        }
        return originalPost.apply(this,arguments);
      };

      let promise;
      window.apiPost=fakePost;
      try{apiPost=fakePost;}catch(e){}
      try{
        promise=Promise.resolve(originalFn.apply(this,arguments));
      }catch(err){
        window.apiPost=originalPost;try{apiPost=originalPost;}catch(e){}
        throw err;
      }
      window.apiPost=originalPost;try{apiPost=originalPost;}catch(e){}

      if(captured&&queueChanged(captured,before)){
        persistCacheSoon();
        setTimeout(worker,0);
      }
      return promise;
    };
    wrapped[marker]=true;
    wrapped.__yayaOriginalFunction=originalFn;
    return wrapped;
  }

  let pendingDeleteId='';

  function installDeleteTracking(){
    if(typeof window.delDocument!=='function')return;
    if(window.delDocument.__yayaDocumentsDeleteBackgroundV3)return;
    const originalDelete=window.delDocument;
    const wrappedDelete=function(id){
      pendingDeleteId=String(id||'').trim();
      return originalDelete.apply(this,arguments);
    };
    wrappedDelete.__yayaDocumentsDeleteBackgroundV3=true;
    wrappedDelete.__yayaOriginalFunction=originalDelete;
    window.delDocument=wrappedDelete;
    try{delDocument=wrappedDelete;}catch(e){}
  }

  function install(){
    installTries++;
    const currentSave=window.saveDocument;
    const currentApply=window.appliquerModificationDocument;
    const currentPost=window.apiPost;
    installDeleteTracking();
    if(typeof currentSave!=='function'||typeof currentPost!=='function'){
      if(installTries<80)setTimeout(install,120);
      return;
    }

    if(!currentSave.__yayaDocumentsBackgroundV2){
      const wrappedSave=interceptSetDocuments(currentSave,'__yayaDocumentsBackgroundV2');
      window.saveDocument=wrappedSave;
      try{saveDocument=wrappedSave;}catch(e){}
    }

    if(typeof currentApply==='function'&&!currentApply.__yayaDocumentsEditBackgroundV2){
      const wrappedApply=interceptSetDocuments(currentApply,'__yayaDocumentsEditBackgroundV2');
      window.appliquerModificationDocument=wrappedApply;
      try{appliquerModificationDocument=wrappedApply;}catch(e){}
    }

    mergePendingIntoLocal();
    setTimeout(worker,500);
  }

  document.addEventListener('click',function(e){
    const ok=e.target&&e.target.closest?e.target.closest('#del-ok-doc'):null;
    if(!ok||!pendingDeleteId)return;
    e.preventDefault();
    e.stopPropagation();
    if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();

    const id=pendingDeleteId;
    pendingDeleteId='';
    queueRemove(id);

    // Appliquer immédiatement la suppression au cache local, avant tout réseau.
    try{
      if(typeof S!=='undefined'&&S&&Array.isArray(S.documents)){
        S.documents=S.documents.filter(function(d){return idOf(d)!==id;});
      }
    }catch(err){}
    persistCacheNow();

    // Fermer la confirmation sans exécuter l'ancien POST direct.
    try{
      const overlay=ok.closest('div[style*="position:fixed"]');
      if(overlay&&overlay.isConnected)overlay.remove();
      else ok.closest('.overlay')?.remove();
    }catch(err){}
    try{if(typeof render==='function')render();}catch(err){}
    toastSafe('Document supprimé — synchronisation…',false);
    setTimeout(worker,0);
  },true);

  install();
  setTimeout(install,400);
  window.addEventListener('online',function(){setTimeout(worker,250);});
  window.addEventListener('focus',function(){mergePendingIntoLocal();setTimeout(worker,500);});
  window.addEventListener('yaya:data-refreshed',function(){mergePendingIntoLocal();setTimeout(worker,150);});
  window.addEventListener('pagehide',function(){
    // La file est déjà persistée de façon synchrone. À la fermeture on ne
    // dépend d'aucun POST réseau ; on fige seulement le cache courant.
    mergePendingIntoLocal();
    persistCacheNow();
  },{passive:true});
})();
