(function(){
  'use strict';

  if(window.__yayaFinanceEditActionsV7)return;
  window.__yayaFinanceEditActionsV7=true;

  let lastAchatId='';
  const STYLE_ID='yaya-finance-edit-actions-v7';

  function txt(v){return String(v==null?'':v).trim();}
  function toastSafe(message,isError){
    try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}
  }

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .achat-edit-modal .yaya-finance-edit-actions{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:10px!important;align-items:stretch!important;margin-top:18px!important;width:100%!important;overflow:visible!important}
      .achat-edit-modal .yaya-finance-edit-actions>button{width:100%!important;min-width:0!important;min-height:46px!important;margin:0!important;padding:0 12px!important;border-radius:9px!important;font-weight:750!important;cursor:pointer!important;pointer-events:auto!important;display:inline-flex!important;visibility:visible!important;opacity:1!important;align-items:center!important;justify-content:center!important;position:relative!important;transform:none!important}
      .achat-edit-modal .yaya-achat-edit-import{background:#249457!important;color:#fff!important;border:1px solid #249457!important}
      .achat-edit-modal .yaya-achat-single-save{background:#064b8e!important;color:#fff!important;border:1px solid #064b8e!important}
      .achat-edit-modal .yaya-achat-edit-delete{background:#fff3f3!important;color:#b42318!important;border:1px solid #efb4b4!important}
      @media(max-width:640px){.achat-edit-modal .yaya-finance-edit-actions{gap:8px!important}.achat-edit-modal .yaya-finance-edit-actions>button{min-height:44px!important;font-size:12px!important;padding:0 8px!important}}
    `;
    document.head.appendChild(style);
  }

  function idFromOnclick(raw,name){
    const m=String(raw||'').match(new RegExp(name+'\\s*\\(\\s*[\\\'\"]([^\\\'\"]+)[\\\'\"]'));
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

  function resolveAchatId(modal,btn){
    let id=txt(btn&&btn.dataset&&btn.dataset.achatId);
    if(!id&&modal)id=txt(modal.dataset&&modal.dataset.yayaAchatId);
    if(!id&&modal){
      const save=Array.from(modal.querySelectorAll('button')).find(function(b){
        return /saveAchat/.test(String(b.getAttribute('onclick')||''));
      });
      if(save)id=idFromOnclick(save.getAttribute('onclick'),'saveAchat');
    }
    if(!id&&lastAchatId)id=lastAchatId;
    if(!id&&modal)id=matchAchatFromFields(modal);
    if(id){
      lastAchatId=id;
      if(modal)modal.dataset.yayaAchatId=id;
      if(btn)btn.dataset.achatId=id;
    }
    return id;
  }

  window.yayaAchatImportButton=function(btn){
    const modal=btn&&btn.closest?btn.closest('.modal'):null;
    const id=resolveAchatId(modal,btn);
    if(!id){toastSafe('Impossible d’identifier cet achat',true);return false;}
    try{
      if(typeof ajouterPJachat==='function')ajouterPJachat(id);
      else if(typeof remplacerPJ==='function')remplacerPJ('achat',id);
      else toastSafe('Import de pièce jointe indisponible',true);
    }catch(err){
      toastSafe('Import impossible : '+String(err&&err.message||err),true);
    }
    return false;
  };

  window.yayaAchatDeleteButton=function(btn){
    const modal=btn&&btn.closest?btn.closest('.modal'):null;
    const id=resolveAchatId(modal,btn);
    if(!id){toastSafe('Impossible d’identifier cet achat',true);return false;}
    try{
      if(typeof delAchat!=='function')throw new Error('suppression indisponible');
      Promise.resolve(delAchat(id)).catch(function(err){
        toastSafe('Suppression impossible : '+String(err&&err.message||err),true);
      });
    }catch(err){
      toastSafe('Suppression impossible : '+String(err&&err.message||err),true);
    }
    return false;
  };

  function wireButton(btn,type){
    if(!btn)return;
    btn.type='button';
    btn.style.pointerEvents='auto';
    if(type==='import'){
      btn.setAttribute('onclick','return window.yayaAchatImportButton(this)');
      btn.onclick=function(){return window.yayaAchatImportButton(this);};
    }else{
      btn.setAttribute('onclick','return window.yayaAchatDeleteButton(this)');
      btn.onclick=function(){return window.yayaAchatDeleteButton(this);};
    }
  }

  function ensureModal(modal){
    if(!modal||!modal.querySelector('#eaCh'))return;

    ensureStyle();
    modal.classList.add('achat-edit-modal','yaya-finance-edit-modal');

    const save=Array.from(modal.querySelectorAll('button')).find(function(b){
      const label=txt(b.textContent);
      const raw=String(b.getAttribute('onclick')||'');
      return /saveAchat/.test(raw)||/^Enregistrer$/i.test(label)||b.classList.contains('yaya-achat-single-save');
    });
    if(!save)return;

    const id=resolveAchatId(modal,save);
    save.classList.add('yaya-achat-single-save');
    save.textContent='Enregistrer';

    let foot=save.closest('.yaya-finance-edit-actions')||save.closest('.mfoot')||save.parentElement;
    if(!foot)return;
    foot.classList.add('yaya-finance-edit-actions');

    Array.from(foot.querySelectorAll('button')).forEach(function(b){
      if(b!==save&&/^Annuler$/i.test(txt(b.textContent)))b.remove();
    });

    let importer=foot.querySelector('.yaya-achat-edit-import');
    if(!importer){
      importer=document.createElement('button');
      importer.className='yaya-achat-edit-import';
      importer.textContent='📎 Importer';
      importer.title='Changer la pièce jointe';
      importer.setAttribute('aria-label','Changer la pièce jointe');
      foot.insertBefore(importer,save);
    }

    let del=foot.querySelector('.yaya-achat-edit-delete');
    if(!del){
      del=document.createElement('button');
      del.className='yaya-achat-edit-delete';
      del.textContent='Supprimer';
      del.title='Supprimer cet achat';
      del.setAttribute('aria-label','Supprimer cet achat');
      foot.appendChild(del);
    }

    wireButton(importer,'import');
    wireButton(del,'delete');

    if(id){
      importer.dataset.achatId=id;
      del.dataset.achatId=id;
    }
  }

  function apply(){
    const root=document.getElementById('modalRoot');
    if(!root)return;
    root.querySelectorAll('.overlay .modal').forEach(ensureModal);
  }

  document.addEventListener('click',function(e){
    const importBtn=e.target&&e.target.closest?e.target.closest('.yaya-achat-edit-import'):null;
    if(importBtn){
      e.preventDefault();
      e.stopPropagation();
      if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
      window.yayaAchatImportButton(importBtn);
      return;
    }
    const delBtn=e.target&&e.target.closest?e.target.closest('.yaya-achat-edit-delete'):null;
    if(delBtn){
      e.preventDefault();
      e.stopPropagation();
      if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
      window.yayaAchatDeleteButton(delBtn);
      return;
    }
    const edit=e.target&&e.target.closest?e.target.closest('[onclick*="editAchat("]'):null;
    if(edit){
      const id=idFromOnclick(edit.getAttribute('onclick'),'editAchat');
      if(id)lastAchatId=id;
      setTimeout(apply,0);
      setTimeout(apply,60);
    }
  },true);

  try{
    const original=window.editAchat;
    if(typeof original==='function'&&!original.__yayaFinanceV7Wrapped){
      const wrapped=function(id){
        if(id)lastAchatId=String(id);
        const out=original.apply(this,arguments);
        setTimeout(apply,0);
        setTimeout(apply,60);
        return out;
      };
      wrapped.__yayaFinanceV7Wrapped=true;
      window.editAchat=wrapped;
      try{editAchat=wrapped;}catch(e){}
    }
  }catch(e){}

  const root=document.getElementById('modalRoot');
  if(root){
    let raf=0;
    new MutationObserver(function(){
      if(raf)return;
      raf=requestAnimationFrame(function(){raf=0;apply();});
    }).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['onclick','class']});
  }

  apply();
  setTimeout(apply,100);
  setTimeout(apply,400);
  setTimeout(apply,1200);
})();
