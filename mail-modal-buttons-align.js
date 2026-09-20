/* Correctif global : syncMsg ne doit jamais bloquer un enregistrement si #syncState est absent. */
window.syncMsg=function(m){
  const el=document.getElementById('syncState');
  if(el)el.textContent=m||'';
};

(function(){
  'use strict';
  if(window.__yayaMailModalButtonsAlignV6)return;
  window.__yayaMailModalButtonsAlignV6=true;

  const STYLE_ID='yaya-mail-modal-buttons-align-v6';
  let raf=0;

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      /* Un seul bouton Fermer : celui de la barre d'actions. */
      #modalRoot .yaya-mail-body-modal > h5 > .yaya-mail-header-close,
      #modalRoot .message-modal > h5 > .yaya-mail-header-close,
      #modalRoot .yaya-mail-body-modal > h5 > button[aria-label="Fermer"]{
        display:none!important;
      }

      /* Supprimer à gauche ; Modifier l'objet + Fermer groupés à droite sur UNE ligne. */
      #modalRoot .yaya-mail-body-modal .yaya-read-actions,
      #modalRoot .yaya-mail-body-modal .yaya-mail-read-actions,
      #modalRoot .message-modal .yaya-read-actions,
      #modalRoot .message-modal .yaya-mail-read-actions{
        display:flex!important;
        flex-direction:row!important;
        align-items:center!important;
        justify-content:flex-start!important;
        flex-wrap:nowrap!important;
        gap:10px!important;
        width:100%!important;
        box-sizing:border-box!important;
      }
      #modalRoot .yaya-mail-body-modal .yaya-read-actions .yaya-delete,
      #modalRoot .yaya-mail-body-modal .yaya-mail-read-actions .yaya-delete,
      #modalRoot .message-modal .yaya-read-actions .yaya-delete,
      #modalRoot .message-modal .yaya-mail-read-actions .yaya-delete{
        margin:0 auto 0 0!important;
        flex:0 0 auto!important;
      }
      #modalRoot .yaya-mail-body-modal .yaya-read-actions .yaya-edit,
      #modalRoot .yaya-mail-body-modal .yaya-read-actions .yaya-close,
      #modalRoot .yaya-mail-body-modal .yaya-mail-read-actions .yaya-edit,
      #modalRoot .yaya-mail-body-modal .yaya-mail-read-actions .yaya-close,
      #modalRoot .message-modal .yaya-read-actions .yaya-edit,
      #modalRoot .message-modal .yaya-read-actions .yaya-close,
      #modalRoot .message-modal .yaya-mail-read-actions .yaya-edit,
      #modalRoot .message-modal .yaya-mail-read-actions .yaya-close{
        margin:0!important;
        flex:0 0 auto!important;
      }
      #modalRoot .yaya-mail-body-modal .yaya-read-actions button,
      #modalRoot .yaya-mail-body-modal .yaya-mail-read-actions button,
      #modalRoot .message-modal .yaya-read-actions button,
      #modalRoot .message-modal .yaya-mail-read-actions button{
        min-height:42px!important;
        height:42px!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        white-space:nowrap!important;
        box-sizing:border-box!important;
      }
      #modalRoot .yaya-mail-body-modal .yaya-close,
      #modalRoot .message-modal .yaya-close,
      #modalRoot .yaya-mail-fullscreen-modal .yaya-close,
      #modalRoot .yaya-mail-fullscreen-modal .yaya-mail-read-actions > button:last-child,
      #modalRoot .yaya-mail-fullscreen-modal .yaya-read-actions > button:last-child{
        visibility:visible!important;
        opacity:1!important;
        background:#5f6b7a!important;
        background-color:#5f6b7a!important;
        border:1px solid #5f6b7a!important;
        border-color:#5f6b7a!important;
        color:#fff!important;
        -webkit-text-fill-color:#fff!important;
        font-weight:700!important;
        box-shadow:none!important;
        filter:none!important;
        pointer-events:auto!important;
        cursor:pointer!important;
      }
      #modalRoot .yaya-mail-body-modal .yaya-close:hover,
      #modalRoot .message-modal .yaya-close:hover,
      #modalRoot .yaya-mail-fullscreen-modal .yaya-close:hover{
        background:#485463!important;
        background-color:#485463!important;
        border-color:#485463!important;
        color:#fff!important;
        -webkit-text-fill-color:#fff!important;
      }
      #modalRoot .yaya-mail-body-modal .yaya-close:disabled,
      #modalRoot .message-modal .yaya-close:disabled,
      #modalRoot .yaya-mail-fullscreen-modal .yaya-close:disabled{
        opacity:1!important;
        background:#5f6b7a!important;
        background-color:#5f6b7a!important;
        border-color:#5f6b7a!important;
        color:#fff!important;
        -webkit-text-fill-color:#fff!important;
        filter:none!important;
      }

      @media(max-width:640px){
        #modalRoot .yaya-mail-body-modal .yaya-read-actions,
        #modalRoot .yaya-mail-body-modal .yaya-mail-read-actions,
        #modalRoot .message-modal .yaya-read-actions,
        #modalRoot .message-modal .yaya-mail-read-actions{
          gap:6px!important;
        }
        #modalRoot .yaya-mail-body-modal .yaya-read-actions button,
        #modalRoot .yaya-mail-body-modal .yaya-mail-read-actions button,
        #modalRoot .message-modal .yaya-read-actions button,
        #modalRoot .message-modal .yaya-mail-read-actions button{
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

  function label(btn){
    return String(btn&&((btn.textContent||'')+' '+(btn.getAttribute('aria-label')||''))||'').replace(/\s+/g,' ').trim();
  }

  function directHeaderClose(modal){
    const head=modal&&modal.querySelector(':scope > h5');
    if(!head)return null;
    return [...head.querySelectorAll(':scope > button')].find(function(b){
      return /fermer/i.test(label(b));
    })||null;
  }

  function findActionButton(modal,re){
    return [...modal.querySelectorAll('button')].find(function(b){
      return !b.closest('h5')&&re.test(label(b));
    })||null;
  }

  function ensureActions(modal){
    let actions=modal.querySelector(':scope > .yaya-read-actions,:scope > .yaya-mail-read-actions');
    if(actions)return actions;

    const del=findActionButton(modal,/^supprimer\b/i);
    const edit=findActionButton(modal,/^modifier\s+l[’']objet\b/i);
    if(del&&edit&&del.parentElement===edit.parentElement&&del.parentElement!==modal){
      actions=del.parentElement;
      actions.classList.add('yaya-read-actions');
      return actions;
    }

    if(del||edit){
      actions=document.createElement('div');
      actions.className='yaya-read-actions yaya-mail-read-actions';
      const head=modal.querySelector(':scope > h5');
      if(head)head.insertAdjacentElement('afterend',actions);
      else modal.insertBefore(actions,modal.firstChild);
      if(del)actions.appendChild(del);
      if(edit)actions.appendChild(edit);
      return actions;
    }
    return null;
  }

  function normalize(modal){
    if(!modal)return;

    const headerClose=directHeaderClose(modal);
    if(headerClose)headerClose.classList.add('yaya-mail-header-close');

    const actions=ensureActions(modal);
    if(!actions)return;
    actions.classList.add('yaya-mail-read-actions');

    const buttons=[...actions.querySelectorAll('button')];
    let del=buttons.find(function(b){return /^supprimer\b/i.test(label(b));})||null;
    let edit=buttons.find(function(b){return /^modifier\s+l[’']objet\b/i.test(label(b));})||null;
    let close=buttons.find(function(b){return /^fermer\b/i.test(label(b));})||null;

    if(del)del.classList.add('yaya-delete');
    if(edit)edit.classList.add('yaya-edit');

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
    close.disabled=false;
    close.removeAttribute('disabled');
    close.setAttribute('aria-disabled','false');
    close.style.setProperty('background','#5f6b7a','important');
    close.style.setProperty('background-color','#5f6b7a','important');
    close.style.setProperty('border','1px solid #5f6b7a','important');
    close.style.setProperty('border-color','#5f6b7a','important');
    close.style.setProperty('color','#fff','important');
    close.style.setProperty('-webkit-text-fill-color','#fff','important');
    close.style.setProperty('opacity','1','important');
    close.style.setProperty('filter','none','important');
    close.style.setProperty('pointer-events','auto','important');

    /* Ordre stable : Supprimer | espace libre | Modifier l'objet | Fermer. */
    if(del&&actions.firstElementChild!==del)actions.insertBefore(del,actions.firstElementChild);
    if(edit&&edit.nextElementSibling!==close)actions.insertBefore(edit,close);
    if(actions.lastElementChild!==close)actions.appendChild(close);
  }

  function apply(){
    installStyle();
    const root=document.getElementById('modalRoot');
    if(!root)return;
    root.querySelectorAll('.yaya-mail-body-modal,.message-modal,.yaya-mail-fullscreen-modal').forEach(normalize);
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
