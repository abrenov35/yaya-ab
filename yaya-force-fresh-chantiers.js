(function(){
  'use strict';
  if(window.__yayaRefreshCoordinatorV7Installed)return;
  window.__yayaRefreshCoordinatorV7Installed=true;
  window.__yayaRefreshCoordinatorV6Installed=true;
  window.__yayaRefreshCoordinatorV5Installed=true;
  window.__yayaFreshChantiersInstalled=true;

  const CHANTIER_ALIASES=Object.freeze({'mtiureohm15c':'C454','planning-12':'C458','msm3za2i1tpw':'C459','mtqylt0du6sy':'C460','mtk4fpwm5tka':'C461','mtlmue3aefv2':'C462','planning-28':'C463','mrrui7k8nrtg':'C464','mthmmenk2njd':'C465','mrsvjujxia59':'C466','mtovzolwurte':'C468','mrrum5gnhn92':'C469','mrrp7dywt2x7':'C473'});
  const ARRAY_ACTIONS=new Set(['setAchats','setDocuments','setAvenants','setCommandes','setHeures']);
  const SINGLE_ACTIONS=new Set(['addAchat','addDocument','addCommande']);
  let writeQueue=Promise.resolve();

  function canonicalId(value){const id=String(value==null?'':value).trim();return CHANTIER_ALIASES[id]||id;}
  function snapshotData(data){try{if(typeof structuredClone==='function')return structuredClone(data);}catch(e){}try{return JSON.parse(JSON.stringify(data));}catch(e){return data;}}
  function canonicalizeRecord(row){if(!row||typeof row!=='object')return row;if(Object.prototype.hasOwnProperty.call(row,'chantierId'))row.chantierId=canonicalId(row.chantierId);if(Object.prototype.hasOwnProperty.call(row,'chantier_id'))row.chantier_id=canonicalId(row.chantier_id);if(String(row.type||'').toLowerCase()==='chantier'&&Object.prototype.hasOwnProperty.call(row,'ref'))row.ref=canonicalId(row.ref);return row;}
  function canonicalizePayload(action,data){const copy=snapshotData(data);if(action==='setChantiers'&&Array.isArray(copy))return copy.filter(c=>{const id=String(c&&c.id||'').trim();return !!id&&!CHANTIER_ALIASES[id];});if(ARRAY_ACTIONS.has(action)&&Array.isArray(copy)){copy.forEach(canonicalizeRecord);return copy;}if(SINGLE_ACTIONS.has(action)&&copy&&typeof copy==='object'){canonicalizeRecord(copy);return copy;}if(action==='setSemaine'&&copy&&typeof copy==='object'){canonicalizeRecord(copy);if(Array.isArray(copy.heures))copy.heures.forEach(canonicalizeRecord);if(Array.isArray(copy.rows))copy.rows.forEach(canonicalizeRecord);if(Array.isArray(copy.lignes))copy.lignes.forEach(canonicalizeRecord);return copy;}return copy;}

  // V7 : suppression de la fusion GET -> POST pour les écritures globales.
  // Elle pouvait réinjecter une ligne que l'utilisateur venait de supprimer.
  // Le tableau transmis par l'action utilisateur est désormais exactement celui écrit au Sheet.
  function installWriteCoordinator(){
    if(typeof window.apiPost!=='function'){setTimeout(installWriteCoordinator,120);return;}
    if(window.apiPost.__yayaWriteCoordinatorV7)return;
    const original=window.apiPost;
    function coordinatedApiPost(action,data){
      const safeAction=String(action||'');
      const submitted=canonicalizePayload(safeAction,data);
      window.__yayaWriteInFlight=(Number(window.__yayaWriteInFlight)||0)+1;
      const execute=async function(){
        try{
          window.__yayaLastSubmittedWrite={action:safeAction,data:snapshotData(submitted),at:Date.now()};
          return await original(action,submitted);
        }finally{
          window.__yayaWriteInFlight=Math.max(0,(Number(window.__yayaWriteInFlight)||1)-1);
          window.__yayaLastWriteAt=Date.now();
        }
      };
      const task=writeQueue.then(execute,execute);
      writeQueue=task.catch(()=>false);
      return task;
    }
    coordinatedApiPost.__yayaWriteCoordinatorV7=true;
    coordinatedApiPost.__yayaWriteCoordinatorV6=true;
    coordinatedApiPost.__yayaWriteCoordinatorV5=true;
    coordinatedApiPost.__yayaWrappedApiPost=original;
    window.apiPost=coordinatedApiPost;
  }

  window.yayaCanonicalChantierId=canonicalId;
  installWriteCoordinator();

  if(!document.querySelector('script[data-yaya-post-html-recovery]')){
    const script=document.createElement('script');script.src='yaya-post-html-recovery.js?v=2';script.async=false;script.dataset.yayaPostHtmlRecovery='1';document.head.appendChild(script);
  }
})();
