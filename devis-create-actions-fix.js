(function(){
  'use strict';

  const STYLE_ID='yaya-devis-create-actions-fix-v1';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .yaya-devis-create-actions{
        display:flex!important;
        align-items:center!important;
        justify-content:flex-start!important;
        gap:10px!important;
        flex-wrap:nowrap!important;
        margin-top:18px!important;
      }
      .yaya-devis-create-actions > button{
        position:static!important;
        width:auto!important;
        min-width:0!important;
        max-width:none!important;
        height:42px!important;
        min-height:42px!important;
        margin:0!important;
        padding:0 20px!important;
        flex:0 0 auto!important;
        white-space:nowrap!important;
      }
      .yaya-devis-create-actions > .yaya-devis-import{
        background:#249457!important;
        border:1px solid #249457!important;
        color:#fff!important;
        opacity:1!important;
        filter:none!important;
      }
      .yaya-devis-create-actions > .yaya-devis-import:hover{
        background:#1d7f49!important;
        border-color:#1d7f49!important;
        color:#fff!important;
      }
    `;
    document.head.appendChild(style);
  }

  function getRoot(){
    return document.getElementById('modalRoot');
  }

  function patch(){
    const root=getRoot();
    if(!root)return;

    const modal=[...root.querySelectorAll('.overlay .modal')].find(function(item){
      const title=String(item.querySelector('h5')&&item.querySelector('h5').textContent||'').trim();
      const hasSave=[...item.querySelectorAll('button')].some(function(button){
        return /Enregistrer le devis/i.test(String(button.textContent||''));
      });
      return /^Ajouter le devis/i.test(title) || hasSave || item.classList.contains('yaya-devis-create-patched');
    });
    if(!modal)return;

    modal.classList.add('yaya-devis-create-patched');

    let buttons=[...modal.querySelectorAll('button')];
    const paste=buttons.find(function(button){
      return /Coller une capture/i.test(String(button.textContent||''));
    });
    if(paste)paste.remove();

    buttons=[...modal.querySelectorAll('button')];
    const cancel=buttons.find(function(button){
      return /^Annuler$/i.test(String(button.textContent||'').trim());
    });
    if(cancel)cancel.remove();

    buttons=[...modal.querySelectorAll('button')];
    const upload=buttons.find(function(button){
      const txt=String(button.textContent||'').trim();
      return /Importer le devis/i.test(txt) || /^Importer$/i.test(txt);
    });
    const save=buttons.find(function(button){
      const txt=String(button.textContent||'').trim();
      return /Enregistrer le devis/i.test(txt) || /^Enregistrer$/i.test(txt);
    });
    const close=buttons.find(function(button){
      return /^Fermer$/i.test(String(button.textContent||'').trim());
    });

    if(!upload||!save||!close)return;

    upload.textContent='Importer';
    save.textContent='Enregistrer';
    upload.classList.add('yaya-devis-import');

    let footer=modal.querySelector('.yaya-devis-create-actions');
    if(!footer){
      footer=save.closest('.mfoot');
      if(!footer){
        footer=document.createElement('div');
        modal.appendChild(footer);
      }
      footer.classList.add('mfoot','yaya-devis-create-actions');
    }

    if(upload.parentElement!==footer)footer.appendChild(upload);
    if(save.parentElement!==footer)footer.appendChild(save);
    if(close.parentElement!==footer)footer.appendChild(close);
  }

  function install(){
    installStyle();
    patch();

    const root=getRoot();
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
