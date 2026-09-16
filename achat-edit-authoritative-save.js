(function(){
  'use strict';
  if(window.__yayaAchatEditAuthoritativeSaveV4)return;
  window.__yayaAchatEditAuthoritativeSaveV4=true;

  let busy=false;

  function txt(v){return String(v==null?'':v).trim();}
  function toastSafe(message,isError){try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}}
  function modalFor(button){return button&&button.closest?button.closest('.modal'):null;}
  function isEditModal(modal){return !!(modal&&modal.querySelector('#eaCh')&&modal.querySelector('#eaType')&&modal.querySelector('#eaFour')&&modal.querySelector('#eaDes')&&modal.querySelector('#eaDate')&&modal.querySelector('#eaMt'));}
  function isChargeModal(modal){
    if(!modal)return false;
    const title=txt(modal.querySelector('h5,h4,h3')&&modal.querySelector('h5,h4,h3').textContent);
    const type=txt(modal.querySelector('#eaType')&&modal.querySelector('#eaType').value);
    return /charge/i.test(title)||type==='Facture sous-traitant';
  }
  function isSaveButton(button){
    const modal=modalFor(button);
    if(!isEditModal(modal))return false;
    const raw=String(button.getAttribute('onclick')||'');
    return button.classList.contains('yaya-achat-single-save')||/saveAchat\s*\(/.test(raw)||/^Enregistrer$/i.test(txt(button.textContent));
  }
  function extractId(button,modal){
    let id=txt(button&&button.dataset&&button.dataset.achatId||modal&&modal.dataset&&modal.dataset.yayaAchatId||'');
    if(id)return id;
    const raws=[];
    if(button)raws.push(String(button.getAttribute('onclick')||''));
    if(modal)Array.from(modal.querySelectorAll('button')).forEach(function(b){raws.push(String(b.getAttribute('onclick')||''));});
    for(const raw of raws){
      const m=raw.match(/saveAchat\s*\(\s*['\"]([^'\"]+)['\"]/);
      if(m&&m[1])return String(m[1]);
    }
    return '';
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
  async function save(button){
    if(busy)return;
    const modal=modalFor(button);
    const charge=isChargeModal(modal);
    const id=extractId(button,modal);
    if(!id){toastSafe(charge?'Impossible d’identifier cette charge':'Impossible d’identifier cet achat',true);return;}

    busy=true;
    setBusy(button,true);
    try{
      const fresh=await readAchats();
      const idx=fresh.findIndex(function(a){return txt(a&&a.id)===txt(id);});
      if(idx<0)throw new Error(charge?'Charge introuvable dans le Sheet':'Achat introuvable dans le Sheet');
      const updated=buildUpdated(modal,fresh[idx]);
      const rows=fresh.slice();
      rows[idx]=updated;

      await writeRows(rows);

      let checked=await readAchats();
      let saved=checked.find(function(a){return txt(a&&a.id)===txt(id);});
      if(!same(saved,updated)){
        await writeRows(rows);
        checked=await readAchats();
        saved=checked.find(function(a){return txt(a&&a.id)===txt(id);});
      }
      if(!same(saved,updated))throw new Error('La modification n’est pas confirmée dans le Sheet');

      updateLocal(checked);
      closeEditModal(modal);
      try{if(typeof render==='function')render();}catch(e){}
      toastSafe(charge?'Charge modifiée dans le Sheet ✓':'Achat modifié dans le Sheet ✓');
    }catch(err){
      setBusy(button,false);
      toastSafe('NON ENREGISTRÉ — '+txt(err&&err.message||err),true);
    }finally{
      busy=false;
    }
  }

  window.addEventListener('click',function(e){
    const button=e.target&&e.target.closest?e.target.closest('button'):null;
    if(!button||!isSaveButton(button))return;
    e.preventDefault();
    e.stopPropagation();
    if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
    save(button);
  },true);
})();
