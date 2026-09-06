(function(){
  'use strict';

  const STYLE_ID='yaya-note-modal-center-fix-v1';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #modalRoot .overlay.yaya-note-overlay-centered{
        align-items:center!important;
        justify-content:center!important;
        padding:18px!important;
      }
      #modalRoot .overlay.yaya-note-overlay-centered > .modal{
        margin:auto!important;
      }
    `;
    document.head.appendChild(style);
  }

  function centerNoteModal(){
    const root=document.getElementById('modalRoot');
    if(!root)return;
    const textarea=root.querySelector('.yaya-note-modal-textarea');
    if(!textarea)return;
    const overlay=textarea.closest('.overlay');
    if(!overlay)return;
    overlay.classList.add('yaya-note-overlay-centered');
    overlay.style.setProperty('align-items','center','important');
    overlay.style.setProperty('justify-content','center','important');
    const modal=overlay.querySelector('.modal');
    if(modal)modal.style.setProperty('margin','auto','important');
  }

  installStyle();
  centerNoteModal();

  new MutationObserver(centerNoteModal).observe(document.documentElement,{
    childList:true,
    subtree:true
  });
})();
