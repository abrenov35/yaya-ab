(function(){
  'use strict';

  function resolveId(collectionName,id){
    try{
      const list=(window.S&&Array.isArray(S[collectionName]))?S[collectionName]:[];
      const found=list.find(x=>String(x&&x.id)===String(id));
      return found?found.id:id;
    }catch(e){
      return id;
    }
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
    let count=0;
    count+=wrap('editAchat','achats')?1:0;
    count+=wrap('editMontantAchat','achats')?1:0;
    count+=wrap('saveAchat','achats')?1:0;
    count+=wrap('editAvenantComplet','avenants')?1:0;
    count+=wrap('editMontantAvenant','avenants')?1:0;
    count+=wrap('saveAvenantComplet','avenants')?1:0;
    count+=wrap('editDocument','documents')?1:0;
    count+=wrap('saveDocumentEdit','documents')?1:0;
    return count;
  }

  install();
  setTimeout(install,100);
  setTimeout(install,500);
  window.addEventListener('yaya:data-refreshed',install);
})();
