(function(){
  'use strict';

  if(window.__yayaDeleteChantierClickBridgeV3)return;
  window.__yayaDeleteChantierClickBridgeV3=true;

  let lastPointerAt=0;
  let lastPointerButton=null;

  function idFromButton(btn){
    if(!btn)return '';

    let id=String(btn.dataset&&btn.dataset.yayaChantierId||'').trim();
    if(id)return id;

    const modal=btn.closest&&btn.closest('.yaya-chantier-edit-modal,.yaya-manage-modal,.modal');
    const select=modal&&modal.querySelector('#yayaManageChantierSelect');
    id=String(select&&select.value||'').trim();
    if(id)return id;

    const code=String(btn.getAttribute&&btn.getAttribute('onclick')||'');
    let m=code.match(/deleteExistingChantier\(['\"]([^'\"]+)['\"]\)/);
    if(m&&m[1])return String(m[1]).trim();

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

  function runDelete(event,btn){
    if(!btn)return false;

    const id=idFromButton(btn);
    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();

    if(!id){
      try{if(typeof window.toast==='function')window.toast('Chantier introuvable',true);}catch(e){}
      return true;
    }

    if(typeof window.deleteExistingChantier!=='function'){
      try{if(typeof window.toast==='function')window.toast('Suppression chantier indisponible',true);}catch(e){}
      return true;
    }

    Promise.resolve(window.deleteExistingChantier(id)).catch(function(err){
      console.error('Suppression chantier :',err);
      try{if(typeof window.toast==='function')window.toast('Suppression du chantier impossible',true);}catch(e){}
    });
    return true;
  }

  /*
   * On prend le pointerup, pas seulement click : si le DOM de la modale bouge
   * entre l'appui et le relâchement, le navigateur peut annuler l'événement click.
   * Ainsi la confirmation de suppression apparaît dès le premier appui réel.
   */
  document.addEventListener('pointerup',function(event){
    const btn=isDeleteButton(event.target);
    if(!btn)return;
    lastPointerAt=Date.now();
    lastPointerButton=btn;
    runDelete(event,btn);
  },true);

  document.addEventListener('click',function(event){
    const btn=isDeleteButton(event.target);
    if(!btn)return;

    if(btn===lastPointerButton&&Date.now()-lastPointerAt<800){
      event.preventDefault();
      event.stopPropagation();
      if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
      return;
    }

    runDelete(event,btn);
  },true);
})();
