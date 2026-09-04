(function(){
  'use strict';

  const STYLE_ID='yaya-document-close-bottom-fix-v1';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .yaya-document-create-actions{
        display:flex!important;
        align-items:center!important;
        justify-content:flex-start!important;
        gap:10px!important;
        flex-wrap:nowrap!important;
        margin-top:14px!important;
      }
      .yaya-document-create-actions > button{
        height:42px!important;
        min-height:42px!important;
        margin:0!important;
        white-space:nowrap!important;
      }
    `;
    document.head.appendChild(style);
  }

  function patch(){
    const root=document.getElementById('modalRoot');
    if(!root)return;

    const modal=[...root.querySelectorAll('.overlay .modal')].find(function(item){
      const title=String(item.querySelector('h5')&&item.querySelector('h5').textContent||'').trim();
      return /^Ajouter un document/i.test(title) || !!item.querySelector('#docFile,#docCh,#docLien,#docEtat');
    });
    if(!modal)return;

    const buttons=[...modal.querySelectorAll('button')];
    const upload=buttons.find(function(button){
      const txt=String(button.textContent||'').trim();
      const onclick=String(button.getAttribute('onclick')||'');
      return /Déposer un document/i.test(txt) || /docFile/i.test(onclick);
    });
    const save=buttons.find(function(button){
      return /^Enregistrer$/i.test(String(button.textContent||'').trim());
    });
    const close=buttons.find(function(button){
      return /^Fermer$/i.test(String(button.textContent||'').trim());
    });

    if(!upload||!save||!close)return;

    let footer=modal.querySelector('.yaya-document-create-actions');
    if(!footer){
      footer=[...modal.querySelectorAll('.mfoot')].find(function(item){
        return item.contains(upload) || item.contains(save);
      });
    }
    if(!footer){
      footer=document.createElement('div');
      footer.className='mfoot';
      modal.appendChild(footer);
    }
    footer.classList.add('yaya-document-create-actions');

    const expected=[upload,save,close];
    const current=[...footer.querySelectorAll(':scope > button')];
    const alreadyOrdered=expected.every(function(button,index){
      return current[index]===button;
    });

    if(!alreadyOrdered){
      expected.forEach(function(button){
        footer.appendChild(button);
      });
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
