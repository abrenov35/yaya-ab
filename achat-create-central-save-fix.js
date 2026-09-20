(function(){
  'use strict';
  if(window.__yayaAchatCreateCentralSaveV2)return;
  window.__yayaAchatCreateCentralSaveV2=true;

  let busy=false;
  const PENDING_KEY='YAYA_ACHATS_CREATE_PENDING_V1';
  let flushBusy=false;
  const syncingIds=new Set();

  function readPending(){
    try{
      const p=JSON.parse(localStorage.getItem(PENDING_KEY)||'[]');
      return Array.isArray(p)?p.filter(x=>x&&x.id):[];
    }catch(e){return [];}
  }
  function writePending(rows){
    try{
      if(rows&&rows.length)localStorage.setItem(PENDING_KEY,JSON.stringify(rows));
      else localStorage.removeItem(PENDING_KEY);
    }catch(e){}
  }
  function queuePending(row){
    const rows=readPending().filter(x=>txt(x&&x.id)!==txt(row&&row.id));
    rows.push(row);
    writePending(rows);
  }
  function dequeuePending(id){
    writePending(readPending().filter(x=>txt(x&&x.id)!==txt(id)));
  }

  function txt(v){return String(v==null?'':v).trim();}
  function toastSafe(message,isError){try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}}
  function currentSection(){
    const b=document.querySelector('#pane-chantiers .yaya-detail-section-tab.on[data-section]');
    return b?txt(b.dataset.section):'';
  }
  function titleOf(modal){
    const h=modal&&modal.querySelector('h5,h4,h3');
    return txt(h&&h.textContent);
  }
  function fieldBy(modal,id,pattern,selector){
    if(!modal)return null;
    let el=id?modal.querySelector('#'+id):null;
    if(el)return el;
    const nodes=Array.from(modal.querySelectorAll(selector||'input,select,textarea'));
    return nodes.find(function(node){
      const hay=[
        node.getAttribute('placeholder'),
        node.getAttribute('aria-label'),
        node.getAttribute('name'),
        node.id
      ].map(txt).join(' ');
      return pattern&&pattern.test(hay);
    })||null;
  }
  function fieldValue(el){return el?txt(el.value):'';}
  function currentChantierId(){
    const ch=document.querySelector('#pane-chantiers .card[data-yaya-detail-section]')?.closest('.card');
    try{
      if(typeof focusChantier!=='undefined'&&focusChantier)return txt(focusChantier);
    }catch(e){}
    try{return txt(new URL(location.href).searchParams.get('chantier'));}catch(e){}
    return '';
  }
  function resolveFields(modal){
    return {
      chantier:fieldBy(modal,'acCh',/chantier/i,'input,select'),
      fournisseur:fieldBy(modal,'acFour',/fournisseur|intervenant|sous.?traitant/i,'input,select'),
      designation:fieldBy(modal,'acDes',/d[ée]signation|description|objet/i,'input,textarea'),
      montant:fieldBy(modal,'acMt',/montant|prix/i,'input'),
      date:fieldBy(modal,'acDate',/date/i,'input'),
      type:fieldBy(modal,'acType',/type/i,'input,select')
    };
  }
  function isCreateAchatModal(modal){
    if(!modal)return false;
    const title=titleOf(modal);
    if(!/Enregistrer un achat|Ajouter une charge|Ajouter une d[ée]pense/i.test(title))return false;
    if(/^Modifier\b/i.test(title))return false;
    const f=resolveFields(modal);
    return !!(f.fournisseur&&f.designation&&f.montant);
  }
  function closeCreateModalNow(modal){
    try{
      const overlay=modal&&modal.closest&&modal.closest('.overlay');
      if(overlay&&overlay.isConnected){overlay.remove();return;}
    }catch(e){}
    try{
      const root=document.getElementById('modalRoot');
      if(root)root.replaceChildren();
    }catch(e){}
    try{if(typeof closeModal==='function')closeModal();}catch(e){}
  }
  function hasId(rows,id){
    return Array.isArray(rows)&&rows.some(function(r){return txt(r&&r.id)===txt(id);});
  }
  function statusEl(modal){
    let el=modal&&modal.querySelector('#yayaAchatSaveStatus');
    if(el)return el;
    if(!modal)return null;
    el=document.createElement('div');
    el.id='yayaAchatSaveStatus';
    el.style.cssText='margin-top:10px;font-size:12px;font-weight:700;min-height:18px';
    const foot=modal.querySelector('.mfoot,.yaya-achat-create-actions-fixed');
    if(foot)modal.insertBefore(el,foot);else modal.appendChild(el);
    return el;
  }
  function setStatus(modal,message,isError){
    const el=statusEl(modal);
    if(!el)return;
    el.textContent=message||'';
    el.style.color=isError?'#b42318':'#166534';
  }
  function applyLocal(row){
    try{
      if(typeof S!=='undefined'&&S){
        if(!Array.isArray(S.achats))S.achats=[];
        const i=S.achats.findIndex(a=>txt(a&&a.id)===txt(row&&row.id));
        if(i>=0)S.achats[i]={...S.achats[i],...row};
        else S.achats.push(row);
      }
    }catch(e){}
    try{
      const raw=localStorage.getItem('YAYA_CACHE_DATA_V2');
      const cached=raw?JSON.parse(raw):{};
      if(cached&&typeof cached==='object'){
        if(!Array.isArray(cached.achats))cached.achats=[];
        const i=cached.achats.findIndex(a=>txt(a&&a.id)===txt(row&&row.id));
        if(i>=0)cached.achats[i]={...cached.achats[i],...row};
        else cached.achats.push(row);
        localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(cached));
      }
    }catch(e){}
  }
  function replaceLocalFromServer(serverRows){
    let merged=Array.isArray(serverRows)?serverRows.map(function(a){return {...a};}):[];

    // Créations non encore confirmées.
    readPending().forEach(function(row){
      const i=merged.findIndex(a=>txt(a&&a.id)===txt(row&&row.id));
      if(i>=0)merged[i]={...merged[i],...row};
      else merged.push({...row});
    });

    // Modifications / suppressions non encore confirmées.
    try{
      const finance=JSON.parse(localStorage.getItem('YAYA_FINANCE_PENDING_ACHATS_V1')||'null');
      if(finance&&Array.isArray(finance.achats)){
        const source=new Map(finance.achats.map(function(row){return [txt(row&&row.id),row];}).filter(function(x){return x[0];}));
        const map=new Map(merged.map(function(row){return [txt(row&&row.id),row];}).filter(function(x){return x[0];}));
        const removeIds=Array.from(new Set((finance.removeIds||[]).map(txt).filter(Boolean)));
        const upsertIds=Array.from(new Set((finance.upsertIds||[]).map(txt).filter(Boolean)));
        removeIds.forEach(function(id){map.delete(id);});
        upsertIds.forEach(function(id){
          const row=source.get(id);
          if(row)map.set(id,{...row});
        });
        merged=Array.from(map.values());
      }
    }catch(e){}

    try{if(typeof S!=='undefined'&&S)S.achats=merged.slice();}catch(e){}
    try{
      const raw=localStorage.getItem('YAYA_CACHE_DATA_V2');
      const cached=raw?JSON.parse(raw):{};
      if(cached&&typeof cached==='object'){
        cached.achats=merged.slice();
        localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(cached));
      }
    }catch(e){}
  }
  function mergePendingIntoLocal(){
    const pending=readPending();
    if(!pending.length)return;
    pending.forEach(applyLocal);
  }

  function setBusy(button,on){
    busy=!!on;
    if(!button)return;
    button.disabled=!!on;
    if(on){
      button.dataset.yayaOriginalText=button.dataset.yayaOriginalText||button.textContent||'Enregistrer';
      button.textContent='Enregistrement…';
    }else{
      button.textContent=button.dataset.yayaOriginalText||'Enregistrer';
    }
  }
  async function fetchWithTimeout(url,options,timeout){
    const ctrl=new AbortController();
    const timer=setTimeout(function(){ctrl.abort();},timeout||15000);
    try{
      return await fetch(url,Object.assign({},options||{},{signal:ctrl.signal,cache:'no-store'}));
    }finally{
      clearTimeout(timer);
    }
  }
  async function postRow(row){
    const r=await fetchWithTimeout(API,{
      method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action:'addAchat',data:row})
    },15000);
    const raw=await r.text();
    if(!r.ok)throw new Error('Serveur HTTP '+r.status);
    let j=null;
    try{j=JSON.parse(raw);}catch(e){return false;}
    if(j&&j.ok===false)throw new Error(j.error||'Écriture refusée');
    return !!(j&&j.ok!==false);
  }
  async function readAchats(){
    const sep=API.indexOf('?')>=0?'&':'?';
    const r=await fetchWithTimeout(API+sep+'tabs=achats&_yaya_check='+Date.now(),{method:'GET'},12000);
    if(!r.ok)throw new Error('Lecture HTTP '+r.status);
    const raw=await r.text();
    let j;
    try{j=JSON.parse(raw);}catch(e){throw new Error('Réponse serveur invalide');}
    if(!j||j.ok===false)throw new Error(j&&j.error?j.error:'Lecture achats impossible');
    return j.data&&Array.isArray(j.data.achats)?j.data.achats:[];
  }
  async function confirmRow(row){
    let rows=await readAchats();
    if(hasId(rows,row.id))return rows;
    await new Promise(function(resolve){setTimeout(resolve,350);});
    try{await postRow(row);}catch(e){console.warn('Yaya achat · seconde écriture',e);}
    rows=await readAchats();
    return hasId(rows,row.id)?rows:null;
  }

  async function persistInBackground(row){
    const rowId=txt(row&&row.id);
    if(!rowId||syncingIds.has(rowId))return false;
    syncingIds.add(rowId);
    queuePending(row);
    window.__yayaWriteInFlight=(Number(window.__yayaWriteInFlight)||0)+1;
    try{
      // Reprise sûre après fermeture : vérifier d'abord si le serveur possède déjà l'ID.
      // Cela évite un second addAchat si le premier POST avait réussi juste avant la fermeture.
      try{
        const already=await readAchats();
        if(hasId(already,rowId)){
          dequeuePending(rowId);
          replaceLocalFromServer(already);
          try{if(typeof render==='function')render();}catch(e){}
          return true;
        }
      }catch(preErr){
        console.warn('Yaya achat · contrôle préalable impossible',preErr);
      }

      let postOk=false;
      try{postOk=await postRow(row);}catch(err){console.warn('Yaya achat · écriture directe',err);}
      const serverRows=await confirmRow(row);
      if(!serverRows)throw new Error(postOk?'Enregistrement non confirmé dans le Sheet':'Écriture serveur refusée');
      dequeuePending(row.id);
      replaceLocalFromServer(serverRows);
      try{if(typeof render==='function')render();}catch(e){}
      toastSafe('Achat synchronisé ✓');
      return true;
    }catch(err){
      console.error('Yaya — achat conservé localement, synchronisation en attente :',err);
      applyLocal(row);
      toastSafe('Achat enregistré localement — synchronisation en attente',true);
      return false;
    }finally{
      syncingIds.delete(rowId);
      window.__yayaWriteInFlight=Math.max(0,(Number(window.__yayaWriteInFlight)||1)-1);
      window.__yayaLastWriteAt=Date.now();
    }
  }

  async function flushPending(){
    if(flushBusy)return;
    const rows=readPending();
    if(!rows.length)return;
    flushBusy=true;
    try{
      for(const row of rows.slice()){
        try{await persistInBackground(row);}catch(e){}
      }
    }finally{flushBusy=false;}
  }

  async function save(button,modal){
    if(busy)return;

    const fields=resolveFields(modal);
    const chantierId=fieldValue(fields.chantier)||currentChantierId();
    const fournisseur=fieldValue(fields.fournisseur);
    const designation=fieldValue(fields.designation);
    const montantTexte=fieldValue(fields.montant).replace(/\s/g,'').replace(',','.');
    const montantHT=Number(montantTexte);
    const date=fieldValue(fields.date)||new Date().toISOString().slice(0,10);
    const charge=currentSection()==='charges'||/Ajouter une charge/i.test(titleOf(modal));
    const typeDoc=charge?'Facture sous-traitant':(fieldValue(fields.type)||'Facture');

    if(!chantierId){toastSafe('Chantier non identifié',true);return;}
    if(!fournisseur){try{fields.fournisseur&&fields.fournisseur.focus();}catch(e){}toastSafe(charge?'Indique le sous-traitant':'Indique le fournisseur',true);return;}
    if(!designation){try{fields.designation&&fields.designation.focus();}catch(e){}toastSafe('Indique la désignation',true);return;}
    if(!Number.isFinite(montantHT)||montantHT<=0){try{fields.montant&&fields.montant.focus();}catch(e){}toastSafe('Indique le montant HT',true);return;}

    let lien='';
    try{lien=txt(achatLien);}catch(e){try{lien=txt(window.achatLien);}catch(_) {}}

    const row={
      id:(typeof uid==='function'?uid():(Date.now().toString(36)+Math.random().toString(36).slice(2,8))),
      chantierId:chantierId,
      typeDoc:typeDoc,
      fournisseur:fournisseur,
      designation:designation,
      date:date,
      montantHT:montantHT,
      sousTraitant:charge?fournisseur:'',
      lien:lien,
      statutValidation:'VALIDEE',
      origine:'MANUELLE'
    };

    // Local-first : l'opérateur ne doit pas attendre les allers-retours Google.
    applyLocal(row);
    queuePending(row);
    try{achatLien='';}catch(e){try{window.achatLien='';}catch(_) {}}

    // Priorité opérateur : la modale disparaît avant render() et avant tout réseau.
    closeCreateModalNow(modal);
    toastSafe(charge?'Charge enregistrée — synchronisation…':'Achat enregistré — synchronisation…');

    // Le rendu et la synchronisation se font après restitution de l'interface.
    setTimeout(function(){
      try{if(typeof render==='function')render();}catch(e){}
      setTimeout(function(){persistInBackground(row);},0);
    },0);
  }

  document.addEventListener('click',function(e){
    const button=e.target&&e.target.closest?e.target.closest('button'):null;
    if(!button||!/^Enregistrer$/i.test(txt(button.textContent)))return;
    const modal=button.closest('.modal');
    if(!isCreateAchatModal(modal))return;
    e.preventDefault();
    e.stopPropagation();
    if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
    save(button,modal);
  },true);

  // Réinjecte les achats non encore synchronisés après un reload.
  mergePendingIntoLocal();
  setTimeout(flushPending,700);
  window.addEventListener('online',function(){setTimeout(flushPending,150);},{passive:true});
  window.addEventListener('focus',function(){mergePendingIntoLocal();setTimeout(flushPending,350);},{passive:true});
  window.addEventListener('yaya:data-refreshed',function(){mergePendingIntoLocal();},{passive:true});
})();
