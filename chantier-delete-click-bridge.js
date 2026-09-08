(function(){
  'use strict';

  if(window.__yayaDeleteChantierClickBridgeV2)return;
  window.__yayaDeleteChantierClickBridgeV2=true;

  function idFromButton(btn){
    if(!btn)return '';

    let id=String(btn.dataset&&btn.dataset.yayaChantierId||'').trim();
    if(id)return id;

    const code=String(btn.getAttribute&&btn.getAttribute('onclick')||'');
    let m=code.match(/deleteExistingChantier\(['\"]([^'\"]+)['\"]\)/);
    if(m&&m[1])return String(m[1]).trim();

    const modal=btn.closest&&btn.closest('.yaya-chantier-edit-modal,.yaya-manage-modal,.modal');
    const select=modal&&modal.querySelector('#yayaManageChantierSelect');
    id=String(select&&select.value||'').trim();
    if(id)return id;

    const save=modal&&modal.querySelector('[onclick*="saveExistingChantier"]');
    const saveCode=String(save&&save.getAttribute('onclick')||'');
    m=saveCode.match(/saveExistingChantier\(['\"]([^'\"]+)['\"]\)/);
    if(m&&m[1])return String(m[1]).trim();

    try{return String(focusChantier||'').trim();}catch(e){return '';}
  }

  function isDeleteButton(target){
    if(!target||!target.closest)return null;
    const btn=target.closest('button');
    if(!btn)return null;
    if(btn.classList.contains('yaya-delete-chantier-modal-btn'))return btn;
    if(!btn.closest('.yaya-chantier-edit-modal,.yaya-manage-modal'))return null;
    const label=String(btn.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
    return (label==='supprimer'||label==='supprimer le chantier')?btn:null;
  }

  document.addEventListener('click',function(event){
    const btn=isDeleteButton(event.target);
    if(!btn)return;

    const id=idFromButton(btn);
    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();

    if(!id){
      try{if(typeof window.toast==='function')window.toast('Chantier introuvable',true);}catch(e){}
      return;
    }

    if(typeof window.deleteExistingChantier!=='function'){
      try{if(typeof window.toast==='function')window.toast('Suppression chantier indisponible',true);}catch(e){}
      return;
    }

    // Aucun verrou local ici : la fonction de suppression gère elle-même
    // les doubles clics. Cela évite qu'un ancien appel réseau bloque les clics suivants.
    Promise.resolve(window.deleteExistingChantier(id)).catch(function(err){
      console.error('Suppression chantier :',err);
      try{if(typeof window.toast==='function')window.toast('Suppression du chantier impossible',true);}catch(e){}
    });
  },true);
})();
