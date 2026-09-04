(function(){
  'use strict';

  const STYLE_ID='yaya-chantier-edit-actions-fix-v3';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .yaya-chantier-edit-modal h5 > button{
        display:none!important;
      }
      .yaya-chantier-edit-modal .mfoot.yaya-chantier-edit-actions-fixed{
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        gap:12px!important;
        flex-wrap:nowrap!important;
      }
      .yaya-chantier-edit-modal .mfoot.yaya-chantier-edit-actions-fixed > button{
        height:42px!important;
        min-height:42px!important;
        margin:0!important;
        white-space:nowrap!important;
      }
      .yaya-chantier-edit-modal .yaya-delete-chantier-modal-btn{
        width:auto!important;
        margin:0!important;
        background:#d93636!important;
        border:1px solid #d93636!important;
        color:#fff!important;
        box-shadow:0 1px 3px rgba(0,0,0,.12)!important;
      }
      .yaya-chantier-edit-modal .yaya-delete-chantier-modal-btn:hover{
        background:#bf2f2f!important;
        border-color:#bf2f2f!important;
        color:#fff!important;
      }
    `;
    document.head.appendChild(style);
  }

  function patch(){
    const root=document.getElementById('modalRoot');
    if(!root)return;

    const modal=root.querySelector('.yaya-chantier-edit-modal');
    if(!modal)return;

    modal.querySelectorAll('h5 > button').forEach(function(button){
      const txt=String(button.textContent||'').trim();
      const aria=String(button.getAttribute('aria-label')||'');
      if(txt==='×' || /Fermer/i.test(aria))button.remove();
    });

    const footer=modal.querySelector('.mfoot');
    if(!footer)return;

    const buttons=[...modal.querySelectorAll('button')];
    const del=buttons.find(function(button){
      return button.classList.contains('yaya-delete-chantier-modal-btn') ||
        /Supprimer le chantier/i.test(String(button.textContent||''));
    });
    const save=buttons.find(function(button){
      return button.id==='editChSave' || /^Enregistrer$/i.test(String(button.textContent||'').trim());
    });
    const cancel=buttons.find(function(button){
      return /^Annuler$/i.test(String(button.textContent||'').trim());
    });

    if(!del||!save||!cancel)return;

    footer.classList.add('yaya-chantier-edit-actions-fixed');
    footer.style.setProperty('display','flex','important');
    footer.style.setProperty('align-items','center','important');
    footer.style.setProperty('justify-content','center','important');
    footer.style.setProperty('gap','12px','important');
    footer.style.setProperty('flex-wrap','nowrap','important');

    del.style.setProperty('background','#d93636','important');
    del.style.setProperty('border','1px solid #d93636','important');
    del.style.setProperty('color','#fff','important');
    del.style.setProperty('margin','0','important');

    [del,save,cancel].forEach(function(button){
      button.style.setProperty('height','42px','important');
      button.style.setProperty('min-height','42px','important');
      button.style.setProperty('margin','0','important');
    });

    footer.appendChild(del);
    footer.appendChild(save);
    footer.appendChild(cancel);
  }

  function wrapOpen(){
    const fn=window.openExistingChantierModal;
    if(typeof fn!=='function' || fn.__yayaActionsWrapped)return;

    function wrapped(){
      const out=fn.apply(this,arguments);
      patch();
      requestAnimationFrame(patch);
      setTimeout(patch,0);
      return out;
    }
    wrapped.__yayaActionsWrapped=true;
    window.openExistingChantierModal=wrapped;
  }

  function install(){
    installStyle();
    wrapOpen();
    patch();

    const root=document.getElementById('modalRoot');
    if(!root)return;

    let raf=0;
    const observer=new MutationObserver(function(){
      if(raf)return;
      raf=requestAnimationFrame(function(){
        raf=0;
        wrapOpen();
        patch();
      });
    });
    observer.observe(root,{childList:true,subtree:true});
  }

  if(document.body)install();
  else document.addEventListener('DOMContentLoaded',install,{once:true});
})();
