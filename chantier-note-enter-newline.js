(function(){
  'use strict';

  if(window.__yayaChantierNoteEnterNewlineV1)return;
  window.__yayaChantierNoteEnterNewlineV1=true;

  // Uniquement dans le bloc-note chantier : Entrée = retour à la ligne.
  // On intercepte avant les raccourcis globaux de modales qui peuvent valider sur Enter.
  window.addEventListener('keydown',function(event){
    if(event.key!=='Enter' || event.isComposing)return;

    const target=event.target;
    if(!target || !target.matches || !target.matches('.yaya-note-modal-textarea'))return;

    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();

    const value=String(target.value||'');
    const start=Number.isInteger(target.selectionStart)?target.selectionStart:value.length;
    const end=Number.isInteger(target.selectionEnd)?target.selectionEnd:start;
    const next=value.slice(0,start)+'\n'+value.slice(end);

    target.value=next;
    const cursor=start+1;
    try{target.setSelectionRange(cursor,cursor);}catch(e){}
    try{target.dispatchEvent(new Event('input',{bubbles:true}));}catch(e){}
  },true);
})();
