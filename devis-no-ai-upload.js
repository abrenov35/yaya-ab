(function(){
  'use strict';
  if(window.__yayaDevisNoAiRestoreLoaderV1)return;
  window.__yayaDevisNoAiRestoreLoaderV1=true;
  fetch('https://raw.githubusercontent.com/abrenov35/yaya-ab/4cf327e1badd3f650ddd896fac81ce87e686751a/devis-no-ai-upload.js',{cache:'no-store'})
    .then(function(r){if(!r.ok)throw new Error('restore '+r.status);return r.text();})
    .then(function(code){(0,eval)(code);})
    .catch(function(err){console.error('Yaya : restauration import devis impossible',err);});
})();

(function(){
  'use strict';
  if(window.__yayaMailDevisPersistenceLoaderV3)return;
  window.__yayaMailDevisPersistenceLoaderV3=true;
  const s=document.createElement('script');
  s.src='mail-devis-persistence-verify.js?v=persist-3';
  s.async=false;
  s.onerror=function(){console.error('Yaya : contrôle persistance Mail/Devis non chargé');};
  document.head.appendChild(s);
})();
