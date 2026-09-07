(function(){
  'use strict';

  if(window.__yayaDocumentMissingAttachmentWarningV2)return;
  window.__yayaDocumentMissingAttachmentWarningV2=true;

  function documentModal(){
    const root=document.getElementById('modalRoot');
    if(!root)return null;
    return Array.from(root.querySelectorAll('.modal')).find(function(item){
      return !!(item.querySelector('#docFile')&&item.querySelector('#docEtat'));
    })||null;
  }

  function normalizeLinkInputs(modal){
    if(!modal)return null;
    const links=Array.from(modal.querySelectorAll('input#docLien'));
    if(!links.length){
      const input=document.createElement('input');
      input.type='hidden';
      input.id='docLien';
      modal.appendChild(input);
      return input;
    }
    const keep=links[0];
    const stored=String(modal.dataset.yayaAttachmentLien||'').trim();
    const current=links.map(function(el){return String(el.value||'').trim();}).find(Boolean)||stored;
    if(current)keep.value=current;
    links.slice(1).forEach(function(el){el.remove();});
    return keep;
  }

  function getAttachmentLink(modal){
    if(!modal)return '';
    const input=normalizeLinkInputs(modal);
    const direct=String(input&&input.value||'').trim();
    const stored=String(modal.dataset.yayaAttachmentLien||'').trim();
    const lien=direct||stored;
    if(lien&&input)input.value=lien;
    if(lien)modal.dataset.yayaAttachmentLien=lien;
    return lien;
  }

  function patch(){
    const modal=documentModal();
    if(!modal)return;

    normalizeLinkInputs(modal);

    const save=Array.from(modal.querySelectorAll('button')).find(function(btn){
      const txt=String(btn.textContent||'').trim();
      const onclick=String(btn.getAttribute('onclick')||'');
      return /saveDocument\s*\(/.test(onclick)||/^Enregistrer$/i.test(txt)||/^Enregistrement/i.test(txt);
    });
    if(!save||save.dataset.yayaMissingAttachmentWarning==='2')return;

    save.dataset.yayaMissingAttachmentWarning='2';
    save.removeAttribute('onclick');
    save.onclick=async function(e){
      if(e){e.preventDefault();e.stopPropagation();}
      if(save.disabled)return;

      const lien=getAttachmentLink(modal);
      if(!lien){
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

  window.addEventListener('yaya:document-upload-state',function(e){
    const detail=e&&e.detail||{};
    if(detail.state!=='success'||!detail.lien)return;
    const modal=documentModal();
    if(!modal)return;
    modal.dataset.yayaAttachmentLien=String(detail.lien||'').trim();
    const input=normalizeLinkInputs(modal);
    if(input)input.value=String(detail.lien||'').trim();
  });

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
