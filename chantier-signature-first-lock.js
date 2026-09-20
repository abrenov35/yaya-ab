(function(){
  'use strict';

  if(window.__yayaSignatureFirstLockV1Installed)return;
  window.__yayaSignatureFirstLockV1Installed=true;

  const STORE_ID='__YAYA_SIGNATURE_LOCKS_V1__';
  const CACHE_KEY='YAYA_SIGNATURE_LOCKS_V1';
  const DATA_CACHE_KEY='YAYA_CACHE_DATA_V2';
  let locks={};
  let saving=false;
  let saveTimer=0;

  function idKey(v){return String(v==null?'':v).trim().toUpperCase();}
  function signatureValue(v){
    const raw=String(v==null?'':v).trim();
    const full=raw.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
    if(full)return full[1]+'-'+full[2]+(full[3]?'-'+full[3]:'');
    const year=raw.match(/^(\d{4})$/);
    return year?year[1]:'';
  }
  function isExtranet(c){
    return /^C\d+$/i.test(String(c&&c.id||'').trim()) ||
      /EXTRANET/i.test(String(c&&(c.origine||c.source)||''));
  }
  function state(){
    try{return typeof S!=='undefined'&&S?S:null;}catch(e){return null;}
  }
  function readLocal(){
    try{
      const value=JSON.parse(localStorage.getItem(CACHE_KEY)||'{}');
      return value&&typeof value==='object'&&!Array.isArray(value)?value:{};
    }catch(e){return {};}
  }
  function readCentral(s){
    try{
      const doc=(s.documents||[]).find(function(d){return String(d&&d.id)===STORE_ID;});
      if(!doc)return {};
      const value=JSON.parse(String(doc.sujet||'{}'));
      return value&&typeof value==='object'&&!Array.isArray(value)?value:{};
    }catch(e){return {};}
  }
  function clean(source){
    const out={};
    Object.keys(source||{}).forEach(function(id){
      const value=signatureValue(source[id]);
      if(idKey(id)&&value)out[idKey(id)]=value;
    });
    return out;
  }
  function saveCache(s){
    try{localStorage.setItem(CACHE_KEY,JSON.stringify(locks));}catch(e){}
    try{if(s)localStorage.setItem(DATA_CACHE_KEY,JSON.stringify(s));}catch(e){}
  }
  function storeDoc(s){
    if(!Array.isArray(s.documents))s.documents=[];
    let doc=s.documents.find(function(d){return String(d&&d.id)===STORE_ID;});
    if(!doc){
      doc={id:STORE_ID,chantierId:'',type:'Divers',titre:'Verrou interne dates de signature',sujet:'{}',date:'',lien:''};
      s.documents.push(doc);
    }
    doc.sujet=JSON.stringify(locks);
  }
  function persistSoon(){
    clearTimeout(saveTimer);
    saveTimer=setTimeout(persist,900);
  }
  async function persist(){
    const s=state();
    if(!s||saving)return;
    storeDoc(s);
    saveCache(s);
    const post=typeof apiPost==='function'?apiPost:
      (typeof window.apiPost==='function'?window.apiPost:null);
    if(!post){
      console.warn('Verrou des dates de signature : apiPost indisponible');
      return;
    }
    saving=true;
    try{
      const ok=await post('setDocuments',s.documents);
      if(ok===false)throw new Error('enregistrement refusé');
    }catch(e){
      console.warn('Verrou des dates de signature non enregistré :',e);
    }finally{saving=false;}
  }
  function apply(){
    const s=state();
    if(!s||!Array.isArray(s.chantiers))return false;
    locks=Object.assign({},clean(readLocal()),clean(readCentral(s)),clean(locks));
    let newLock=false;
    let changed=false;
    s.chantiers.forEach(function(c){
      if(!isExtranet(c))return;
      const id=idKey(c.id);
      if(!id)return;
      if(locks[id]){
        if(signatureValue(c.dateSignature)!==locks[id]){
          c.dateSignature=locks[id];
          changed=true;
        }
      }else{
        const value=signatureValue(c.dateSignature);
        if(value){locks[id]=value;newLock=true;}
      }
    });
    saveCache(s);
    if(newLock)persistSoon();
    return changed;
  }

  window.__yayaLockedSignatureFor=function(id){
    apply();
    return locks[idKey(id)]||'';
  };
  window.__yayaUpdateLockedSignature=function(id,value){
    const key=idKey(id);
    const normalized=signatureValue(value);
    if(!key)return Promise.resolve(false);
    if(normalized)locks[key]=normalized;else delete locks[key];
    const s=state();
    if(s)storeDoc(s);
    saveCache(s);
    clearTimeout(saveTimer);
    return persist().then(function(){return true;});
  };

  function refresh(){
    if(apply()){
      try{if(typeof render==='function')render();}catch(e){}
    }
  }
  window.addEventListener('yaya:data-refreshed',refresh);
  window.addEventListener('yaya:signature-dates-refreshed',refresh);
  setTimeout(refresh,500);
  setTimeout(refresh,2200);
})();
