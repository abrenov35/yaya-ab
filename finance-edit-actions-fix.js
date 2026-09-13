(function(){
  'use strict';

  if(window.__yayaFinanceEditActionsV6)return;
  window.__yayaFinanceEditActionsV6=true;

  const STYLE_ID='yaya-finance-edit-actions-v6';
  let lastAchatId='';

  function txt(v){return String(v==null?'':v).trim();}
  function toastSafe(message,isError){
    try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}
  }

  function idFromOnclick(raw,name){
    const re=new RegExp(name+'\\s*\\(\\s*[\\\'\"]([^\\\'\"]+)[\\\'\"]');
    const m=String(raw||'').match(re);
    return m&&m[1]?String(m[1]):'';
  }

  function matchAchatFromFields(modal){
    try{
      if(typeof S==='undefined'||!S||!Array.isArray(S.achats))return '';
      const ch=txt(modal.querySelector('#eaCh')&&modal.querySelector('#eaCh').value);
      const type=txt(modal.querySelector('#eaType')&&modal.querySelector('#eaType').value);
      const four=txt(modal.querySelector('#eaFour')&&modal.querySelector('#eaFour').value);
      const des=txt(modal.querySelector('#eaDes')&&modal.querySelector('#eaDes').value);
      const date=txt(modal.querySelector('#eaDate')&&modal.querySelector('#eaDate').value);
      const mt=Number((modal.querySelector('#eaMt')&&modal.querySelector('#eaMt').value)||0);
      const found=S.achats.filter(function(a){
        if(ch&&String(a&&a.chantierId||'')!==ch)return false;
        if(type&&String(a&&a.typeDoc||'')!==type)return false;
        if(four&&txt(a&&a.fournisseur)!==four)return false;
        if(des&&txt(a&&a.designation)!==des)return false;
        if(date&&String(a&&a.date||'').slice(0,10)!==date)return false;
        if(Number.isFinite(mt)&&Math.abs((Number(a&&a.montantHT)||0)-mt)>.01)return false;
        return true;
      });
      return found.length===1?String(found[0].id||''):'';
    }catch(e){return '';}
  }

  function resolveId(modal,save){
    let id=txt(modal&&modal.dataset&&modal.dataset.yayaAchatId);
    if(!id&&save)id=idFromOnclick(save.getAttribute('onclick'),'saveAchat');
    if(!id&&lastAchatId)id=lastAchatId;
    if(!id)id=matchAchatFromFields(modal);
    if(id&&modal)modal.dataset.yayaAchatId=id;
    if(id)lastAchatId=id;
    return id;
  }

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .achat-edit-modal .yaya-finance-edit-actions{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:10px!important;margin-top:18px!important;align-items:stretch!important}
      .achat-edit-modal .yaya-finance-edit-actions>button{width:100%!important;min-width:0!important;min-height:46px!important;margin:0!important;border-radius:9px!important;font-weight:750!important;cursor:pointer!important;pointer-events:auto!important}
      .achat-edit-modal .yaya-achat-edit-import{display:inline-flex!important;align-items:center!important;justify-content:center!important;background:#249457!important;color:#fff!important;border:1px solid #249457!important}
      .achat-edit-modal .yaya-achat-single-save{display:inline-flex!important;align-items:center!important;justify-content:center!important;background:#064b8e!important;color:#fff!important;border:1px solid #064b8e!important}
      .achat-edit-modal .yaya-achat-edit-delete{display:inline-flex!important;align-items:center!important;justify-content:center!important;background:#fff3f3!important;color:#b42318!important;border:1px solid #efb4b4!important}
      .achat-edit-modal .yaya-achat-edit-close{margin-left:auto!important;width:40px!important;height:40px!important;padding:0!important;border:1px solid #d7dee8!important;border-radius:10px!important;background:#fff!important;color:#697586!important;font-size:24px!important;line-height:1!important;cursor:pointer!important;pointer-events:auto!important}
      @media(max-width:640px){.achat-edit-modal .yaya-finance-edit-actions{gap:8px!important}.achat-edit-modal .yaya-finance-edit-actions>button{min-height:44px!important;font-size:12px!important;padding:0 8px!important}}
    `;
    document.head.appendChild(style);
  }

  function closeFinanceModal(modal){
    try{
      if(typeof closeModal==='function')closeModal();
      else if(modal&&modal.closest('.overlay'))modal.closest('.overlay').remove();
    }catch(e){
      try{if(modal&&modal.closest('.overlay'))modal.closest('.overlay').remove();}catch(_){}
    }
  }

  function ensureClose(modal){
    const heading=modal.querySelector('h5');
    if(!heading)return;
    let close=heading.querySelector('.yaya-achat-edit-close');
    if(close)return;
    heading.querySelectorAll('button,[role="button"]').forEach(function(button){button.remove();});
    heading.textContent="Modifier l'achat";
    close=document.createElement('button');
    close.type='button';
    close.className='yaya-achat-edit-close';
    close.textContent='×';
    close.title='Fermer';
    close.setAttribute('aria-label','Fermer');
    close.onclick=function(event){
      if(event){event.preventDefault();event.stopPropagation();}
      closeFinanceModal(modal);
    };
    heading.appendChild(close);
  }

  window.yayaAchatImportButton=function(button){
    const modal=button&&button.closest?button.closest('.modal'):null;
    const save=modal&&modal.querySelector('.yaya-achat-single-save');
    const id=txt(button&&button.dataset&&button.dataset.achatId)||resolveId(modal,save);
    if(!id){toastSafe('Impossible d’identifier cet achat',true);return false;}
    try{
      if(typeof ajouterPJachat==='function')ajouterPJachat(id);
      else if(typeof remplacerPJ==='function')remplacerPJ('achat',id);
      else throw new Error('import indisponible');
    }catch(err){
      toastSafe('Import impossible : '+String(err&&err.message||err),true);
    }
    return false;
  };

  window.yayaAchatDeleteButton=async function(button){
    const modal=button&&button.closest?button.closest('.modal'):null;
    const save=modal&&modal.querySelector('.yaya-achat-single-save');
    const id=txt(button&&button.dataset&&button.dataset.achatId)||resolveId(modal,save);
    if(!id){toastSafe('Impossible d’identifier cet achat',true);return false;}
    try{
      if(typeof delAchat!=='function')throw new Error('suppression indisponible');
      await delAchat(id);
    }catch(err){
      toastSafe('Suppression impossible : '+String(err&&err.message||err),true);
    }
    return false;
  };

  function ensureActions(modal){
    if(!modal||!modal.querySelector('#eaCh')||!modal.querySelector('#eaType'))return;

    const type=modal.querySelector('#eaType');
    let typeText=String(type.value||'');
    if(type.options&&type.selectedIndex>=0&&type.options[type.selectedIndex])typeText+=' '+String(type.options[type.selectedIndex].text||'');
    if(/sous[-\s]?trait/i.test(typeText))return;

    ensureStyle();
    modal.classList.add('yaya-finance-edit-modal','achat-edit-modal');
    ensureClose(modal);

    const save=Array.from(modal.querySelectorAll('button')).find(function(button){
      const raw=String(button.getAttribute('onclick')||'');
      const label=txt(button.textContent).toLowerCase();
      return /saveAchat/.test(raw)||label==='enregistrer'||button.classList.contains('yaya-achat-single-save');
    });
    if(!save)return;

    save.classList.add('yaya-achat-single-save');
    save.textContent='Enregistrer';
    save.title='Enregistrer';
    save.setAttribute('aria-label','Enregistrer');

    const id=resolveId(modal,save);
    const footer=save.parentElement;
    if(!footer)return;
    footer.classList.add('yaya-finance-edit-actions');

    Array.from(footer.querySelectorAll('button')).forEach(function(button){
      if(button===save)return;
      const label=txt(button.textContent).toLowerCase();
      if(label==='annuler')button.remove();
    });

    let importer=footer.querySelector('.yaya-achat-edit-import');
    if(!importer){
      importer=document.createElement('button');
      importer.type='button';
      importer.className='yaya-achat-edit-import';
      importer.textContent='📎 Importer';
      footer.insertBefore(importer,save);
    }
    importer.dataset.achatId=id||'';
    importer.title='Changer la pièce jointe';
    importer.setAttribute('aria-label','Changer la pièce jointe');
    importer.setAttribute('onclick','return window.yayaAchatImportButton(this)');

    let del=footer.querySelector('.yaya-achat-edit-delete');
    if(!del){
      del=document.createElement('button');
      del.type='button';
      del.className='yaya-achat-edit-delete';
      del.textContent='Supprimer';
      save.insertAdjacentElement('afterend',del);
    }
    del.dataset.achatId=id||'';
    del.title='Supprimer cet achat';
    del.setAttribute('aria-label','Supprimer cet achat');
    del.setAttribute('onclick','return window.yayaAchatDeleteButton(this)');

    if(importer.nextElementSibling!==save)footer.insertBefore(importer,save);
    if(save.nextElementSibling!==del)save.insertAdjacentElement('afterend',del);
  }

  function rememberEditTarget(target){
    const edit=target&&target.closest?target.closest('[onclick*="editAchat("],.yaya-detail-charge-edit[data-achat-id]'):null;
    if(!edit)return;
    let id=txt(edit.dataset&&edit.dataset.achatId);
    if(!id)id=idFromOnclick(edit.getAttribute('onclick'),'editAchat');
    if(id)lastAchatId=id;
  }

  document.addEventListener('pointerdown',function(e){rememberEditTarget(e.target);},true);
  document.addEventListener('click',function(e){rememberEditTarget(e.target);},true);

  function wrapEditAchat(){
    try{
      const original=window.editAchat;
      if(typeof original!=='function'||original.__yayaFinanceV6Wrapped)return;
      const wrapped=function(id){
        if(id)lastAchatId=String(id);
        const result=original.apply(this,arguments);
        setTimeout(apply,0);
        return result;
      };
      wrapped.__yayaFinanceV6Wrapped=true;
      window.editAchat=wrapped;
      try{editAchat=wrapped;}catch(e){}
    }catch(e){}
  }

  function apply(){
    wrapEditAchat();
    const root=document.getElementById('modalRoot');
    if(!root)return;
    root.querySelectorAll('.overlay .modal').forEach(ensureActions);
  }

  apply();

  const root=document.getElementById('modalRoot');
  if(root){
    let raf=0;
    new MutationObserver(function(){
      if(raf)return;
      raf=requestAnimationFrame(function(){raf=0;apply();});
    }).observe(root,{childList:true,subtree:true});
  }

  window.addEventListener('yaya:data-refreshed',apply);
  setInterval(function(){
    const root=document.getElementById('modalRoot');
    if(root&&root.querySelector('#eaCh'))apply();
  },180);
})();
