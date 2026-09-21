(function(){
  'use strict';

  const STYLE_ID='yaya-chantier-edit-actions-fix-v5';

  function installStyle(){
    ['yaya-chantier-edit-actions-fix-v3','yaya-chantier-edit-actions-fix-v4'].forEach(function(id){
      const old=document.getElementById(id);if(old)old.remove();
    });
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .yaya-chantier-edit-modal h5 > button{display:none!important;}
      .yaya-chantier-edit-modal{
        width:min(560px,calc(100vw - 24px))!important;max-width:560px!important;
        overflow-x:hidden!important;box-sizing:border-box!important;
      }
      .yaya-chantier-edit-modal label{margin-bottom:13px!important;}
      .yaya-chantier-edit-modal .inp{min-height:42px!important;box-sizing:border-box!important;}
      .yaya-chantier-edit-modal .mfoot.yaya-chantier-edit-actions-fixed{
        display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;
        align-items:stretch!important;gap:8px!important;width:100%!important;
        margin-top:16px!important;padding:14px 0 0!important;border-top:1px solid #dfe6ee!important;
        overflow:visible!important;box-sizing:border-box!important;
      }
      .yaya-chantier-edit-modal .mfoot.yaya-chantier-edit-actions-fixed > button{
        width:100%!important;min-width:0!important;height:42px!important;min-height:42px!important;
        margin:0!important;padding:0 8px!important;white-space:nowrap!important;font-size:12px!important;
      }
      .yaya-chantier-edit-modal .yaya-delete-chantier-modal-btn{
        width:auto!important;margin:0!important;background:#d93636!important;
        border:1px solid #d93636!important;color:#fff!important;box-shadow:0 1px 3px rgba(0,0,0,.12)!important;
      }
      .yaya-chantier-edit-modal .yaya-delete-chantier-modal-btn:hover{
        background:#bf2f2f!important;border-color:#bf2f2f!important;color:#fff!important;
      }
      .yaya-chantier-edit-modal .yaya-archive-chantier-modal-btn{
        width:auto!important;margin:0!important;background:#fff3df!important;
        border:1px solid #e4a14f!important;color:#99500b!important;box-shadow:none!important;
      }
      .yaya-chantier-edit-modal .yaya-archive-chantier-modal-btn:hover{
        background:#ffe6bf!important;border-color:#cf8127!important;color:#7c3e06!important;
      }
      @media(max-width:560px){
        .yaya-chantier-edit-modal .mfoot.yaya-chantier-edit-actions-fixed{grid-template-columns:repeat(2,minmax(0,1fr))!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function sameOrder(parent,nodes){
    const current=[...parent.children].filter(function(n){return nodes.indexOf(n)!==-1;});
    return current.length===nodes.length&&current.every(function(n,i){return n===nodes[i];});
  }

  function patch(){
    const root=document.getElementById('modalRoot');
    if(!root)return;
    const modal=root.querySelector('.yaya-chantier-edit-modal');
    if(!modal)return;

    modal.querySelectorAll('h5 > button').forEach(function(button){
      const txt=String(button.textContent||'').trim();
      const aria=String(button.getAttribute('aria-label')||'');
      if(txt==='×'||/Fermer/i.test(aria))button.remove();
    });

    const footer=modal.querySelector('.mfoot');
    if(!footer)return;

    const buttons=[...footer.querySelectorAll(':scope > button')];
    const archive=buttons.find(function(button){
      return button.classList.contains('yaya-archive-chantier-modal-btn')||/^Archiver$/i.test(String(button.textContent||'').trim());
    });
    const del=buttons.find(function(button){
      return button.classList.contains('yaya-delete-chantier-modal-btn')||/^Supprimer(?: le chantier)?$/i.test(String(button.textContent||'').trim());
    });
    const save=buttons.find(function(button){
      return button.id==='editChSave'||/^Enregistrer(?:ement…)?$/i.test(String(button.textContent||'').trim());
    });
    const cancel=buttons.find(function(button){
      return button.id==='editChCancel'||/^Annuler$/i.test(String(button.textContent||'').trim());
    });

    if(!del||!save||!cancel)return;

    footer.classList.add('yaya-chantier-edit-actions-fixed');
    footer.style.setProperty('display','grid','important');
    footer.style.removeProperty('grid-template-columns');
    footer.style.setProperty('align-items','stretch','important');
    footer.style.setProperty('gap','8px','important');
    footer.style.setProperty('width','100%','important');
    footer.style.setProperty('overflow','visible','important');

    del.style.setProperty('background','#d93636','important');
    del.style.setProperty('border','1px solid #d93636','important');
    del.style.setProperty('color','#fff','important');
    del.style.setProperty('margin','0','important');

    [archive,del,save,cancel].filter(Boolean).forEach(function(button){
      button.style.setProperty('width','100%','important');
      button.style.setProperty('min-width','0','important');
      button.style.setProperty('height','42px','important');
      button.style.setProperty('min-height','42px','important');
      button.style.setProperty('margin','0','important');
    });

    /*
     * IMPORTANT : ne jamais appendChild les boutons à chaque MutationObserver.
     * L'ancienne version les déplaçait en boucle, parfois entre pointerdown et click,
     * ce qui annulait le clic navigateur. Résultat : Supprimer inactif et Enregistrer
     * nécessitant plusieurs clics. On ne touche au DOM que si l'ordre est réellement faux.
     */
    const desired=[archive,del,cancel,save].filter(Boolean);
    if(!sameOrder(footer,desired)){
      const others=[...footer.children].filter(function(n){return desired.indexOf(n)===-1;});
      footer.replaceChildren.apply(footer,desired.concat(others));
    }
  }

  function wrapOpen(){
    const fn=window.openExistingChantierModal;
    if(typeof fn!=='function'||fn.__yayaActionsWrappedV4)return;
    function wrapped(){
      const out=fn.apply(this,arguments);
      requestAnimationFrame(patch);
      setTimeout(patch,20);
      return out;
    }
    wrapped.__yayaActionsWrappedV4=true;
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
