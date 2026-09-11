(function(){
  'use strict';

  if(window.__yayaChantierNoteEnterNewlineV2)return;
  window.__yayaChantierNoteEnterNewlineV2=true;

  const STYLE_ID='yaya-chantier-note-contrast-v2';

  function installContrast(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-chantier-note-box{
        border:1px solid #aebdcd!important;
        border-radius:10px!important;
        background:#fff!important;
        box-shadow:0 1px 3px rgba(22,45,73,.10)!important;
        overflow:hidden!important;
        padding:0!important;
      }
      #pane-chantiers .yaya-chantier-note-head{
        min-height:38px!important;
        margin:0!important;
        padding:9px 12px!important;
        background:#e6edf5!important;
        border-bottom:1px solid #b8c6d6!important;
      }
      #pane-chantiers .yaya-chantier-note-title{
        color:#162d49!important;
        font-size:12px!important;
        font-weight:850!important;
        letter-spacing:.045em!important;
      }
      #pane-chantiers .yaya-chantier-note-add{
        display:block!important;
        width:calc(100% - 20px)!important;
        min-height:40px!important;
        margin:10px!important;
        padding:9px 12px!important;
        border:1px solid #b8c6d6!important;
        border-radius:8px!important;
        background:#f4f7fa!important;
        color:#162d49!important;
        font-size:12.5px!important;
        font-weight:800!important;
        box-shadow:0 1px 2px rgba(22,45,73,.05)!important;
      }
      #pane-chantiers .yaya-chantier-note-add:hover{
        background:#eaf0f6!important;
        border-color:#8fa4ba!important;
      }
      #pane-chantiers .yaya-chantier-note-text{
        padding:12px 13px!important;
        color:#233750!important;
      }
      #pane-chantiers .yaya-chantier-note-date{
        margin:0!important;
        padding:0 13px 10px!important;
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
