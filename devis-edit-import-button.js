(function(){
  'use strict';

  const BUTTON_ID='yayaDevisEditImportBtn';
  const STYLE_ID='yaya-devis-edit-import-style-v2';
  let current={kind:'',id:''};
  let apiPostPatched=false;

  function toastSafe(message,isError){
    try{
      if(typeof toast==='function')toast(message,!!isError);
    }catch(e){}
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

  function ensureApiPostCompatibility(){
    if(apiPostPatched)return true;

    let original=null;
    try{
      original=window.apiPost || (typeof apiPost==='function'?apiPost:null);
    }catch(e){
      original=window.apiPost||null;
    }

    if(typeof original!=='function')return false;

    const patched=async function(action,data){
      if(action==='updateChantier'){
        try{
          if(typeof S!=='undefined'&&Array.isArray(S.chantiers)){
            return await original('setChantiers',S.chantiers);
          }
        }catch(e){}
      }
      return original(action,data);
    };

    window.apiPost=patched;
    try{apiPost=patched;}catch(e){}
    apiPostPatched=true;
    return true;
  }

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;

    const old=document.getElementById('yaya-devis-edit-import-style-v1');
    if(old)old.remove();

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
      .yaya-devis-fast-modal #${BUTTON_ID}:hover{
        background:#1f814c!important;
        border-color:#1f814c!important;
      }
      .yaya-devis-fast-modal #${BUTTON_ID}:disabled{
        opacity:.55!important;
        cursor:default!important;
      }
      @media(max-width:640px){
        .yaya-devis-fast-modal #${BUTTON_ID}{
          padding:0 13px!important;
          font-size:12px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function findFooter(modal){
    return modal.querySelector('.yaya-devis-fast-foot,.mfoot')||null;
  }

  function watchSelectedFile(button){
    setTimeout(function(){
      const inputs=[...document.querySelectorAll('body > input[type="file"]')];
      const input=inputs.length?inputs[inputs.length-1]:null;
      if(!input||input.dataset.yayaImportFeedback==='1')return;
      input.dataset.yayaImportFeedback='1';
      input.addEventListener('change',function(){
        const file=input.files&&input.files[0];
        if(!file)return;
        button.disabled=true;
        button.textContent='⏳ Import en cours…';
        setTimeout(function(){
          if(button&&button.isConnected){
            button.disabled=false;
            button.textContent='📎 Importer';
          }
        },32000);
      },{once:true});
    },0);
  }

  function ensureButton(){
    ensureStyle();
    ensureApiPostCompatibility();

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

        const ctx=resolveContext(modal);
        if(!ctx.id){
          toastSafe('Devis introuvable',true);
          return;
        }

        if(!ensureApiPostCompatibility()){
          toastSafe('Enregistrement Yaya indisponible',true);
          return;
        }

        const type=ctx.kind==='avenant'?'avenant':'devis';

        if(typeof remplacerPJ==='function'){
          remplacerPJ(type,ctx.id);
          watchSelectedFile(button);
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
