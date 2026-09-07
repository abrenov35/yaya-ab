(function(){
  'use strict';

  if(window.__yayaAchatSousTraitantSingleFieldV5)return;
  window.__yayaAchatSousTraitantSingleFieldV5=true;

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

  function toastSafe(message,isError){
    try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}
  }

  function renderSafe(){
    try{if(typeof render==='function')render();}catch(e){}
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
      if(designation){
        designation.placeholder='Description';
        designation.setAttribute('aria-label','Description');
        show(designation);
      }
    }else{
      fournisseur.placeholder='Fournisseur';
      fournisseur.setAttribute('aria-label','Fournisseur');
      fournisseur.required=true;
      if(designation){
        designation.placeholder='Désignation';
        designation.setAttribute('aria-label','Désignation');
        show(designation);
      }
      if(st){
        st.value='';
        hide(st);
      }
    }

    hideOpenAIWarning(type.closest('.modal'));
  }

  function prepareBeforeSave(){
    const type=document.getElementById('acType');
    const fournisseur=document.getElementById('acFour');
    const st=document.getElementById('acST');
    if(!type||!fournisseur)return;

    if(isSousTraitant(type.value)){
      const nom=String(fournisseur.value||'').trim();
      if(st)st.value=nom;
    }else if(st){
      st.value='';
    }
  }

  function value(id){
    const el=document.getElementById(id);
    return el?String(el.value||'').trim():'';
  }

  function rollbackAchat(id){
    try{
      if(typeof S==='undefined'||!S||!Array.isArray(S.achats))return;
      S.achats=S.achats.filter(function(a){return String(a&&a.id)!==String(id);});
      renderSafe();
    }catch(e){}
  }

  function saveWithoutPageSwitch(){
    const chantierId=value('acCh');
    const typeDoc=value('acType');
    const fournisseur=value('acFour');
    const designation=value('acDes');
    const date=value('acDate');
    const montantRaw=value('acMt').replace(/\s/g,'').replace(',','.');
    const montantHT=Number(montantRaw)||0;
    const sousTraitant=isSousTraitant(typeDoc)?fournisseur:'';

    if(!chantierId){toastSafe('Choisis le chantier de rattachement',true);return false;}
    if(!fournisseur){
      const el=document.getElementById('acFour');
      if(el)el.focus();
      toastSafe(isSousTraitant(typeDoc)?'Indique le sous-traitant':'Indique le fournisseur',true);
      return false;
    }
    if(!montantHT){toastSafe('Indique le montant HT',true);return false;}

    try{
      const doublon=(typeof S!=='undefined'&&S&&Array.isArray(S.achats))
        ?S.achats.find(function(a){
          return String(a&&a.fournisseur||'').toLowerCase()===fournisseur.toLowerCase()
            && Number(a&&a.montantHT||0)===montantHT
            && String(a&&a.date||'')===date;
        })
        :null;
      if(doublon && !window.confirm('Doublon probable : '+fournisseur+' — '+montantHT+' € au '+date+' existe déjà. Enregistrer quand même ?')){
        return false;
      }
    }catch(e){}

    let lien='';
    try{lien=String(achatLien||'');}catch(e){}

    const row={
      id:(typeof uid==='function'?uid():(Date.now().toString(36)+Math.random().toString(36).slice(2,8))),
      chantierId:chantierId,
      typeDoc:typeDoc,
      fournisseur:fournisseur,
      designation:designation,
      date:date,
      montantHT:montantHT,
      sousTraitant:sousTraitant,
      lien:lien,
      statutValidation:'VALIDEE',
      origine:'MANUELLE'
    };

    try{
      if(typeof S==='undefined'||!S)return false;
      if(!Array.isArray(S.achats))S.achats=[];
      S.achats.push(row);
    }catch(e){
      toastSafe('Impossible d’ajouter la dépense',true);
      return false;
    }

    try{achatLien='';}catch(e){}

    try{if(typeof closeModal==='function')closeModal();}catch(e){}
    renderSafe();
    toastSafe('Achat enregistré ✓');

    Promise.resolve()
      .then(function(){
        return (typeof apiPost==='function')?apiPost('addAchat',row):false;
      })
      .then(function(ok){
        if(ok)return;
        rollbackAchat(row.id);
        toastSafe('La dépense n’a pas été enregistrée sur le serveur',true);
      })
      .catch(function(err){
        console.error('Yaya — enregistrement achat :',err);
        rollbackAchat(row.id);
        toastSafe('La dépense n’a pas été enregistrée sur le serveur',true);
      });

    return true;
  }

  function patchModal(){
    const type=document.getElementById('acType');
    const fournisseur=document.getElementById('acFour');
    if(!type||!fournisseur)return;

    const modal=type.closest('.modal');
    if(!modal)return;

    if(!type.__yayaSousTraitantChangeV5){
      type.addEventListener('change',syncSousTraitantField);
      type.__yayaSousTraitantChangeV5=true;
    }

    if(!fournisseur.__yayaSousTraitantInputV5){
      fournisseur.addEventListener('input',function(){
        if(!isSousTraitant(type.value))return;
        const st=document.getElementById('acST');
        if(st)st.value=String(fournisseur.value||'').trim();
      });
      fournisseur.__yayaSousTraitantInputV5=true;
    }

    syncSousTraitantField();
    hideOpenAIWarning(modal);

    const save=Array.from(modal.querySelectorAll('button')).find(function(b){
      const txt=String(b.textContent||'').trim();
      const onclick=String(b.getAttribute('onclick')||'');
      return /^Enregistrer$/i.test(txt)||/addAchat/.test(onclick);
    });
    if(!save||save.__yayaAchatSaveNoSwitchV5)return;

    save.removeAttribute('onclick');
    save.__yayaAchatSaveNoSwitchV5=true;
    save.addEventListener('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      prepareBeforeSave();
      saveWithoutPageSwitch();
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

  setTimeout(patchModal,0);
})();

/* Recharge sans cache les correctifs Documents : l'ancien code contient deux #docLien. */
(function(){
  'use strict';
  if(window.__yayaDocumentAttachmentBootstrapV2)return;
  window.__yayaDocumentAttachmentBootstrapV2=true;

  ['document-upload-noai-fix.js','document-missing-attachment-warning.js'].forEach(function(src){
    const s=document.createElement('script');
    s.src=src+'?v=attachment-fix-2-'+Date.now();
    s.async=false;
    document.head.appendChild(s);
  });
})();
