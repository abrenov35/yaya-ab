(function(){
  'use strict';

  function ready(){
    try{return typeof S!=='undefined' && Array.isArray(S.chantiers) && typeof apiPost==='function';}
    catch(e){return false;}
  }

  function normalizeMode(c){
    if(!c || typeof c!=='object')return c;
    c.modeSuivi = c.modeSuivi==='documents' ? 'documents' : 'complet';
    return c;
  }

  function normalizeAll(){
    if(!ready())return;
    S.chantiers.forEach(normalizeMode);
  }

  function wrapApiPost(){
    if(typeof window.apiPost!=='function' || window.apiPost.__yayaModeSheetWrapped)return;
    const original=window.apiPost;
    const wrapped=async function(action,data){
      if(action==='setChantiers' && Array.isArray(data)){
        data.forEach(normalizeMode);
      }
      return await original.apply(this,arguments);
    };
    wrapped.__yayaModeSheetWrapped=true;
    window.apiPost=wrapped;
  }

  function install(){
    if(!ready())return setTimeout(install,100);
    normalizeAll();
    wrapApiPost();
  }

  install();
})();
