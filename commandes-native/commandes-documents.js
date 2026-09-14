(()=>{
  'use strict';
  if(window.__YAYA_COMMANDES_NATIVE_DOC_LOADER)return;
  window.__YAYA_COMMANDES_NATIVE_DOC_LOADER=true;
  const s=document.createElement('script');
  s.src='../public/commandes-native/commandes-documents.js?v=2';
  s.async=false;
  s.onerror=()=>console.error('Yaya Commandes native : chargement documents impossible');
  document.head.appendChild(s);
})();
