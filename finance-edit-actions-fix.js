(function(){
  'use strict';

  if(window.__yayaFinanceEditActionsV13)return;
  window.__yayaFinanceEditActionsV13=true;

  let lastAchatId='';
  let deleteBusy=false;
  const STYLE_ID='yaya-finance-edit-actions-v13';

  function txt(v){return String(v==null?'':v).trim();}
  function sleep(ms){return new Promise(function(resolve){setTimeout(resolve,ms);});}
  function toastSafe(message,isError){try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}}

  function ensureSyncState(){
    if(document.getElementById('syncState'))return;
    const el=document.createElement('span');
    el.id='syncState';
    el.style.display='none';
    el.setAttribute('aria-hidden','true');
    document.body.appendChild(el);
  }

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .achat-edit-modal .yaya-finance-edit-actions{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;align-items:stretch!important;margin-top:18px!important;width:100%!important;overflow:visible!important}
      .achat-edit-modal .yaya-finance-edit-actions>button{width:100%!important;min-width:0!important;min-height:46px!important;margin:0!important;padding:0 12px!important;border-radius:9px!important;font-weight:750!important;cursor:pointer!important;pointer-events:auto!important;display:inline-flex!important;visibility:visible!important;opacity:1!important;align-items:center!important;justify-content:center!important;position:relative!important;transform:none!important}
      .achat-edit-modal .yaya-achat-single-save{background:#064b8e!important;color:#fff!important;border:1px solid #064b8e!important}
      .achat-edit-modal .yaya-achat-edit-delete{background:#fff3f3!important;color:#b42318!important;border:1px solid #efb4b4!important}
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
    id=txt(id);
    if(id){
      lastAchatId=id;
      if(modal)modal.dataset.yayaAchatId=id;
      if(btn)btn.dataset.achatId=id;
    }
    return id;
  }

  function updateCache(data){
    try{
      const raw=localStorage.getItem('YAYA_CACHE_DATA_V2');
      const cached=raw?JSON.parse(raw):{};
      if(data&&Array.isArray(data.achats)){
        Object.keys(data).forEach(function(k){cached[k]=data[k];});
      }else if(Array.isArray(data)){
        cached.achats=data;
      }
      localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(cached));
    }catch(e){}
  }

  function applyFresh(data){
    if(!data||!Array.isArray(data.achats))return;
    try{
      if(typeof S!=='undefined'&&S){
        Object.keys(data).forEach(function(k){S[k]=data[k];});
      }
    }catch(e){}
    updateCache(data);
    try{if(typeof render==='function')render();}catch(e){}
    try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed'));}catch(e){}
  }

  async function freshData(){
    if(typeof apiGet!=='function')return null;
    try{
      const data=await apiGet(true);
      return data&&Array.isArray(data.achats)?data:null;
    }catch(e){
      console.warn('Yaya suppression achat — lecture serveur impossible',e);
      return null;
    }
  }

  async function directPost(list){
    if(typeof API==='undefined'||!API)throw new Error('API Yaya introuvable');
    const r=await fetch(API,{
      method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action:'setAchats',data:list})
    });
    const text=await r.text();
    let j;
    try{j=JSON.parse(text);}catch(e){throw new Error('réponse Google non JSON');}
    if(!j||!j.ok)throw new Error(j&&j.error?j.error:'écriture refusée');
    return true;
  }

  async function writeAchats(list){
    ensureSyncState();
    let firstError=null;

    if(typeof apiPost==='function'){
      try{
        const ok=await apiPost('setAchats',list);
        if(ok)return true;
        firstError=new Error('apiPost a refusé l’écriture');
      }catch(e){
        firstError=e;
      }
    }

    try{
      await directPost(list);
      return true;
    }catch(e){
      if(firstError)console.warn('Yaya suppression achat — apiPost :',firstError);
      throw e;
    }
  }

  async function deleteAchatPersist(id,statusNode){
    id=txt(id);
    if(!id)throw new Error('identifiant achat absent');
    if(deleteBusy)throw new Error('une suppression est déjà en cours');
    deleteBusy=true;

    try{
      let fresh=await freshData();
      let source=fresh&&Array.isArray(fresh.achats)
        ?fresh.achats.slice()
        :((typeof S!=='undefined'&&S&&Array.isArray(S.achats))?S.achats.slice():[]);

      const wanted=function(a){return txt(a&&a.id)===id;};
      if(!source.some(wanted)){
        if(fresh)applyFresh(fresh);
        return {ok:true,already:true};
      }

      for(let attempt=1;attempt<=3;attempt++){
        const after=source.filter(function(a){return !wanted(a);});
        if(statusNode)statusNode.textContent='Suppression… tentative '+attempt+'/3';

        await writeAchats(after);
        await sleep(700*attempt);

        const verify=await freshData();
        if(verify&&Array.isArray(verify.achats)){
          if(!verify.achats.some(wanted)){
            applyFresh(verify);
            return {ok:true,already:false};
          }
          source=verify.achats.slice();
        }else{
          try{S.achats=after;}catch(e){}
          updateCache(after);
          try{if(typeof render==='function')render();}catch(e){}
          return {ok:true,unverified:true};
        }
      }

      throw new Error('la ligne est toujours présente dans le Sheet après 3 écritures');
    }finally{
      deleteBusy=false;
    }
  }

  function closeConfirm(overlay){
    if(overlay&&overlay.parentNode)overlay.parentNode.removeChild(overlay);
  }

  function showDeleteConfirm(id,editModal){
    document.querySelectorAll('.yaya-edit-delete-confirm-v13').forEach(function(n){n.remove();});

    const overlay=document.createElement('div');
    overlay.className='yaya-edit-delete-confirm-v13';
    overlay.style.cssText='position:fixed!important;inset:0!important;background:rgba(15,23,42,.58)!important;z-index:2147483647!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:18px!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important';
    overlay.innerHTML=''
      +'<div style="background:#fff;border-radius:14px;padding:22px;max-width:410px;width:100%;box-shadow:0 18px 60px rgba(0,0,0,.35);font-family:inherit">'
      +'<div style="font-size:17px;font-weight:800;color:#162D49;margin-bottom:10px">Supprimer cet achat de Yaya ?</div>'
      +'<div style="font-size:13px;line-height:1.5;color:#556579;margin-bottom:18px">Le fichier original Drive / Dropbox sera conservé. Seule la ligne Yaya sera supprimée.</div>'
      +'<div data-yaya-delete-status style="font-size:12px;color:#64748b;min-height:18px;margin-bottom:10px"></div>'
      +'<div style="display:flex;gap:10px;justify-content:flex-end">'
      +'<button type="button" data-yaya-delete-cancel style="padding:10px 15px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;color:#334155;font-weight:700;cursor:pointer">Annuler</button>'
      +'<button type="button" data-yaya-delete-ok style="padding:10px 15px;border-radius:8px;border:0;background:#b42318;color:#fff;font-weight:800;cursor:pointer">Supprimer de Yaya</button>'
      +'</div></div>';

    const cancel=overlay.querySelector('[data-yaya-delete-cancel]');
    const ok=overlay.querySelector('[data-yaya-delete-ok]');
    const status=overlay.querySelector('[data-yaya-delete-status]');

    cancel.onclick=function(){if(!deleteBusy)closeConfirm(overlay);};
    overlay.addEventListener('click',function(e){if(e.target===overlay&&!deleteBusy)closeConfirm(overlay);});

    ok.onclick=async function(e){
      e.preventDefault();
      e.stopPropagation();
      if(deleteBusy)return;
      ok.disabled=true;
      cancel.disabled=true;
      status.textContent='Suppression en cours…';

      try{
        const result=await deleteAchatPersist(id,status);
        status.style.color='#166534';
        status.textContent=result.already?'Déjà supprimé du Sheet ✓':'Suppression confirmée dans le Sheet ✓';
        toastSafe('Charge supprimée de Yaya — fichier conservé ✓');
        await sleep(350);
        closeConfirm(overlay);
        try{if(typeof closeModal==='function')closeModal();else if(editModal&&editModal.closest('.overlay'))editModal.closest('.overlay').remove();}catch(e){}
      }catch(err){
        console.error('Yaya suppression achat :',err);
        status.style.color='#b42318';
        status.textContent='Échec : '+String(err&&err.message||err);
        ok.disabled=false;
        cancel.disabled=false;
        ok.textContent='Réessayer';
      }
    };

    document.body.appendChild(overlay);
    setTimeout(function(){try{ok.focus();}catch(e){}},0);
  }

  function removeImporterButtons(modal,save){
    if(!modal)return;
    Array.from(modal.querySelectorAll('button')).forEach(function(b){
      if(b===save||b.classList.contains('yaya-achat-edit-delete')||b.classList.contains('yaya-achat-edit-close'))return;
      const label=txt(b.textContent);
      const title=txt(b.getAttribute('title'));
      const aria=txt(b.getAttribute('aria-label'));
      if(/importer/i.test(label)||b.classList.contains('yaya-achat-edit-import')||b.classList.contains('yaya-test-import')||/changer.*pi[eè]ce|pi[eè]ce jointe/i.test(title+' '+aria))b.remove();
    });
  }

  function ensureModal(modal){
    if(!modal||!modal.querySelector('#eaCh'))return;
    ensureSyncState();
    ensureStyle();
    modal.classList.add('achat-edit-modal','yaya-finance-edit-modal');

    const save=Array.from(modal.querySelectorAll('button')).find(function(b){
      const label=txt(b.textContent);
      const raw=String(b.getAttribute('onclick')||'');
      return /saveAchat/.test(raw)||/^Enregistrer$/i.test(label)||b.classList.contains('yaya-achat-single-save')||b.classList.contains('achat-icon-save');
    });
    if(!save)return;

    const id=resolveAchatId(modal,save);
    save.classList.add('yaya-achat-single-save');
    if(!save.textContent||/^[✓✔]$/.test(txt(save.textContent)))save.textContent='Enregistrer';

    let foot=save.closest('.yaya-finance-edit-actions')||save.closest('.mfoot')||save.parentElement;
    if(!foot)return;
    foot.classList.add('yaya-finance-edit-actions');

    removeImporterButtons(modal,save);
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

    del.type='button';
    del.removeAttribute('onclick');
    del.onclick=null;
    del.style.pointerEvents='auto';
    if(id)del.dataset.achatId=id;
  }

  function handleDelete(event){
    const target=event&&event.target;
    const btn=target&&target.closest?target.closest('.yaya-achat-edit-delete'):null;
    if(!btn)return;
    const modal=btn.closest('.modal');
    if(!modal||!modal.querySelector('#eaCh'))return;

    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();

    const id=resolveAchatId(modal,btn);
    if(!id){toastSafe('Impossible d’identifier cet achat',true);return;}
    showDeleteConfirm(id,modal);
  }

  // Le clic de cette modale est intercepté par d'anciens correctifs Yaya.
  // Le pointerdown global a été validé en production et passe avant eux.
  window.addEventListener('pointerdown',handleDelete,true);

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
    if(typeof original==='function'&&!original.__yayaFinanceV13Wrapped){
      const wrapped=function(id){
        if(id)lastAchatId=String(id);
        const out=original.apply(this,arguments);
        setTimeout(apply,0);
        setTimeout(apply,60);
        return out;
      };
      wrapped.__yayaFinanceV13Wrapped=true;
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
    }).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['onclick','class','title','aria-label']});
  }

  ensureSyncState();
  apply();
  setTimeout(apply,100);
  setTimeout(apply,400);
  setTimeout(apply,1200);
})();