(function(){
  'use strict';

  if(window.__yayaChantierWriteSafetyV2Installed)return;
  window.__yayaChantierWriteSafetyV2Installed=true;
  window.__yayaChantierWriteSafetyInstalled=true;

  let pendingDeleteId='';
  let authorizedDelete={id:'',expires:0};
  let busy=false;

  const PERSISTED_FIELDS=[
    'id','nom','numero','montantDevisHT','statut','notes',
    'montantMarcheHT','modeSuivi','dateDemarrage','dateSignature'
  ];

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

  function canonical(c){
    c=c||{};
    const o={};
    PERSISTED_FIELDS.forEach(function(k){
      if(k==='montantDevisHT'||k==='montantMarcheHT'){
        o[k]=Number(c[k])||0;
      }else{
        o[k]=String(c[k]==null?'':c[k]).trim();
      }
    });
    return JSON.stringify(o);
  }

  function copyRecord(v){
    return v&&typeof v==='object'?Object.assign({},v):v;
  }

  async function freshServer(){
    const fresh=await window.apiGet(true);
    if(!fresh||!Array.isArray(fresh.chantiers)){
      throw new Error('liste chantiers serveur invalide');
    }
    return fresh;
  }

  function replaceLocalFromFresh(fresh){
    try{
      if(typeof S==='undefined'||!S||!fresh)return;
      if(Array.isArray(fresh.chantiers))S.chantiers=fresh.chantiers.map(copyRecord);
      if(Array.isArray(fresh.achats))S.achats=fresh.achats;
      if(Array.isArray(fresh.avenants))S.avenants=fresh.avenants;
    }catch(e){}
  }

  function installApiGuard(){
    if(typeof window.apiPost!=='function'||typeof window.apiGet!=='function'){
      setTimeout(installApiGuard,120);
      return;
    }
    if(window.apiPost.__yayaChantierWriteSafetyV2)return;

    const originalApiPost=window.apiPost;

    async function guardedApiPost(action,data){
      if(action!=='setChantiers'||!Array.isArray(data)){
        return originalApiPost(action,data);
      }

      if(busy){
        console.warn('Sécurité Yaya : écriture chantiers déjà en cours.');
        return false;
      }

      busy=true;
      try{
        const fresh=await freshServer();
        const server=fresh.chantiers;
        const serverById=new Map();
        server.forEach(function(c){
          const id=String(c&&c.id||'').trim();
          if(id&&!serverById.has(id))serverById.set(id,c);
        });

        const incomingById=new Map();
        data.forEach(function(c){
          const id=String(c&&c.id||'').trim();
          if(!id){
            console.warn('Sécurité Yaya : chantier sans identifiant ignoré.',c);
            return;
          }
          if(!incomingById.has(id))incomingById.set(id,c);
        });

        const added=[];
        const changed=[];
        incomingById.forEach(function(c,id){
          const old=serverById.get(id);
          if(!old)added.push(c);
          else if(canonical(old)!==canonical(c))changed.push(c);
        });

        const removed=[];
        serverById.forEach(function(c,id){
          if(!incomingById.has(id))removed.push(c);
        });

        const allowedId=(authorizedDelete.expires>Date.now())
          ?String(authorizedDelete.id||'').trim()
          :'';

        if(removed.length){
          const unauthorized=removed.filter(function(c){
            return !allowedId||String(c.id)!==allowedId;
          });
          if(unauthorized.length){
            console.warn(
              'Sécurité Yaya : suppression implicite bloquée pour',
              unauthorized.map(function(c){return c.id+':'+c.nom;})
            );
          }
        }

        let ok=true;

        if(allowedId&&removed.some(function(c){return String(c.id)===allowedId;})){
          ok=!!(await originalApiPost('deleteChantier',{id:allowedId}))&&ok;
        }

        for(const c of added){
          ok=!!(await originalApiPost('addChantier',copyRecord(c)))&&ok;
        }

        for(const c of changed){
          ok=!!(await originalApiPost('updateChantier',copyRecord(c)))&&ok;
        }

        authorizedDelete={id:'',expires:0};
        pendingDeleteId='';

        if(!ok)throw new Error('une écriture chantier a échoué');

        const after=await freshServer();
        replaceLocalFromFresh(after);

        try{
          if(typeof render==='function')render();
          window.dispatchEvent(new CustomEvent('yaya:data-refreshed'));
        }catch(e){}

        return true;
      }catch(err){
        console.error('Sécurité écriture chantiers :',err);
        try{
          if(typeof toast==='function'){
            toast('Enregistrement chantier bloqué : '+String(err&&err.message||err),true);
          }
        }catch(e){}
        return false;
      }finally{
        busy=false;
      }
    }

    guardedApiPost.__yayaChantierWriteSafety=true;
    guardedApiPost.__yayaChantierWriteSafetyV2=true;
    guardedApiPost.__yayaOriginalApiPost=originalApiPost;
    window.apiPost=guardedApiPost;
  }

  installApiGuard();
})();
