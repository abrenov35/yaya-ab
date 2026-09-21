(function(){
  'use strict';
  if(window.__yayaMailStorageAdapterV1)return;
  window.__yayaMailStorageAdapterV1=true;

  function rawRows(){
    try{
      if(typeof S==='undefined'||!S)return [];
      if(Array.isArray(S.MAILS))return S.MAILS;
      if(Array.isArray(S.mails))return S.mails;
    }catch(e){}
    return [];
  }

  function legacy(row){
    row=row||{};
    return Object.assign({},row,{
      type:'MAIL',
      origine:'MAIL',
      origineMail:'MAIL',
      nomMail:String(row.expediteur||''),
      sujet:String(row.expediteur||''),
      objetMail:String(row.objet||''),
      contenuMail:String(row.corps||''),
      corpsMail:String(row.corps||''),
      titre:String(row.corps||row.objet||''),
      lien:String(row.lienGmail||'')
    });
  }

  window.yayaMailRawRows=function(){return rawRows();};
  window.yayaMailRows=function(){return rawRows().map(legacy);};
  window.yayaMailRawById=function(id){
    return rawRows().find(function(row){return String(row&&row.id||'')===String(id);})||null;
  };
  window.yayaMailById=function(id){
    const row=window.yayaMailRawById(id);
    return row?legacy(row):null;
  };
})();