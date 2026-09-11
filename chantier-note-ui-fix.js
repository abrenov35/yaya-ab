(function(){
  'use strict';

  const STYLE_ID='yaya-chantier-note-ui-fix-v1';

  function installStyle(){
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

  function ensureFeature(){
    if(document.getElementById('yaya-chantier-market-note-style-v1'))return;
    if(document.querySelector('script[data-yaya-note-feature="1"]'))return;
    const script=document.createElement('script');
    script.src='chantier-market-note.js?v=note-ui-2';
    script.dataset.yayaNoteFeature='1';
    document.head.appendChild(script);
  }

  function closeSavedNoteModal(){
    const root=document.getElementById('modalRoot');
    if(!root)return;
    if(root.querySelector('.yaya-note-modal-textarea'))root.innerHTML='';
  }

  installStyle();
  setTimeout(ensureFeature,150);
  window.addEventListener('yaya:chantier-note-changed',closeSavedNoteModal);

  window.__YAYA_CHANTIER_NOTE_UI_FIX_VERSION='1.0';
})();
