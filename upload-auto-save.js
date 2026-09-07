(function(){
  'use strict';

  if(window.__yayaUploadAutoSaveV1)return;
  window.__yayaUploadAutoSaveV1=true;

  const ARM_TTL=120000;

  function modalFrom(node){
    if(node&&node.closest){
      const direct=node.closest('.yaya-commande-create-modal,.yaya-devis-fast-modal,.modal');
      if(direct)return direct;
    }
    return document.querySelector('.yaya-devis-fast-modal,.yaya-commande-create-modal,#modalRoot .modal');
  }

  function arm(modal){
    if(!modal)return;
    modal.dataset.yayaUploadAutoSaveArmed='1';
    modal.dataset.yayaUploadAutoSaveDone='0';
    modal.dataset.yayaUploadAutoSaveAt=String(Date.now());
  }

  function isArmed(modal){
    if(!modal||modal.dataset.yayaUploadAutoSaveArmed!=='1')return false;
    const at=Number(modal.dataset.yayaUploadAutoSaveAt||0);
    if(!at||Date.now()-at>ARM_TTL){
      modal.dataset.yayaUploadAutoSaveArmed='0';
      return false;
    }
    return modal.dataset.yayaUploadAutoSaveDone!=='1';
  }

  function saveButton(modal){
    if(!modal)return null;
    return Array.from(modal.querySelectorAll('button')).find(function(btn){
      const text=String(btn.textContent||'').replace(/\s+/g,' ').trim();
      return /^Enregistrer(?:$|\s|…|\.\.\.)/i.test(text)
        || btn.classList.contains('yaya-commande-create-save');
    })||null;
  }

  function successText(text){
    const t=String(text||'').replace(/\s+/g,' ').trim();
    if(!t||!/✓/.test(t))return false;
    return /pièce jointe enregistrée|pièce importée|importé|importée|archivé|archivée|document ajouté/i.test(t);
  }

  function tryAutoSave(modal,attempt){
    if(!isArmed(modal))return;
    const save=saveButton(modal);
    if(!save)return;

    if(save.disabled||save.getAttribute('aria-busy')==='true'){
      if((attempt||0)<30){
        setTimeout(function(){tryAutoSave(modal,(attempt||0)+1);},100);
      }
      return;
    }

    modal.dataset.yayaUploadAutoSaveDone='1';
    modal.dataset.yayaUploadAutoSaveArmed='0';

    try{
      save.click();
    }catch(e){
      modal.dataset.yayaUploadAutoSaveDone='0';
    }
  }

  function success(modal){
    if(!isArmed(modal))return;
    setTimeout(function(){tryAutoSave(modal,0);},60);
  }

  document.addEventListener('click',function(event){
    const btn=event.target&&event.target.closest?event.target.closest('button'):null;
    if(!btn)return;
    const text=String(btn.textContent||'').replace(/\s+/g,' ').trim();
    if(!/Importer|Déposer|Ajouter une pièce|Remplacer/i.test(text))return;
    const modal=modalFrom(btn);
    if(modal)arm(modal);
  },true);

  document.addEventListener('change',function(event){
    const input=event.target;
    if(!input||input.tagName!=='INPUT'||String(input.type||'').toLowerCase()!=='file')return;
    const file=input.files&&input.files[0];
    if(!file)return;
    const known=input.id==='avFile'
      || input.id==='achatFile'
      || input.id==='docFile'
      || (input.classList&&input.classList.contains('yaya-commande-create-file'));
    if(!known)return;
    const modal=modalFrom(input);
    if(modal)arm(modal);
  },true);

  window.addEventListener('yaya:quote-upload-state',function(event){
    const detail=event&&event.detail||{};
    const modal=document.querySelector('.yaya-devis-fast-modal');
    if(!modal)return;
    if(detail.state==='start')arm(modal);
    else if(detail.state==='success')success(modal);
    else if(detail.state==='error')modal.dataset.yayaUploadAutoSaveArmed='0';
  });

  window.addEventListener('yaya:document-upload-state',function(event){
    const detail=event&&event.detail||{};
    const modal=document.querySelector('#modalRoot .modal');
    if(!modal)return;
    if(detail.state==='success')success(modal);
    else if(detail.state==='error')modal.dataset.yayaUploadAutoSaveArmed='0';
  });

  const observer=new MutationObserver(function(mutations){
    mutations.forEach(function(mutation){
      const target=mutation.target&&mutation.target.nodeType===1
        ? mutation.target
        : mutation.target&&mutation.target.parentElement;
      if(!target)return;
      const modal=modalFrom(target);
      if(!isArmed(modal))return;
      const text=String(target.textContent||'').replace(/\s+/g,' ').trim();
      if(successText(text))success(modal);
    });
  });

  observer.observe(document.documentElement,{
    childList:true,
    subtree:true,
    characterData:true
  });
})();
