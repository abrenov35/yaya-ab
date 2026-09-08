(function(){
  'use strict';

  if(window.__yayaChantierEditModalSimpleV1)return;
  window.__yayaChantierEditModalSimpleV1=true;

  const STYLE_ID='yaya-chantier-edit-modal-simple-v1';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #modalRoot .yaya-chantier-edit-modal .yaya-manage-selector,
      #modalRoot .yaya-chantier-edit-modal .yaya-extranet-note,
      #modalRoot .yaya-chantier-edit-modal .yaya-manage-edit-title{
        display:none!important;
      }
      #modalRoot .yaya-chantier-edit-modal{
        max-width:520px!important;
      }
      #modalRoot .yaya-chantier-edit-modal h5{
        margin-bottom:14px!important;
      }
    `;
    document.head.appendChild(style);
  }

  function setTitle(modal){
    const h5=modal&&modal.querySelector('h5');
    if(!h5)return;
    let done=false;
    h5.childNodes.forEach(function(node){
      if(!done&&node.nodeType===Node.TEXT_NODE){
        node.nodeValue='Modifier le chantier';
        done=true;
      }
    });
    if(!done)h5.insertBefore(document.createTextNode('Modifier le chantier'),h5.firstChild||null);
  }

  function simplify(){
    installStyle();
    const modal=document.querySelector('#modalRoot .yaya-chantier-edit-modal');
    if(!modal)return;

    modal.querySelectorAll('.yaya-manage-selector,.yaya-extranet-note,.yaya-manage-edit-title').forEach(function(el){
      el.remove();
    });
    setTitle(modal);
  }

  function install(){
    installStyle();
    simplify();
    const root=document.getElementById('modalRoot');
    if(!root){setTimeout(install,120);return;}
    let raf=0;
    new MutationObserver(function(){
      if(raf)return;
      raf=requestAnimationFrame(function(){
        raf=0;
        simplify();
      });
    }).observe(root,{childList:true,subtree:true});
  }

  if(document.body)install();
  else document.addEventListener('DOMContentLoaded',install,{once:true});
})();
