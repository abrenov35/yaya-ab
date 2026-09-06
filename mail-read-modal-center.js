(function(){
  'use strict';

  const STYLE_ID='yaya-mail-read-modal-center-style';
  const CENTER_CLASS='yaya-mail-read-centered';

  function installStyle(){
    if(document.getElementById(STYLE_ID)) return;

    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .overlay.${CENTER_CLASS}{
        align-items:center!important;
        justify-content:center!important;
        padding:20px!important;
      }

      .overlay.${CENTER_CLASS} > .modal{
        margin:auto!important;
        width:min(680px, calc(100vw - 24px))!important;
        max-width:680px!important;
      }

      @media(max-width:640px){
        .overlay.${CENTER_CLASS}{
          padding:14px!important;
        }

        .overlay.${CENTER_CLASS} > .modal{
          width:min(100%, calc(100vw - 18px))!important;
          max-width:none!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function isMailReadModal(modal){
    if(!modal) return false;

    const txt=String(modal.textContent || '').replace(/\s+/g,' ').trim();

    if(modal.querySelector('.b-mail')) return true;
    if(/Objet non renseigné/i.test(txt)) return true;
    if(/Voir mail/i.test(txt)) return true;

    return false;
  }

  function applyCentering(){
    document.querySelectorAll('.overlay').forEach(function(overlay){
      const modal=overlay.querySelector(':scope > .modal');
      if(!modal) return;

      if(isMailReadModal(modal)){
        overlay.classList.add(CENTER_CLASS);
      } else {
        overlay.classList.remove(CENTER_CLASS);
      }
    });
  }

  function install(){
    installStyle();
    applyCentering();

    const obs=new MutationObserver(function(){
      applyCentering();
    });

    obs.observe(document.documentElement,{
      childList:true,
      subtree:true
    });

    setTimeout(applyCentering,50);
    setTimeout(applyCentering,200);
    setTimeout(applyCentering,600);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',install);
  } else {
    install();
  }
})();