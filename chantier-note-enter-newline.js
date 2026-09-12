(function(){
  'use strict';

  if(window.__yayaChantierNoteEnterNewlineV4)return;
  window.__yayaChantierNoteEnterNewlineV4=true;

  const STYLE_ID='yaya-chantier-note-contrast-v4';

  function installContrast(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-chantier-note-box{
        border:1px solid #d3e0eb!important;
        border-left:4px solid #759cbc!important;
        border-radius:9px!important;
        background:#fff!important;
        box-shadow:0 1px 2px rgba(22,45,73,.04)!important;
        overflow:hidden!important;
        padding:0!important;
      }
      #pane-chantiers .yaya-chantier-note-head{
        min-height:46px!important;
        margin:0!important;
        padding:7px 9px 7px 11px!important;
        background:#f2f6fa!important;
        border-bottom:1px solid #d3e0eb!important;
      }
      #pane-chantiers .yaya-chantier-note-title{
        color:#315a7b!important;
        font-size:13px!important;
        font-weight:850!important;
        letter-spacing:.065em!important;
        line-height:1!important;
      }
      #pane-chantiers .yaya-chantier-note-text{
        margin:10px 12px 8px!important;
        padding:12px 13px!important;
        border:1px solid #d3e0eb!important;
        border-radius:8px!important;
        background:#fff!important;
        color:#233750!important;
        box-shadow:none!important;
      }
      #pane-chantiers .yaya-chantier-note-date{
        margin:0!important;
        padding:0 13px 10px!important;
        color:#62738a!important;
      }
      #pane-chantiers .yaya-chantier-note-add{
        display:block!important;
        width:calc(100% - 24px)!important;
        min-height:40px!important;
        margin:11px 12px!important;
        padding:9px 12px!important;
        border:1px solid #d3e0eb!important;
        border-radius:8px!important;
        background:#f8fafc!important;
        color:#315a7b!important;
        font-size:12.5px!important;
        font-weight:800!important;
        box-shadow:none!important;
      }
      #pane-chantiers .yaya-chantier-note-add:hover{
        background:#edf3f9!important;
        border-color:#9fb8d4!important;
      }
      #pane-chantiers .yaya-chantier-note-action{
        background:#fff!important;
        box-shadow:none!important;
      }
      @media(max-width:640px){
        #pane-chantiers .yaya-chantier-note-head{min-height:43px!important;padding:6px 7px 6px 9px!important}
        #pane-chantiers .yaya-chantier-note-title{font-size:12px!important}
        #pane-chantiers .yaya-chantier-note-text{margin:9px 10px 7px!important;padding:11px!important}
        #pane-chantiers .yaya-chantier-note-add{width:calc(100% - 20px)!important;margin:10px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureNoteFeature(){
    if(document.getElementById('yaya-chantier-market-note-style-v1'))return;
    if(document.querySelector('script[data-yaya-note-feature="1"]'))return;
    const script=document.createElement('script');
    script.src='chantier-market-note.js?v=note-ui-3';
    script.dataset.yayaNoteFeature='1';
    document.head.appendChild(script);
  }

  function closeSavedNoteModal(){
    const root=document.getElementById('modalRoot');
    if(root&&root.querySelector('.yaya-note-modal-textarea'))root.innerHTML='';
  }

  // Un clic sur Enregistrer lance le handler existant puis libère immédiatement l'interface.
  // Le POST déjà démarré continue en arrière-plan.
  document.addEventListener('click',function(event){
    const save=event.target&&event.target.closest&&event.target.closest('.yaya-note-save');
    if(!save)return;
    const root=document.getElementById('modalRoot');
    const textarea=root&&root.querySelector('.yaya-note-modal-textarea');
    if(!textarea||!String(textarea.value||'').trim())return;
    setTimeout(function(){
      if(root&&root.querySelector('.yaya-note-modal-textarea'))root.innerHTML='';
    },0);
  },false);

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

  installContrast();
  setTimeout(ensureNoteFeature,150);
  window.addEventListener('yaya:chantier-note-changed',closeSavedNoteModal);
})();
