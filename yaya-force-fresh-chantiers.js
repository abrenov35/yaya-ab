(function(){
  'use strict';
  if(window.__yayaRefreshCoordinatorV6Installed)return;
  window.__yayaRefreshCoordinatorV6Installed=true;
  window.__yayaRefreshCoordinatorV5Installed=true;
  window.__yayaRefreshCoordinatorV4Installed=true;
  window.__yayaRefreshCoordinatorV3Installed=true;
  window.__yayaRefreshCoordinatorV2Installed=true;
  window.__yayaRefreshCoordinatorV1Installed=true;
  window.__yayaFreshChantiersInstalled=true;

  const CACHE_DATA_KEY='YAYA_CACHE_DATA_V2';
  const CHANTIER_ALIASES=Object.freeze({'mtiureohm15c':'C454','planning-12':'C458','msm3za2i1tpw':'C459','mtqylt0du6sy':'C460','mtk4fpwm5tka':'C461','mtlmue3aefv2':'C462','planning-28':'C463','mrrui7k8nrtg':'C464','mthmmenk2njd':'C465','mrsvjujxia59':'C466','mtovzolwurte':'C468','mrrum5gnhn92':'C469','mrrp7dywt2x7':'C473'});
  const ARRAY_ACTIONS=new Set(['setAchats','setDocuments','setAvenants','setCommandes','setHeures']);
  const SINGLE_ACTIONS=new Set(['addAchat','addDocument','addCommande']);
  const SAFE_MERGE_ACTIONS=Object.freeze({setAchats:'achats',setDocuments:'documents',setAvenants:'avenants',setCommandes:'commandes'});
  let writeQueue=Promise.resolve();
  let visibleShadow={};

  function canonicalId(value){const id=String(value==null?'':value).trim();return CHANTIER_ALIASES[id]||id;}
  function signatureFromNotes(notes){const m=String(notes==null?'':notes).match(/\[\[YAYA_SIG:(\d{4}-\d{2})\]\]/);return m&&m[1]?m[1]:'';}
  function signatureMonth(value){const m=String(value==null?'':value).trim().match(/^(\d{4}-\d{2})/);return m&&m[1]?m[1]:'';}
  function canonicalizeRecord(row){if(!row||typeof row!=='object')return row;if(Object.prototype.hasOwnProperty.call(row,'chantierId'))row.chantierId=canonicalId(row.chantierId);if(Object.prototype.hasOwnProperty.call(row,'chantier_id'))row.chantier_id=canonicalId(row.chantier_id);if(String(row.type||'').toLowerCase()==='chantier'&&Object.prototype.hasOwnProperty.call(row,'ref'))row.ref=canonicalId(row.ref);return row;}
  function snapshotData(data){try{if(typeof structuredClone==='function')return structuredClone(data);}catch(e){}try{return JSON.parse(JSON.stringify(data));}catch(e){return data;}}
  function canonicalizePayload(action,data){const copy=snapshotData(data);if(action==='setChantiers'&&Array.isArray(copy))return copy.filter(c=>{const id=String(c&&c.id||'').trim();return !!id&&!CHANTIER_ALIASES[id];});if(ARRAY_ACTIONS.has(action)&&Array.isArray(copy)){copy.forEach(canonicalizeRecord);return copy;}if(SINGLE_ACTIONS.has(action)&&copy&&typeof copy==='object'){canonicalizeRecord(copy);return copy;}if(action==='setSemaine'&&copy&&typeof copy==='object'){canonicalizeRecord(copy);if(Array.isArray(copy.heures))copy.heures.forEach(canonicalizeRecord);if(Array.isArray(copy.rows))copy.rows.forEach(canonicalizeRecord);if(Array.isArray(copy.lignes))copy.lignes.forEach(canonicalizeRecord);return copy;}return copy;}
  function captureVisibleShadow(){try{if(typeof S==='undefined'||!S||typeof S!=='object')return;Object.keys(SAFE_MERGE_ACTIONS).forEach(action=>{const name=SAFE_MERGE_ACTIONS[action];if(Array.isArray(S[name]))visibleShadow[name]=snapshotData(S[name]);});}catch(e){}}
  function apiUrl(){try{return typeof API!=='undefined'?String(API||''):'';}catch(e){return '';}}
  async function fetchFreshTable(name){const api=apiUrl();if(!api)return null;const sep=api.includes('?')?'&':'?';const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),12000);try{const r=await fetch(api+sep+'tabs='+encodeURIComponent(name)+'&_yaya_write_merge='+Date.now(),{method:'GET',cache:'no-store',signal:ctrl.signal});const text=await r.text();if(/^\s*</.test(text))throw new Error('Réponse Google temporairement invalide');const json=JSON.parse(text);if(!json||json.ok!==true||!json.data||!Array.isArray(json.data[name]))return null;return json.data[name].map(row=>{const copy=snapshotData(row);canonicalizeRecord(copy);return copy;});}catch(e){if(!(e&&e.name==='AbortError'))console.warn('Fusion pré-écriture '+name+' ignorée :',e);return null;}finally{clearTimeout(timer);}}
  function sameValue(a,b){if(a===b)return true;try{return JSON.stringify(a)===JSON.stringify(b);}catch(e){return String(a)===String(b);}}
  function mapById(rows){const map=new Map();(Array.isArray(rows)?rows:[]).forEach(row=>{const id=String(row&&row.id||'').trim();if(id)map.set(id,row);});return map;}
  function mergeUserDiffOntoFresh(baseline,incoming,fresh){baseline=Array.isArray(baseline)?baseline:[];incoming=Array.isArray(incoming)?incoming:[];fresh=Array.isArray(fresh)?fresh:[];const baseMap=mapById(baseline),inMap=mapById(incoming),freshMap=mapById(fresh);const order=fresh.map(r=>String(r&&r.id||'').trim()).filter(Boolean);baseMap.forEach((_row,id)=>{if(!inMap.has(id))freshMap.delete(id);});inMap.forEach((inRow,id)=>{const baseRow=baseMap.get(id);if(!baseRow){freshMap.set(id,snapshotData(inRow));if(!order.includes(id))order.push(id);return;}const freshRow=freshMap.get(id);if(!freshRow){freshMap.set(id,snapshotData(inRow));if(!order.includes(id))order.push(id);return;}const merged=Object.assign({},snapshotData(freshRow));const keys=new Set(Object.keys(baseRow||{}).concat(Object.keys(inRow||{})));keys.forEach(key=>{if(!sameValue(baseRow&&baseRow[key],inRow&&inRow[key])){if(Object.prototype.hasOwnProperty.call(inRow,key))merged[key]=snapshotData(inRow[key]);else delete merged[key];}});canonicalizeRecord(merged);freshMap.set(id,merged);});const out=[],used=new Set();order.forEach(id=>{if(used.has(id)||!freshMap.has(id))return;used.add(id);out.push(freshMap.get(id));});inMap.forEach((_row,id)=>{if(used.has(id)||!freshMap.has(id))return;used.add(id);out.push(freshMap.get(id));});return out;}

  async function prepareSafeWrite(action,incoming){
    const name=SAFE_MERGE_ACTIONS[action];if(!name||!Array.isArray(incoming))return incoming;
    const fresh=await fetchFreshTable(name);if(!fresh)return incoming;
    // V6 : si le shadow n'a pas encore été initialisé avec les données affichées,
    // utiliser la table serveur fraîche comme baseline. L'ancien fallback sur `incoming`
    // rendait une suppression invisible au merge : la ligne supprimée était donc réinjectée.
    const shadow=Array.isArray(visibleShadow[name])?visibleShadow[name]:null;
    const baseline=(shadow&&shadow.length)?snapshotData(shadow):snapshotData(fresh);
    const merged=mergeUserDiffOntoFresh(baseline,incoming,fresh);merged.forEach(canonicalizeRecord);return merged;
  }

  function normalizeSignaturesAndIds(){try{if(typeof S==='undefined'||!S||typeof S!=='object')return false;let changed=false;if(Array.isArray(S.chantiers)){S.chantiers.forEach(c=>{if(!c)return;const sig=signatureFromNotes(c.notes);if(sig&&signatureMonth(c.dateSignature)!==sig){c.dateSignature=sig;changed=true;}});const targets=new Set(S.chantiers.map(c=>String(c&&c.id||'').trim()).filter(Boolean));const before=S.chantiers.length;S.chantiers=S.chantiers.filter(c=>{const id=String(c&&c.id||'').trim();if(!id)return false;const target=CHANTIER_ALIASES[id];return !(target&&targets.has(target));});if(S.chantiers.length!==before)changed=true;}['achats','documents','avenants','commandes','heures'].forEach(name=>{const rows=S[name];if(!Array.isArray(rows))return;rows.forEach(row=>{if(!row||typeof row!=='object')return;const beforeA=String(row.chantierId||row.chantier_id||''),beforeB=String(row.ref||'');canonicalizeRecord(row);if(beforeA!==String(row.chantierId||row.chantier_id||'')||beforeB!==String(row.ref||''))changed=true;});});if(changed){try{localStorage.setItem(CACHE_DATA_KEY,JSON.stringify(S));}catch(e){}}captureVisibleShadow();return changed;}catch(e){console.warn('Normalisation Yaya ignorée :',e);return false;}}
  function normalizeAndRender(){const changed=normalizeSignaturesAndIds();if(changed){try{if(typeof render==='function')render();}catch(e){}}}
  window.yayaNormalizeChantierSignatures=normalizeSignaturesAndIds;window.yayaCanonicalChantierId=canonicalId;
  function installWriteCoordinator(){if(typeof window.apiPost!=='function'){setTimeout(installWriteCoordinator,120);return;}if(window.apiPost.__yayaWriteCoordinatorV6)return;captureVisibleShadow();const original=window.apiPost;function coordinatedApiPost(action,data){const safeAction=String(action||''),frozenData=canonicalizePayload(safeAction,data);window.__yayaWriteInFlight=(Number(window.__yayaWriteInFlight)||0)+1;const execute=async function(){let submitted=frozenData;try{submitted=await prepareSafeWrite(safeAction,frozenData);window.__yayaLastSubmittedWrite={action:safeAction,data:snapshotData(submitted),at:Date.now()};const result=await original(action,submitted);if(result!==false){const name=SAFE_MERGE_ACTIONS[safeAction];if(name&&Array.isArray(frozenData))visibleShadow[name]=snapshotData(frozenData);}return result;}finally{window.__yayaWriteInFlight=Math.max(0,(Number(window.__yayaWriteInFlight)||1)-1);window.__yayaLastWriteAt=Date.now();setTimeout(normalizeAndRender,0);}};const task=writeQueue.then(execute,execute);writeQueue=task.catch(()=>false);return task;}coordinatedApiPost.__yayaWriteCoordinatorV6=true;coordinatedApiPost.__yayaWriteCoordinatorV5=true;coordinatedApiPost.__yayaWrappedApiPost=original;window.apiPost=coordinatedApiPost;}
  installWriteCoordinator();window.addEventListener('yaya:data-refreshed',()=>requestAnimationFrame(()=>{normalizeAndRender();captureVisibleShadow();}));[100,500,1500].forEach(ms=>setTimeout(normalizeAndRender,ms));
  if(!document.querySelector('script[data-yaya-post-html-recovery]')){const script=document.createElement('script');script.src='yaya-post-html-recovery.js?v=2';script.async=false;script.dataset.yayaPostHtmlRecovery='1';document.head.appendChild(script);}
})();
