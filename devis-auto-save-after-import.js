(function(){
  'use strict';
  if(window.__yayaDevisAutoSaveAfterImportV1)return;
  window.__yayaDevisAutoSaveAfterImportV1=true;

  function bind(modal){
    if(!modal||modal.dataset.yayaAutoSaveBound==='1')return;
    modal.dataset.yayaAutoSaveBound='1';

    const state=modal.querySelector('.ydd-state');
    const saveBtn=modal.querySelector('[data-save]');
    const importBtn=modal.querySelector('[data-import]');
    if(!state||!saveBtn)return;

    // L'enregistrement devient automatique : on garde le bouton dans le DOM
    // pour réutiliser exactement le circuit existant, mais on ne l'affiche plus.
    saveBtn.style.setProperty('display','none','important');

    let saved=false;

    function sync(){
      const text=String(state.textContent||'').trim();
      const loading=/Import en cours/i.test(text);

      if(importBtn){
        importBtn.disabled=loading||saved;
        importBtn.style.opacity=(loading||saved)?'.55':'1';
      }

      // En cas d'échec, on autorise un nouvel essai dans la même modale.
      if(/Import impossible|Fichier trop lourd|Document vide|illisible/i.test(text)){
        saved=false;
        if(importBtn){importBtn.disabled=false;importBtn.style.opacity='1';}
        return;
      }

      if(saved||!/Pi[eè]ce jointe enregistr[eé]e/i.test(text))return;
      saved=true;

      // Le handler existant data-save enregistre le devis puis ferme la modale.
      // Ensuite on recharge une fois Yaya pour forcer marche-cards-page.js à
      // relire la feuille centrale DEVIS et migrer un éventuel devis resté local.
      setTimeout(function(){
        if(!modal.isConnected)return;
        try{
          saveBtn.click();
          setTimeout(function(){
            try{window.location.reload();}catch(e){}
          },900);
        }
        catch(e){
          saved=false;
          if(importBtn){importBtn.disabled=false;importBtn.style.opacity='1';}
        }
      },80);
    }

    new MutationObserver(sync).observe(state,{childList:true,subtree:true,characterData:true});
    sync();
  }

  function scan(){
    bind(document.getElementById('yayaDevisAdd'));
  }

  scan();
  new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});
})();
