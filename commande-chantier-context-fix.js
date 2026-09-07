(function(){
  'use strict';

  if(window.__yayaCommandeChantierContextFixV1)return;
  window.__yayaCommandeChantierContextFixV1=true;

  function patch(){
    document.querySelectorAll('.yaya-commande-create-overlay').forEach(function(overlay){
      const select=overlay.querySelector('select[data-field="chantierId"]');
      if(!select)return;

      // Au moment où la modale est créée depuis une fiche chantier,
      // le chantier est déjà présélectionné par openCommandeForChantier(id).
      // On le verrouille et on masque complètement le champ.
      if(select.dataset.yayaCommandeContextChecked!=='1'){
        select.dataset.yayaCommandeContextChecked='1';
        const value=String(select.value||'').trim();
        if(value){
          select.dataset.yayaLockedChantierId=value;
          const field=select.closest('.yaya-commande-create-field');
          (field||select).style.setProperty('display','none','important');
          select.setAttribute('aria-hidden','true');
          select.tabIndex=-1;
        }
      }

      const locked=String(select.dataset.yayaLockedChantierId||'');
      if(locked && String(select.value)!==locked)select.value=locked;
    });
  }

  let raf=0;
  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(function(){
      raf=0;
      patch();
    });
  }

  document.addEventListener('change',function(e){
    const select=e.target&&e.target.matches&&e.target.matches('.yaya-commande-create-overlay select[data-field="chantierId"]')?e.target:null;
    if(!select)return;
    const locked=String(select.dataset.yayaLockedChantierId||'');
    if(locked)select.value=locked;
  },true);

  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  patch();
  setTimeout(patch,0);
})();
