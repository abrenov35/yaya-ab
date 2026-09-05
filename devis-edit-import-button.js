(function(){
  'use strict';

  if(window.__yayaDevisEditImportButtonV3)return;
  window.__yayaDevisEditImportButtonV3=true;

  const BUTTON_ID='yayaDevisEditImportBtn';
  const STYLE_ID='yaya-devis-edit-import-style-v3';
  let current={kind:'',id:''};

  function toastSafe(message,isError){
    try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}
  }

  function rememberContext(button){
    if(!button)return;
    current={
      kind:String(button.dataset.kind||''),
      id:String(button.dataset.rowId||'')
    };
  }

  document.addEventListener('click',function(event){
    const edit=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers .yaya-detail-market-row .yaya-detail-document-edit')
      :null;
    if(edit)rememberContext(edit);
  },true);

  function resolveContext(modal){
    if(current.id)return current;
    if(modal&&modal.querySelector('#edNom')){
      try{
        if(typeof focusChantier!=='undefined'&&focusChantier){
          return {kind:'main',id:String(focusChantier)};
        }
      }catch(e){}
    }
    return {kind:'',id:''};
  }

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    ['yaya-devis-edit-import-style-v1','yaya-devis-edit-import-style-v2'].forEach(function(id){
      const old=document.getElementById(id);if(old)old.remove();
    });

    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .yaya-devis-fast-modal #${BUTTON_ID}{
        min-height:42px!important;
        height:42px!important;
        margin:0!important;
        padding:0 18px!important;
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
      .yaya-devis-fast-modal #${BUTTON_ID}:disabled{opacity:.62!important;cursor:default!important}
      @media(max-width:640px){
        .yaya-devis-fast-modal #${BUTTON_ID}{padding:0 13px!important;font-size:12px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function findFooter(modal){
    return modal.querySelector('.yaya-devis-fast-foot,.mfoot')||null;
  }

  function buttonState(state){
    const button=document.getElementById(BUTTON_ID);
    if(!button)return;

    if(state==='start'){
      button.disabled=true;
      button.textContent='⏳ Import en cours…';
      return;
    }
    if(state==='success'){
      button.disabled=true;
      button.textContent='✓ Importé';
      return;
    }
    if(state==='error'){
      button.disabled=false;
      button.textContent='↻ Réessayer';
      return;
    }
    if(state==='end'){
      setTimeout(function(){
        const fresh=document.getElementById(BUTTON_ID);
        if(fresh){fresh.disabled=false;fresh.textContent='📎 Importer';}
      },900);
    }
  }

  window.addEventListener('yaya:quote-upload-state',function(event){
    const detail=event&&event.detail||{};
    buttonState(String(detail.state||''));
  });

  function ensureButton(){
    ensureStyle();

    const modal=document.querySelector('.yaya-devis-fast-modal');
    if(!modal)return;
    const footer=findFooter(modal);
    if(!footer)return;

    let button=modal.querySelector('#'+BUTTON_ID);
    if(!button){
      button=document.createElement('button');
      button.id=BUTTON_ID;
      button.type='button';
      button.textContent='📎 Importer';
      button.title='Importer un devis PDF ou une image';
      button.setAttribute('aria-label','Importer un devis');

      button.addEventListener('click',function(event){
        event.preventDefault();
        event.stopPropagation();
        if(button.disabled)return;

        const ctx=resolveContext(modal);
        if(!ctx.id){
          toastSafe('Devis introuvable',true);
          return;
        }

        const type=ctx.kind==='avenant'?'avenant':'devis';
        if(typeof remplacerPJ==='function'){
          remplacerPJ(type,ctx.id);
        }else{
          toastSafe('Import du devis indisponible',true);
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