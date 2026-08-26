(function(){
  'use strict';

  let currentSave=null;

  function findSaveButton(){
    const root=document.getElementById('modalRoot');
    if(!root)return null;
    return Array.from(root.querySelectorAll('button')).find(function(btn){
      return /saveDocument\s*\(/.test(String(btn.getAttribute('onclick')||''));
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

  function install(){
    if(typeof window.saveDocument!=='function'){
      setTimeout(install,120);
      return;
    }
    if(window.saveDocument.__yayaSingleSubmit)return;

    const original=window.saveDocument;
    const wrapped=function(){
      if(currentSave)return currentSave;

      setBusy(true);
      let p;
      try{
        p=Promise.resolve(original.apply(this,arguments));
      }catch(err){
        setBusy(false);
        throw err;
      }

      currentSave=p.finally(function(){
        currentSave=null;
        // Si une validation a empêché la fermeture de la modale, rendre le bouton utilisable.
        setTimeout(function(){setBusy(false);},0);
      });
      return currentSave;
    };

    wrapped.__yayaSingleSubmit=true;
    window.saveDocument=wrapped;
  }

  install();
})();
