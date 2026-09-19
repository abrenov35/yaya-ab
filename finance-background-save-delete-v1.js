(function(){
  'use strict';

  if(!window.__yayaAchatsConcurrencyGuardV1 && !document.querySelector('script[data-yaya-achats-guard]')){
    const guard=document.createElement('script');
    guard.src='achats-concurrency-guard.js?v=guard-2';
    guard.async=false;
    guard.dataset.yayaAchatsGuard='1';
    (document.head||document.documentElement).appendChild(guard);
  }

  if(window.__yayaFinanceBackgroundSaveDeleteV1)return;
  window.__yayaFinanceBackgroundSaveDeleteV1=true;

  const PENDING_KEY='YAYA_FINANCE_PENDING_ACHATS_V1';
  const CONFIRM_CLASS='yaya-finance-bg-delete-confirm-v1';
  let workerBusy=false;

  function txt(v){return String(v==null?'':v).trim();}
  function toastSafe(message,isError){try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}}
  function closeModalSafe(){try{if(typeof closeModal==='function')closeModal();else document.getElementById('modalRoot')?.replaceChildren();}catch(e){}}
  function renderSoon(){
    try{
      requestAnimationFrame(function(){
        try{if(typeof render==='function')render();}catch(e){}
      });
    }catch(e){setTimeout(function(){try{if(typeof render==='function')render();}catch(_){ }},0);}
  }

  function cloneAchats(){
    try{return (typeof S!=='undefined'&&S&&Array.isArray(S.achats))?S.achats.map(function(a){return {...a};}):[];}catch(e){return [];}
  }

  function persistCacheSoon(){
    setTimeout(function(){
      try{
        const raw=localStorage.getItem('YAYA_CACHE_DATA_V2');
        const cached=raw?JSON.parse(raw):{};
        if(!cached||typeof cached!=='object')return;
        cached.achats=cloneAchats();
        localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(cached));
      }catch(e){console.warn('Yaya finance cache local :',e);}
    },0);
  }

  function readPending(){
    try{
      const p=JSON.parse(localStorage.getItem(PENDING_KEY)||'null');
      return p&&Array.isArray(p.achats)?p:null;
    }catch(e){return null;}
  }

  function cleanIds(list){
    return Array.from(new Set((Array.isArray(list)?list:[]).map(txt).filter(Boolean)));
  }

  function writePending(achats,ops){
    ops=ops||{};
    const previous=readPending();
    const payload={
      token:Date.now()+'_'+Math.random().toString(36).slice(2),
      savedAt:Date.now(),
      achats:achats.map(function(a){return {...a};}),
      upsertIds:cleanIds([...(previous&&previous.upsertIds||[]),...(ops.upsertIds||[])]),
      removeIds:cleanIds([...(previous&&previous.removeIds||[]),...(ops.removeIds||[])])
    };
    // Une suppression gagne toujours sur un upsert du même ID.
    if(payload.removeIds.length){
      const removed=new Set(payload.removeIds);
      payload.upsertIds=payload.upsertIds.filter(function(id){return !removed.has(id);});
    }
    try{localStorage.setItem(PENDING_KEY,JSON.stringify(payload));}catch(e){}
    return payload;
  }

  function clearPendingIfSame(token){
    try{
      const current=readPending();
      if(current&&current.token===token)localStorage.removeItem(PENDING_KEY);
    }catch(e){}
  }

  function reconcileCreatePending(id,row){
    try{
      const key='YAYA_ACHATS_CREATE_PENDING_V1';
      const list=JSON.parse(localStorage.getItem(key)||'[]');
      if(!Array.isArray(list))return;
      const idx=list.findIndex(function(x){return txt(x&&x.id)===txt(id);});
      if(idx<0)return;
      if(row)list[idx]={...list[idx],...row};
      else list.splice(idx,1);
      if(list.length)localStorage.setItem(key,JSON.stringify(list));
      else localStorage.removeItem(key);
    }catch(e){}
  }

  async function sendSnapshot(snapshot){
    if(typeof apiPost!=='function')throw new Error('API Yaya indisponible');

    const upsertIds=cleanIds(snapshot&&snapshot.upsertIds);
    const removeIds=cleanIds(snapshot&&snapshot.removeIds);
    let target=Array.isArray(snapshot&&snapshot.achats)?snapshot.achats.map(function(a){return {...a};}):[];

    // Après un reload, on repart toujours d'une lecture serveur fraîche puis
    // on rejoue explicitement les IDs modifiés/supprimés.
    if((upsertIds.length||removeIds.length)&&typeof apiGet==='function'){
      const fresh=await apiGet(true);
      if(!fresh||!Array.isArray(fresh.achats))throw new Error('liste achats serveur indisponible');
      const source=new Map(target.map(function(row){return [txt(row&&row.id),row];}).filter(function(x){return x[0];}));
      const merged=new Map(fresh.achats.map(function(row){return [txt(row&&row.id),{...row}];}).filter(function(x){return x[0];}));

      removeIds.forEach(function(id){merged.delete(id);});
      upsertIds.forEach(function(id){
        const row=source.get(id);
        if(row)merged.set(id,{...row});
      });
      target=Array.from(merged.values());
    }

    const ok=await apiPost('setAchats',target);
    if(!ok)throw new Error('écriture refusée');
    return true;
  }

  async function worker(){
    if(workerBusy)return;
    workerBusy=true;
    try{
      while(true){
        const snapshot=readPending();
        if(!snapshot)break;
        try{
          await sendSnapshot(snapshot);
          clearPendingIfSame(snapshot.token);
          const newer=readPending();
          if(!newer)break;
          if(newer.token===snapshot.token)break;
        }catch(err){
          console.warn('Yaya finance — synchronisation arrière-plan en attente :',err);
          toastSafe('Synchronisation en attente — tu peux continuer à travailler',true);
          break;
        }
      }
    }finally{
      workerBusy=false;
    }
  }

  function queueCurrent(ops){
    ops=ops||{};
    const rows=cloneAchats();
    (ops.upsertIds||[]).forEach(function(id){
      const row=rows.find(function(a){return txt(a&&a.id)===txt(id);});
      if(row)reconcileCreatePending(id,row);
    });
    (ops.removeIds||[]).forEach(function(id){reconcileCreatePending(id,null);});
    writePending(rows,ops);
    setTimeout(worker,0);
  }

  function restorePendingLocally(){
    const pending=readPending();
    if(!pending||!Array.isArray(pending.achats))return;

    const upsertIds=cleanIds(pending.upsertIds);
    const removeIds=cleanIds(pending.removeIds);
    const source=new Map(pending.achats.map(function(row){return [txt(row&&row.id),row];}).filter(function(x){return x[0];}));

    let current=[];
    try{
      if(typeof S!=='undefined'&&S&&Array.isArray(S.achats))current=S.achats.map(function(a){return {...a};});
    }catch(e){}
    if(!current.length){
      try{
        const raw=localStorage.getItem('YAYA_CACHE_DATA_V2');
        const cached=raw?JSON.parse(raw):{};
        if(Array.isArray(cached.achats))current=cached.achats.map(function(a){return {...a};});
      }catch(e){}
    }

    let restored;
    if(upsertIds.length||removeIds.length){
      const map=new Map(current.map(function(row){return [txt(row&&row.id),row];}).filter(function(x){return x[0];}));
      removeIds.forEach(function(id){map.delete(id);});
      upsertIds.forEach(function(id){
        const row=source.get(id);
        if(row)map.set(id,{...row});
      });
      restored=Array.from(map.values());
    }else{
      // Compatibilité avec une ancienne file créée avant les mutations explicites.
      restored=pending.achats.map(function(a){return {...a};});
    }

    try{if(typeof S!=='undefined'&&S)S.achats=restored.map(function(a){return {...a};});}catch(e){}
    try{
      const raw=localStorage.getItem('YAYA_CACHE_DATA_V2');
      const cached=raw?JSON.parse(raw):{};
      if(cached&&typeof cached==='object'){
        cached.achats=restored.map(function(a){return {...a};});
        localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(cached));
      }
    }catch(e){}
  }

  function idFromOnclick(raw){
    const m=String(raw||'').match(/saveAchat\s*\(\s*['\"]([^'\"]+)['\"]/);
    return m&&m[1]?String(m[1]):'';
  }

  function matchAchatFromFields(modal){
    try{
      if(typeof S==='undefined'||!S||!Array.isArray(S.achats))return '';
      const ch=txt(modal.querySelector('#eaCh')?.value);
      const type=txt(modal.querySelector('#eaType')?.value);
      const four=txt(modal.querySelector('#eaFour')?.value);
      const des=txt(modal.querySelector('#eaDes')?.value);
      const date=txt(modal.querySelector('#eaDate')?.value);
      const mt=Number(modal.querySelector('#eaMt')?.value||0);
      const found=S.achats.filter(function(a){
        if(ch&&String(a?.chantierId||'')!==ch)return false;
        if(type&&String(a?.typeDoc||'')!==type)return false;
        if(four&&txt(a?.fournisseur)!==four)return false;
        if(des&&txt(a?.designation)!==des)return false;
        if(date&&String(a?.date||'').slice(0,10)!==date)return false;
        if(Number.isFinite(mt)&&Math.abs((Number(a?.montantHT)||0)-mt)>.01)return false;
        return true;
      });
      return found.length===1?String(found[0].id||''):'';
    }catch(e){return '';}
  }

  function resolveId(modal,button){
    let id=txt(button?.dataset?.achatId||modal?.dataset?.yayaAchatId||'');
    if(!id&&modal){
      const save=Array.from(modal.querySelectorAll('button')).find(function(b){return /saveAchat/.test(String(b.getAttribute('onclick')||''));});
      if(save)id=idFromOnclick(save.getAttribute('onclick'));
    }
    if(!id&&modal)id=matchAchatFromFields(modal);
    return txt(id);
  }

  function fastSave(modal,id){
    if(!modal||!id)return false;
    let achat=null;
    try{achat=S.achats.find(function(a){return String(a?.id||'')===String(id);});}catch(e){}
    if(!achat){toastSafe('Impossible d’identifier cet achat',true);return false;}

    const ch=modal.querySelector('#eaCh');
    const type=modal.querySelector('#eaType');
    const four=modal.querySelector('#eaFour');
    const des=modal.querySelector('#eaDes');
    const date=modal.querySelector('#eaDate');
    const mt=modal.querySelector('#eaMt');
    if(!ch||!type||!four||!des||!date||!mt)return false;

    achat.chantierId=ch.value;
    achat.typeDoc=type.value;
    achat.fournisseur=four.value.trim();
    achat.designation=des.value.trim();
    achat.date=date.value;
    achat.montantHT=Number(mt.value)||0;
    if(String(achat.typeDoc||'').trim()==='Facture sous-traitant')achat.sousTraitant=achat.fournisseur;
    else if('sousTraitant' in achat)achat.sousTraitant='';

    closeModalSafe();
    toastSafe('Achat enregistré — synchronisation en arrière-plan');
    renderSoon();
    persistCacheSoon();
    queueCurrent({upsertIds:[id]});
    return true;
  }

  function removeConfirm(overlay){try{overlay?.remove();}catch(e){}}

  function showFastDeleteConfirm(id,editModal){
    document.querySelectorAll('.'+CONFIRM_CLASS).forEach(function(n){n.remove();});
    const overlay=document.createElement('div');
    overlay.className=CONFIRM_CLASS;
    overlay.style.cssText='position:fixed!important;inset:0!important;background:rgba(15,23,42,.58)!important;z-index:2147483647!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:18px!important';
    overlay.innerHTML=''
      +'<div style="background:#fff;border-radius:14px;padding:22px;max-width:410px;width:100%;box-shadow:0 18px 60px rgba(0,0,0,.35);font-family:inherit">'
      +'<div style="font-size:17px;font-weight:800;color:#162D49;margin-bottom:10px">Supprimer cet achat de Yaya ?</div>'
      +'<div style="font-size:13px;line-height:1.5;color:#556579;margin-bottom:18px">Le fichier original Drive / Dropbox sera conservé. Seule la ligne Yaya sera supprimée.</div>'
      +'<div style="display:flex;gap:10px;justify-content:flex-end">'
      +'<button type="button" data-bg-cancel style="padding:10px 15px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;color:#334155;font-weight:700;cursor:pointer">Annuler</button>'
      +'<button type="button" data-bg-ok style="padding:10px 15px;border-radius:8px;border:0;background:#b42318;color:#fff;font-weight:800;cursor:pointer">Supprimer de Yaya</button>'
      +'</div></div>';

    overlay.querySelector('[data-bg-cancel]').onclick=function(){removeConfirm(overlay);};
    overlay.onclick=function(e){if(e.target===overlay)removeConfirm(overlay);};
    overlay.querySelector('[data-bg-ok]').onclick=function(e){
      e.preventDefault();e.stopPropagation();
      try{
        if(typeof S==='undefined'||!S||!Array.isArray(S.achats))throw new Error('données indisponibles');
        const before=S.achats.length;
        S.achats=S.achats.filter(function(a){return String(a?.id||'')!==String(id);});
        if(S.achats.length===before)console.warn('Yaya finance — achat déjà absent :',id);
      }catch(err){toastSafe('Suppression impossible',true);return;}

      removeConfirm(overlay);
      try{if(editModal?.closest('.overlay'))editModal.closest('.overlay').remove();else closeModalSafe();}catch(e){closeModalSafe();}
      toastSafe('Achat supprimé — synchronisation en arrière-plan');
      renderSoon();
      persistCacheSoon();
      queueCurrent({removeIds:[id]});
    };
    document.body.appendChild(overlay);
  }

  window.addEventListener('click',function(e){
    const button=e.target?.closest?.('button');
    if(!button)return;
    const modal=button.closest('.modal');
    if(!modal||!modal.querySelector('#eaCh'))return;
    if(window.__yayaAchatEditAuthoritativeSaveV4)return;
    const raw=String(button.getAttribute('onclick')||'');
    const isSave=button.classList.contains('yaya-achat-single-save')||/saveAchat/.test(raw)||/^Enregistrer$/i.test(txt(button.textContent));
    if(!isSave)return;
    const id=resolveId(modal,button);
    if(!id)return;
    e.preventDefault();e.stopPropagation();if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
    fastSave(modal,id);
  },true);

  window.addEventListener('pointerdown',function(e){
    const button=e.target?.closest?.('.yaya-achat-edit-delete');
    if(!button)return;
    const modal=button.closest('.modal');
    if(!modal||!modal.querySelector('#eaCh'))return;
    const id=resolveId(modal,button);
    if(!id){toastSafe('Impossible d’identifier cet achat',true);return;}
    e.preventDefault();e.stopPropagation();if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
    showFastDeleteConfirm(id,modal);
  },true);

  window.saveAchat=function(id){
    const modal=document.querySelector('#modalRoot .modal');
    return fastSave(modal,txt(id));
  };

  function deleteByIdQueued(id,skipConfirm){
    id=txt(id);
    if(!id)return false;

    const execute=function(){
      try{
        if(typeof S==='undefined'||!S||!Array.isArray(S.achats))throw new Error('données indisponibles');
        const before=S.achats.length;
        S.achats=S.achats.filter(function(a){return txt(a&&a.id)!==id;});
        if(S.achats.length===before){
          console.warn('Yaya finance — achat déjà absent :',id);
        }
      }catch(err){
        toastSafe('Suppression impossible',true);
        return false;
      }

      persistCacheSoon();
      queueCurrent({removeIds:[id]});
      renderSoon();
      toastSafe('Achat supprimé — synchronisation…');
      return true;
    };

    if(skipConfirm===true)return execute();

    const existing=document.querySelector('.'+CONFIRM_CLASS);
    if(existing)existing.remove();

    const overlay=document.createElement('div');
    overlay.className=CONFIRM_CLASS;
    overlay.style.cssText='position:fixed!important;inset:0!important;background:rgba(15,23,42,.58)!important;z-index:2147483647!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:18px!important';
    overlay.innerHTML=''
      +'<div style="background:#fff;border-radius:14px;padding:22px;max-width:410px;width:100%;box-shadow:0 18px 60px rgba(0,0,0,.35);font-family:inherit">'
      +'<div style="font-size:17px;font-weight:800;color:#162D49;margin-bottom:10px">Supprimer cet achat de Yaya ?</div>'
      +'<div style="font-size:13px;line-height:1.5;color:#556579;margin-bottom:18px">Le fichier original Drive / Dropbox sera conservé. Seule la ligne Yaya sera supprimée.</div>'
      +'<div style="display:flex;gap:10px;justify-content:flex-end">'
      +'<button type="button" data-bg-cancel style="padding:10px 15px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;color:#334155;font-weight:700;cursor:pointer">Annuler</button>'
      +'<button type="button" data-bg-ok style="padding:10px 15px;border-radius:8px;border:0;background:#b42318;color:#fff;font-weight:800;cursor:pointer">Supprimer de Yaya</button>'
      +'</div></div>';
    document.body.appendChild(overlay);

    const close=function(){try{overlay.remove();}catch(e){}};
    overlay.querySelector('[data-bg-cancel]').onclick=close;
    overlay.onclick=function(e){if(e.target===overlay)close();};
    overlay.querySelector('[data-bg-ok]').onclick=function(e){
      e.preventDefault();e.stopPropagation();
      close();
      execute();
    };
    return true;
  }

  window.__yayaFinanceDeleteById=deleteByIdQueued;
  window.__yayaFinanceQueueCurrent=queueCurrent;
  window.__yayaFinanceFlushPending=worker;

  // Toutes les anciennes croix/boutons qui appellent delAchat(id) passent
  // désormais par la suppression persistante par ID.
  window.delAchat=function(id){return deleteByIdQueued(id,false);};
  try{delAchat=window.delAchat;}catch(e){}

  restorePendingLocally();
  window.addEventListener('online',function(){setTimeout(worker,250);});
  window.addEventListener('focus',function(){restorePendingLocally();setTimeout(worker,500);});
  window.addEventListener('pagehide',function(){
    // Pas de réseau à la fermeture : la file locale est déjà la source de reprise.
    // On force seulement le cache courant de façon synchrone.
    try{
      const raw=localStorage.getItem('YAYA_CACHE_DATA_V2');
      const cached=raw?JSON.parse(raw):{};
      if(cached&&typeof cached==='object'){
        cached.achats=cloneAchats();
        localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(cached));
      }
    }catch(e){}
  },{passive:true});
  setTimeout(worker,1200);
})();
