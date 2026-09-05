(function(){
  'use strict';

  if(window.__yayaChantierEditButtonsFixInstalled)return;
  window.__yayaChantierEditButtonsFixInstalled=true;

  let saveBusy=false;
  let lastPointerAt=0;

  function modal(){
    return document.querySelector('#modalRoot .yaya-chantier-edit-modal');
  }

  function closeEditModal(){
    try{
      const root=document.getElementById('modalRoot');
      if(root)root.innerHTML='';
    }catch(e){}
    try{
      if(typeof window.closeModal==='function')window.closeModal();
    }catch(e){}
  }

  function chantierIdFromModal(m){
    if(!m)return '';
    const save=m.querySelector('#editChSave');
    const code=String(save&&save.getAttribute('onclick')||'');
    let match=code.match(/saveExistingChantier\(['\"]([^'\"]+)['\"]\)/);
    if(match&&match[1])return match[1];

    const del=m.querySelector('.yaya-delete-chantier-modal-btn');
    const delId=String(del&&del.dataset&&del.dataset.yayaChantierId||'').trim();
    if(delId)return delId;
    const delCode=String(del&&del.getAttribute('onclick')||'');
    match=delCode.match(/deleteExistingChantier\(['\"]([^'\"]+)['\"]\)/);
    return match&&match[1]?match[1]:'';
  }

  function getChantier(id){
    try{
      return Array.isArray(S&&S.chantiers)
        ?S.chantiers.find(function(c){return String(c&&c.id)===String(id);})||null
        :null;
    }catch(e){return null;}
  }

  function readValues(c){
    const nom=document.getElementById('editChNom');
    const sig=document.getElementById('editChSignature');
    const dem=document.getElementById('editChDemarrage');
    const mt=document.getElementById('editChMarcheHT');
    if(!c||!nom||!sig||!mt)return {ok:false};

    const name=String(nom.value||'').trim();
    if(!name){
      if(typeof toast==='function')toast('Indique le nom du chantier',true);
      try{nom.focus();}catch(e){}
      return {ok:false};
    }

    const brut=String(mt.value||'0').trim().replace(/\s/g,'').replace(',','.');
    const montant=Number(brut||0);
    if(!Number.isFinite(montant)||montant<0){
      if(typeof toast==='function')toast('Chiffre d’affaires HT invalide',true);
      try{mt.focus();}catch(e){}
      return {ok:false};
    }

    return {
      ok:true,
      nom:name,
      dateSignature:String(sig.value||''),
      dateDemarrageEstime:dem?String(dem.value||''):'',
      montantMarcheHT:montant
    };
  }

  async function saveEdit(button){
    if(saveBusy)return;
    const m=modal();
    const id=chantierIdFromModal(m);
    const c=getChantier(id);
    if(!c){
      if(typeof toast==='function')toast('Chantier introuvable',true);
      return;
    }

    const values=readValues(c);
    if(!values.ok)return;

    const before={
      nom:c.nom,
      dateSignature:c.dateSignature,
      dateDemarrageEstime:c.dateDemarrageEstime,
      montantMarcheHT:c.montantMarcheHT
    };

    c.nom=values.nom;
    c.dateSignature=values.dateSignature;
    c.dateDemarrageEstime=values.dateDemarrageEstime;
    c.montantMarcheHT=values.montantMarcheHT;

    saveBusy=true;
    if(button){
      button.disabled=true;
      button.textContent='Enregistrement…';
    }

    closeEditModal();
    try{if(typeof render==='function')render();}catch(e){}

    try{
      if(typeof apiPost!=='function')throw new Error('API Yaya indisponible');
      const result=await apiPost('setChantiers',S.chantiers);
      if(result===false)throw new Error('Enregistrement refusé');
      if(typeof toast==='function')toast('Chantier mis à jour ✓');
    }catch(err){
      c.nom=before.nom;
      c.dateSignature=before.dateSignature;
      c.dateDemarrageEstime=before.dateDemarrageEstime;
      c.montantMarcheHT=before.montantMarcheHT;
      try{if(typeof render==='function')render();}catch(e){}
      if(typeof toast==='function')toast('Enregistrement impossible : aucune modification conservée',true);
      console.error('Edition chantier : enregistrement impossible',err);
    }finally{
      saveBusy=false;
    }
  }

  function actionFromButton(btn){
    if(!btn)return '';
    const text=String(btn.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
    if(btn.id==='editChSave'||text==='enregistrer'||text==='enregistrement…')return 'save';
    if(btn.id==='editChCancel'||text==='annuler')return 'cancel';
    return '';
  }

  function intercept(event){
    const m=modal();
    if(!m||!event.target||!event.target.closest)return;
    const btn=event.target.closest('button');
    if(!btn||!m.contains(btn))return;
    const action=actionFromButton(btn);
    if(!action)return;

    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();

    if(action==='cancel'){
      closeEditModal();
      return;
    }
    saveEdit(btn);
  }

  window.addEventListener('pointerup',function(event){
    const m=modal();
    const btn=m&&event.target&&event.target.closest?event.target.closest('button'):null;
    const action=btn&&m&&m.contains(btn)?actionFromButton(btn):'';
    if(!action)return;
    lastPointerAt=Date.now();
    intercept(event);
  },true);

  window.addEventListener('click',function(event){
    if(Date.now()-lastPointerAt<650){
      const m=modal();
      const btn=m&&event.target&&event.target.closest?event.target.closest('button'):null;
      const action=btn&&m&&m.contains(btn)?actionFromButton(btn):'';
      if(action){
        event.preventDefault();
        event.stopPropagation();
        if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
        return;
      }
    }
    intercept(event);
  },true);
})();
