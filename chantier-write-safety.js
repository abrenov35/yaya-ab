(function(){
  'use strict';

  if(window.__yayaChantierWriteSafetyV6Installed)return;
  window.__yayaChantierWriteSafetyV6Installed=true;
  window.__yayaChantierWriteSafetyV5Installed=true;
  window.__yayaChantierWriteSafetyV4Installed=true;
  window.__yayaChantierWriteSafetyV3Installed=true;
  window.__yayaChantierWriteSafetyV2Installed=true;
  window.__yayaChantierWriteSafetyInstalled=true;

  let pendingDeleteId='';
  let authorizedDelete={id:'',expires:0};
  let busy=false;

  const SIGNATURE_MARKER_RE=/\s*\[\[YAYA_SIG:(\d{4}-\d{2})\]\]\s*/g;

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

  function copyRecord(v){
    return v&&typeof v==='object'?Object.assign({},v):v;
  }

  function signatureMonth(value){
    const s=String(value==null?'':value).trim();
    const m=s.match(/^(\d{4})-(\d{2})/);
    return m?m[1]+'-'+m[2]:s;
  }

  function signatureStorage(value){
    const s=signatureMonth(value);
    if(/^\d{4}-\d{2}$/.test(s))return s+'-01';
    return s;
  }

  function signatureFromNotes(notes){
    const s=String(notes==null?'':notes);
    const m=s.match(/\[\[YAYA_SIG:(\d{4}-\d{2})\]\]/);
    return m&&m[1]?m[1]:'';
  }

  function cleanNotes(notes){
    return String(notes==null?'':notes)
      .replace(SIGNATURE_MARKER_RE,'\n')
      .replace(/\n{3,}/g,'\n\n')
      .trim();
  }

  function notesWithSignature(notes,signature){
    const clean=cleanNotes(notes);
    const sig=signatureMonth(signature);
    if(!sig)return clean;
    return (clean?clean+'\n':'')+'[[YAYA_SIG:'+sig+']]';
  }

  function normalizedIncoming(value){
    const c=copyRecord(value)||{};

    const fallbackSignature=signatureFromNotes(c.notes);
    c.notes=cleanNotes(c.notes);

    if(Object.prototype.hasOwnProperty.call(c,'dateDemarrageEstime')){
      c.dateDemarrage=String(c.dateDemarrageEstime||'').trim();
    }else if(c.dateDemarrage&&!c.dateDemarrageEstime){
      c.dateDemarrageEstime=String(c.dateDemarrage||'').trim();
    }

    c.dateSignature=String(c.dateSignature||fallbackSignature||'').trim();

    return c;
  }

  function canonical(c){
    c=normalizedIncoming(c||{});
    const o={};
    PERSISTED_FIELDS.forEach(function(k){
      if(k==='montantDevisHT'||k==='montantMarcheHT'){
        o[k]=Number(c[k])||0;
      }else if(k==='dateSignature'){
        o[k]=signatureMonth(c[k]);
      }else{
        o[k]=String(c[k]==null?'':c[k]).trim();
      }
    });
    return JSON.stringify(o);
  }

  async function freshServer(){
    const fresh=await window.apiGet(true);
    if(!fresh||!Array.isArray(fresh.chantiers)){
      throw new Error('liste chantiers serveur invalide');
    }
    return fresh;
  }

  function cacheFreshState(fresh){
    try{
      if(!fresh||typeof fresh!=='object'||typeof S==='undefined'||!S)return;
      const cached=Object.assign({},fresh);
      if(Array.isArray(S.chantiers))cached.chantiers=S.chantiers.map(copyRecord);
      if(Array.isArray(S.achats))cached.achats=S.achats;
      if(Array.isArray(S.avenants))cached.avenants=S.avenants;
      localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(cached));
    }catch(e){}
  }

  function replaceLocalFromFresh(fresh){
    try{
      if(typeof S==='undefined'||!S||!fresh)return;
      if(Array.isArray(fresh.chantiers)){
        S.chantiers=fresh.chantiers.map(function(c){
          return normalizedIncoming(c);
        });
      }
      if(Array.isArray(fresh.achats))S.achats=fresh.achats;
      if(Array.isArray(fresh.avenants))S.avenants=fresh.avenants;
      cacheFreshState(fresh);
    }catch(e){}
  }

  function hydrateCurrentState(){
    try{
      if(typeof S==='undefined'||!S||!Array.isArray(S.chantiers))return false;
      let changed=false;
      S.chantiers=S.chantiers.map(function(raw){
        const beforeSig=signatureMonth(raw&&raw.dateSignature);
        const beforeNotes=String(raw&&raw.notes||'');
        const row=normalizedIncoming(raw);
        if(beforeSig!==signatureMonth(row.dateSignature)||beforeNotes!==String(row.notes||''))changed=true;
        return row;
      });
      return changed;
    }catch(e){return false;}
  }

  function mergeSafeServerList(server,incomingById,allowedDeleteId){
    return server.map(function(old){
      const id=String(old&&old.id||'').trim();
      if(allowedDeleteId&&id===allowedDeleteId)return null;

      const incoming=incomingById.get(id);
      if(!incoming)return copyRecord(old);

      const merged=copyRecord(old)||{};
      PERSISTED_FIELDS.forEach(function(k){
        if(k==='id')return;
        if(!Object.prototype.hasOwnProperty.call(incoming,k))return;

        if(k==='montantDevisHT'||k==='montantMarcheHT'){
          merged[k]=Number(incoming[k])||0;
        }else if(k==='dateSignature'){
          merged[k]=signatureStorage(incoming[k]);
        }else{
          merged[k]=String(incoming[k]==null?'':incoming[k]).trim();
        }
      });

      merged.notes=notesWithSignature(merged.notes,incoming.dateSignature);

      return merged;
    }).filter(Boolean);
  }

  function verifyPersisted(after,changed){
    const byId=new Map();
    (after.chantiers||[]).forEach(function(c){
      const id=String(c&&c.id||'').trim();
      if(id&&!byId.has(id))byId.set(id,c);
    });

    for(const wantedRaw of changed){
      const wanted=normalizedIncoming(wantedRaw);
      const id=String(wanted&&wanted.id||'').trim();
      const storedRaw=byId.get(id);
      if(!storedRaw)throw new Error('chantier '+id+' absent après enregistrement');
      const stored=normalizedIncoming(storedRaw);

      const wantedSignature=signatureMonth(wanted.dateSignature);
      const storedSignature=signatureMonth(stored.dateSignature);
      if(wantedSignature!==storedSignature){
        throw new Error('date de signature non conservée pour '+String(wanted.nom||id));
      }

      if(String(wanted.nom||'').trim()!==String(stored.nom||'').trim()){
        throw new Error('nom chantier non conservé pour '+id);
      }

      if((Number(wanted.montantMarcheHT)||0)!==(Number(stored.montantMarcheHT)||0)){
        throw new Error('montant marché non conservé pour '+String(wanted.nom||id));
      }
    }
  }

  function installApiGuard(){
    if(typeof window.apiPost!=='function'||typeof window.apiGet!=='function'){
      setTimeout(installApiGuard,120);
      return;
    }
    if(window.apiPost.__yayaChantierWriteSafetyV6)return;

    const originalApiPost=window.apiPost;

    async function guardedApiPost(action,data){
      if(action==='addChantier'){
        console.warn('Sécurité Yaya : ajout chantier local bloqué.',data);
        try{
          const fresh=await freshServer();
          replaceLocalFromFresh(fresh);
          if(typeof render==='function')render();
        }catch(e){}
        return false;
      }

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
        data.forEach(function(raw){
          const c=normalizedIncoming(raw);
          const id=String(c&&c.id||'').trim();
          if(!id){
            console.warn('Sécurité Yaya : chantier sans identifiant ignoré.',raw);
            return;
          }
          if(!incomingById.has(id))incomingById.set(id,c);
        });

        const added=[];
        const changed=[];
        incomingById.forEach(function(c,id){
          const old=serverById.get(id);
          if(!old){
            added.push(c);
            return;
          }

          const serverMarket=Number(old.montantMarcheHT)||0;
          const incomingMarket=Number(c.montantMarcheHT)||0;

          if(serverMarket>0&&incomingMarket===0){
            c=copyRecord(c);
            c.montantMarcheHT=serverMarket;
            incomingById.set(id,c);
            console.warn(
              'Sécurité Yaya : remise à zéro du marché bloquée pour',
              id,
              old.nom,
              serverMarket
            );
          }

          if(canonical(old)!==canonical(c))changed.push(c);
        });

        if(added.length){
          console.warn(
            'Sécurité Yaya : réintroduction de chantier bloquée pour',
            added.map(function(c){return String(c.id||'')+':'+String(c.nom||'');})
          );
        }

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
        const deleteAllowed=!!(
          allowedId&&removed.some(function(c){return String(c.id)===allowedId;})
        );

        if(deleteAllowed){
          ok=!!(await originalApiPost('deleteChantier',{id:allowedId}))&&ok;
        }

        if(changed.length){
          const safeList=mergeSafeServerList(
            server,
            incomingById,
            deleteAllowed?allowedId:''
          );
          ok=!!(await originalApiPost('setChantiers',safeList))&&ok;
        }

        authorizedDelete={id:'',expires:0};
        pendingDeleteId='';

        if(!ok)throw new Error('une écriture chantier a échoué');

        const after=await freshServer();
        if(changed.length)verifyPersisted(after,changed);
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
    guardedApiPost.__yayaChantierWriteSafetyV3=true;
    guardedApiPost.__yayaChantierWriteSafetyV4=true;
    guardedApiPost.__yayaChantierWriteSafetyV5=true;
    guardedApiPost.__yayaChantierWriteSafetyV6=true;
    guardedApiPost.__yayaOriginalApiPost=originalApiPost;
    window.apiPost=guardedApiPost;

    const hydrated=hydrateCurrentState();
    if(hydrated){
      try{
        if(typeof render==='function')render();
        localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(S));
      }catch(e){}
    }
  }

  installApiGuard();
})();
