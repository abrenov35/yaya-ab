(function(){
  'use strict';

  if(window.__yayaModalUploadGlobalLockV2)return;
  window.__yayaModalUploadGlobalLockV2=true;

  const SUCCESS_CLASS='yaya-upload-success-banner';
  const timers=new WeakMap();
  const observers=new WeakMap();

  function installStyle(){
    if(document.getElementById('yaya-modal-upload-global-lock-style-v2'))return;
    const old=document.getElementById('yaya-modal-upload-global-lock-style-v1');
    if(old)old.remove();
    const style=document.createElement('style');
    style.id='yaya-modal-upload-global-lock-style-v2';
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
      return /Importer|Déposer|Ajouter une pièce|Remplacer|Pièce importée/i.test(text)
        || btn.classList.contains('yaya-commande-create-import')
        || btn.classList.contains('yaya-achat-import-btn')
        || btn.id==='yayaDevisEditImportBtn';
    })||null;
  }

  function baselineDisabled(btn){
    // achat-upload-lock.js peut avoir déjà désactivé le bouton avant ce verrou global.
    // Dans ce cas on récupère son véritable état initial au lieu de mémoriser "disabled".
    if(btn.dataset.yayaUploadLockSaved==='1'){
      return btn.dataset.yayaUploadWasDisabled==='1';
    }
    return !!btn.disabled;
  }

  function baselineText(btn){
    if(btn.dataset.yayaUploadLockSaved==='1'&&btn.dataset.yayaUploadOriginalText){
      return btn.dataset.yayaUploadOriginalText;
    }
    return btn.textContent||'';
  }

  function rememberButton(btn){
    if(btn.dataset.yayaGlobalUploadSaved==='1')return;
    btn.dataset.yayaGlobalUploadSaved='1';
    btn.dataset.yayaGlobalUploadDisabled=baselineDisabled(btn)?'1':'0';
    btn.dataset.yayaGlobalUploadText=baselineText(btn);
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

  function releaseLegacyAchatLock(modal){
    if(!modal)return;

    // Deux verrous existaient sur Achat/Charge. Ils pouvaient se mémoriser
    // mutuellement comme "déjà désactivés" et laisser toute la modale figée.
    modal.dataset.yayaAchatUploadBusy='0';

    modal.querySelectorAll('button[data-yaya-upload-lock-saved="1"]').forEach(function(btn){
      btn.disabled=btn.dataset.yayaUploadWasDisabled==='1';
      btn.removeAttribute('aria-busy');
      btn.style.removeProperty('pointer-events');
      btn.style.removeProperty('opacity');
      btn.style.removeProperty('cursor');
      if(btn.dataset.yayaUploadOriginalText){
        btn.textContent=btn.dataset.yayaUploadOriginalText;
      }
      delete btn.dataset.yayaUploadLockSaved;
      delete btn.dataset.yayaUploadWasDisabled;
      delete btn.dataset.yayaUploadOriginalText;
    });
  }

  function restoreGlobalButtons(modal){
    modal.querySelectorAll('button[data-yaya-global-upload-saved="1"]').forEach(function(btn){
      btn.disabled=btn.dataset.yayaGlobalUploadDisabled==='1';
      btn.removeAttribute('aria-busy');
      btn.style.removeProperty('pointer-events');
      btn.style.removeProperty('opacity');
      btn.style.removeProperty('cursor');
      const original=btn.dataset.yayaGlobalUploadText||'';
      if(original)btn.textContent=original;
      delete btn.dataset.yayaGlobalUploadSaved;
      delete btn.dataset.yayaGlobalUploadDisabled;
      delete btn.dataset.yayaGlobalUploadText;
    });
  }

  function unlock(modal,success){
    if(!modal)return;

    const old=timers.get(modal);
    if(old)clearTimeout(old);
    timers.delete(modal);

    modal.classList.remove('yaya-upload-modal-busy');
    modal.dataset.yayaUploadBusy='0';

    // Libère d'abord l'ancien verrou Achat/Charge puis restaure l'état réel initial.
    releaseLegacyAchatLock(modal);
    restoreGlobalButtons(modal);

    if(success){
      const imp=importButton(modal);
      if(imp){
        imp.disabled=false;
        imp.removeAttribute('aria-busy');
        imp.style.removeProperty('pointer-events');
        imp.style.removeProperty('opacity');
        imp.style.removeProperty('cursor');
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
      const footer=modal.querySelector('.yaya-devis-fast-foot,.yaya-commande-create-actions,.yaya-devis-create-actions,.yaya-document-create-actions,.yaya-achat-create-actions-fixed,.mfoot');
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
    return (/✓/.test(t) && !/non archivée|impossible|erreur|réessai/i.test(t))
      || (/(?:archivé|importé|pièce jointe enregistrée|document analysé)/i.test(t) && !/non archivée|impossible|erreur/i.test(t));
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
    let observer=null;

    const finish=function(success){
      unlock(modal,success);
      if(observer){try{observer.disconnect();}catch(e){}}
      observers.delete(modal);
    };

    const check=function(){
      const text=String(status.textContent||'').trim();
      if(progressText(text)){
        sawProgress=true;
        lock(modal);
        return;
      }
      if(!sawProgress||!text)return;
      if(successText(text))finish(true);
      else if(finalErrorText(text))finish(false);
    };

    observer=new MutationObserver(check);
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
    if(!file||file.size>8*1024*1024)return;

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

  // Nettoie un éventuel état figé laissé par V1 au rechargement du script.
  document.querySelectorAll('.yaya-upload-modal-busy,[data-yaya-upload-busy="1"]').forEach(function(modal){
    unlock(modal,false);
  });

  installStyle();
})();
