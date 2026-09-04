(function(){
  'use strict';

  const STYLE_ID='yaya-document-modal-upload-fix-style';
  const BUTTON_CLASS='yaya-document-upload-bottom';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .${BUTTON_CLASS}{
        background:#249457!important;
        border:1px solid #249457!important;
        color:#fff!important;
        opacity:1!important;
        filter:none!important;
        box-shadow:0 2px 8px rgba(36,148,87,.18)!important;
      }
      .${BUTTON_CLASS}:hover{
        background:#1d7e49!important;
        border-color:#1d7e49!important;
        color:#fff!important;
        opacity:1!important;
      }
      .${BUTTON_CLASS}:disabled,
      .${BUTTON_CLASS}[disabled]{
        background:#249457!important;
        border-color:#249457!important;
        color:#fff!important;
        opacity:.72!important;
        filter:none!important;
      }
      .yaya-document-create-actions{
        display:flex!important;
        align-items:center!important;
        justify-content:flex-start!important;
        gap:10px!important;
        flex-wrap:wrap!important;
        margin-top:14px!important;
      }
    `;
    document.head.appendChild(style);
  }

  function findDocumentModal(root){
    return [...root.querySelectorAll('.overlay .modal')].find(function(modal){
      const title=String(modal.querySelector('h5')?.textContent||'').trim();
      return /^Ajouter un document/i.test(title) || !!modal.querySelector('#docFile,#docCh,#docLien,#docEtat');
    });
  }

  function patch(){
    const root=document.getElementById('modalRoot');
    if(!root)return;

    const modal=findDocumentModal(root);
    if(!modal)return;

    const upload=[...modal.querySelectorAll('button')].find(function(button){
      const txt=String(button.textContent||'').trim();
      const onclick=String(button.getAttribute('onclick')||'');
      return /Déposer un document/i.test(txt) || /docFile/i.test(onclick);
    });
    if(!upload)return;

    upload.textContent='Déposer un document';
    upload.classList.add(BUTTON_CLASS);

    let footer=modal.querySelector('.mfoot');
    if(!footer){
      const save=[...modal.querySelectorAll('button')].find(function(button){
        return /^Enregistrer$/i.test(String(button.textContent||'').trim());
      });
      if(save)footer=save.parentElement;
    }

    if(!footer){
      footer=document.createElement('div');
      footer.className='mfoot yaya-document-create-actions';
      modal.appendChild(footer);
    }else{
      footer.classList.add('yaya-document-create-actions');
    }

    if(upload.parentElement!==footer){
      footer.insertBefore(upload,footer.firstChild);
    }
  }

  function install(){
    installStyle();
    patch();

    const root=document.getElementById('modalRoot');
    if(!root)return;

    let raf=0;
    const observer=new MutationObserver(function(){
      if(raf)return;
      raf=requestAnimationFrame(function(){
        raf=0;
        patch();
      });
    });
    observer.observe(root,{childList:true,subtree:true});
  }

  if(document.body)install();
  else document.addEventListener('DOMContentLoaded',install,{once:true});
})();
