(function(){
  'use strict';

  if(window.__yayaModalOutsideClickLock)return;
  window.__yayaModalOutsideClickLock=true;

  function isModalBackdrop(el){
    if(!(el instanceof Element))return false;

    // Cas standard de Yaya.
    if(el.classList.contains('overlay'))return true;

    // Cas de confirmations/modales spécifiques sans classe .overlay.
    if(/^yaya-.*(confirm|modal|overlay)/i.test(String(el.id||''))){
      if(el.querySelector(':scope > .modal, :scope > [role="dialog"], :scope > div[role="dialog"]'))return true;
    }

    // Filet de sécurité pour les fonds plein écran créés dynamiquement.
    try{
      const cs=getComputedStyle(el);
      const pleinEcran=(cs.position==='fixed' || cs.position==='absolute') &&
        (cs.inset==='0px' || (cs.top==='0px' && cs.right==='0px' && cs.bottom==='0px' && cs.left==='0px'));
      if(pleinEcran && el.querySelector(':scope > .modal, :scope > [role="dialog"], :scope > div[role="dialog"]'))return true;
    }catch(e){}

    return false;
  }

  function blockOutsideClick(event){
    const target=event.target;
    if(!isModalBackdrop(target))return;

    // Le clic est bien sur le fond de la modale, pas dans son contenu.
    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
  }

  // Capture avant les onclick inline et les listeners de fermeture existants.
  document.addEventListener('pointerdown',blockOutsideClick,true);
  document.addEventListener('mousedown',blockOutsideClick,true);
  document.addEventListener('touchstart',blockOutsideClick,true);
  document.addEventListener('click',blockOutsideClick,true);
})();
