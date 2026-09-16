(function(){
  'use strict';
  if(window.__yayaAchatEditAuthoritativeSaveV3)return;
  window.__yayaAchatEditAuthoritativeSaveV3=true;

  let busy=false;

  function txt(v){return String(v==null?'':v).trim();}
  function toastSafe(message,isError){try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}}
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
    if(button)raws.push(String(button.getAttribute('onclick')||''));
    if(modal)Array.from(modal.querySelectorAll('button')).forEach(function(b){raws.push(String(b.getAttribute('onclick')||''));});
    for(const raw of raws){
      const m=raw.match(/saveAchat\s*\(\s*['\"]([^'\"]+)['\"]/);
      if(m&&m[1])return String(m[1]);
    }
    try{
      if(typeof S!=='undefined'&&S&&Array.isArray(S.achats)){
        const ch=txt(modal.querySelector('#eaCh').value);
        const four=txt(modal.querySelector('#eaFour').value);
        const des=txt(modal.querySelector('#eaDes').value);
        const date=txt(modal.querySelector('#eaDate').value);
        const mt=Number(String(modal.querySelector('#eaMt').value||'0').replace(',','.'))||0;
        const matches=S.achats.filter(function(a){
          return txt(a&&a.chantierId)===ch&&txt(a&&a.fournisseur)===four&&txt(a&&a.designation)===des&&String(a&&a.date||'').slice(0,10)===date&&Math.abs((Number(a&&a.montantHT)||0)-mt)<0.001;
        });
        if(matches.length===1)return txt(matches[0].id);
      }
    }catch(e){}
    return '';
  }
  function currentAchat(id){
    try{return typeof S!=='undefined'&&S&&Array.isArray(S.achats)?S.achats.find(function(a){return txt(a&&a.id)===txt(id);})||null:null;}catch(e){return null;}
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
  async function directPost(row){
    const ctrl=new AbortController();
    const timer=setTimeout(function(){ctrl.abort();},9000);
    try{
      const r=await fetch(API,{
        method:'POST',
        headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({action:'addAchat',data:row}),
        signal:ctrl.signal,
        cache:'no-store'
      });
      const raw=await r.text();
      if(!r.ok)throw new Error('HTTP '+r.status);
      if(raw){
        try{
          const j=JSON.parse(raw);
          if(j&&j.ok===false)throw new Error(j.error||'Écriture refusée');
        }catch(e){
          if(e&&/Écriture refusée|HTTP/.test(String(e.message||'')))throw e;
        }
      }
      return true;
    }finally{clearTimeout(timer);}
  }
  function updateLocal(id,updated){
    try{
      const idx=S.achats.findIndex(function(a){return txt(a&&a.id)===txt(id);});
      if(idx>=0)S.achats[idx]=updated;
    }catch(e){}
    try{
      const raw=localStorage.getItem('YAYA_CACHE_DATA_V2');
      const cached=raw?JSON.parse(raw):{};
      if(cached&&typeof cached==='object'&&Array.isArray(S&&S.achats)){
        cached.achats=S.achats;
        localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(cached));
      }
    }catch(e){}
    try{localStorage.removeItem('YAYA_FINANCE_PENDING_ACHATS_V1');}catch(e){}
  }
  function setBusy(button,on){
    busy=!!on;
    if(!button)return;
    if(on){
      button.dataset.yayaEditOriginalText=button.textContent||'Enregistrer';
      button.disabled=true;
      button.textContent='Enregistrement…';
    }else{
      button.disabled=false;
      button.textContent=button.dataset.yayaEditOriginalText||'Enregistrer';
    }
  }
  async function save(button){
    if(busy)return;
    const modal=modalFor(button);
    if(!isEditModal(modal))return;
    const id=extractId(button,modal);
    if(!id){toastSafe('Impossible d’identifier cet achat',true);return;}
    const current=currentAchat(id);
    if(!current){toastSafe('Achat introuvable',true);return;}
    const updated=buildUpdated(modal,current);

    setBusy(button,true);
    try{
      await directPost(updated);
      updateLocal(id,updated);
      try{if(typeof closeModal==='function')closeModal();}catch(e){}
      try{if(typeof render==='function')render();}catch(e){}
      toastSafe('Achat modifié ✓');
    }catch(err){
      setBusy(button,false);
      toastSafe('NON ENREGISTRÉ — '+txt(err&&err.message||err),true);
      return;
    }
    busy=false;
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
