(function(){
  'use strict';
  if(window.__yayaAchatEditAuthoritativeSaveV1)return;
  window.__yayaAchatEditAuthoritativeSaveV1=true;

  let busy=false;

  function txt(v){return String(v==null?'':v).trim();}
  function toastSafe(message,isError){try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}}
  function wait(ms){return new Promise(function(resolve){setTimeout(resolve,ms);});}
  function modalFor(button){return button&&button.closest?button.closest('.modal'):null;}
  function isEditModal(modal){return !!(modal&&modal.querySelector('#eaCh')&&modal.querySelector('#eaType')&&modal.querySelector('#eaFour')&&modal.querySelector('#eaDes')&&modal.querySelector('#eaDate')&&modal.querySelector('#eaMt'));}
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
    if(button)raws.push(String(button.getAttribute('onclick')||''),String(button.dataset&&button.dataset.yayaDirectSaveOnclick||''));
    if(modal){
      Array.from(modal.querySelectorAll('button')).forEach(function(b){raws.push(String(b.getAttribute('onclick')||''));});
    }
    for(const raw of raws){
      const m=raw.match(/saveAchat\s*\(\s*['\"]([^'\"]+)['\"]/);
      if(m&&m[1])return String(m[1]);
    }
    return '';
  }
  function arm(button){
    if(!isSaveButton(button)||busy)return false;
    const modal=modalFor(button);
    const id=extractId(button,modal);
    if(!id)return false;
    button.dataset.yayaAuthoritativeEdit='1';
    button.dataset.yayaAuthoritativeId=id;
    button.dataset.yayaAuthoritativeText=button.textContent||'Enregistrer';
    button.dataset.yayaAuthoritativeOnclick=button.getAttribute('onclick')||'';
    button.classList.remove('yaya-achat-single-save');
    button.removeAttribute('onclick');
    button.textContent='Enregistrement…';
    button.disabled=true;
    return true;
  }
  function restore(button){
    if(!button)return;
    button.disabled=false;
    button.textContent=button.dataset.yayaAuthoritativeText||'Enregistrer';
    button.classList.add('yaya-achat-single-save');
    if(button.dataset.yayaAuthoritativeOnclick)button.setAttribute('onclick',button.dataset.yayaAuthoritativeOnclick);
    delete button.dataset.yayaAuthoritativeEdit;
  }
  async function fetchWithTimeout(url,options,timeout){
    const ctrl=new AbortController();
    const timer=setTimeout(function(){ctrl.abort();},timeout||12000);
    try{return await fetch(url,Object.assign({},options||{},{signal:ctrl.signal,cache:'no-store'}));}
    finally{clearTimeout(timer);}
  }
  async function readAchats(){
    const sep=API.indexOf('?')>=0?'&':'?';
    const r=await fetchWithTimeout(API+sep+'tabs=achats&_yaya_edit_check='+Date.now(),{method:'GET'},12000);
    const raw=await r.text();
    if(!r.ok)throw new Error('Lecture HTTP '+r.status);
    let j;try{j=JSON.parse(raw);}catch(e){throw new Error('Réponse serveur invalide');}
    if(!j||j.ok===false)throw new Error(j&&j.error?j.error:'Lecture achats impossible');
    return j.data&&Array.isArray(j.data.achats)?j.data.achats:[];
  }
  async function postRows(rows){
    const r=await fetchWithTimeout(API,{
      method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action:'setAchats',data:rows})
    },15000);
    const raw=await r.text();
    if(!r.ok)throw new Error('Écriture HTTP '+r.status);
    try{
      const j=JSON.parse(raw);
      if(j&&j.ok===false)throw new Error(j.error||'Écriture refusée');
    }catch(e){
      if(e&&/Écriture refusée/.test(String(e.message||'')))throw e;
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
  }
  async function save(button){
    if(busy)return;
    const modal=modalFor(button);
    const id=txt(button.dataset.yayaAuthoritativeId);
    if(!isEditModal(modal)||!id){restore(button);return;}
    const fresh=await readAchats();
    const idx=fresh.findIndex(function(a){return txt(a&&a.id)===id;});
    if(idx<0)throw new Error('Achat introuvable dans le Sheet');
    const current=fresh[idx];
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
    const rows=fresh.slice();rows[idx]=updated;

    busy=true;
    try{
      await postRows(rows);
      await wait(300);
      let checked=await readAchats();
      let saved=checked.find(function(a){return txt(a&&a.id)===id;});
      if(!same(saved,updated)){
        await postRows(rows);
        await wait(450);
        checked=await readAchats();
        saved=checked.find(function(a){return txt(a&&a.id)===id;});
      }
      if(!same(saved,updated))throw new Error('La modification n’est pas confirmée dans le Sheet');
      updateLocal(checked);
      try{localStorage.removeItem('YAYA_FINANCE_PENDING_ACHATS_V1');}catch(e){}
      try{if(typeof closeModal==='function')closeModal();}catch(e){}
      try{if(typeof render==='function')render();}catch(e){}
      toastSafe('Achat modifié dans le Sheet ✓');
    }finally{
      busy=false;
    }
  }

  window.addEventListener('pointerdown',function(e){
    const button=e.target&&e.target.closest?e.target.closest('button'):null;
    if(button)arm(button);
  },true);

  window.addEventListener('click',function(e){
    const button=e.target&&e.target.closest?e.target.closest('button'):null;
    if(!button||button.dataset.yayaAuthoritativeEdit!=='1')return;
    e.preventDefault();e.stopPropagation();if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
    save(button).catch(function(err){
      console.error('Yaya — modification achat non enregistrée :',err);
      restore(button);
      toastSafe('NON ENREGISTRÉ — '+txt(err&&err.message||err),true);
    });
  },true);
})();
