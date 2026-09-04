(function(){
  'use strict';

  function patch(){
    const root=document.getElementById('modalRoot');
    if(!root)return;

    const type=root.querySelector('#edDocType');
    if(!type || !/^Document$/i.test(String(type.value||'').trim()))return;

    let box=type.parentElement;
    while(box && box!==root){
      const buttons=[...box.querySelectorAll('button')];
      const save=buttons.find(function(button){
        return /^Enregistrer$/i.test(String(button.textContent||'').trim());
      });
      const cancel=buttons.find(function(button){
        return /^Annuler$/i.test(String(button.textContent||'').trim());
      });
      const close=buttons.find(function(button){
        return /^Fermer$/i.test(String(button.textContent||'').trim());
      });

      if(save && cancel){
        if(close)close.remove();
        return;
      }
      box=box.parentElement;
    }
  }

  function install(){
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
