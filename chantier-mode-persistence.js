(function(){
  'use strict';

  const TOKEN='__YAYA_MODE_DOCUMENTS__';
  const PARAM='yaya_mode';

  function ready(){
    try{return typeof S!=='undefined'&&Array.isArray(S.chantiers)&&typeof apiPost==='function';}
    catch(e){return false;}
  }

  function decodeNotes(c){
    if(!c)return;
    const raw=String(c.notes||'');
    let docs=false;
    let clean=raw;

    if(raw.includes(TOKEN)){
      docs=true;
      clean=raw.replace(new RegExp('\\n?'+TOKEN.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&'),'g'),'').trim();
    }

    if(/^https?:\/\//i.test(clean)){
      try{
        const u=new URL(clean);
        if(u.searchParams.get(PARAM)==='documents')docs=true;
        u.searchParams.delete(PARAM);
        clean=u.toString();
      }catch(e){}
    }

    c.notes=clean;
    if(docs)c.modeSuivi='documents';
  }

  function encodeNotes(c){
    let raw=String(c&&c.notes||'');
    raw=raw.replace(new RegExp('\\n?'+TOKEN.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&'),'g'),'').trim();

    if(/^https?:\/\//i.test(raw)){
      try{
        const u=new URL(raw);
        u.searchParams.delete(PARAM);
        if(c&&c.modeSuivi==='documents')u.searchParams.set(PARAM,'documents');
        return u.toString();
      }catch(e){}
    }

    if(c&&c.modeSuivi==='documents')return raw?raw+'\n'+TOKEN:TOKEN;
    return raw;
  }

  function decodeAll(){
    if(!ready())return;
    S.chantiers.forEach(decodeNotes);
  }

  function wrapApiPost(){
    if(typeof apiPost!=='function'||apiPost.__yayaModePersistWrapped)return;
    const original=apiPost;
    const wrapped=async function(action,payload){
      if(action==='setChantiers'&&Array.isArray(payload)){
        const persisted=payload.map(c=>Object.assign({},c,{notes:encodeNotes(c)}));
        return await original.call(this,action,persisted);
      }
      return await original.apply(this,arguments);
    };
    wrapped.__yayaModePersistWrapped=true;
    window.apiPost=wrapped;
  }

  function install(){
    if(!ready())return setTimeout(install,25);
    decodeAll();
    wrapApiPost();
  }

  install();
})();
