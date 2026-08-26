(function(){
  'use strict';

  const previousVoirPiece=window.voirPiece;
  if(typeof previousVoirPiece!=='function')return;

  function isDropboxUrl(value){
    try{
      const u=new URL(String(value||''));
      return /(^|\.)dropbox\.com$/i.test(u.hostname)||/(^|\.)dropboxusercontent\.com$/i.test(u.hostname);
    }catch(e){
      return /dropbox\.com|dropboxusercontent\.com/i.test(String(value||''));
    }
  }

  function toDirectDropbox(value){
    try{
      const u=new URL(String(value||''));
      if(/(^|\.)dropbox\.com$/i.test(u.hostname))u.hostname='dl.dropboxusercontent.com';
      u.searchParams.delete('dl');
      u.searchParams.delete('raw');
      return u.toString();
    }catch(e){
      return String(value||'')
        .replace(/^https?:\/\/(?:www\.)?dropbox\.com/i,'https://dl.dropboxusercontent.com')
        .replace(/([?&])(dl|raw)=[^&]*/gi,'$1')
        .replace(/[?&]$/,'');
    }
  }

  window.voirPiece=function(value){
    const url=String(value||'').trim();
    if(!url)return;
    return previousVoirPiece(isDropboxUrl(url)?toDirectDropbox(url):url);
  };
})();
