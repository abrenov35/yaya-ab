(function(){
  'use strict';

  if(window.__yayaAchatUploadLockV1)return;
  window.__yayaAchatUploadLockV1=true;

  let etatObserver=null;
  let safetyTimer=null;
  let seenProgress=false;

  function getModal(){
    const input=document.getElementById('achatFile');
    return input&&input.closest?input.closest('.modal'):null;
  }

  function isImportButton(btn){
    if(!btn)return false;
    const txt=String(btn.textContent||'');
    const onclick=String(btn.getAttribute('onclick')||'');
    return btn.classList.contains('yaya-achat-import-btn')
      || /Importer|Déposer un BL|facture.*PDF|facture.*photo/i.test(txt)
      || /achatFile/.test(onclick);
  }

  function isProgressText(text){
    const t=String(text||'').trim();
    return /^⏳/.test(t)
      || /Lecture du document en cours/i.test(t)
      || /Import(?:ation)?\s+en cours/i.test(t)
      || /Téléchargement\s+en cours/i.test(t);
  }

  function setBusy(busy){
    const modal=getModal();
    if(!modal)return;

    const alreadyBusy=modal.dataset.yayaAchatUploadBusy==='1';
    if(busy && alreadyBusy)return;
    if(!busy && !alreadyBusy)return;

    modal.dataset.yayaAchatUploadBusy=busy?'1':'0';

    Array.from(modal.querySelectorAll('button')).forEach(function(btn){
      if(busy){
        if(btn.dataset.yayaUploadLockSaved!=='1'){
          btn.dataset.yayaUploadLockSaved='1';
          btn.dataset.yayaUploadWasDisabled=btn.disabled?'1':'0';
          btn.dataset.yayaUploadOriginalText=btn.textContent||'';
        }
        btn.disabled=true;
        btn.setAttribute('aria-busy','true');
        btn.style.setProperty('opacity','.55','important');
        btn.style.setProperty('cursor','wait','important');
        btn.style.setProperty('pointer-events','none','important');
        if(isImportButton(btn) && btn.textContent!=='Import en cours…'){
          btn.textContent='Import en cours…';
        }
      }else if(btn.dataset.yayaUploadLockSaved==='1'){
        btn.disabled=btn.dataset.yayaUploadWasDisabled==='1';
        btn.removeAttribute('aria-busy');
        btn.style.removeProperty('opacity');
        btn.style.removeProperty('cursor');
        btn.style.removeProperty('pointer-events');
        if(isImportButton(btn) && btn.dataset.yayaUploadOriginalText){
          btn.textContent=btn.dataset.yayaUploadOriginalText;
        }
        delete btn.dataset.yayaUploadLockSaved;
        delete btn.dataset.yayaUploadWasDisabled;
        delete btn.dataset.yayaUploadOriginalText;
      }
    });

    if(busy){
      clearTimeout(safetyTimer);
      safetyTimer=setTimeout(function(){
        setBusy(false);
        stopEtatWatch();
      },90000);
    }else{
      clearTimeout(safetyTimer);
      safetyTimer=null;
    }
  }

  function stopEtatWatch(){
    if(etatObserver){
      try{etatObserver.disconnect();}catch(_){}
      etatObserver=null;
    }
    seenProgress=false;
  }

  function startEtatWatch(){
    stopEtatWatch();
    const etat=document.getElementById('achatEtat');
    if(!etat)return;

    function check(){
      const text=String(etat.textContent||'').trim();
      if(isProgressText(text)){
        seenProgress=true;
        setBusy(true);
        return;
      }
      if(seenProgress && text){
        setBusy(false);
        stopEtatWatch();
      }
    }

    etatObserver=new MutationObserver(check);
    etatObserver.observe(etat,{childList:true,subtree:true,characterData:true});
    check();
  }

  document.addEventListener('change',function(e){
    const input=e.target;
    if(!input || input.id!=='achatFile')return;
    const file=input.files&&input.files[0];
    if(!file || file.size>8*1024*1024)return;

    setBusy(true);
    seenProgress=false;
    startEtatWatch();

    setTimeout(function(){
      const etat=document.getElementById('achatEtat');
      if(etat && isProgressText(etat.textContent))seenProgress=true;
    },0);
  },true);

  document.addEventListener('click',function(e){
    const btn=e.target&&e.target.closest?e.target.closest('button'):null;
    if(!btn)return;
    const modal=getModal();
    if(!modal || modal.dataset.yayaAchatUploadBusy!=='1' || !modal.contains(btn))return;
    e.preventDefault();
    e.stopImmediatePropagation();
  },true);

  const root=document.getElementById('modalRoot');
  if(root){
    new MutationObserver(function(){
      const etat=document.getElementById('achatEtat');
      if(!etat)return;
      if(isProgressText(etat.textContent)){
        setBusy(true);
        if(!etatObserver)startEtatWatch();
      }
    }).observe(root,{childList:true,subtree:true,characterData:true});
  }
})();

/* Charge toujours la dernière version du verrou de contexte chantier. */
(function(){
  'use strict';
  if(document.querySelector('script[data-yaya-chantier-modal-context-lock="1"]'))return;
  const s=document.createElement('script');
  s.src='chantier-modal-context-lock.js?v=context-lock-'+Date.now();
  s.async=false;
  s.setAttribute('data-yaya-chantier-modal-context-lock','1');
  document.head.appendChild(s);
})();

/* Correctif dédié commande : si la modale est ouverte depuis une fiche chantier,
   le chantier est déjà présélectionné et le champ ne doit pas être proposé. */
(function(){
  'use strict';
  if(document.querySelector('script[data-yaya-commande-chantier-context-fix="1"]'))return;
  const s=document.createElement('script');
  s.src='commande-chantier-context-fix.js?v=commande-context-'+Date.now();
  s.async=false;
  s.setAttribute('data-yaya-commande-chantier-context-fix','1');
  document.head.appendChild(s);
})();

/* Verrou global : pendant n'importe quel import de pièce dans les modales
   Devis, Achat/Charge, Document et Commande, toutes les actions sont bloquées. */
(function(){
  'use strict';
  if(document.querySelector('script[data-yaya-modal-upload-global-lock="1"]'))return;
  const s=document.createElement('script');
  s.src='modal-upload-global-lock.js?v=global-upload-'+Date.now();
  s.async=false;
  s.setAttribute('data-yaya-modal-upload-global-lock','1');
  document.head.appendChild(s);
})();
