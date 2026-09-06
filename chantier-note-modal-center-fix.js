(function(){
  'use strict';

  const STYLE_ID='yaya-note-modal-center-fix-v2';

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
        transition:transform .12s ease!important;
      }
    `;
    document.head.appendChild(style);
  }

  function visible(el){
    if(!el||!el.isConnected)return false;
    const s=getComputedStyle(el);
    return s.display!=='none'&&s.visibility!=='hidden';
  }

  function workspaceTop(){
    const header=document.querySelector('.hdr');
    if(!header||!visible(header))return 0;
    const r=header.getBoundingClientRect();
    return Math.max(0,Math.min(window.innerHeight,Math.round(r.bottom)));
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
    if(!modal)return;

    modal.style.setProperty('margin','auto','important');

    /* Centre visuel de la zone réellement disponible sous la barre Yaya. */
    const top=workspaceTop();
    const offset=Math.round(top/2);
    modal.style.setProperty('transform','translateY('+offset+'px)','important');
    modal.dataset.yayaVisualCenterOffset=String(offset);
  }

  installStyle();
  centerNoteModal();

  new MutationObserver(centerNoteModal).observe(document.documentElement,{
    childList:true,
    subtree:true
  });

  window.addEventListener('resize',centerNoteModal,{passive:true});
  window.addEventListener('orientationchange',centerNoteModal,{passive:true});
})();
