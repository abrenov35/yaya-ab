(function(){
  'use strict';

  if(window.__yayaFinanceEditActionsV10)return;
  window.__yayaFinanceEditActionsV10=true;

  let lastAchatId='';
  const pendingDelete=new Set();
  const STYLE_ID='yaya-finance-edit-actions-v10';

  function txt(v){return String(v==null?'':v).trim();}
  function toastSafe(message,isError){try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}}

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .achat-edit-modal .yaya-finance-edit-actions{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;align-items:stretch!important;margin-top:18px!important;width:100%!important;overflow:visible!important}
      .achat-edit-modal .yaya-finance-edit-actions>button{width:100%!important;min-width:0!important;min-height:46px!important;margin:0!important;padding:0 12px!important;border-radius:9px!important;font-weight:750!important;cursor:pointer!important;pointer-events:auto!important;display:inline-flex!important;visibility:visible!important;opacity:1!important;align-items:center!important;justify-content:center!important;position:relative!important;transform:none!important}
      .achat-edit-modal .yaya-achat-single-save{background:#064b8e!important;color:#fff!important;border:1px solid #064b8e!important}
      .achat-edit-modal .yaya-achat-edit-delete{background:#fff3f3!important;color:#b42318!important;border:1px solid #efb4b4!important}
      .achat-edit-modal .yaya-achat-edit-delete[data-yaya-confirm-delete="1"]{background:#b42318!important;color:#fff!important;border-color:#b42318!important}
      .achat-edit-modal .yaya-achat-edit-import,.achat-edit-modal .yaya-test-import{display:none!important}
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
      const save=Array.from(modal.querySelectorAll('button')).find(function(b){return /saveAchat/.test(String(b.getAttribute('onclick')||''));});
      if(save)id=idFromOnclick(save.getAttribute('onclick'),'saveAchat');
    }
    if(!id&&lastAchatId)id=lastAchatId;
    if(!id&&modal)id=matchAchatFromFields(modal);
    if(id){lastAchatId=id;if(modal)modal.dataset.yayaAchatId=id;if(btn)btn.dataset.achatId=id;}
    return id;
  }

  function removeImporterButtons(modal,save){
    if(!modal)return;
    Array.from(modal.querySelectorAll('button')).forEach(function(b){
      if(b===save||b.classList.contains('yaya-achat-edit-delete')||b.classList.contains('yaya-achat-edit-close'))return;
      const label=txt(b.textContent);
      const title=txt(b.getAttribute('title'));
      const aria=txt(b.getAttribute('aria-label'));
      if(/importer/i.test(label)||b.classList.contains('yaya-achat-edit-import')||b.classList.contains('yaya-test-import')||/changer.*pi[eè]ce|pi[eè]ce jointe/i.test(title+' '+aria)){
        b.remove();
      }
    });
  }

  function updateCache(list){
    try{
      const raw=localStorage.getItem('YAYA_CACHE_DATA_V2');
      const cached=raw?JSON.parse(raw):{};
      cached.achats=Array.isArray(list)?list:[];
      localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(cached));
    }catch(e){}
  }

  function resetDeleteButton(btn){
    if(!btn||!document.contains(btn))return;
    btn.disabled=false;
    btn.dataset.yayaConfirmDelete='';
    btn.textContent='Supprimer';
  }

  async function deleteAchatDirect(btn,id){
    if(pendingDelete.has(id))return false;
    pendingDelete.add(id);
    btn.disabled=true;
    btn.textContent='Suppression…';

    try{
      let source=(typeof S!=='undefined'&&S&&Array.isArray(S.achats))?S.achats.slice():[];
      try{
        if(typeof apiGet==='function'){
          const fresh=await apiGet(true);
          if(fresh&&Array.isArray(fresh.achats))source=fresh.achats.slice();
        }
      }catch(e){}

      const after=source.filter(function(a){return String(a&&a.id||'')!==String(id);});
      if(after.length===source.length)throw new Error('achat introuvable');
      if(typeof API==='undefined'||!API)throw new Error('API Yaya introuvable');

      const response=await fetch(API,{
        method:'POST',
        headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({action:'setAchats',data:after})
      });
      const body=await response.text();
      let json;
      try{json=JSON.parse(body);}catch(e){throw new Error('réponse serveur invalide');}
      if(!json||!json.ok)throw new Error(json&&json.error?json.error:'suppression refusée');

      try{S.achats=after;}catch(e){}
      updateCache(after);
      try{if(typeof closeModal==='function')closeModal();}catch(e){}
      try{if(typeof render==='function')render();}catch(e){}
      try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed'));}catch(e){}
      toastSafe('Charge supprimée de Yaya — fichier conservé ✓');
      return true;
    }catch(err){
      toastSafe('Suppression impossible : '+String(err&&err.message||err),true);
      resetDeleteButton(btn);
      return false;
    }finally{
      pendingDelete.delete(id);
    }
  }

  window.yayaAchatDeleteButton=function(btn){
    const modal=btn&&btn.closest?btn.closest('.modal'):null;
    const id=resolveAchatId(modal,btn);
    if(!id){toastSafe('Impossible d’identifier cet achat',true);return false;}

    if(btn.dataset.yayaConfirmDelete!=='1'){
      btn.dataset.yayaConfirmDelete='1';
      btn.textContent='Confirmer suppression';
      clearTimeout(btn.__yayaDeleteTimer);
      btn.__yayaDeleteTimer=setTimeout(function(){resetDeleteButton(btn);},12000);
      return false;
    }

    clearTimeout(btn.__yayaDeleteTimer);
    btn.dataset.yayaConfirmDelete='';
    deleteAchatDirect(btn,id);
    return false;
  };

  function wireDelete(btn){
    if(!btn)return;
    btn.type='button';
    btn.style.pointerEvents='auto';
    btn.onclick=function(e){
      if(e){e.preventDefault();e.stopPropagation();}
      return window.yayaAchatDeleteButton(this);
    };
  }

  function ensureModal(modal){
    if(!modal||!modal.querySelector('#eaCh'))return;
    ensureStyle();
    modal.classList.add('achat-edit-modal','yaya-finance-edit-modal');

    const save=Array.from(modal.querySelectorAll('button')).find(function(b){
      const label=txt(b.textContent);
      const raw=String(b.getAttribute('onclick')||'');
      return /saveAchat/.test(raw)||/^Enregistrer$/i.test(label)||b.classList.contains('yaya-achat-single-save')||b.classList.contains('achat-icon-save');
    });
    if(!save)return;

    removeImporterButtons(modal,save);

    const id=resolveAchatId(modal,save);
    save.classList.add('yaya-achat-single-save');
    if(!save.textContent||/^[✓✔]$/.test(txt(save.textContent)))save.textContent='Enregistrer';

    let foot=save.closest('.yaya-finance-edit-actions')||save.closest('.mfoot')||save.parentElement;
    if(!foot)return;
    foot.classList.add('yaya-finance-edit-actions');

    Array.from(foot.querySelectorAll('button')).forEach(function(b){
      if(b!==save&&!b.classList.contains('yaya-achat-edit-delete')&&/^Annuler$/i.test(txt(b.textContent)))b.remove();
    });

    let del=foot.querySelector('.yaya-achat-edit-delete');
    if(!del){
      del=document.createElement('button');
      del.className='yaya-achat-edit-delete';
      del.textContent='Supprimer';
      del.title='Supprimer cet achat';
      del.setAttribute('aria-label','Supprimer cet achat');
      foot.appendChild(del);
    }

    wireDelete(del);
    if(id)del.dataset.achatId=id;
    removeImporterButtons(modal,save);
  }

  function apply(){
    const root=document.getElementById('modalRoot');
    if(!root)return;
    root.querySelectorAll('.overlay .modal').forEach(ensureModal);
  }

  document.addEventListener('click',function(e){
    const edit=e.target&&e.target.closest?e.target.closest('[onclick*="editAchat("]'):null;
    if(!edit)return;
    const id=idFromOnclick(edit.getAttribute('onclick'),'editAchat');
    if(id)lastAchatId=id;
    setTimeout(apply,0);
    setTimeout(apply,60);
  },true);

  try{
    const original=window.editAchat;
    if(typeof original==='function'&&!original.__yayaFinanceV10Wrapped){
      const wrapped=function(id){
        if(id)lastAchatId=String(id);
        const out=original.apply(this,arguments);
        setTimeout(apply,0);
        setTimeout(apply,60);
        return out;
      };
      wrapped.__yayaFinanceV10Wrapped=true;
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
    }).observe(root,{childList:true,subtree:true,attributes:true,characterData:true,attributeFilter:['onclick','class','title','aria-label']});
  }

  apply();
  setTimeout(apply,100);
  setTimeout(apply,400);
  setTimeout(apply,1200);
})();
