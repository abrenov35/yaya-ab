(function(){
  'use strict';
  if(window.__yayaBackgroundEditSyncV1)return;
  window.__yayaBackgroundEditSyncV1=true;

  const KEY='YAYA_PENDING_EDIT_SYNC_V1';
  const CACHE='YAYA_CACHE_DATA_V2';
  let busy=false;
  let quoteCtx={kind:'',id:''};

  function txt(v){return String(v==null?'':v).trim();}
  function toastSafe(m,e){try{if(typeof toast==='function')toast(m,!!e);}catch(_){}}
  function clone(v){try{return JSON.parse(JSON.stringify(v));}catch(e){return v;}}
  function stateList(name){try{return typeof S!=='undefined'&&S&&Array.isArray(S[name])?S[name]:[];}catch(e){return [];}}
  function cacheNow(){try{if(typeof S!=='undefined'&&S)localStorage.setItem(CACHE,JSON.stringify(S));}catch(e){}}
  function renderSoon(){try{requestAnimationFrame(function(){try{if(typeof render==='function')render();}catch(_){}});}catch(e){}}
  function closeNow(){try{if(typeof closeModal==='function')closeModal();}catch(e){}}

  function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return x&&typeof x==='object'?x:{};}catch(e){return {};}}
  function write(x){try{if(Object.keys(x).length)localStorage.setItem(KEY,JSON.stringify(x));else localStorage.removeItem(KEY);}catch(e){}}
  function queue(type,data){const p=read();p[type]={token:Date.now()+'_'+Math.random().toString(36).slice(2),data:clone(data)};write(p);setTimeout(worker,0);}

  async function worker(){
    if(busy||typeof apiPost!=='function')return;
    busy=true;
    try{
      const actions={documents:'setDocuments',chantiers:'setChantiers',avenants:'setAvenants'};
      while(true){
        const p=read();const type=Object.keys(p).find(k=>actions[k]&&p[k]);if(!type)break;
        const item=p[type];
        try{
          const ok=await apiPost(actions[type],item.data);
          if(!ok)throw new Error('écriture refusée');
          const latest=read();
          if(latest[type]&&latest[type].token===item.token){delete latest[type];write(latest);}
          if(!Object.keys(read()).length)toastSafe('Synchronisation terminée ✓');
        }catch(e){
          console.warn('Yaya — synchronisation édition en attente',type,e);
          toastSafe('Non synchronisé — nouvelle tentative automatique',true);
          break;
        }
      }
    }finally{busy=false;}
  }

  function packMeta(label,description){const l=txt(label),d=txt(description);return d?l+' [[YAYA_DESC:'+encodeURIComponent(d)+']]':l;}

  // Mémorise le devis choisi avant l'ouverture de la modale.
  document.addEventListener('click',function(e){
    const b=e.target&&e.target.closest&&e.target.closest('#pane-chantiers .yaya-detail-market-row .yaya-detail-document-edit');
    if(b)quoteCtx={kind:String(b.dataset.kind||''),id:String(b.dataset.rowId||'')};
  },true);

  // Devis : le clic agit immédiatement, Google travaille ensuite.
  document.addEventListener('click',function(e){
    const b=e.target&&e.target.closest&&e.target.closest('#yayaFastSave');
    if(!b)return;
    const modal=b.closest('.yaya-devis-fast-modal');if(!modal)return;
    const isExtra=!!modal.querySelector('#eavLib');
    const lib=modal.querySelector(isExtra?'#eavLib':'#edDevisLib');
    const desc=modal.querySelector(isExtra?'#eavDesc':'#edDevisDesc');
    const mt=modal.querySelector(isExtra?'#eavMt':'#edMt');
    if(!lib||!desc||!mt)return;
    const label=txt(lib.value);if(!label){e.preventDefault();e.stopImmediatePropagation();toastSafe('Indique un libellé',true);lib.focus();return;}
    const id=txt(quoteCtx.id);if(!id)return;
    const amount=Number(String(mt.value||'0').replace(',','.'))||0;
    const list=isExtra?stateList('avenants'):stateList('chantiers');
    const item=list.find(x=>String(x&&x.id||'')===id);if(!item)return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    if(b.dataset.yayaBusy==='1')return;b.dataset.yayaBusy='1';
    if(isExtra){item.libelle=packMeta(label,desc.value);item.montantHT=amount;queue('avenants',list);}
    else{item.numero=packMeta(label,desc.value);item.montantDevisHT=amount;queue('chantiers',list);}
    cacheNow();closeNow();renderSoon();toastSafe('Devis enregistré — synchronisation en arrière-plan');
  },true);

  // Mail : remplace le rollback historique par une file locale persistante.
  function installMail(){
    if(typeof window.saveDocumentEdit!=='function'){setTimeout(installMail,200);return;}
    if(window.saveDocumentEdit.__yayaBackgroundV1)return;
    const previous=window.saveDocumentEdit;
    window.saveDocumentEdit=function(id){
      const docs=stateList('documents');
      const d=docs.find(x=>String(x&&x.id||'')===String(id));
      const ch=document.getElementById('edDocCh'),type=document.getElementById('edDocType'),sender=document.getElementById('edDocSujet'),object=document.getElementById('edDocTitre');
      const isMail=!!(d&&(String(d.type||'').toUpperCase()==='MAIL'||String(d.origineMail||d.origine||'').toUpperCase()==='MAIL'||d.nomMail||d.objetMail));
      if(!d||!isMail||!ch||!type||!sender||!object)return previous.apply(this,arguments);
      const body=String((typeof window.contenuMailYaya==='function'?window.contenuMailYaya(d):'')||'').trim();
      const obj=txt(object.value);
      d.chantierId=String(ch.value||'');d.type=String(type.value||'');d.sujet=txt(sender.value);d.nomMail=d.sujet;d.objetMail=obj;d.origineMail='MAIL';
      if(body){d.contenuMail=body;d.titre='Objet : '+(obj||'Objet non renseigné')+'\n\n'+body;}else d.titre=obj;
      cacheNow();queue('documents',docs);closeNow();renderSoon();toastSafe('Mail enregistré — synchronisation en arrière-plan');
      return true;
    };
    window.saveDocumentEdit.__yayaBackgroundV1=true;
    try{saveDocumentEdit=window.saveDocumentEdit;}catch(e){}
  }

  installMail();
  window.addEventListener('online',function(){setTimeout(worker,250);});
  window.addEventListener('focus',function(){setTimeout(worker,500);});
  setTimeout(worker,1200);
})();
