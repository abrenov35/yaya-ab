(function(){
  'use strict';

  function patch(){
    const root=document.getElementById('modalRoot');
    if(!root)return;

    const modal=Array.from(root.querySelectorAll('.modal')).find(function(item){
      return !!(item.querySelector('#docFile')&&item.querySelector('#docLien'));
    });
    if(!modal)return;

    const save=Array.from(modal.querySelectorAll('button')).find(function(btn){
      const txt=String(btn.textContent||'').trim();
      const onclick=String(btn.getAttribute('onclick')||'');
      return /saveDocument\s*\(/.test(onclick)||/^Enregistrer$/i.test(txt);
    });
    if(!save||save.dataset.yayaMissingAttachmentWarning==='1')return;

    save.dataset.yayaMissingAttachmentWarning='1';
    save.removeAttribute('onclick');
    save.onclick=async function(e){
      if(e){e.preventDefault();e.stopPropagation();}
      if(save.disabled)return;

      const lien=document.getElementById('docLien');
      const hasAttachment=!!String(lien&&lien.value||'').trim();

      if(!hasAttachment){
        const ok=window.confirm('Aucune pièce jointe. Souhaitez-vous continuer quand même ?');
        if(!ok)return;
      }

      if(typeof window.saveDocument!=='function')return;
      await window.saveDocument();
      if(typeof window.closeModal==='function')window.closeModal();
    };
  }

  function install(){
    const root=document.getElementById('modalRoot');
    if(!root){setTimeout(install,150);return;}

    patch();
    let raf=0;
    new MutationObserver(function(){
      if(raf)return;
      raf=requestAnimationFrame(function(){
        raf=0;
        patch();
      });
    }).observe(root,{childList:true,subtree:true});
  }

  if(document.body)install();
  else document.addEventListener('DOMContentLoaded',install,{once:true});
})();

/* Charge / facture sous-traitant : recharge toujours la version qui affiche Description. */
(function(){
  'use strict';
  if(document.querySelector('script[data-yaya-achat-st-description="1"]'))return;
  const s=document.createElement('script');
  s.src='achat-soustraitant-modal-fix.js?v=description-'+Date.now();
  s.async=false;
  s.setAttribute('data-yaya-achat-st-description','1');
  document.head.appendChild(s);
})();
