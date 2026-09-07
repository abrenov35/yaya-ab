(function(){
  'use strict';

  if(window.__yayaDevisEditImportButtonV5)return;
  window.__yayaDevisEditImportButtonV5=true;

  const BUTTON_ID='yayaDevisEditImportBtn';
  const STATUS_ID='yayaDevisEditImportStatus';
  const STYLE_ID='yaya-devis-edit-import-style-v5';
  let current={kind:'',id:''};
  let uploadSucceeded=false;

  function toastSafe(message,isError){
    try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}
  }

  function rememberContext(button){
    if(!button)return;
    current={
      kind:String(button.dataset.kind||''),
      id:String(button.dataset.rowId||'')
    };
    uploadSucceeded=false;
  }

  document.addEventListener('click',function(event){
    const edit=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers .yaya-detail-market-row .yaya-detail-document-edit')
      :null;
    if(edit)rememberContext(edit);
  },true);

  function contextFromModal(modal){
    if(!modal)return {kind:'',id:''};

    // Pour les devis 2+, l'id exact est déjà présent dans le onclick du bouton Enregistrer.
    const save=[...modal.querySelectorAll('button')].find(function(button){
      return /saveAvenantComplet\s*\(/.test(String(button.getAttribute('onclick')||''));
    });
    if(save){
      const raw=String(save.getAttribute('onclick')||'');
      const match=raw.match(/saveAvenantComplet\s*\(\s*['\"]([^'\"]+)['\"]\s*\)/);
      if(match&&match[1])return {kind:'avenant',id:String(match[1])};
    }

    // Pour le devis principal, la fiche chantier ouverte fournit l'id fiable.
    if(modal.querySelector('#edNom,#edNum,#edMt')){
      try{
        if(typeof focusChantier!=='undefined'&&focusChantier){
          return {kind:'main',id:String(focusChantier)};
        }
      }catch(e){}
    }

    return {kind:'',id:''};
  }

  function resolveContext(modal){
    // La modale est prioritaire : elle évite de réutiliser un ancien devis mémorisé.
    const fromModal=contextFromModal(modal);
    if(fromModal.id){
      current=fromModal;
      return fromModal;
    }
    if(current.id)return current;
    return {kind:'',id:''};
  }

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    ['yaya-devis-edit-import-style-v1','yaya-devis-edit-import-style-v2','yaya-devis-edit-import-style-v3','yaya-devis-edit-import-style-v4'].forEach(function(id){
      const old=document.getElementById(id);if(old)old.remove();
    });

    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .yaya-devis-fast-modal .yaya-devis-fast-foot{
        display:grid!important;
        grid-template-columns:repeat(3,minmax(0,1fr))!important;
        align-items:stretch!important;
        gap:10px!important;
      }
      .yaya-devis-fast-modal .yaya-devis-fast-foot > button{
        width:100%!important;
        min-width:0!important;
        min-height:44px!important;
        height:44px!important;
        margin:0!important;
      }
      .yaya-devis-fast-modal #${BUTTON_ID}{
        width:100%!important;
        min-width:0!important;
        min-height:44px!important;
        height:44px!important;
        margin:0!important;
        padding:0 12px!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        gap:7px!important;
        border:1px solid #249457!important;
        border-radius:8px!important;
        background:#249457!important;
        color:#fff!important;
        font-family:inherit!important;
        font-size:13px!important;
        font-weight:750!important;
        line-height:1!important;
        white-space:nowrap!important;
        cursor:pointer!important;
        box-shadow:none!important;
      }
      .yaya-devis-fast-modal #${BUTTON_ID}:hover{background:#1f814c!important;border-color:#1f814c!important}
      .yaya-devis-fast-modal #${BUTTON_ID}:disabled{opacity:.72!important;cursor:default!important}
      .yaya-devis-fast-modal #${STATUS_ID}{
        display:none;
        margin:10px 0 0!important;
        padding:8px 10px!important;
        border-radius:7px!important;
        background:#eef9f2!important;
        border:1px solid #b9dfc6!important;
        color:#237443!important;
        font-size:12px!important;
        font-weight:700!important;
      }
      .yaya-devis-fast-modal #${STATUS_ID}[data-state="error"]{
        display:block!important;
        background:#fff2f2!important;
        border-color:#efb7b7!important;
        color:#b42318!important;
      }
      .yaya-devis-fast-modal #${STATUS_ID}[data-state="success"]{display:block!important}
      @media(max-width:640px){
        .yaya-devis-fast-modal .yaya-devis-fast-foot{gap:8px!important;}
        .yaya-devis-fast-modal .yaya-devis-fast-foot > button,
        .yaya-devis-fast-modal #${BUTTON_ID}{
          min-height:44px!important;
          height:44px!important;
          padding:0 8px!important;
          font-size:12px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function findFooter(modal){
    return modal.querySelector('.yaya-devis-fast-foot,.mfoot')||null;
  }

  function setStatus(modal,state,message){
    if(!modal)return;
    let status=modal.querySelector('#'+STATUS_ID);
    if(!status){
      status=document.createElement('div');
      status.id=STATUS_ID;
      const footer=findFooter(modal);
      if(footer)footer.insertAdjacentElement('beforebegin',status);
      else modal.appendChild(status);
    }
    status.dataset.state=state||'';
    status.textContent=message||'';
    status.style.display=message?'block':'none';
  }

  function buttonState(state,detail){
    const button=document.getElementById(BUTTON_ID);
    if(!button)return;
    const modal=button.closest('.yaya-devis-fast-modal');
    const ctx=resolveContext(modal);

    // Ignore les événements d'un autre devis éventuellement encore en traitement.
    if(detail&&detail.id&&ctx.id&&String(detail.id)!==String(ctx.id))return;

    if(state==='start'){
      uploadSucceeded=false;
      button.disabled=true;
      button.textContent='⏳ Import en cours…';
      setStatus(modal,'','');
      return;
    }
    if(state==='success'){
      uploadSucceeded=true;
      button.disabled=false;
      button.textContent='✓ Pièce importée';
      setStatus(modal,'success','✓ Pièce jointe enregistrée sur ce devis');
      return;
    }
    if(state==='error'){
      uploadSucceeded=false;
      button.disabled=false;
      button.textContent='↻ Réessayer';
      setStatus(modal,'error',String(detail&&detail.message||'Import impossible'));
      return;
    }
    if(state==='end'){
      if(!uploadSucceeded){
        button.disabled=false;
        if(button.textContent.indexOf('Réessayer')<0)button.textContent='📎 Importer';
      }
    }
  }

  window.addEventListener('yaya:quote-upload-state',function(event){
    const detail=event&&event.detail||{};
    buttonState(String(detail.state||''),detail);
  });

  function ensureButton(){
    ensureStyle();

    const modal=document.querySelector('.yaya-devis-fast-modal');
    if(!modal)return;
    const footer=findFooter(modal);
    if(!footer)return;

    const ctx=resolveContext(modal);
    if(ctx.id){
      modal.dataset.yayaQuoteKind=ctx.kind;
      modal.dataset.yayaQuoteId=ctx.id;
    }

    let button=modal.querySelector('#'+BUTTON_ID);
    if(!button){
      uploadSucceeded=false;
      button=document.createElement('button');
      button.id=BUTTON_ID;
      button.type='button';
      button.textContent='📎 Importer';
      button.title='Importer un devis PDF ou une image';
      button.setAttribute('aria-label','Importer un devis');

      button.addEventListener('click',function(event){
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        if(button.disabled)return;

        const fresh=resolveContext(modal);
        if(!fresh.id){
          toastSafe('Devis introuvable',true);
          return;
        }

        current=fresh;
        const type=fresh.kind==='avenant'?'avenant':'devis';
        const importer=typeof window.remplacerPJ==='function'?window.remplacerPJ:null;
        if(importer){
          importer(type,fresh.id);
        }else{
          toastSafe('Import du devis indisponible',true);
          setStatus(modal,'error','Import du devis indisponible');
        }
      });
    }

    const save=footer.querySelector('#yayaFastSave')||[...footer.querySelectorAll('button')].find(function(item){
      return /enregistrer/i.test(String(item.textContent||''));
    });

    if(button.parentElement!==footer){
      if(save)footer.insertBefore(button,save);
      else footer.insertBefore(button,footer.firstChild);
    }else if(save&&button.nextElementSibling!==save){
      footer.insertBefore(button,save);
    }
  }

  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(function(){
      scheduled=false;
      ensureButton();
    });
  }

  schedule();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();