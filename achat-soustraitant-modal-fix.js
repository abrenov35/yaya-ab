(function(){
  'use strict';

  function isSousTraitant(type){
    return String(type||'').trim()==='Facture sous-traitant';
  }

  function syncSousTraitantField(){
    const type=document.getElementById('acType');
    const st=document.getElementById('acST');
    if(!type||!st)return;
    const show=isSousTraitant(type.value);
    st.style.display=show?'':'none';
    if(show){
      st.placeholder='Sous-traitant';
      st.required=true;
    }else{
      st.required=false;
    }
  }

  function patchModal(){
    const type=document.getElementById('acType');
    const st=document.getElementById('acST');
    if(!type||!st)return;

    if(!type.__yayaSousTraitantChange){
      type.addEventListener('change',syncSousTraitantField);
      type.__yayaSousTraitantChange=true;
    }
    syncSousTraitantField();

    const modal=type.closest('.modal');
    if(!modal)return;
    const save=[...modal.querySelectorAll('button')].find(b=>String(b.textContent||'').trim()==='Enregistrer');
    if(!save||save.__yayaAchatSaveFix)return;

    save.removeAttribute('onclick');
    save.__yayaAchatSaveFix=true;
    save.addEventListener('click',async function(e){
      e.preventDefault();
      e.stopPropagation();

      const chantier=document.getElementById('acCh');
      const fournisseur=document.getElementById('acFour');
      const montant=document.getElementById('acMt');
      const typeNow=document.getElementById('acType');
      const stNow=document.getElementById('acST');

      if(!chantier||!chantier.value){ if(typeof toast==='function')toast('Choisis le chantier de rattachement',true); return; }
      if(!fournisseur||!String(fournisseur.value||'').trim()){ if(typeof toast==='function')toast('Indique le fournisseur',true); return; }
      if(!montant||!(Number(montant.value)||0)){ if(typeof toast==='function')toast('Indique le montant HT',true); return; }
      if(typeNow&&isSousTraitant(typeNow.value)&&(!stNow||!String(stNow.value||'').trim())){
        syncSousTraitantField();
        if(stNow)stNow.focus();
        if(typeof toast==='function')toast("Indique le sous-traitant",true);
        return;
      }

      let before=0;
      try{ before=(window.S&&Array.isArray(S.achats))?S.achats.length:0; }catch(_e){}
      try{
        const r=(typeof addAchat==='function')?addAchat():null;
        if(r&&typeof r.then==='function')await r;
      }catch(err){
        if(typeof toast==='function')toast(String(err&&err.message||err),true);
        return;
      }
      let after=before;
      try{ after=(window.S&&Array.isArray(S.achats))?S.achats.length:before; }catch(_e){}
      if(after>before && typeof closeModal==='function')closeModal();
    },true);
  }

  const obs=new MutationObserver(()=>patchModal());
  obs.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('change',function(e){if(e.target&&e.target.id==='acType')syncSousTraitantField();},true);
  setTimeout(patchModal,0);
})();
