(function(){
  'use strict';

  if(window.__yayaChantierWriteSafetyInstalled)return;
  window.__yayaChantierWriteSafetyInstalled=true;

  let pendingDeleteId='';
  let authorizedDelete={id:'',expires:0};

  function getIdFromDeleteButton(btn){
    if(!btn)return '';
    let id=String(btn.dataset&&btn.dataset.yayaChantierId||'').trim();
    if(id)return id;

    const code=String(btn.getAttribute&&btn.getAttribute('onclick')||'');
    let m=code.match(/deleteExistingChantier\(['\"]([^'\"]+)['\"]\)/);
    if(m&&m[1])return String(m[1]).trim();

    const modal=btn.closest&&btn.closest('.yaya-chantier-edit-modal,.modal');
    const save=modal&&modal.querySelector('[onclick*="saveExistingChantier"]');
    const saveCode=String(save&&save.getAttribute('onclick')||'');
    m=saveCode.match(/saveExistingChantier\(['\"]([^'\"]+)['\"]\)/);
    return m&&m[1]?String(m[1]).trim():'';
  }

  function isDeleteButton(target){
    if(!target||!target.closest)return null;
    const btn=target.closest('button');
    if(!btn)return null;
    if(btn.classList.contains('yaya-delete-chantier-modal-btn'))return btn;
    if(!btn.closest('.yaya-chantier-edit-modal'))return null;
    const text=String(btn.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
    return text==='supprimer le chantier'?btn:null;
  }

  function observeDeleteConfirmation(event){
    const target=event&&event.target;
    const deleteBtn=isDeleteButton(target);
    if(deleteBtn){
      pendingDeleteId=getIdFromDeleteButton(deleteBtn);
      authorizedDelete={id:'',expires:0};
      return;
    }

    if(!target||!target.closest)return;

    if(target.closest('.yaya-chantier-delete-overlay [data-confirm]')){
      if(pendingDeleteId){
        authorizedDelete={id:pendingDeleteId,expires:Date.now()+60000};
      }
      return;
    }

    if(target.closest('.yaya-chantier-delete-overlay [data-cancel]')){
      pendingDeleteId='';
      authorizedDelete={id:'',expires:0};
    }
  }

  window.addEventListener('pointerup',observeDeleteConfirmation,true);
  window.addEventListener('click',observeDeleteConfirmation,true);

  function copyRecord(v){
    if(!v||typeof v!=='object')return v;
    return Object.assign({},v);
  }

  function installApiGuard(){
    if(typeof window.apiPost!=='function'||typeof window.apiGet!=='function'){
      setTimeout(installApiGuard,120);
      return;
    }
    if(window.apiPost.__yayaChantierWriteSafety)return;

    const originalApiPost=window.apiPost;

    async function guardedApiPost(action,data){
      if(action!=='setChantiers'||!Array.isArray(data)){
        return originalApiPost(action,data);
      }

      let fresh;
      try{
        fresh=await window.apiGet(true);
      }catch(err){
        console.error('Sécurité écriture chantiers : lecture serveur impossible',err);
        try{if(typeof toast==='function')toast('Enregistrement bloqué : impossible de vérifier les chantiers sur le serveur',true);}catch(e){}
        return false;
      }

      const server=Array.isArray(fresh&&fresh.chantiers)?fresh.chantiers:[];
      const serverById=new Map();
      server.forEach(function(c){
        const id=String(c&&c.id||'').trim();
        if(id&&!serverById.has(id))serverById.set(id,c);
      });

      const outgoing=[];
      const outgoingIds=new Set();

      data.forEach(function(c){
        const id=String(c&&c.id||'').trim();
        if(!id){
          outgoing.push(copyRecord(c));
          return;
        }
        if(outgoingIds.has(id))return;
        outgoingIds.add(id);
        const current=serverById.get(id);
        outgoing.push(current?Object.assign({},current,c):copyRecord(c));
      });

      const allowedId=(authorizedDelete.expires>Date.now())?String(authorizedDelete.id||''):'';
      let restored=0;

      server.forEach(function(c){
        const id=String(c&&c.id||'').trim();
        if(!id||outgoingIds.has(id))return;
        if(allowedId&&id===allowedId)return;
        outgoing.push(copyRecord(c));
        outgoingIds.add(id);
        restored++;
      });

      authorizedDelete={id:'',expires:0};
      pendingDeleteId='';

      if(restored>0){
        console.warn('Sécurité Yaya : '+restored+' chantier(s) serveur absent(s) du cache local ont été préservés.');
      }

      try{
        if(typeof S!=='undefined'&&S&&Array.isArray(S.chantiers)){
          S.chantiers=outgoing.map(copyRecord);
        }
      }catch(e){}

      const ok=await originalApiPost(action,outgoing);
      if(!ok)return false;

      try{
        const after=await window.apiGet(true);
        if(after&&Array.isArray(after.chantiers)&&typeof S!=='undefined'&&S){
          S.chantiers=after.chantiers;
        }
      }catch(e){
        console.warn('Sécurité Yaya : relecture après enregistrement impossible',e);
      }

      return true;
    }

    guardedApiPost.__yayaChantierWriteSafety=true;
    guardedApiPost.__yayaOriginalApiPost=originalApiPost;
    window.apiPost=guardedApiPost;
  }

  installApiGuard();
})();
