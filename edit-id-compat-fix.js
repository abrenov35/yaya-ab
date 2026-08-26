(function(){
  'use strict';

  function collection(collectionName){
    try{
      if(typeof S!=='undefined' && S && Array.isArray(S[collectionName])) return S[collectionName];
    }catch(e){}
    return [];
  }

  function resolveId(collectionName,id){
    const found=collection(collectionName).find(x=>String(x&&x.id)===String(id));
    return found?found.id:id;
  }

  function wrap(name,collectionName){
    const original=window[name];
    if(typeof original!=='function' || original.__yayaLooseIdWrapped)return false;
    const wrapped=function(id){
      const args=[...arguments];
      args[0]=resolveId(collectionName,id);
      return original.apply(this,args);
    };
    wrapped.__yayaLooseIdWrapped=true;
    wrapped.__yayaOriginal=original;
    window[name]=wrapped;
    try{eval(name+'=window[\''+name+'\']');}catch(e){}
    return true;
  }

  function install(){
    wrap('editAchat','achats');
    wrap('editMontantAchat','achats');
    wrap('saveAchat','achats');
    wrap('editAvenantComplet','avenants');
    wrap('editMontantAvenant','avenants');
    wrap('saveAvenantComplet','avenants');
    wrap('delAvenant','avenants');
    wrap('editDocument','documents');
    wrap('saveDocumentEdit','documents');
    wrap('delDocument','documents');
  }

  install();
  setTimeout(install,100);
  setTimeout(install,500);
  window.addEventListener('yaya:data-refreshed',install);
})();
