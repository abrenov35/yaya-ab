(function(){
  'use strict';

  if(window.__yayaFinanceEditActionsV3)return;
  window.__yayaFinanceEditActionsV3=true;

  const STYLE_ID='yaya-finance-edit-actions-v3';
  let lastAchatId='';

  function txt(v){return String(v==null?'':v).trim();}
  function toastSafe(message,isError){
    try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}
  }

  function isFinanceEditModal(modal){
    if(!modal)return false;
    return modal.classList.contains('yaya-finance-edit-modal')
      || modal.classList.contains('achat-edit-modal')
      || modal.classList.contains('charge-edit-modal')
      || !!modal.querySelector('#eaCh,#eaType,#eaFour,#eaDes,#eaDate,#eaMt');
  }

  function isCharge(modal){
    if(!modal)return false;
    if(modal.classList.contains('charge-edit-modal'))return true;
    const type=modal.querySelector('#eaType');
    let value=type?String(type.value||''):'';
    if(type&&type.options&&type.selectedIndex>=0&&type.options[type.selectedIndex]){
      value+=' '+String(type.options[type.selectedIndex].text||'');
    }
    return /sous[-\s]?trait/i.test(value);
  }

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .achat-edit-modal .yaya-finance-edit-actions{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:10px!important;margin-top:18px!important;align-items:stretch!important}
      .achat-edit-modal .yaya-finance-edit-actions>button{width:100%!important;min-width:0!important;min-height:46px!important;margin:0!important;border-radius:9px!important;font-weight:750!important;cursor:pointer!important;pointer-events:auto!important}
      .achat-edit-modal .yaya-achat-edit-import{background:#249457!important;color:#fff!important;border:1px solid #249457!important}
      .achat-edit-modal .yaya-achat-edit-import:hover{background:#1f814c!important;border-color:#1f814c!important}
      .achat-edit-modal .yaya-achat-single-save{background:#064b8e!important;color:#fff!important;border:1px solid #064b8e!important}
      .achat-edit-modal .yaya-achat-edit-delete{background:#fff3f3!important;color:#b42318!important;border:1px solid #efb4b4!important}
      .achat-edit-modal .yaya-achat-edit-delete:hover{background:#ffe7e7!important;border-color:#e78d8d!important}
      .achat-edit-modal .yaya-achat-edit-close{margin-left:auto!important;width:40px!important;height:40px!important;padding:0!important;border:1px solid #d7dee8!important;border-radius:10px!important;background:#fff!important;color:#697586!important;font-size:24px!important;line-height:1!important;cursor:pointer!important}
      @media(max-width:640px){.achat-edit-modal .yaya-finance-edit-actions{gap:8px!important}.achat-edit-modal .yaya-finance-edit-actions>button{min-height:44px!important;font-size:12px!important;padding:0 8px!important}}
    `;
    document.head.appendChild(style);
  }

  function idFromOnclick(raw,name){
    const re=new RegExp(name+'\\s*\\(\\s*[\\\'\"]([^\\\'\"]+)[\\\'\"]');
    const m=String(raw||'').match(re);
    return m&&m[1]?String(m[1]):'';
  }

  function rememberFromElement(el){
    if(!el)return '';
    let id=txt(el.dataset&&el.dataset.achatId);
    if(!id)id=idFromOnclick(el.getAttribute&&el.getAttribute('onclick'),'editAchat');
    if(id)lastAchatId=id;
    return id;
  }

  function matchAchatFromFields(modal){
    try{
      if(typeof S==='undefined'||!S||!Array.isArray(S.achats))return '';
      const ch=txt(modal.querySelector('#eaCh')?.value);
      const type=txt(modal.querySelector('#eaType')?.value);
      const four=txt(modal.querySelector('#eaFour')?.value);
      const des=txt(modal.querySelector('#eaDes')?.value);
      const date=txt(modal.querySelector('#eaDate')?.value);
      const mt=Number(modal.querySelector('#eaMt')?.value||0);
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

  function resolveAchatId(modal,save){
    let id=txt(modal&&modal.dataset&&modal.dataset.yayaAchatId);
    if(!id&&save)id=idFromOnclick(save.getAttribute('onclick'),'saveAchat');
    if(!id&&lastAchatId)id=lastAchatId;
    if(!id)id=matchAchatFromFields(modal);
    if(id&&modal)modal.dataset.yayaAchatId=id;
    return id;
  }

  function closeFinanceModal(modal){
    try{
      if(typeof closeModal==='function')closeModal();
      else modal.closest('.overlay')?.remove();
    }catch(e){modal.closest('.overlay')?.remove();}
  }

  function patchHeading(modal,charge){
    const heading=modal.querySelector('h5');
    if(!heading)return;
    heading.querySelectorAll('button,[role="button"]').forEach(function(button){button.remove();});
    if(charge){
      if(String(heading.textContent||'').trim()!=='Modifier la charge')heading.textContent='Modifier la charge';
      return;
    }
    heading.textContent="Modifier l'achat";
    const close=document.createElement('button');
    close.type='button';
    close.className='yaya-achat-edit-close';
    close.textContent='×';
    close.title='Fermer';
    close.setAttribute('aria-label','Fermer');
    close.onclick=function(){closeFinanceModal(modal);};
    heading.appendChild(close);
  }

  function ensurePjZone(modal){
    let zone=modal.querySelector('#pj-zone');
    if(zone)return zone;
    zone=document.createElement('div');
    zone.id='pj-zone';
    zone.style.marginBottom='8px';
    zone.style.padding='8px 12px';
    zone.style.border='1.5px dashed #ddd';
    zone.style.borderRadius='10px';
    zone.style.display='none';
    const actions=modal.querySelector('.yaya-finance-edit-actions');
    if(actions)actions.insertAdjacentElement('beforebegin',zone);
    else modal.appendChild(zone);
    return zone;
  }

  async function deleteAchat(id,modal,button){
    if(!id)return;
    if(!window.confirm("Supprimer cet achat de Yaya ?\n\nLe fichier original Drive ou Dropbox sera conservé."))return;
    let before=[];
    try{
      if(typeof S==='undefined'||!S||!Array.isArray(S.achats))throw new Error('liste achats indisponible');
      before=S.achats.slice();
      const next=before.filter(function(a){return String(a&&a.id||'')!==String(id);});
      if(next.length===before.length)throw new Error('achat introuvable');
      if(button){button.disabled=true;button.textContent='Suppression…';}
      S.achats=next;
      if(typeof render==='function')render();
      closeFinanceModal(modal);
      const ok=typeof apiPost==='function'?await apiPost('setAchats',next):false;
      if(!ok)throw new Error('enregistrement impossible');
      toastSafe('Achat supprimé ✓');
    }catch(err){
      try{if(typeof S!=='undefined'&&S)S.achats=before;}catch(e){}
      try{if(typeof render==='function')render();}catch(e){}
      toastSafe('Suppression impossible : '+String(err&&err.message||err),true);
    }
  }

  function patchModal(modal){
    if(!isFinanceEditModal(modal))return;
    ensureStyle();
    modal.classList.add('yaya-finance-edit-modal');

    const charge=isCharge(modal);
    if(!charge)modal.classList.add('achat-edit-modal');

    const save=modal.querySelector('.yaya-achat-single-save')||Array.from(modal.querySelectorAll('button')).find(function(button){
      const t=String(button.textContent||'').trim();
      const raw=String(button.getAttribute('onclick')||'');
      return /saveAchat/.test(raw)||/enregistrer/i.test(t)||/enregistrer/i.test(button.title||'');
    });
    if(!save)return;

    patchHeading(modal,charge);
    save.title='Enregistrer';
    save.setAttribute('aria-label','Enregistrer');
    save.textContent='Enregistrer';
    save.classList.add('yaya-achat-single-save');

    let actions=modal.querySelector('.yaya-finance-edit-actions');
    if(!actions){
      const oldParent=save.parentElement;
      actions=document.createElement('div');
      actions.className='yaya-finance-edit-actions';
      if(oldParent)oldParent.insertAdjacentElement('afterend',actions);
      else modal.appendChild(actions);
      actions.appendChild(save);
    }else if(save.parentElement!==actions){
      actions.appendChild(save);
    }

    if(charge)return;

    actions.querySelectorAll('.yaya-finance-edit-cancel,.achat-icon-cancel').forEach(function(b){b.remove();});
    const id=resolveAchatId(modal,save);
    if(id)lastAchatId=id;

    let importer=actions.querySelector('.yaya-achat-edit-import');
    if(!importer){
      importer=document.createElement('button');
      importer.type='button';
      importer.className='yaya-achat-edit-import';
      importer.textContent='📎 Importer';
      importer.title='Changer la pièce jointe';
      importer.setAttribute('aria-label','Changer la pièce jointe');
    }
    actions.insertBefore(importer,save);

    let del=actions.querySelector('.yaya-achat-edit-delete');
    if(!del){
      del=document.createElement('button');
      del.type='button';
      del.className='yaya-achat-edit-delete';
      del.textContent='Supprimer';
      del.title='Supprimer cet achat';
      del.setAttribute('aria-label','Supprimer cet achat');
    }
    actions.appendChild(del);
  }

  document.addEventListener('click',function(e){
    const edit=e.target&&e.target.closest?e.target.closest('[onclick*="editAchat("],#pane-chantiers .yaya-detail-charge-edit'):null;
    if(edit)rememberFromElement(edit);
  },true);

  document.addEventListener('click',function(e){
    const importer=e.target&&e.target.closest?e.target.closest('.achat-edit-modal .yaya-achat-edit-import'):null;
    if(!importer)return;
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    const modal=importer.closest('.achat-edit-modal');
    const save=modal&&modal.querySelector('.yaya-achat-single-save');
    const id=resolveAchatId(modal,save);
    if(!id){toastSafe('Impossible d’identifier cet achat',true);return;}
    lastAchatId=id;
    const zone=ensurePjZone(modal);
    zone.style.removeProperty('display');
    zone.removeAttribute('aria-hidden');
    if(typeof remplacerPJ==='function')remplacerPJ('achat',id);
    else if(typeof ajouterPJachat==='function')ajouterPJachat(id);
    else toastSafe('Import de pièce jointe indisponible',true);
  },true);

  document.addEventListener('click',function(e){
    const button=e.target&&e.target.closest?e.target.closest('.achat-edit-modal .yaya-achat-edit-delete'):null;
    if(!button)return;
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    const modal=button.closest('.achat-edit-modal');
    const save=modal&&modal.querySelector('.yaya-achat-single-save');
    const id=resolveAchatId(modal,save);
    if(!id){toastSafe('Impossible d’identifier cet achat',true);return;}
    deleteAchat(id,modal,button);
  },true);

  function wrapEditAchat(){
    try{
      const original=window.editAchat;
      if(typeof original!=='function'||original.__yayaFinanceV3Wrapped)return;
      const wrapped=function(id){
        if(id)lastAchatId=String(id);
        return original.apply(this,arguments);
      };
      wrapped.__yayaFinanceV3Wrapped=true;
      window.editAchat=wrapped;
      try{editAchat=wrapped;}catch(e){}
    }catch(e){}
  }

  function apply(){
    wrapEditAchat();
    const root=document.getElementById('modalRoot');
    if(!root)return;
    root.querySelectorAll('.overlay .modal').forEach(patchModal);
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
  setTimeout(apply,0);
  setTimeout(apply,250);
})();
