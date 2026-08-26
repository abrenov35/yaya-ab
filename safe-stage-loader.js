(function(){
  'use strict';

  const scripts=[
    'chantier-toolbar-style.js?v=stage2-1',
    'document-save-lock.js?v=stage2-1',
    'delete-confirm-preserve-files.js?v=stage2-1',
    'chantier-tabs-soft-theme.js?v=stage2-1',
    'piece-preview-patch.js?v=stage2-1',
    'piece-preview-api-patch.js?v=stage2-1',
    'piece-preview-size-patch.js?v=stage2-1',
    'dropbox-preview-fix.js?v=stage2-1',
    'evolution-ca-2026-patch.js?v=stage2-1'
  ];

  function loadNext(index){
    if(index>=scripts.length)return;
    const s=document.createElement('script');
    s.src=scripts[index];
    s.async=false;
    s.onload=function(){loadNext(index+1);};
    s.onerror=function(){console.warn('Yaya stage 2 non chargé :',scripts[index]);loadNext(index+1);};
    document.body.appendChild(s);
  }

  function boot(){loadNext(0);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
