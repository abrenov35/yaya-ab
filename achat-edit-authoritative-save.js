(function(){
  'use strict';
  if(window.__yayaAchatEditAuthoritativeSaveV5)return;
  window.__yayaAchatEditAuthoritativeSaveV5=true;
  window.__yayaAchatEditAuthoritativeSaveV4=true;

  let busy=false;

  function txt(v){return String(v==null?'':v).trim();}
  function toastSafe(message,isError){try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}}
  function currentModal(){return document.querySelector('#modalRoot .modal');}
  function isEditModal(modal){return !!(modal&&modal.querySelector('#eaCh')&&modal.querySelector('#eaType')&&modal.querySelector('#eaFour')&&modal.querySelector('#eaDes')&&modal.querySelector('#eaDate')&&modal.querySelector('#eaMt'));}
  function isChargeModal(modal){
    if(!modal)return false;
    const title=txt(modal.querySelector('h5,h4,h3')&&modal.querySelector('h5,h4,h3').textContent);
    const type=txt(modal.querySelector('#eaType')&&modal.querySelector('#eaType').value);
    return /charge/i.test(title)||type==='Facture sous-traitant';
  }
  function saveButton(modal){
    if(!modal)return null;
    return Array.from(modal.querySelectorAll('button')).find(function(b){
      const raw=String(b.getAttribute('onclick')||'');
      return b.classList.contains('yaya-achat-single-save')||/saveAchat\s*\(/.test(raw)||/^Enregistrer$/i.test(txt(b.textContent));
    })||null;
  }
  function setBusy(button,on){
    if(!button)return;
    if(on){
      button.dataset.yayaEditText=button.textContent||'Enregistrer';
      button.disabled=true;
      button.textContent='Enregistrement…';
    }else{
      button.disabled=false;
      button.textContent=button.dataset.yayaEditText||'Enregistrer';
    }
  }
  function closeEditModal(modal){
    const overlay=modal&&modal.closest?modal.closest('.overlay'):null;
    try{if(typeof closeModal==='function')closeModal();}catch(e){}
    if(modal&&modal.isConnected){
      try{
        if(overlay&&overlay.isConnected)overlay.remove();
        else modal.remove();
      }catch(e){}
    }
  }
  async function fetchWithTimeout(url,options,timeout){
    const ctrl=new AbortController();
    const timer=setTimeout(function(){ctrl.abort();},timeout||12000);
    try{return await fetch(url,Object.assign({},options||{},{signal:ctrl.signal,cache:'no-store'}));}
    finally{clearTimeout(timer);}
  }
  async function readAchats(){
    const sep=API.indexOf('?')>=0?'&':'?';
    const r=await fetchWithTimeout(API+sep+'tabs=achats&_yaya_edit='+Date.now(),{method:'GET'},12000);
    const raw=await r.text();
    if(!r.ok)throw new Error('Lecture HTTP '+r.status);
    let j;try{j=JSON.parse(raw);}catch(e){throw new Error('Réponse serveur invalide');}
    if(!j||j.ok===false)throw new Error(j&&j.error?j.error:'Lecture achats impossible');
    return j.data&&Array.isArray(j.data.achats)?j.data.achats:[];
  }
  async function writeRows(rows){
    const r=await fetchWithTimeout(API,{
      method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action:'setAchats',data:rows})
    },15000);
    const raw=await r.text();
    if(!r.ok)throw new Error('Écriture HTTP '+r.status);
    if(raw){
      try{
        const j=JSON.parse(raw);
        if(j&&j.ok===false)throw new Error(j.error||'Écriture refusée');
      }catch(e){
        if(e&&/Écriture refusée/.test(String(e.message||'')))throw e;
      }
    }
    return true;
  }
  function same(a,b){
    if(!a||!b)return false;
    return txt(a.chantierId)===txt(b.chantierId)
      &&txt(a.typeDoc)===txt(b.typeDoc)
      &&txt(a.fournisseur)===txt(b.fournisseur)
      &&txt(a.designation)===txt(b.designation)
      &&String(a.date||'').slice(0,10)===String(b.date||'').slice(0,10)
      &&Math.abs((Number(a.montantHT)||0)-(Number(b.montantHT)||0))<0.001;
  }
  function buildUpdated(modal,current){
    const updated=Object.assign({},current,{
      chantierId:txt(modal.querySelector('#eaCh').value),
      typeDoc:txt(modal.querySelector('#eaType').value),
      fournisseur:txt(modal.querySelector('#eaFour').value),
      designation:txt(modal.querySelector('#eaDes').value),
      date:txt(modal.querySelector('#eaDate').value),
      montantHT:Number(String(modal.querySelector('#eaMt').value||'0').replace(',','.'))||0
    });
    if(updated.typeDoc==='Facture sous-traitant')updated.sousTraitant=updated.fournisseur;
    else if('sousTraitant' in updated)updated.sousTraitant='';
    return updated;
  }
  function updateLocal(rows){
    try{if(typeof S!=='undefined'&&S)S.achats=rows;}catch(e){}
    try{
      const raw=localStorage.getItem('YAYA_CACHE_DATA_V2');
      const cached=raw?JSON.parse(raw):{};
      if(cached&&typeof cached==='object'){
        cached.achats=rows;
        localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(cached));
      }
    }catch(e){}
    try{localStorage.removeItem('YAYA_FINANCE_PENDING_ACHATS_V1');}catch(e){}
  }
  function verifyInBackground(id,updated,charge){
    setTimeout(async function(){
      try{
        const checked=await readAchats();
        const saved=checked.find(function(a){return txt(a&&a.id)===txt(id);});
        updateLocal(checked);
        if(!same(saved,updated)){
          try{if(typeof render==='function')render();}catch(e){}
          toastSafe(charge?'Attention : la charge n’est pas confirmée dans le Sheet':'Attention : l’achat n’est pas confirmé dans le Sheet',true);
        }
      }catch(e){
        console.warn('Yaya — contrôle Sheet en arrière-plan impossible',e);
      }
    },250);
  }
  async function saveById(id){
    if(busy)return false;
    const modal=currentModal();
    if(!isEditModal(modal))return false;
    const charge=isChargeModal(modal);
    const rowId=txt(id);
    if(!rowId){toastSafe(charge?'Impossible d’identifier cette charge':'Impossible d’identifier cet achat',true);return false;}

    const button=saveButton(modal);
    busy=true;
    setBusy(button,true);
    window.__yayaWriteInFlight=(Number(window.__yayaWriteInFlight)||0)+1;
    try{
      const fresh=await readAchats();
      const idx=fresh.findIndex(function(a){return txt(a&&a.id)===rowId;});
      if(idx<0)throw new Error(charge?'Charge introuvable dans le Sheet':'Achat introuvable dans le Sheet');
      const updated=buildUpdated(modal,fresh[idx]);
      const rows=fresh.slice();
      rows[idx]=updated;

      await writeRows(rows);
      updateLocal(rows);
      closeEditModal(modal);
      try{if(typeof render==='function')render();}catch(e){}
      toastSafe(charge?'Charge modifiée ✓':'Achat modifié ✓');
      verifyInBackground(rowId,updated,charge);
      return true;
    }catch(err){
      setBusy(button,false);
      toastSafe('NON ENREGISTRÉ — '+txt(err&&err.message||err),true);
      return false;
    }finally{
      window.__yayaWriteInFlight=Math.max(0,(Number(window.__yayaWriteInFlight)||1)-1);
      window.__yayaLastWriteAt=Date.now();
      busy=false;
    }
  }

  window.saveAchat=function(id){return saveById(id);};
  try{saveAchat=window.saveAchat;}catch(e){}
})();
