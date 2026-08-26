(function(){
  'use strict';

  const scripts=[
    'chantier-toolbar-style.js?v=stage1-1',
    'document-save-lock.js?v=stage1-1',
    'delete-confirm-preserve-files.js?v=stage1-1',
    'chantier-tabs-soft-theme.js?v=stage1-1'
  ];

  function loadNext(index){
    if(index>=scripts.length)return;
    const s=document.createElement('script');
    s.src=scripts[index];
    s.async=false;
    s.onload=function(){loadNext(index+1);};
    s.onerror=function(){console.warn('Yaya stage 1 non chargé :',scripts[index]);loadNext(index+1);};
    document.body.appendChild(s);
  }

  function boot(){loadNext(0);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
