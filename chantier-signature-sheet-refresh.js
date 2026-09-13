(function(){
  'use strict';

  if(window.__yayaSignatureSheetRefreshV4Installed)return;
  window.__yayaSignatureSheetRefreshV4Installed=true;
  window.__yayaSignatureSheetRefreshV3Installed=true;
  window.__yayaSignatureSheetRefreshV2Installed=true;
  window.__yayaSignatureSheetRefreshV1Installed=true;

  const CACHE_DATA_KEY='YAYA_CACHE_DATA_V2';
  const MIN_REFRESH_MS=60000;
  const SPECIAL='AVANT_2026-09';
  const SPECIAL_LABEL='Signé avant Sept. 2026';
  let running=false;
  let lastRefreshAt=0;
  let waitAttempts=0;

  function apiUrl(){
    try{return typeof API!=='undefined'?String(API||''):'';}catch(e){return '';}
  }

  function nameKey(v){
    return String(v==null?'':v)
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .trim().replace(/\s+/g,' ').toUpperCase();
  }

  function localChantiers(){
    try{return typeof S!=='undefined'&&S&&Array.isArray(S.chantiers)?S.chantiers:null;}
    catch(e){return null;}
  }

  function signatureLabel(c){
    const value=String(c&&c.dateSignature||'').trim();
    if(!value)return '';
    if(value.toUpperCase()===SPECIAL)return SPECIAL_LABEL;
    const m=value.match(/^(\d{4})-(\d{2})/);
    if(!m)return '';
    const d=new Date(Number(m[1]),Number(m[2])-1,1);
    const lib=d.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
    return 'Signé : '+lib.charAt(0).toUpperCase()+lib.slice(1);
  }

  function installSignatureRenderer(){
    window.signatureChantierHtml=function(c){
      const label=signatureLabel(c);
      return label?'<span class="signature-date">'+label+'</span>':'';
    };
  }

  function remoteMatch(local,byId,byName){
    const id=String(local&&local.id||'').trim();
    if(id&&byId.has(id))return byId.get(id);
    const key=nameKey(local&&local.nom);
    const hits=key?byName.get(key):null;
    return hits&&hits.length===1?hits[0]:null;
  }

  async function fetchJson(url,signal){
    const r=await fetch(url,{method:'GET',cache:'no-store',signal:signal});
    const text=await r.text();
    if(/^\s*</.test(text))throw new Error('Réponse Yaya temporairement invalide');
    const json=JSON.parse(text);
    if(!json||!json.ok)throw new Error((json&&json.error)||'Réponse Yaya invalide');
    return json;
  }

  async function fetchFreshChantiers(api,signal){
    const sep=api.includes('?')?'&':'?';
    const stamp=Date.now();

    // Route canonique : elle lit directement l'onglet chantiers et inclut
    // désormais les colonnes I/J (dateDemarrage/dateSignature).
    try{
      const json=await fetchJson(
        api+sep+'tabs=chantiers&_yaya_signature_fresh='+stamp,
        signal
      );
      const rows=json&&json.data&&Array.isArray(json.data.chantiers)?json.data.chantiers:null;
      if(rows&&rows.length)return rows;
    }catch(err){
      console.warn('Lecture ciblée chantiers impossible, repli API complète :',err);
    }

    // Repli uniquement si la route ciblée est indisponible.
    const json=await fetchJson(
      api+sep+'_yaya_signature_fresh='+stamp+'&_yaya_force=1',
      signal
    );
    const rows=json&&json.data&&Array.isArray(json.data.chantiers)?json.data.chantiers:null;
    if(!rows)throw new Error('Rubrique chantiers absente de la réponse Yaya');
    return rows;
  }

  async function refreshSignatures(force){
    if(running)return false;
    if(!force&&Date.now()-lastRefreshAt<MIN_REFRESH_MS)return false;

    const api=apiUrl();
    const locals=localChantiers();
    if(!api||!locals){
      if(waitAttempts<20){
        waitAttempts++;
        setTimeout(function(){refreshSignatures(true);},250);
      }
      return false;
    }

    installSignatureRenderer();
    running=true;
    lastRefreshAt=Date.now();
    const ctrl=new AbortController();
    const timer=setTimeout(function(){ctrl.abort();},16000);

    try{
      const rows=await fetchFreshChantiers(api,ctrl.signal);

      const byId=new Map();
      const byName=new Map();
      rows.forEach(function(row){
        const id=String(row&&row.id||'').trim();
        if(id)byId.set(id,row);
        const key=nameKey(row&&row.nom);
        if(key){
          if(!byName.has(key))byName.set(key,[]);
          byName.get(key).push(row);
        }
      });

      let changed=false;
      let found=0;
      locals.forEach(function(local){
        const remote=remoteMatch(local,byId,byName);
        if(!remote||!Object.prototype.hasOwnProperty.call(remote,'dateSignature'))return;
        found++;
        const fresh=remote.dateSignature==null?'':String(remote.dateSignature).trim();
        const current=local.dateSignature==null?'':String(local.dateSignature).trim();
        if(current!==fresh){
          local.dateSignature=fresh;
          changed=true;
        }
      });

      if(changed){
        try{localStorage.setItem(CACHE_DATA_KEY,JSON.stringify(S));}catch(e){}
      }

      installSignatureRenderer();
      try{if(typeof render==='function')render();}catch(e){console.warn('Rendu signatures ignoré :',e);}
      try{window.dispatchEvent(new CustomEvent('yaya:signature-dates-refreshed',{detail:{found:found,total:rows.length,changed:changed}}));}catch(e){}
      console.info('Yaya signatures Sheet :',found,'/',rows.length,'lignes lues, changement =',changed);
      return true;
    }catch(err){
      console.warn('Lecture fraîche des dates de signature ignorée :',err);
      return false;
    }finally{
      clearTimeout(timer);
      running=false;
    }
  }

  installSignatureRenderer();
  window.yayaRefreshSignatureDates=function(){return refreshSignatures(true);};

  setTimeout(function(){refreshSignatures(true);},350);
  setTimeout(function(){refreshSignatures(true);},1800);

  window.addEventListener('focus',function(){refreshSignatures(false);});
  document.addEventListener('visibilitychange',function(){
    if(!document.hidden)refreshSignatures(false);
  });
})();
