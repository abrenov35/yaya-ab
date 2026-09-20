(function(){
  'use strict';

  if(window.__yayaSignatureSheetRefreshV5Installed)return;
  window.__yayaSignatureSheetRefreshV5Installed=true;
  window.__yayaSignatureSheetRefreshV4Installed=true;
  window.__yayaSignatureSheetRefreshV3Installed=true;
  window.__yayaSignatureSheetRefreshV2Installed=true;
  window.__yayaSignatureSheetRefreshV1Installed=true;

  const CACHE_DATA_KEY='YAYA_CACHE_DATA_V2';
  const MIN_REFRESH_MS=60000;
  const REQUEST_TIMEOUT_MS=45000;
  const SPECIAL='AVANT_2026-09';
  const SPECIAL_LABEL='Signé avant Sept. 2026';
  let running=false;
  let lastRefreshAt=0;
  let waitAttempts=0;

  function apiUrl(){
    try{return typeof API!=='undefined'?String(API||''):'';}catch(e){return '';}
  }

  function idKey(v){
    return String(v==null?'':v).trim().toUpperCase();
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
    const id=idKey(local&&local.id);
    if(id&&byId.has(id))return byId.get(id);
    const key=nameKey(local&&local.nom);
    const hits=key?byName.get(key):null;
    return hits&&hits.length===1?hits[0]:null;
  }

  async function fetchJsonWithTimeout(url,timeoutMs){
    const ctrl=new AbortController();
    const timer=setTimeout(function(){ctrl.abort();},timeoutMs);
    try{
      const r=await fetch(url,{method:'GET',cache:'no-store',signal:ctrl.signal});
      const text=await r.text();
      if(/^\s*</.test(text))throw new Error('Réponse Yaya temporairement invalide');
      const json=JSON.parse(text);
      if(!json||!json.ok)throw new Error((json&&json.error)||'Réponse Yaya invalide');
      return json;
    }finally{
      clearTimeout(timer);
    }
  }

  async function fetchFreshChantiers(api){
    const sep=api.includes('?')?'&':'?';
    let lastErr=null;

    for(let attempt=1;attempt<=2;attempt++){
      try{
        const url=api+sep+'tabs=chantiers&_yaya_signature_fresh='+Date.now()+'_'+attempt;
        const json=await fetchJsonWithTimeout(url,REQUEST_TIMEOUT_MS);
        const rows=json&&json.data&&Array.isArray(json.data.chantiers)?json.data.chantiers:null;
        if(!rows||!rows.length)throw new Error('Rubrique chantiers vide');

        const withField=rows.filter(function(row){
          return row&&Object.prototype.hasOwnProperty.call(row,'dateSignature');
        }).length;

        if(!withField){
          throw new Error('dateSignature absente de la route chantiers');
        }

        return rows;
      }catch(err){
        lastErr=err;
        if(attempt<2){
          console.warn('Lecture colonne J tentative '+attempt+' échouée, nouvelle tentative :',err);
          await new Promise(function(resolve){setTimeout(resolve,1200);});
        }
      }
    }

    throw lastErr||new Error('Lecture colonne J impossible');
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

    try{
      const rows=await fetchFreshChantiers(api);

      const byId=new Map();
      const byName=new Map();
      rows.forEach(function(row){
        const id=idKey(row&&row.id);
        if(id)byId.set(id,row);
        const key=nameKey(row&&row.nom);
        if(key){
          if(!byName.has(key))byName.set(key,[]);
          byName.get(key).push(row);
        }
      });

      let changed=false;
      let matched=0;
      let found=0;
      locals.forEach(function(local){
        const remote=remoteMatch(local,byId,byName);
        if(!remote)return;
        matched++;
        if(!Object.prototype.hasOwnProperty.call(remote,'dateSignature'))return;
        found++;
        const locked=typeof window.__yayaLockedSignatureFor==='function'
          ?window.__yayaLockedSignatureFor(local.id):'';
        const fresh=locked||(remote.dateSignature==null?'':String(remote.dateSignature).trim());
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
      try{window.dispatchEvent(new CustomEvent('yaya:signature-dates-refreshed',{detail:{matched:matched,found:found,total:rows.length,changed:changed}}));}catch(e){}
      console.info('Yaya signatures Sheet :',found,'/',rows.length,'lignes lues ; correspondances =',matched,'; changement =',changed);
      return true;
    }catch(err){
      console.warn('Lecture fraîche des dates de signature ignorée :',err);
      return false;
    }finally{
      running=false;
    }
  }

  installSignatureRenderer();
  window.yayaRefreshSignatureDates=function(){return refreshSignatures(true);};

  // Laisser le chargement principal Yaya finir avant d'interroger le Sheet.
  setTimeout(function(){refreshSignatures(true);},2500);
  setTimeout(function(){refreshSignatures(true);},8000);

  window.addEventListener('focus',function(){refreshSignatures(false);});
  document.addEventListener('visibilitychange',function(){
    if(!document.hidden)refreshSignatures(false);
  });
})();
