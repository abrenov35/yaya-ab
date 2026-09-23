(function(){
  'use strict';
  if(window.__yayaToolbarCloseModalV1)return;
  window.__yayaToolbarCloseModalV1=true;

  function modalOpen(){
    const root=document.getElementById('modalRoot');
    return !!(root&&root.children&&root.children.length);
  }

  function closeActiveModal(){
    if(!modalOpen())return;
    try{
      if(typeof window.closeModal==='function'){
        window.closeModal();
        return;
      }
    }catch(e){}
    const root=document.getElementById('modalRoot');
    if(root)root.replaceChildren();
  }

  // Capture : on ferme la modale AVANT que le bouton de la toolbar
  // exécute son action normale. Aucun preventDefault / stopPropagation.
  document.addEventListener('click',function(e){
    const target=e.target&&e.target.closest
      ? e.target.closest('.hdr button,.hdr a,.hdr .tab,.hdr .fiche-inter-tab')
      : null;
    if(!target)return;
    closeActiveModal();
  },true);
})();
