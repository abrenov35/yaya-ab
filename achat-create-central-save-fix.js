(function(){
  'use strict';
  if(window.__yayaAchatCreateCentralSaveV1)return;
  window.__yayaAchatCreateCentralSaveV1=true;

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
  function uniqueById(rows){
    const m=new Map();
    (Array.isArray(rows)?rows:[]).forEach(function(r){
      const id=txt(r&&r.id);
      if(id)m.set(id,r);
    });
    return Array.from(m.values());
  }
  function setBusy(button,on){
    busy=!!on;
    if(!button)return;
    button.disabled=!!on;
    if(on){button.dataset.yayaOriginalText=button.textContent||'Enregistrer';button.textContent='Enregistrement…';}
    else button.textContent=button.dataset.yayaOriginalText||'Enregistrer';
  }

  async function save(button,modal){
    if(busy)return;

    const chantierId=val('acCh');
    const fournisseur=val('acFour');
    const designation=val('acDes');
    const montantTexte=val('acMt').replace(/\s/g,'').replace(',','.');
    const montantHT=Number(montantTexte);
    const date=val('acDate')||new Date().toISOString().slice(0,10);
    const charge=currentSection()==='charges';
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
    try{
      if(typeof apiGet!=='function'||typeof apiPost!=='function')throw new Error('API Yaya indisponible');

      const fresh=await apiGet(true);
      if(!fresh||!Array.isArray(fresh.achats))throw new Error('Liste centrale des achats indisponible');

      const merged=uniqueById(fresh.achats.concat([row]));
      const ok=await apiPost('setAchats',merged);
      if(!ok)throw new Error('Écriture centrale refusée');

      const check=await apiGet(true);
      const serverRows=check&&Array.isArray(check.achats)?check.achats:[];
      if(!hasId(serverRows,row.id))throw new Error('Enregistrement non confirmé dans le Sheet');

      try{if(typeof S!=='undefined'&&S)S.achats=serverRows;}catch(e){}
      try{achatLien='';}catch(e){try{window.achatLien='';}catch(_) {}}
      try{if(typeof closeModal==='function')closeModal();}catch(e){}
      try{if(typeof render==='function')render();}catch(e){}
      toastSafe(charge?'Charge enregistrée dans le Sheet ✓':'Achat enregistré dans le Sheet ✓');
    }catch(err){
      console.error('Yaya — création achat/charge non enregistrée :',err);
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
