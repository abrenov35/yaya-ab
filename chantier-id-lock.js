(function(){
  'use strict';

  if(window.__yayaChantierIdLockV1Installed)return;
  window.__yayaChantierIdLockV1Installed=true;

  /*
   * Verrou de migration Yaya -> Extranet.
   * Une fois un chantier repris sous son nouvel ID Extranet, aucun ancien
   * cache / modal / set* ne doit pouvoir rattacher ses données à l'ancien ID.
   *
   * IMPORTANT : ce verrou ne crée ni ne supprime aucune donnée métier.
   * Il remplace uniquement les anciens identifiants par l'identifiant
   * canonique du chantier repris.
   */
  const ALIASES=Object.freeze({
    'mtiureohm15c':'C454',       // CONGREGATION -> CONGREGATION #2
    'planning-12':'C458',       // LABIGANG 2 -> LABIGANG • SDB 3
    'msm3za2i1tpw':'C459',      // FIMINSKI -> FIMINSKI - RENOVATION #2
    'mtqylt0du6sy':'C460',       // ancien ODALYS -> ODALYS Extranet
    'mtk4fpwm5tka':'C461',       // GRANDJEAN -> GRANDJEAN #2
    'mtlmue3aefv2':'C462',       // HERVOUET -> HERVOUET - GANCHE #2
    'planning-28':'C463',        // MANINI -> MANINI - SCI YZOTERRA #2
    'mrrui7k8nrtg':'C464',       // LE GUEN -> LE GUEN #2
    'mthmmenk2njd':'C465'        // STANUS -> STANUS / HIVE #2
  });

  const ARRAY_ACTIONS=new Set([
    'setAchats','setDocuments','setAvenants','setCommandes','setHeures'
  ]);

  const SINGLE_ACTIONS=new Set([
    'addAchat','addDocument','addCommande'
  ]);

  function canonicalId(value){
    const id=String(value==null?'':value).trim();
    return ALIASES[id]||id;
  }

  function clone(value){
    try{
      if(typeof structuredClone==='function')return structuredClone(value);
    }catch(e){}
    try{return JSON.parse(JSON.stringify(value));}catch(e){return value;}
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

  function canonicalizePayload(action,data){
    const copy=clone(data);

    if(action==='setChantiers'&&Array.isArray(copy)){
      return copy.filter(function(c){
        const id=String(c&&c.id||'').trim();
        return !ALIASES[id];
      });
    }

    if(ARRAY_ACTIONS.has(action)&&Array.isArray(copy)){
      copy.forEach(canonicalizeRecord);
      return copy;
    }

    if(SINGLE_ACTIONS.has(action)&&copy&&typeof copy==='object'){
      return canonicalizeRecord(copy);
    }

    /* setSemaine et certains anciens appels peuvent contenir des lignes imbriquées. */
    if(action==='setSemaine'&&copy&&typeof copy==='object'){
      if(Array.isArray(copy.heures))copy.heures.forEach(canonicalizeRecord);
      if(Array.isArray(copy.rows))copy.rows.forEach(canonicalizeRecord);
      canonicalizeRecord(copy);
      return copy;
    }

    return copy;
  }

  function canonicalizeLocalState(){
    try{
      if(typeof S==='undefined'||!S||typeof S!=='object')return false;
      let changed=false;

      ['achats','documents','avenants','commandes','heures'].forEach(function(name){
        const rows=S[name];
        if(!Array.isArray(rows))return;
        rows.forEach(function(row){
          if(!row||typeof row!=='object')return;
          const beforeChantier=String(row.chantierId||row.chantier_id||'');
          const beforeRef=String(row.ref||'');
          canonicalizeRecord(row);
          const afterChantier=String(row.chantierId||row.chantier_id||'');
          const afterRef=String(row.ref||'');
          if(beforeChantier!==afterChantier||beforeRef!==afterRef)changed=true;
        });
      });

      if(Array.isArray(S.chantiers)){
        const before=S.chantiers.length;
        const canonicalTargets=new Set(Object.values(ALIASES));
        S.chantiers=S.chantiers.filter(function(c){
          const id=String(c&&c.id||'').trim();
          if(!ALIASES[id])return true;
          /* On masque l'ancien uniquement si son chantier canonique existe. */
          return !S.chantiers.some(function(x){
            return String(x&&x.id||'').trim()===ALIASES[id] && canonicalTargets.has(ALIASES[id]);
          });
        });
        if(S.chantiers.length!==before)changed=true;
      }

      if(changed){
        try{localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(S));}catch(e){}
      }
      return changed;
    }catch(e){
      console.warn('Verrou IDs chantier : normalisation locale ignorée',e);
      return false;
    }
  }

  function installPostGuard(){
    if(typeof window.apiPost!=='function'){
      setTimeout(installPostGuard,120);
      return;
    }
    if(window.apiPost.__yayaChantierIdLockV1)return;

    const original=window.apiPost;
    async function lockedApiPost(action,data){
      const safe=canonicalizePayload(String(action||''),data);
      return original(action,safe);
    }
    lockedApiPost.__yayaChantierIdLockV1=true;
    lockedApiPost.__yayaWrappedApiPost=original;
    window.apiPost=lockedApiPost;
  }

  installPostGuard();

  window.yayaCanonicalChantierId=canonicalId;
  window.yayaCanonicalizeMigratedChantierRefs=canonicalizeLocalState;

  window.addEventListener('yaya:data-refreshed',function(){
    requestAnimationFrame(function(){
      if(canonicalizeLocalState()){
        try{if(typeof render==='function')render();}catch(e){}
      }
    });
  });

  [100,600,1800].forEach(function(ms){
    setTimeout(function(){
      if(canonicalizeLocalState()){
        try{if(typeof render==='function')render();}catch(e){}
      }
    },ms);
  });
})();
