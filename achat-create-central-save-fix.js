(function(){
  'use strict';
  if(window.__yayaAchatCreateCentralSaveV2)return;
  window.__yayaAchatCreateCentralSaveV2=true;

  let busy=false;

  function txt(v){return String(v==null?'':v).trim();}
  function val(id){const el=document.getElementById(id);return el?txt(el.value):'';}
  function toastSafe(message,isError){try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}}
  function currentSection(){
    const b=document.querySelector('#pane-chantiers .yaya-detail-section-tab.on[data-section]');
    return b?txt(b.dataset.section):'';
  }
  function isCreateAchatModal(modal){
    if(!modal||!modal.querySelector('#acFour,#acMt'))return false;
    const h=modal.querySelector('h5,h4,h3');
    return /Enregistrer un achat|Ajouter une charge/i.test(txt(h&&h.textContent));
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

  async function save(button,modal){
    if(busy)return;

    const chantierId=val('acCh');
    const fournisseur=val('acFour');
    const designation=val('acDes');
    const montantTexte=val('acMt').replace(/\s/g,'').replace(',','.');
    const montantHT=Number(montantTexte);
    const date=val('acDate')||new Date().toISOString().slice(0,10);
    const charge=currentSection()==='charges'||/Ajouter une charge/i.test(txt(modal&&modal.textContent));
    const typeDoc=charge?'Facture sous-traitant':(val('acType')||'Facture');

    if(!chantierId){toastSafe('Chantier non identifié',true);return;}
    if(!fournisseur){document.getElementById('acFour')?.focus();toastSafe(charge?'Indique le sous-traitant':'Indique le fournisseur',true);return;}
    if(!designation){document.getElementById('acDes')?.focus();toastSafe('Indique la désignation',true);return;}
    if(!Number.isFinite(montantHT)||montantHT<=0){document.getElementById('acMt')?.focus();toastSafe('Indique le montant HT',true);return;}

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

    setBusy(button,true);
    setStatus(modal,'Écriture dans le Sheet…',false);
    try{
      if(typeof API==='undefined'||!API)throw new Error('API Yaya indisponible');

      let postOk=false;
      try{postOk=await postRow(row);}catch(err){console.warn('Yaya achat · écriture directe',err);}
      const serverRows=await confirmRow(row);
      if(!serverRows)throw new Error(postOk?'Enregistrement non confirmé dans le Sheet':'Écriture serveur refusée');

      try{if(typeof S!=='undefined'&&S)S.achats=serverRows;}catch(e){}
      try{
        const raw=localStorage.getItem('YAYA_CACHE_DATA_V2');
        const cached=raw?JSON.parse(raw):{};
        if(cached&&typeof cached==='object'){
          cached.achats=serverRows;
          localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(cached));
        }
      }catch(e){}
      try{achatLien='';}catch(e){try{window.achatLien='';}catch(_) {}}
      setStatus(modal,'Enregistré dans le Sheet ✓',false);
      try{if(typeof closeModal==='function')closeModal();}catch(e){}
      try{if(typeof render==='function')render();}catch(e){}
      toastSafe(charge?'Charge enregistrée dans le Sheet ✓':'Achat enregistré dans le Sheet ✓');
    }catch(err){
      console.error('Yaya — création achat/charge non enregistrée :',err);
      setStatus(modal,'NON ENREGISTRÉ — '+txt(err&&err.message||err),true);
      toastSafe('NON ENREGISTRÉ — '+txt(err&&err.message||err),true);
    }finally{
      setBusy(button,false);
    }
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
})();
