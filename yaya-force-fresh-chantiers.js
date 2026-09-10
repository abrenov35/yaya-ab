(function(){
  'use strict';

  /*
   * Coordinateur de stabilité Yaya.
   * - une seule file d'écriture : pas de sauvegardes concurrentes ;
   * - les anciens IDs des chantiers migrés sont toujours convertis vers
   *   leur ID Extranet canonique avant toute sauvegarde ;
   * - un ancien cache ne peut plus rattacher achats, documents, commandes,
   *   devis ou heures à un chantier Yaya supprimé ;
   * - dateSignature est restaurée depuis [[YAYA_SIG:AAAA-MM]] si nécessaire.
   */
  if(window.__yayaRefreshCoordinatorV3Installed)return;
  window.__yayaRefreshCoordinatorV3Installed=true;
  window.__yayaRefreshCoordinatorV2Installed=true;
  window.__yayaRefreshCoordinatorV1Installed=true;
  window.__yayaFreshChantiersInstalled=true;

  const CACHE_DATA_KEY='YAYA_CACHE_DATA_V2';

  const CHANTIER_ALIASES=Object.freeze({
    'mtiureohm15c':'C454',
    'planning-12':'C458',
    'msm3za2i1tpw':'C459',
    'mtqylt0du6sy':'C460',
    'mtk4fpwm5tka':'C461',
    'mtlmue3aefv2':'C462',
    'planning-28':'C463',
    'mrrui7k8nrtg':'C464',
    'mthmmenk2njd':'C465',
    'mrsvjujxia59':'C466'
  });

  const ARRAY_ACTIONS=new Set([
    'setAchats','setDocuments','setAvenants','setCommandes','setHeures'
  ]);
  const SINGLE_ACTIONS=new Set([
    'addAchat','addDocument','addCommande'
  ]);

  let writeQueue=Promise.resolve();

  function canonicalId(value){
    const id=String(value==null?'':value).trim();
    return CHANTIER_ALIASES[id]||id;
  }

  function signatureFromNotes(notes){
    const m=String(notes==null?'':notes).match(/\[\[YAYA_SIG:(\d{4}-\d{2})\]\]/);
    return m&&m[1]?m[1]:'';
  }

  function canonicalizeRecord(row){
    if(!row||typeof row!=='object')return row;

    if(Object.prototype.hasOwnProperty.call(row,'chantierId')){
      row.chantierId=canonicalId(row.chantierId);
    }
    if(Object.prototype.hasOwnProperty.call(row,'chantier_id')){
      row.chantier_id=canonicalId(row.chantier_id);
    }
    if(String(row.type||'').toLowerCase()==='chantier' &&
       Object.prototype.hasOwnProperty.call(row,'ref')){
      row.ref=canonicalId(row.ref);
    }
    return row;
  }

  function snapshotData(data){
    try{
      if(typeof structuredClone==='function')return structuredClone(data);
    }catch(e){}
    try{return JSON.parse(JSON.stringify(data));}catch(e){return data;}
  }

  function canonicalizePayload(action,data){
    const copy=snapshotData(data);

    if(action==='setChantiers'&&Array.isArray(copy)){
      return copy.filter(function(c){
        const id=String(c&&c.id||'').trim();
        return !CHANTIER_ALIASES[id];
      });
    }

    if(ARRAY_ACTIONS.has(action)&&Array.isArray(copy)){
      copy.forEach(canonicalizeRecord);
      return copy;
    }

    if(SINGLE_ACTIONS.has(action)&&copy&&typeof copy==='object'){
      canonicalizeRecord(copy);
      return copy;
    }

    if(action==='setSemaine'&&copy&&typeof copy==='object'){
      canonicalizeRecord(copy);
      if(Array.isArray(copy.heures))copy.heures.forEach(canonicalizeRecord);
      if(Array.isArray(copy.rows))copy.rows.forEach(canonicalizeRecord);
      return copy;
    }

    return copy;
  }

  function normalizeSignaturesAndIds(){
    try{
      if(typeof S==='undefined'||!S||typeof S!=='object')return false;
      let changed=false;

      if(Array.isArray(S.chantiers)){
        S.chantiers.forEach(function(c){
          if(!c)return;
          if(!String(c.dateSignature||'').trim()){
            const sig=signatureFromNotes(c.notes);
            if(sig){c.dateSignature=sig;changed=true;}
          }
        });

        const targets=new Set(S.chantiers.map(function(c){
          return String(c&&c.id||'').trim();
        }));
        const before=S.chantiers.length;
        S.chantiers=S.chantiers.filter(function(c){
          const id=String(c&&c.id||'').trim();
          const target=CHANTIER_ALIASES[id];
          return !(target&&targets.has(target));
        });
        if(S.chantiers.length!==before)changed=true;
      }

      ['achats','documents','avenants','commandes','heures'].forEach(function(name){
        const rows=S[name];
        if(!Array.isArray(rows))return;
        rows.forEach(function(row){
          if(!row||typeof row!=='object')return;
          const beforeA=String(row.chantierId||row.chantier_id||'');
          const beforeB=String(row.ref||'');
          canonicalizeRecord(row);
          if(beforeA!==String(row.chantierId||row.chantier_id||'') ||
             beforeB!==String(row.ref||''))changed=true;
        });
      });

      if(changed){
        try{localStorage.setItem(CACHE_DATA_KEY,JSON.stringify(S));}catch(e){}
      }
      return changed;
    }catch(e){
      console.warn('Normalisation Yaya ignorée :',e);
      return false;
    }
  }

  function normalizeAndRender(){
    const changed=normalizeSignaturesAndIds();
    if(changed){
      try{if(typeof render==='function')render();}catch(e){}
    }
  }

  window.yayaNormalizeChantierSignatures=normalizeSignaturesAndIds;
  window.yayaCanonicalChantierId=canonicalId;

  function installWriteCoordinator(){
    if(typeof window.apiPost!=='function'){
      setTimeout(installWriteCoordinator,120);
      return;
    }
    if(window.apiPost.__yayaWriteCoordinatorV3)return;

    const original=window.apiPost;

    function coordinatedApiPost(action,data){
      const safeAction=String(action||'');
      const frozenData=canonicalizePayload(safeAction,data);
      window.__yayaWriteInFlight=(Number(window.__yayaWriteInFlight)||0)+1;

      const execute=async function(){
        try{
          return await original(action,frozenData);
        }finally{
          window.__yayaWriteInFlight=Math.max(0,(Number(window.__yayaWriteInFlight)||1)-1);
          window.__yayaLastWriteAt=Date.now();
          setTimeout(normalizeAndRender,0);
        }
      };

      const task=writeQueue.then(execute,execute);
      writeQueue=task.catch(function(){return false;});
      return task;
    }

    coordinatedApiPost.__yayaWriteCoordinatorV3=true;
    coordinatedApiPost.__yayaWriteCoordinatorV2=true;
    coordinatedApiPost.__yayaWriteCoordinatorV1=true;
    coordinatedApiPost.__yayaWrappedApiPost=original;
    window.apiPost=coordinatedApiPost;
  }

  installWriteCoordinator();

  window.addEventListener('yaya:data-refreshed',function(){
    requestAnimationFrame(normalizeAndRender);
  });

  [100,500,1500].forEach(function(ms){
    setTimeout(normalizeAndRender,ms);
  });

  if(!document.querySelector('script[data-yaya-post-html-recovery]')){
    const script=document.createElement('script');
    script.src='yaya-post-html-recovery.js?v=1';
    script.async=false;
    script.dataset.yayaPostHtmlRecovery='1';
    document.head.appendChild(script);
  }
})();
