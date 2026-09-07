(function(){
  'use strict';

  if(window.__yayaChantierModalContextLockV4)return;
  window.__yayaChantierModalContextLockV4=true;

  function currentChantierId(){
    const pane=document.getElementById('pane-chantiers');
    if(!pane)return '';
    try{
      if(window.getComputedStyle(pane).display==='none')return '';
    }catch(e){
      if(pane.style&&pane.style.display==='none')return '';
    }

    try{
      if(typeof focusChantier!=='undefined' && focusChantier){
        return String(focusChantier);
      }
    }catch(e){}

    try{
      const id=new URL(window.location.href).searchParams.get('chantier');
      if(id)return String(id);
    }catch(e){}

    return '';
  }

  function activeDetailSection(){
    const btn=document.querySelector('#pane-chantiers .yaya-detail-section-tab.on[data-section]');
    return btn?String(btn.dataset.section||''):'';
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

  function optionExists(select,id){
    if(!select||!id)return false;
    return Array.from(select.options||[]).some(function(option){
      return String(option.value)===String(id);
    });
  }

  function lockSelect(select,id,hideTarget){
    if(!select||!id||!optionExists(select,id))return false;

    const value=String(id);
    if(!select.dataset.yayaLockedChantierId){
      select.dataset.yayaLockedChantierId=value;
    }

    select.value=String(select.dataset.yayaLockedChantierId||value);
    select.setAttribute('aria-hidden','true');
    select.tabIndex=-1;
    hide(hideTarget||select);
    return true;
  }

  function enforceLockedSelects(scope){
    const root=scope&&scope.querySelectorAll?scope:document;

    root.querySelectorAll('select[data-yaya-locked-chantier-id]').forEach(function(select){
      const id=String(select.dataset.yayaLockedChantierId||'');
      if(id&&optionExists(select,id))select.value=id;
    });

    root.querySelectorAll('select[data-yaya-locked-charge-type]').forEach(function(select){
      const value=String(select.dataset.yayaLockedChargeType||'');
      if(value&&optionExists(select,value))select.value=value;
    });
  }

  function lockDevisContext(){
    const avLib=document.getElementById('avLib');
    if(avLib)show(avLib.closest('.mrow')||avLib);

    const edNom=document.getElementById('edNom');
    if(edNom)hide(edNom.closest('.yaya-devis-fast-field')||edNom.closest('.mrow')||edNom);

    const edNum=document.getElementById('edNum');
    if(edNum)show(edNum.closest('.yaya-devis-fast-field')||edNum.closest('.mrow')||edNum);

    const eavLib=document.getElementById('eavLib');
    if(eavLib)show(eavLib.closest('.yaya-devis-fast-field')||eavLib.closest('.mrow')||eavLib);
  }

  function lockAchatChargeContext(contextId){
    const acCh=document.getElementById('acCh');
    if(acCh&&contextId){
      lockSelect(acCh,contextId,acCh);
    }

    const acType=document.getElementById('acType');
    if(acType && activeDetailSection()==='charges'){
      const fixedType='Facture sous-traitant';
      if(optionExists(acType,fixedType)){
        const changed=String(acType.value)!==fixedType;
        acType.value=fixedType;
        acType.dataset.yayaLockedChargeType=fixedType;
        acType.tabIndex=-1;
        hide(acType);
        if(changed){
          try{acType.dispatchEvent(new Event('change',{bubbles:true}));}catch(e){}
        }
      }
    }

    const eaCh=document.getElementById('eaCh');
    if(eaCh){
      const id=String(eaCh.dataset.yayaLockedChantierId||eaCh.value||'');
      if(id)lockSelect(eaCh,id,eaCh.closest('.mrow')||eaCh);
    }
  }

  function cleanDocumentWarning(){
    const docFile=document.getElementById('docFile');
    const docSujet=document.getElementById('docSujet');
    const docType=document.getElementById('docType');
    const docTitre=document.getElementById('docTitre');
    const anchor=docFile||docSujet||docType||docTitre;
    if(!anchor)return;

    const modal=anchor.closest('.modal');
    if(!modal)return;

    Array.from(modal.querySelectorAll('.note,.hint,div,span,p,small,label')).forEach(function(el){
      if(el.querySelector&&el.querySelector('input,select,textarea,button'))return;
      const txt=String(el.textContent||'').replace(/\s+/g,' ').trim();
      if(txt && txt.length<280 && (/Clé\s+OpenAI\s+absente/i.test(txt)||/OPENAI_API_KEY/i.test(txt))){
        hide(el);
      }
    });
  }

  function lockDocumentContext(contextId){
    const docCh=document.getElementById('docCh');
    if(docCh&&contextId){
      lockSelect(docCh,contextId,docCh.closest('.row')||docCh);
    }

    const edDocCh=document.getElementById('edDocCh');
    if(edDocCh){
      const id=String(edDocCh.dataset.yayaLockedChantierId||edDocCh.value||'');
      if(id)lockSelect(edDocCh,id,edDocCh.closest('.mrow')||edDocCh);
    }

    cleanDocumentWarning();
  }

  function lockCommandeContext(contextId){
    const select=document.querySelector('.yaya-commande-create-overlay select[data-field="chantierId"]');
    if(!select)return;

    let id='';
    if(contextId&&optionExists(select,contextId))id=String(contextId);
    else if(select.value)id=String(select.value);

    if(id){
      lockSelect(select,id,select.closest('.yaya-commande-create-field')||select);
    }
  }

  function restoreDetailSection(section,scrollY){
    requestAnimationFrame(function(){
      try{
        if(section){
          const buttons=Array.from(document.querySelectorAll('#pane-chantiers .yaya-detail-section-tab[data-section="'+section+'"]'));
          const button=buttons.find(function(el){
            try{return window.getComputedStyle(el).display!=='none';}catch(e){return true;}
          });
          if(button&&!button.classList.contains('on'))button.click();
        }
      }catch(e){}
      try{window.scrollTo(0,scrollY||0);}catch(e){}
    });
  }

  function installDocumentSaveContextGuard(){
    if(typeof window.saveDocument!=='function'){
      setTimeout(installDocumentSaveContextGuard,120);
      return;
    }
    if(window.saveDocument.__yayaStayInChantier)return;

    const original=window.saveDocument;
    const wrapped=function(){
      const chantierId=currentChantierId();
      const section=activeDetailSection();
      const scrollY=window.scrollY||0;

      let result;
      try{
        result=original.apply(this,arguments);
      }catch(err){
        throw err;
      }

      return Promise.resolve(result).then(function(value){
        let currentTab='';
        try{currentTab=String(typeof tab!=='undefined'?tab:'');}catch(e){}

        if(chantierId && currentTab==='documents'){
          try{tab='chantiers';}catch(e){}
          try{focusChantier=chantierId;}catch(e){}
          try{if(typeof render==='function')render();}catch(e){}
          try{if(typeof window.yayaSetDirectUrl==='function')window.yayaSetDirectUrl(chantierId);}catch(e){}
          restoreDetailSection(section||'documents',scrollY);
        }
        return value;
      });
    };

    wrapped.__yayaStayInChantier=true;
    wrapped.__yayaSingleSubmit=!!original.__yayaSingleSubmit;
    window.saveDocument=wrapped;
  }

  function installDirectDocumentEditSave(){
    if(
      typeof window.saveDocumentEdit!=='function' ||
      typeof window.appliquerModificationDocument!=='function' ||
      typeof window.changementsDocument!=='function'
    ){
      setTimeout(installDirectDocumentEditSave,120);
      return;
    }
    if(window.saveDocumentEdit.__yayaDirectSave)return;

    let busy=false;
    const direct=async function(id){
      if(busy)return;

      const changement=window.changementsDocument(id);
      if(!changement)return;
      if(!changement.messages.length){
        if(typeof window.toast==='function')window.toast('Aucune modification à enregistrer');
        return;
      }

      if(typeof window.fermerConfirmationDocument==='function'){
        window.fermerConfirmationDocument();
      }

      const root=document.getElementById('modalRoot');
      const modal=root?Array.from(root.querySelectorAll('.modal')).find(function(item){
        return !!item.querySelector('#edDocSujet,#edDocTitre,#edDocType,#edDocCh');
      }):null;
      const btn=modal?Array.from(modal.querySelectorAll('button')).find(function(button){
        return /^Enregistrer$/i.test(String(button.textContent||'').trim()) || /saveDocumentEdit/.test(String(button.getAttribute('onclick')||''));
      }):null;

      busy=true;
      if(btn){
        btn.disabled=true;
        btn.dataset.yayaOriginalText=btn.textContent||'Enregistrer';
        btn.textContent='Enregistrement…';
      }

      try{
        await window.appliquerModificationDocument(id);
      }finally{
        busy=false;
        if(btn&&btn.isConnected){
          btn.disabled=false;
          btn.textContent=btn.dataset.yayaOriginalText||'Enregistrer';
        }
      }
    };

    direct.__yayaDirectSave=true;
    window.saveDocumentEdit=direct;
  }

  function apply(){
    const contextId=currentChantierId();

    lockDevisContext();
    lockAchatChargeContext(contextId);
    lockDocumentContext(contextId);
    lockCommandeContext(contextId);
    enforceLockedSelects(document);
    cleanDocumentWarning();
  }

  let raf=0;
  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(function(){
      raf=0;
      apply();
    });
  }

  const observer=new MutationObserver(schedule);
  observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true});

  document.addEventListener('click',function(){
    enforceLockedSelects(document);
    cleanDocumentWarning();
  },true);
  document.addEventListener('change',function(){
    enforceLockedSelects(document);
    cleanDocumentWarning();
  },true);

  installDocumentSaveContextGuard();
  installDirectDocumentEditSave();
  apply();
})();
