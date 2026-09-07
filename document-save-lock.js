(function(){
  'use strict';

  let currentSave=null;

  function documentModal(){
    const root=document.getElementById('modalRoot');
    if(!root)return null;
    return Array.from(root.querySelectorAll('.modal')).find(function(item){
      return !!(item.querySelector('#docFile')||item.querySelector('#docCh')||item.querySelector('#docType')||item.querySelector('#docSujet')||item.querySelector('#docTitre'));
    })||null;
  }

  function cleanOpenAIWarning(){
    const modal=documentModal();
    if(!modal)return;

    Array.from(modal.querySelectorAll('.note,.hint,div,span,p,small,label')).forEach(function(el){
      if(el.querySelector&&el.querySelector('input,select,textarea,button'))return;
      const txt=String(el.textContent||'').replace(/\s+/g,' ').trim();
      if(txt && txt.length<280 && (/Clé\s+OpenAI\s+absente/i.test(txt)||/OPENAI_API_KEY/i.test(txt))){
        el.style.setProperty('display','none','important');
        el.setAttribute('aria-hidden','true');
      }
    });
  }

  function findSaveButton(){
    const modal=documentModal();
    if(!modal)return null;
    return Array.from(modal.querySelectorAll('button')).find(function(btn){
      const txt=String(btn.textContent||'').trim();
      const onclick=String(btn.getAttribute('onclick')||'');
      return /saveDocument\s*\(/.test(onclick)||/^Enregistrer$/i.test(txt)||/^Enregistrement/i.test(txt);
    })||null;
  }

  function setBusy(busy){
    const btn=findSaveButton();
    if(!btn)return;
    if(busy){
      if(!btn.dataset.yayaOriginalText)btn.dataset.yayaOriginalText=btn.textContent||'Enregistrer';
      btn.disabled=true;
      btn.setAttribute('aria-busy','true');
      btn.style.opacity='.65';
      btn.style.cursor='wait';
      btn.textContent='Enregistrement…';
    }else{
      btn.disabled=false;
      btn.removeAttribute('aria-busy');
      btn.style.opacity='';
      btn.style.cursor='';
      btn.textContent=btn.dataset.yayaOriginalText||'Enregistrer';
    }
  }

  function captureContext(){
    let tabValue='';
    let focus='';
    try{tabValue=String(typeof tab!=='undefined'?tab:'');}catch(e){}
    try{focus=String(typeof focusChantier!=='undefined'&&focusChantier?focusChantier:'');}catch(e){}

    let section='';
    try{
      const active=document.querySelector('#pane-chantiers .yaya-detail-section-tab.on[data-section]');
      if(active)section=String(active.dataset.section||'');
    }catch(e){}

    return {
      tab:tabValue,
      focus:focus,
      section:section,
      scrollY:window.scrollY||0
    };
  }

  function restoreContext(ctx){
    if(!ctx||ctx.tab!=='chantiers'||!ctx.focus)return;

    try{tab='chantiers';}catch(e){}
    try{focusChantier=ctx.focus;}catch(e){}

    try{
      if(typeof render==='function')render();
    }catch(e){}

    try{
      if(typeof window.yayaSetDirectUrl==='function')window.yayaSetDirectUrl(ctx.focus);
    }catch(e){}

    requestAnimationFrame(function(){
      try{
        const section=ctx.section||'documents';
        const buttons=Array.from(document.querySelectorAll('#pane-chantiers .yaya-detail-section-tab[data-section="'+section+'"]'));
        const button=buttons.find(function(el){
          try{return window.getComputedStyle(el).display!=='none';}catch(e){return true;}
        });
        if(button&&!button.classList.contains('on'))button.click();
      }catch(e){}
      try{window.scrollTo(0,ctx.scrollY||0);}catch(e){}
    });
  }

  function install(){
    cleanOpenAIWarning();

    if(typeof window.saveDocument!=='function'){
      setTimeout(install,120);
      return;
    }
    if(window.saveDocument.__yayaSingleSubmit)return;

    const original=window.saveDocument;
    const wrapped=function(){
      if(currentSave)return currentSave;

      const context=captureContext();
      setBusy(true);
      let p;
      try{
        p=Promise.resolve(original.apply(this,arguments));
      }catch(err){
        setBusy(false);
        throw err;
      }

      currentSave=p.then(function(result){
        let currentTab='';
        try{currentTab=String(typeof tab!=='undefined'?tab:'');}catch(e){}

        if(context.tab==='chantiers'&&context.focus&&currentTab==='documents'){
          restoreContext(context);
        }
        return result;
      }).finally(function(){
        currentSave=null;
        setTimeout(function(){setBusy(false);cleanOpenAIWarning();},0);
      });
      return currentSave;
    };

    wrapped.__yayaSingleSubmit=true;
    wrapped.__yayaStayInChantier=true;
    window.saveDocument=wrapped;
  }

  function observeModal(){
    const root=document.getElementById('modalRoot');
    if(!root){setTimeout(observeModal,150);return;}
    cleanOpenAIWarning();
    new MutationObserver(function(){
      cleanOpenAIWarning();
    }).observe(root,{childList:true,subtree:true,characterData:true});
  }

  install();
  observeModal();
})();

/* Protection globale : un clic hors d'une modale ne la ferme jamais. */
(function(){
  'use strict';
  if(document.querySelector('script[data-yaya-modal-outside-lock="1"]'))return;
  const s=document.createElement('script');
  s.src='modal-outside-click-lock.js?v=outside-lock-'+Date.now();
  s.async=false;
  s.setAttribute('data-yaya-modal-outside-lock','1');
  document.head.appendChild(s);
})();

/* Raccourci global : Entrée déclenche Enregistrer dans la modale active. */
(function(){
  'use strict';
  if(document.querySelector('script[data-yaya-modal-enter-save="1"]'))return;
  const s=document.createElement('script');
  s.src='modal-enter-save.js?v=enter-save-'+Date.now();
  s.async=false;
  s.setAttribute('data-yaya-modal-enter-save','1');
  document.head.appendChild(s);
})();

/* Bloc-note chantier affiché directement dans la section Marché. */
(function(){
  'use strict';
  if(document.querySelector('script[data-yaya-chantier-market-note="1"]'))return;
  const s=document.createElement('script');
  s.src='chantier-market-note.js?v=market-note-'+Date.now();
  s.async=false;
  s.setAttribute('data-yaya-chantier-market-note','1');
  document.head.appendChild(s);
})();

/* Correctif dédié : centre réellement la modale du bloc-note chantier. */
(function(){
  'use strict';
  if(document.querySelector('script[data-yaya-note-modal-center-fix="1"]'))return;
  const s=document.createElement('script');
  s.src='chantier-note-modal-center-fix.js?v=note-center-'+Date.now();
  s.async=false;
  s.setAttribute('data-yaya-note-modal-center-fix','1');
  document.head.appendChild(s);
})();

/* Verrouillage de la modale achat pendant l'import d'un PDF / d'une photo. */
(function(){
  'use strict';
  if(document.querySelector('script[data-yaya-achat-upload-lock="1"]'))return;
  const s=document.createElement('script');
  s.src='achat-upload-lock.js?v=upload-lock-'+Date.now();
  s.async=false;
  s.setAttribute('data-yaya-achat-upload-lock','1');
  document.head.appendChild(s);
})();

/* Dans une fiche chantier, les modales héritent du chantier courant et ne proposent plus de le changer. */
(function(){
  'use strict';
  if(document.querySelector('script[data-yaya-chantier-modal-context-lock="1"]'))return;
  const s=document.createElement('script');
  s.src='chantier-modal-context-lock.js?v=context-lock-'+Date.now();
  s.async=false;
  s.setAttribute('data-yaya-chantier-modal-context-lock','1');
  document.head.appendChild(s);
})();

/* La modale achat ne doit jamais afficher l'alerte technique OPENAI_API_KEY. */
(function(){
  'use strict';

  function clean(){
    const root=document.getElementById('modalRoot');
    if(!root)return;

    const modal=Array.from(root.querySelectorAll('.modal')).find(function(item){
      return !!(item.querySelector('#acType')||item.querySelector('#achatFile'));
    });
    if(!modal)return;

    Array.from(modal.querySelectorAll('div,span,p,small,label')).forEach(function(el){
      if(el.children&&el.children.length)return;
      const txt=String(el.textContent||'').trim();
      if(/Clé\s+OpenAI\s+absente/i.test(txt)||/OPENAI_API_KEY/i.test(txt)){
        el.style.setProperty('display','none','important');
        el.setAttribute('aria-hidden','true');
      }
    });
  }

  clean();
  const root=document.getElementById('modalRoot');
  if(root){
    new MutationObserver(clean).observe(root,{childList:true,subtree:true,characterData:true});
  }
})();

/* Modification document : un seul clic sur Enregistrer, sans seconde confirmation. */
(function(){
  'use strict';
  let busy=false;

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

  installDirectDocumentEditSave();
})();
