(function(){
  'use strict';

  if(window.__yayaChantierModalContextLockV1)return;
  window.__yayaChantierModalContextLockV1=true;

  function currentChantierId(){
    // Ne jamais réutiliser un ancien focusChantier lorsqu'on a quitté la page Chantiers.
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
  }

  function lockDevisContext(){
    // IMPORTANT : dans une fiche chantier, on masque uniquement l'identité du CHANTIER.
    // L'intitulé/libellé du devis doit rester modifiable à l'ajout comme à la modification.

    // Ajouter un devis 2+ : conserver le champ "Libellé du devis" (avLib).
    const avLib=document.getElementById('avLib');
    if(avLib)show(avLib.closest('.mrow')||avLib);

    // Modifier le devis principal : ne pas proposer de renommer le chantier.
    const edNom=document.getElementById('edNom');
    if(edNom)hide(edNom.closest('.yaya-devis-fast-field')||edNom.closest('.mrow')||edNom);

    // L'intitulé / objet du devis reste disponible.
    const edNum=document.getElementById('edNum');
    if(edNum)show(edNum.closest('.yaya-devis-fast-field')||edNum.closest('.mrow')||edNum);

    // Modifier un devis 2+ : conserver le champ libellé (eavLib).
    const eavLib=document.getElementById('eavLib');
    if(eavLib)show(eavLib.closest('.yaya-devis-fast-field')||eavLib.closest('.mrow')||eavLib);
  }

  function lockAchatChargeContext(contextId){
    // Création dépense / achat / charge depuis la fiche chantier.
    const acCh=document.getElementById('acCh');
    if(acCh&&contextId){
      lockSelect(acCh,contextId,acCh);
    }

    // Modification : l'affectation chantier existante est immuable ici.
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
    const anchor=docFile||docSujet||docType;
    if(!anchor)return;

    const modal=anchor.closest('.modal');
    if(!modal)return;

    Array.from(modal.querySelectorAll('div,span,p,small,label')).forEach(function(el){
      if(el.children&&el.children.length)return;
      const txt=String(el.textContent||'').replace(/\s+/g,' ').trim();
      if(/Clé\s+OpenAI\s+absente/i.test(txt)||/OPENAI_API_KEY/i.test(txt)){
        hide(el);
      }
    });
  }

  function lockDocumentContext(contextId){
    // Création document depuis la fiche chantier.
    const docCh=document.getElementById('docCh');
    if(docCh&&contextId){
      lockSelect(docCh,contextId,docCh.closest('.row')||docCh);
    }

    // Modification : ne pas déplacer un document vers un autre chantier depuis cette modale.
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

    // Si la commande est ouverte depuis une fiche chantier, le chantier est déjà connu.
    // Sur une ouverture globale sans chantier présélectionné, le choix reste disponible.
    if(id){
      lockSelect(select,id,select.closest('.yaya-commande-create-field')||select);
    }
  }

  function apply(){
    const contextId=currentChantierId();

    lockDevisContext();
    lockAchatChargeContext(contextId);
    lockDocumentContext(contextId);
    lockCommandeContext(contextId);
    enforceLockedSelects(document);
  }

  let raf=0;
  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(function(){
      raf=0;
      apply();
    });
  }

  // Réapplique le verrou après les imports qui peuvent préremplir automatiquement
  // un chantier à partir du contenu du document.
  const observer=new MutationObserver(schedule);
  observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true});

  // Juste avant toute action de la modale, restaurer systématiquement les valeurs verrouillées.
  document.addEventListener('click',function(){
    enforceLockedSelects(document);
  },true);
  document.addEventListener('change',function(){
    enforceLockedSelects(document);
  },true);

  apply();
})();
