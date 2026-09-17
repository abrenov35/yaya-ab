/* Correctif global : syncMsg ne doit jamais bloquer un enregistrement si #syncState est absent. */
window.syncMsg=function(m){
  const el=document.getElementById('syncState');
  if(el)el.textContent=m||'';
};

(function(){
  'use strict';
  if(window.__yayaMailModalButtonsAlignV2)return;
  window.__yayaMailModalButtonsAlignV2=true;

  const STYLE_ID='yaya-mail-modal-buttons-align-v2';
  let raf=0;

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      /* La fermeture du mail se fait dans la barre d'actions : pas de 2e bouton dans le titre. */
      #modalRoot .yaya-mail-body-modal > h5 > button[aria-label="Fermer"]{
        display:none!important;
      }

      /* Supprimer à gauche ; Modifier l'objet + Fermer groupés à droite, tous sur la même ligne. */
      #modalRoot .yaya-mail-body-modal .yaya-read-actions{
        display:flex!important;
        flex-direction:row!important;
        align-items:center!important;
        justify-content:flex-start!important;
        flex-wrap:nowrap!important;
        gap:10px!important;
        width:100%!important;
        box-sizing:border-box!important;
      }
      #modalRoot .yaya-mail-body-modal .yaya-read-actions .yaya-delete{
        margin:0 auto 0 0!important;
        flex:0 0 auto!important;
      }
      #modalRoot .yaya-mail-body-modal .yaya-read-actions .yaya-edit,
      #modalRoot .yaya-mail-body-modal .yaya-read-actions .yaya-close{
        margin:0!important;
        flex:0 0 auto!important;
      }
      #modalRoot .yaya-mail-body-modal .yaya-read-actions button{
        min-height:42px!important;
        height:42px!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        white-space:nowrap!important;
        box-sizing:border-box!important;
      }
      #modalRoot .yaya-mail-body-modal .yaya-read-actions .yaya-close{
        visibility:visible!important;
        opacity:1!important;
      }

      @media(max-width:640px){
        #modalRoot .yaya-mail-body-modal .yaya-read-actions{
          gap:6px!important;
        }
        #modalRoot .yaya-mail-body-modal .yaya-read-actions button{
          min-width:0!important;
          min-height:40px!important;
          height:40px!important;
          padding-left:9px!important;
          padding-right:9px!important;
          font-size:11.5px!important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  function closeModalSafe(){
    try{
      if(typeof window.closeModal==='function')return window.closeModal();
      if(typeof closeModal==='function')return closeModal();
    }catch(e){}
    const root=document.getElementById('modalRoot');
    if(root)root.innerHTML='';
  }

  function normalize(modal){
    if(!modal)return;
    const actions=modal.querySelector('.yaya-read-actions');
    if(!actions)return;

    const headerClose=modal.querySelector(':scope > h5 > button[aria-label="Fermer"]');
    if(headerClose)headerClose.classList.add('yaya-mail-header-close');

    const buttons=[...actions.querySelectorAll('button')];
    let close=buttons.find(function(b){
      return /^Fermer$/i.test(String(b.textContent||'').trim());
    });

    if(!close){
      close=document.createElement('button');
      close.type='button';
      close.className='btnp';
      close.textContent='Fermer';
      close.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        closeModalSafe();
      });
      actions.appendChild(close);
    }

    close.classList.add('yaya-close');

    /* Garantit l'ordre visuel, même si un autre patch a déplacé les boutons. */
    const edit=actions.querySelector('.yaya-edit');
    if(edit)actions.appendChild(edit);
    actions.appendChild(close);
  }

  function apply(){
    installStyle();
    const root=document.getElementById('modalRoot');
    if(!root)return;
    root.querySelectorAll('.yaya-mail-body-modal').forEach(normalize);
  }

  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(function(){
      raf=0;
      apply();
    });
  }

  function install(){
    installStyle();
    apply();
    const root=document.getElementById('modalRoot');
    if(!root){setTimeout(install,120);return;}
    new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
    setTimeout(apply,50);
    setTimeout(apply,250);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
