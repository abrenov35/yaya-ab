(function(){
  'use strict';

  if(window.__yayaModalUploadGlobalLockV1)return;
  window.__yayaModalUploadGlobalLockV1=true;

  const SUCCESS_CLASS='yaya-upload-success-banner';
  const timers=new WeakMap();
  const observers=new WeakMap();

  function installStyle(){
    if(document.getElementById('yaya-modal-upload-global-lock-style-v1'))return;
    const style=document.createElement('style');
    style.id='yaya-modal-upload-global-lock-style-v1';
    style.textContent=`
      .${SUCCESS_CLASS}{
        display:block!important;
        margin:10px 0!important;
        padding:9px 11px!important;
        border:1px solid #b9dfc6!important;
        border-radius:7px!important;
        background:#eef9f2!important;
        color:#237443!important;
        font-size:12px!important;
        font-weight:750!important;
        line-height:1.3!important;
      }
      .yaya-upload-modal-busy button{cursor:wait!important}
    `;
    document.head.appendChild(style);
  }

  function modalFor(node){
    if(!node||!node.closest)return null;
    return node.closest('.yaya-commande-create-modal,.yaya-devis-fast-modal,.modal');
  }

  function importButton(modal){
    if(!modal)return null;
    return Array.from(modal.querySelectorAll('button')).find(function(btn){
      const text=String(btn.textContent||'').trim();
      return /Importer|Déposer|Ajouter une pièce|Remplacer/i.test(text)
        || btn.classList.contains('yaya-commande-create-import')
        || btn.id==='yayaDevisEditImportBtn';
    })||null;
  }

  function rememberButton(btn){
    if(btn.dataset.yayaGlobalUploadSaved==='1')return;
    btn.dataset.yayaGlobalUploadSaved='1';
    btn.dataset.yayaGlobalUploadDisabled=btn.disabled?'1':'0';
    btn.dataset.yayaGlobalUploadText=btn.textContent||'';
  }

  function lock(modal){
    if(!modal)return;
    installStyle();
    modal.classList.add('yaya-upload-modal-busy');
    modal.dataset.yayaUploadBusy='1';
    modal.querySelectorAll('button').forEach(function(btn){
      rememberButton(btn);
      btn.disabled=true;
      btn.setAttribute('aria-busy','true');
      btn.style.setProperty('pointer-events','none','important');
      btn.style.setProperty('opacity','.62','important');
    });
    const imp=importButton(modal);
    if(imp)imp.textContent='⏳ Import en cours…';

    const old=timers.get(modal);
    if(old)clearTimeout(old);
    timers.set(modal,setTimeout(function(){unlock(modal,false);},90000));
  }

  function unlock(modal,success){
    if(!modal)return;
    const old=timers.get(modal);
    if(old)clearTimeout(old);
    timers.delete(modal);

    modal.classList.remove('yaya-upload-modal-busy');
    modal.dataset.yayaUploadBusy='0';

    modal.querySelectorAll('button[data-yaya-global-upload-saved="1"]').forEach(function(btn){
      btn.disabled=btn.dataset.yayaGlobalUploadDisabled==='1';
      btn.removeAttribute('aria-busy');
      btn.style.removeProperty('pointer-events');
      btn.style.removeProperty('opacity');
      const original=btn.dataset.yayaGlobalUploadText||'';
      if(original)btn.textContent=original;
      delete btn.dataset.yayaGlobalUploadSaved;
      delete btn.dataset.yayaGlobalUploadDisabled;
      delete btn.dataset.yayaGlobalUploadText;
    });

    if(success){
      const imp=importButton(modal);
      if(imp){
        imp.disabled=false;
        imp.textContent='✓ Pièce importée';
      }
      showSuccess(modal);
    }
  }

  function showSuccess(modal){
    if(!modal)return;
    let banner=modal.querySelector('.'+SUCCESS_CLASS);
    if(!banner){
      banner=document.createElement('div');
      banner.className=SUCCESS_CLASS;
      const footer=modal.querySelector('.yaya-devis-fast-foot,.yaya-commande-create-actions,.yaya-devis-create-actions,.mfoot');
      if(footer)footer.insertAdjacentElement('beforebegin',banner);
      else{
        const actions=Array.from(modal.children).find(function(el){
          return el.querySelector&&Array.from(el.querySelectorAll('button')).some(function(b){return /Enregistrer/i.test(String(b.textContent||''));});
        });
        if(actions)actions.insertAdjacentElement('beforebegin',banner);
        else modal.appendChild(banner);
      }
    }
    banner.textContent='✓ Pièce jointe enregistrée';
  }

  function progressText(text){
    const t=String(text||'').replace(/\s+/g,' ').trim();
    return /^⏳/.test(t)
      || /lecture .* en cours/i.test(t)
      || /import(?:ation)? .* en cours/i.test(t)
      || /import de .*…/i.test(t)
      || /téléchargement .* en cours/i.test(t)
      || /chargement .* en cours/i.test(t);
  }

  function successText(text){
    const t=String(text||'').replace(/\s+/g,' ').trim();
    return /✓/.test(t) && !/non archivée|impossible|erreur|réessai/i.test(t)
      || /(?:archivé|importé|pièce jointe enregistrée|document analysé)/i.test(t) && !/non archivée|impossible|erreur/i.test(t);
  }

  function finalErrorText(text){
    const t=String(text||'').replace(/\s+/g,' ').trim();
    return /⚠|erreur|impossible|non archivée|trop lourd|interrompu/i.test(t);
  }

  function watchStatus(modal,status){
    if(!modal||!status)return;
    const old=observers.get(modal);
    if(old){try{old.disconnect();}catch(e){}}

    let sawProgress=progressText(status.textContent);
    const check=function(){
      const text=String(status.textContent||'').trim();
      if(progressText(text)){
        sawProgress=true;
        lock(modal);
        return;
      }
      if(!sawProgress||!text)return;
      if(successText(text)){
        unlock(modal,true);
        observer.disconnect();
        observers.delete(modal);
      }else if(finalErrorText(text)){
        unlock(modal,false);
        observer.disconnect();
        observers.delete(modal);
      }
    };

    const observer=new MutationObserver(check);
    observers.set(modal,observer);
    observer.observe(status,{childList:true,subtree:true,characterData:true,attributes:true});
    check();
  }

  function knownUpload(input){
    if(!input)return null;
    if(input.id==='avFile')return {status:'#avEtat'};
    if(input.id==='achatFile')return {status:'#achatEtat'};
    if(input.id==='docFile')return {status:'#docEtat'};
    if(input.classList&&input.classList.contains('yaya-commande-create-file'))return {status:'.yaya-commande-create-file-state'};
    return null;
  }

  document.addEventListener('change',function(event){
    const input=event.target;
    if(!input||input.tagName!=='INPUT'||String(input.type||'').toLowerCase()!=='file')return;
    const cfg=knownUpload(input);
    if(!cfg)return;
    const file=input.files&&input.files[0];
    if(!file)return;
    if(file.size>8*1024*1024)return;

    const modal=modalFor(input);
    if(!modal)return;
    const status=modal.querySelector(cfg.status)||document.querySelector(cfg.status);
    lock(modal);
    if(status)watchStatus(modal,status);
  },true);

  window.addEventListener('yaya:quote-upload-state',function(event){
    const detail=event&&event.detail||{};
    const modal=document.querySelector('.yaya-devis-fast-modal');
    if(!modal)return;
    const state=String(detail.state||'');
    if(state==='start')lock(modal);
    else if(state==='success')unlock(modal,true);
    else if(state==='error')unlock(modal,false);
  });

  installStyle();
})();
