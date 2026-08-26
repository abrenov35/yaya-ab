(function(){
  'use strict';

  function install(){
    if(typeof window.saveExistingChantier!=='function'){
      setTimeout(install,120);
      return;
    }

    const current=window.saveExistingChantier;
    if(current.__yayaImmediateClose)return;

    const wrapped=async function(){
      const promise=current.apply(this,arguments);

      const btn=document.getElementById('editChSave');
      const started=!!(btn&&btn.disabled&&String(btn.textContent||'').toLowerCase().includes('enregistrement'));

      if(started){
        setTimeout(()=>{
          try{
            if(typeof window.closeModal==='function')window.closeModal();
            if(typeof window.render==='function')window.render();
          }catch(e){console.warn('Fermeture modale chantier',e);}
        },0);
      }

      return await promise;
    };

    wrapped.__yayaImmediateClose=true;
    wrapped.__yayaModeWrapped=!!current.__yayaModeWrapped;
    window.saveExistingChantier=wrapped;
  }

  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      if(typeof window.saveExistingChantier==='function'&&!window.saveExistingChantier.__yayaImmediateClose)install();
    });
  }

  const obs=new MutationObserver(schedule);
  obs.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(install,80);
  setTimeout(install,500);
  setTimeout(install,1500);
})();
