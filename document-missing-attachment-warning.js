(function(){
  'use strict';

  if(window.__yayaDocumentMissingAttachmentWarningV3)return;
  window.__yayaDocumentMissingAttachmentWarningV3=true;

  function installConfirmStyle(){
    if(document.getElementById('yaya-centered-warning-style-v1'))return;
    const style=document.createElement('style');
    style.id='yaya-centered-warning-style-v1';
    style.textContent=`
      .yaya-centered-warning-overlay{
        position:fixed!important;
        inset:0!important;
        z-index:300000!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        padding:18px!important;
        background:rgba(22,45,73,.44)!important;
      }
      .yaya-centered-warning-box{
        width:min(480px,calc(100vw - 36px))!important;
        margin:auto!important;
        padding:24px!important;
        border:1px solid #d9e1ea!important;
        border-radius:15px!important;
        background:#fff!important;
        color:#162d49!important;
        box-shadow:0 18px 55px rgba(0,0,0,.28)!important;
        text-align:center!important;
      }
      .yaya-centered-warning-icon{
        font-size:30px!important;
        line-height:1!important;
        margin-bottom:10px!important;
      }
      .yaya-centered-warning-title{
        margin:0 0 8px!important;
        font-size:18px!important;
        font-weight:800!important;
      }
      .yaya-centered-warning-message{
        margin:0 0 20px!important;
        color:#66758a!important;
        font-size:13px!important;
        line-height:1.5!important;
      }
      .yaya-centered-warning-actions{
        display:flex!important;
        justify-content:center!important;
        gap:10px!important;
      }
      .yaya-centered-warning-actions button{
        min-width:120px!important;
        min-height:42px!important;
        padding:0 18px!important;
        border-radius:9px!important;
        font-family:inherit!important;
        font-size:13px!important;
        font-weight:750!important;
        cursor:pointer!important;
      }
      .yaya-centered-warning-cancel{
        border:1px solid #cbd5e1!important;
        background:#fff!important;
        color:#334155!important;
      }
      .yaya-centered-warning-ok{
        border:1px solid #0b4d8f!important;
        background:#0b4d8f!important;
        color:#fff!important;
      }
      @media(max-width:640px){
        .yaya-centered-warning-box{padding:21px 18px!important}
        .yaya-centered-warning-actions button{flex:1!important;min-width:0!important;min-height:46px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function centeredConfirm(message,options){
    installConfirmStyle();
    options=options||{};
    return new Promise(function(resolve){
      document.querySelectorAll('.yaya-centered-warning-overlay').forEach(function(el){el.remove();});

      const overlay=document.createElement('div');
      overlay.className='yaya-centered-warning-overlay';
      overlay.innerHTML=''
        +'<div class="yaya-centered-warning-box" role="dialog" aria-modal="true">'
        +'<div class="yaya-centered-warning-icon">⚠️</div>'
        +'<div class="yaya-centered-warning-title">'+String(options.title||'Attention')+'</div>'
        +'<div class="yaya-centered-warning-message"></div>'
        +'<div class="yaya-centered-warning-actions">'
        +'<button type="button" class="yaya-centered-warning-cancel">'+String(options.cancelText||'Annuler')+'</button>'
        +'<button type="button" class="yaya-centered-warning-ok">'+String(options.okText||'Continuer')+'</button>'
        +'</div></div>';

      const msg=overlay.querySelector('.yaya-centered-warning-message');
      if(msg)msg.textContent=String(message||'');

      let done=false;
      function finish(value){
        if(done)return;
        done=true;
        document.removeEventListener('keydown',onKey,true);
        overlay.remove();
        resolve(!!value);
      }
      function onKey(e){
        if(e.key==='Escape'){e.preventDefault();finish(false);}
        else if(e.key==='Enter'){e.preventDefault();finish(true);}
      }

      overlay.addEventListener('click',function(e){if(e.target===overlay)finish(false);});
      overlay.querySelector('.yaya-centered-warning-cancel').addEventListener('click',function(){finish(false);});
      overlay.querySelector('.yaya-centered-warning-ok').addEventListener('click',function(){finish(true);});
      document.addEventListener('keydown',onKey,true);
      document.body.appendChild(overlay);
      setTimeout(function(){try{overlay.querySelector('.yaya-centered-warning-ok').focus();}catch(e){}},0);
    });
  }

  if(typeof window.yayaConfirmCentered!=='function')window.yayaConfirmCentered=centeredConfirm;

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
    if(!save||save.dataset.yayaMissingAttachmentWarning==='3')return;

    save.dataset.yayaMissingAttachmentWarning='3';
    save.removeAttribute('onclick');
    save.onclick=async function(e){
      if(e){e.preventDefault();e.stopPropagation();}
      if(save.disabled)return;

      const lien=getAttachmentLink(modal);
      if(!lien){
        const ok=await centeredConfirm(
          'Aucune pièce jointe. Souhaitez-vous continuer quand même ?',
          {title:'Pièce jointe manquante',okText:'Continuer',cancelText:'Annuler'}
        );
        if(!ok)return;
      }

      if(typeof window.saveDocument!=='function')return;
      await window.saveDocument();
      if(typeof window.closeModal==='function')window.closeModal();
    };
  }

  function install(){
    installConfirmStyle();
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
