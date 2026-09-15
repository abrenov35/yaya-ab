(function(){
  'use strict';
  if(window.__yayaDevisNoAiUploadV11)return;
  window.__yayaDevisNoAiUploadV11=true;
  /* Le code d'import existant reste installé par la version précédente déjà chargée. */
})();

(function(){
  'use strict';
  if(window.__yayaMailDevisPersistenceLoaderV1)return;
  window.__yayaMailDevisPersistenceLoaderV1=true;
  const s=document.createElement('script');
  s.src='mail-devis-persistence-verify.js?v=persist-1';
  s.async=false;
  s.onerror=function(){console.error('Yaya : contrôle persistance Mail/Devis non chargé');};
  document.head.appendChild(s);
})();
