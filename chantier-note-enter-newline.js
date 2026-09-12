(function(){
  'use strict';

  if(window.__yayaChantierNoteEnterNewlineV3)return;
  window.__yayaChantierNoteEnterNewlineV3=true;

  const STYLE_ID='yaya-chantier-note-contrast-v3';

  function installContrast(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-chantier-note-box{
        border:2px solid #879bb4!important;
        border-radius:12px!important;
        background:#f8fafc!important;
        box-shadow:0 2px 8px rgba(22,45,73,.13)!important;
        overflow:hidden!important;
        padding:0!important;
      }
      #pane-chantiers .yaya-chantier-note-head{
        min-height:42px!important;
        margin:0!important;
        padding:10px 13px!important;
        background:#dce7f3!important;
        border-bottom:1px solid #9fb1c7!important;
      }
      #pane-chantiers .yaya-chantier-note-title{
        color:#162d49!important;
        font-size:12.5px!important;
        font-weight:900!important;
        letter-spacing:.05em!important;
      }
      #pane-chantiers .yaya-chantier-note-text{
        margin:10px 12px 8px!important;
        padding:12px 13px!important;
        border:1px solid #c5d2e1!important;
        border-radius:9px!important;
        background:#fff!important;
        color:#233750!important;
        box-shadow:inset 0 1px 2px rgba(22,45,73,.035)!important;
      }
      #pane-chantiers .yaya-chantier-note-date{
        margin:0!important;
        padding:0 13px 10px!important;
        color:#62738a!important;
      }
      #pane-chantiers .yaya-chantier-note-add{
        display:block!important;
        width:calc(100% - 24px)!important;
        min-height:42px!important;
        margin:11px 12px!important;
        padding:9px 12px!important;
        border:1px solid #a7b9ce!important;
        border-radius:9px!important;
        background:#fff!important;
        color:#162d49!important;
        font-size:12.5px!important;
        font-weight:850!important;
        box-shadow:0 1px 3px rgba(22,45,73,.07)!important;
      }
      #pane-chantiers .yaya-chantier-note-add:hover{
        background:#edf3f9!important;
        border-color:#7f96b0!important;
      }
      #pane-chantiers .yaya-chantier-note-action{
        background:#fff!important;
        box-shadow:0 1px 2px rgba(22,45,73,.08)!important;
      }
      @media(max-width:640px){
        #pane-chantiers .yaya-chantier-note-box{border-width:1.5px!important}
        #pane-chantiers .yaya-chantier-note-head{padding:9px 11px!important}
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
    script.src='chantier-market-note.js?v=note-ui-2';
    script.dataset.yayaNoteFeature='1';
    document.head.appendChild(script);
  }

  function closeSavedNoteModal(){
    const root=document.getElementById('modalRoot');
    if(root&&root.querySelector('.yaya-note-modal-textarea'))root.innerHTML='';
  }

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
