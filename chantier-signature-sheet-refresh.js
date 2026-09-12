(function(){
  'use strict';

  if(window.__yayaSignatureBridgeV2Installed)return;
  window.__yayaSignatureBridgeV2Installed=true;

  const DATA_CACHE_KEY='YAYA_CACHE_DATA_V2';
  const MAP_KEY='YAYA_SIGNATURE_CANONICAL_V2';
  const SPECIAL='AVANT_2026-09';

  // Valeurs vérifiées directement dans YAYA-AB / chantiers / colonne J le 12/09/2026.
  // Elles servent uniquement tant que l'API Yaya ne renvoie pas dateSignature.
  const VERIFIED_BY_ID={
    'mrrpbaxcbsf6':'AVANT_2026-09',
    'msso73wnhrbp':'2026-09-01',
    'C454':'2026-09-08',
    'C463':'2026-09-01',
    'C433':'2026-07-30',
    'C356':'2026-04-02',
    'C430':'2026-07-25',
    'C347':'2026-03-24'
  };

  const VERIFIED_BY_NAME={
    'PAVAGEAU':'AVANT_2026-09',
    'ANGOT':'2026-09-01',
    'CONGREGATION IMM CONCEPTION':'2026-09-08',
    'MANINI SCI YZOTERRA':'2026-09-01',
    'MASTON ROMAIN':'2026-07-30',
    'SERGEANT':'2026-04-02',
    'LISSARAGUE':'2026-07-25',
    'CADIOU PAULINE 2 NOV':'2026-03-24'
  };

  let backendSupportsSignature=false;
  let backendSupportKnown=false;
  let applying=false;
  let installTries=0;

  function keyName(v){
    return String(v==null?'':v)
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toUpperCase().replace(/[^A-Z0-9]+/g,' ')
      .trim().replace(/\s+/g,' ');
  }

  function value(v){
    const s=String(v==null?'':v).trim();
    if(!s)return '';
    if(s.toUpperCase()===SPECIAL)return SPECIAL;
    const m=s.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
    if(!m)return s;
    return m[1]+'-'+m[2]+'-'+(m[3]||'01');
  }

  function loadMap(){
    try{
      const parsed=JSON.parse(localStorage.getItem(MAP_KEY)||'{}');
      return parsed&&typeof parsed==='object'?parsed:{};
    }catch(e){return {};}
  }

  function saveMap(map){
    try{localStorage.setItem(MAP_KEY,JSON.stringify(map));}catch(e){}
  }

  function rows(){
    try{return typeof S!=='undefined'&&S&&Array.isArray(S.chantiers)?S.chantiers:null;}
    catch(e){return null;}
  }

  function hasField(c){
    return !!(c&&Object.prototype.hasOwnProperty.call(c,'dateSignature'));
  }

  function idKey(c){return String(c&&c.id||'').trim();}

  function mapValue(c,map){
    const id=idKey(c);
    if(id&&Object.prototype.hasOwnProperty.call(map,id))return value(map[id]);
    const nk=keyName(c&&c.nom);
    if(nk&&Object.prototype.hasOwnProperty.call(VERIFIED_BY_NAME,nk))return value(VERIFIED_BY_NAME[nk]);
    return '';
  }

  function seedVerified(map){
    Object.keys(VERIFIED_BY_ID).forEach(function(id){
      if(!Object.prototype.hasOwnProperty.call(map,id))map[id]=VERIFIED_BY_ID[id];
    });
    return map;
  }

  function inspectBackend(list){
    if(!Array.isArray(list)||!list.length)return;
    backendSupportsSignature=list.some(hasField);
    backendSupportKnown=true;
  }

  function persistDataCache(){
    try{
      if(typeof S!=='undefined'&&S)localStorage.setItem(DATA_CACHE_KEY,JSON.stringify(S));
    }catch(e){}
  }

  function apply(){
    if(applying)return false;
    const list=rows();
    if(!list)return false;
    applying=true;
    try{
      let map=loadMap();
      let changed=false;

      if(!backendSupportKnown)inspectBackend(list);

      if(backendSupportsSignature){
        // Dès que le backend renverra J, la BDD reprend automatiquement la priorité.
        list.forEach(function(c){
          if(!hasField(c))return;
          const id=idKey(c);
          if(!id)return;
          const v=value(c.dateSignature);
          if(v)map[id]=v;
          else delete map[id];
        });
      }else{
        map=seedVerified(map);
        list.forEach(function(c){
          const current=value(c&&c.dateSignature);
          if(current){
            const id=idKey(c);
            if(id)map[id]=current;
            return;
          }
          const fresh=mapValue(c,map);
          if(fresh){
            c.dateSignature=fresh;
            changed=true;
          }
        });
      }

      saveMap(map);
      if(changed){
        persistDataCache();
        try{if(typeof render==='function')render();}catch(e){}
      }
      try{
        window.dispatchEvent(new CustomEvent('yaya:signature-dates-restored',{
          detail:{backend:backendSupportsSignature,changed:changed}
        }));
      }catch(e){}
      return changed;
    }finally{
      applying=false;
    }
  }

  function installApiGet(){
    const current=window.apiGet;
    if(typeof current!=='function'||current.__yayaSignatureBridgeV2)return false;
    const wrapped=async function(){
      const data=await current.apply(this,arguments);
      try{
        const list=data&&Array.isArray(data.chantiers)?data.chantiers:null;
        if(list)inspectBackend(list);
      }catch(e){}
      setTimeout(apply,0);
      return data;
    };
    wrapped.__yayaSignatureBridgeV2=true;
    window.apiGet=wrapped;
    return true;
  }

  function installApiPost(){
    const current=window.apiPost;
    if(typeof current!=='function'||current.__yayaSignatureBridgeV2)return false;
    const wrapped=async function(action,data){
      let proposed=null;
      if(String(action||'')==='setChantiers'&&Array.isArray(data)){
        proposed=data.filter(function(c){return c&&hasField(c);}).map(function(c){
          return {id:idKey(c),dateSignature:value(c.dateSignature)};
        });
      }
      const result=await current.apply(this,arguments);
      if(result!==false&&proposed){
        const map=loadMap();
        proposed.forEach(function(c){
          if(!c.id)return;
          if(c.dateSignature)map[c.id]=c.dateSignature;
          else delete map[c.id];
        });
        saveMap(map);
        setTimeout(apply,0);
      }
      return result;
    };
    wrapped.__yayaSignatureBridgeV2=true;
    window.apiPost=wrapped;
    return true;
  }

  function install(){
    installApiGet();
    installApiPost();
    const list=rows();
    if(list){
      if(!backendSupportKnown)inspectBackend(list);
      apply();
    }
    if((!list||typeof window.apiGet!=='function'||typeof window.apiPost!=='function')&&installTries<40){
      installTries++;
      setTimeout(install,150);
    }
  }

  window.yayaRestoreSignatureDates=apply;

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){setTimeout(install,0);},{once:true});
  }else{
    setTimeout(install,0);
  }
  setTimeout(install,350);
  setTimeout(apply,1200);
  setTimeout(apply,3000);

  window.addEventListener('yaya:data-refreshed',function(){setTimeout(apply,0);});
  window.addEventListener('focus',function(){setTimeout(apply,0);});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(apply,0);});
})();
