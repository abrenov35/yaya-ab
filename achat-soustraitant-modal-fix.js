(function(){
  'use strict';

  if(window.__yayaAchatSousTraitantSingleFieldV2)return;
  window.__yayaAchatSousTraitantSingleFieldV2=true;

  function isSousTraitant(type){
    return String(type||'').trim()==='Facture sous-traitant';
  }

  function hide(el){
    if(!el)return;
    el.style.setProperty('display','none','important');
    el.setAttribute('aria-hidden','true');
  }

  function show(el){
    if(!el)return;
    el.style.removeProperty('display');
    el.removeAttribute('aria-hidden');
  }

  function hideOpenAIWarning(modal){
    if(!modal)return;
    Array.from(modal.querySelectorAll('.note,span,div,p,small')).forEach(function(el){
      if(el.children&&el.children.length>2)return;
      const text=String(el.textContent||'').replace(/\s+/g,' ').trim();
      if(text && text.length<300 && (/Clé OpenAI absente/i.test(text)||/OPENAI_API_KEY/i.test(text))){
        hide(el);
      }
    });
  }

  function syncSousTraitantField(){
    const type=document.getElementById('acType');
    const fournisseur=document.getElementById('acFour');
    const designation=document.getElementById('acDes');
    const st=document.getElementById('acST');
    if(!type||!fournisseur)return;

    const sousTraitant=isSousTraitant(type.value);

    if(sousTraitant){
      fournisseur.placeholder='Sous-traitant';
      fournisseur.setAttribute('aria-label','Sous-traitant');
      fournisseur.required=true;
      if(st){
        st.value=String(fournisseur.value||'').trim();
        hide(st);
      }
      if(designation)hide(designation);
    }else{
      fournisseur.placeholder='Fournisseur';
      fournisseur.setAttribute('aria-label','Fournisseur');
      fournisseur.required=true;
      if(designation)show(designation);
      if(st){
        st.value='';
        hide(st);
      }
    }

    const modal=type.closest('.modal');
    hideOpenAIWarning(modal);
  }

  function prepareBeforeSave(){
    const type=document.getElementById('acType');
    const fournisseur=document.getElementById('acFour');
    const designation=document.getElementById('acDes');
    const st=document.getElementById('acST');
    if(!type||!fournisseur)return;

    if(isSousTraitant(type.value)){
      const nom=String(fournisseur.value||'').trim();
      if(st)st.value=nom;
      // Une facture sous-traitant ne propose qu'un seul champ texte : le nom du sous-traitant.
      if(designation)designation.value='';
    }else if(st){
      st.value='';
    }
  }

  function patchModal(){
    const type=document.getElementById('acType');
    const fournisseur=document.getElementById('acFour');
    if(!type||!fournisseur)return;

    const modal=type.closest('.modal');
    if(!modal)return;

    if(!type.__yayaSousTraitantChange){
      type.addEventListener('change',syncSousTraitantField);
      type.__yayaSousTraitantChange=true;
    }

    if(!fournisseur.__yayaSousTraitantInput){
      fournisseur.addEventListener('input',function(){
        if(!isSousTraitant(type.value))return;
        const st=document.getElementById('acST');
        if(st)st.value=String(fournisseur.value||'').trim();
      });
      fournisseur.__yayaSousTraitantInput=true;
    }

    syncSousTraitantField();
    hideOpenAIWarning(modal);

    const save=Array.from(modal.querySelectorAll('button')).find(function(b){
      const txt=String(b.textContent||'').trim();
      const onclick=String(b.getAttribute('onclick')||'');
      return /^Enregistrer$/i.test(txt)||/addAchat/.test(onclick);
    });
    if(!save||save.__yayaAchatSaveSingleField)return;

    save.removeAttribute('onclick');
    save.__yayaAchatSaveSingleField=true;
    save.addEventListener('click',async function(e){
      e.preventDefault();
      e.stopPropagation();

      const chantier=document.getElementById('acCh');
      const fournisseurNow=document.getElementById('acFour');
      const montant=document.getElementById('acMt');
      const typeNow=document.getElementById('acType');

      if(!chantier||!chantier.value){
        if(typeof toast==='function')toast('Choisis le chantier de rattachement',true);
        return;
      }

      const nom=String(fournisseurNow&&fournisseurNow.value||'').trim();
      if(!nom){
        if(fournisseurNow)fournisseurNow.focus();
        if(typeof toast==='function')toast(isSousTraitant(typeNow&&typeNow.value)?'Indique le sous-traitant':'Indique le fournisseur',true);
        return;
      }

      if(!montant||!(Number(montant.value)||0)){
        if(typeof toast==='function')toast('Indique le montant HT',true);
        return;
      }

      prepareBeforeSave();

      let before=0;
      try{before=(window.S&&Array.isArray(S.achats))?S.achats.length:0;}catch(_e){}

      try{
        const r=(typeof addAchat==='function')?addAchat():null;
        if(r&&typeof r.then==='function')await r;
      }catch(err){
        if(typeof toast==='function')toast(String(err&&err.message||err),true);
        return;
      }

      let after=before;
      try{after=(window.S&&Array.isArray(S.achats))?S.achats.length:before;}catch(_e){}
      if(after>before && typeof closeModal==='function')closeModal();
    },true);
  }

  let raf=0;
  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(function(){
      raf=0;
      patchModal();
    });
  }

  const obs=new MutationObserver(schedule);
  obs.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  document.addEventListener('change',function(e){
    if(e.target&&e.target.id==='acType')syncSousTraitantField();
  },true);
  document.addEventListener('click',function(e){
    const btn=e.target&&e.target.closest?e.target.closest('button'):null;
    if(btn&&document.getElementById('acType'))prepareBeforeSave();
  },true);

  setTimeout(patchModal,0);
})();
