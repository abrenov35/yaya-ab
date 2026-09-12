(function(){
  'use strict';

  if(window.__yayaSignatureColumnFixV1Installed)return;
  window.__yayaSignatureColumnFixV1Installed=true;

  const MARKER_RE=/\s*\[\[YAYA_SIG:(\d{4}-\d{2})\]\]\s*/g;

  function monthValue(v){
    const s=String(v==null?'':v).trim();
    const m=s.match(/^(\d{4})-(\d{2})/);
    return m?m[1]+'-'+m[2]:s;
  }

  function markerValue(notes){
    const m=String(notes==null?'':notes).match(/\[\[YAYA_SIG:(\d{4}-\d{2})\]\]/);
    return m&&m[1]?m[1]:'';
  }

  function cleanNotes(notes){
    return String(notes==null?'':notes)
      .replace(MARKER_RE,'\n')
      .replace(/\n{3,}/g,'\n\n')
      .trim();
  }

  function normalizeRow(raw){
    const c=raw&&typeof raw==='object'?Object.assign({},raw):{};
    const fallback=markerValue(c.notes);
    c.notes=cleanNotes(c.notes);
    if(!String(c.dateSignature||'').trim()&&fallback){
      c.dateSignature=fallback+'-01';
    }else if(c.dateSignature){
      const m=monthValue(c.dateSignature);
      c.dateSignature=/^\d{4}-\d{2}$/.test(m)?m+'-01':String(c.dateSignature||'').trim();
    }
    return c;
  }

  function cleanLocalState(){
    try{
      if(typeof S==='undefined'||!S||!Array.isArray(S.chantiers))return;
      S.chantiers=S.chantiers.map(normalizeRow);
      try{localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(S));}catch(e){}
    }catch(e){}
  }

  function install(){
    if(typeof window.apiPost!=='function'){
      setTimeout(install,120);
      return;
    }
    if(window.apiPost.__yayaSignatureColumnFixV1)return;

    const guarded=window.apiPost;
    const rawPost=guarded.__yayaOriginalApiPost||guarded;

    async function patchedApiPost(action,data){
      if(action!=='setChantiers'||!Array.isArray(data)){
        return guarded(action,data);
      }

      const incoming=data.map(normalizeRow);
      const result=await guarded(action,incoming);
      if(result===false)return false;

      /*
       * Le garde-fou historique ajoutait encore [[YAYA_SIG:...]] dans notes.
       * Après son écriture validée, on renvoie la même liste nettoyée via
       * l'API native afin que notes reste une vraie note métier.
       * dateSignature reste le champ canonique de la signature.
       */
      const source=(typeof S!=='undefined'&&S&&Array.isArray(S.chantiers))?S.chantiers:incoming;
      const cleaned=source.map(normalizeRow);

      try{
        const cleanupOk=await rawPost('setChantiers',cleaned);
        if(cleanupOk===false)throw new Error('nettoyage notes refusé');
        if(typeof S!=='undefined'&&S)S.chantiers=cleaned.map(function(c){return Object.assign({},c);});
        try{localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(S));}catch(e){}
      }catch(err){
        console.error('Correction dateSignature : nettoyage notes impossible',err);
        return false;
      }

      return true;
    }

    patchedApiPost.__yayaSignatureColumnFixV1=true;
    patchedApiPost.__yayaOriginalApiPost=rawPost;
    window.apiPost=patchedApiPost;
    cleanLocalState();
  }

  install();
})();
