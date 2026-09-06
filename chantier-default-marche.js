(function(){
  'use strict';

  if(window.__yayaDefaultMarcheInstalled)return;
  window.__yayaDefaultMarcheInstalled=true;

  const PREFIX='yaya.chantier.detail.section.';

  function setMarche(id){
    const cid=String(id||'').trim();
    if(!cid)return;
    try{localStorage.setItem(PREFIX+cid,'marche');}catch(e){}
  }

  function install(){
    if(typeof window.toggleChantier!=='function'){
      setTimeout(install,120);
      return;
    }
    if(window.toggleChantier.__yayaDefaultMarche)return;

    const original=window.toggleChantier;
    function wrappedToggleChantier(id){
      try{
        const cid=String(id||'').trim();
        const current=(typeof focusChantier!=='undefined'&&focusChantier!=null)
          ?String(focusChantier)
          :'';
        if(cid&&current!==cid)setMarche(cid);
      }catch(e){
        setMarche(id);
      }
      return original.apply(this,arguments);
    }
    wrappedToggleChantier.__yayaDefaultMarche=true;
    wrappedToggleChantier.__yayaOriginalToggleChantier=original;
    window.toggleChantier=wrappedToggleChantier;

    // Si la fiche est ouverte directement avec ?chantier=ID,
    // Marché reste aussi la section d'arrivée.
    try{
      const directId=String(new URL(window.location.href).searchParams.get('chantier')||'').trim();
      if(directId)setMarche(directId);
    }catch(e){}
  }

  install();
})();
