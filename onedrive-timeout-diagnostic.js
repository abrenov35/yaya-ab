(function(){
  'use strict';

  if(window.__yayaOneDriveTimeoutDiagnosticV2)return;
  window.__yayaOneDriveTimeoutDiagnosticV2=true;
  window.__yayaOneDriveDiagnosticVersion='timeout-v2';

  const nativeFetch=window.fetch.bind(window);
  const WATCHDOG_MS=12000;

  function isOneDrivePreviewRequest(init){
    try{
      const body=String(init&&init.body||'');
      return body.includes('"action":"getOneDriveFile"') || body.includes("'action':'getOneDriveFile'");
    }catch(e){
      return false;
    }
  }

  window.fetch=function(input,init){
    if(!isOneDrivePreviewRequest(init)){
      return nativeFetch(input,init);
    }

    if(init&&init.signal){
      return nativeFetch(input,init);
    }

    const ctrl=new AbortController();
    const started=Date.now();
    const timer=setTimeout(function(){
      try{ctrl.abort();}catch(e){}
    },WATCHDOG_MS);

    const nextInit=Object.assign({},init||{}, {
      signal:ctrl.signal,
      cache:'no-store'
    });

    return nativeFetch(input,nextInit)
      .catch(function(err){
        if(ctrl.signal.aborted){
          throw new Error('Lecture OneDrive bloquée : le backend Yaya ne répond pas après 12 secondes.');
        }
        throw err;
      })
      .finally(function(){
        clearTimeout(timer);
        try{
          console.info('Yaya OneDrive — durée appel backend : '+(Date.now()-started)+' ms');
        }catch(e){}
      });
  };

  function armLoadingNode(node){
    if(!(node instanceof Element))return;
    if(node.dataset&&node.dataset.yayaOneDriveWatchdog==='1')return;
    const text=String(node.textContent||'');
    if(text.indexOf('Chargement de la pièce')===-1)return;

    if(node.dataset)node.dataset.yayaOneDriveWatchdog='1';

    setTimeout(function(){
      if(!node.isConnected)return;
      const current=String(node.textContent||'');
      if(current.indexOf('Chargement de la pièce')===-1)return;
      node.textContent='Lecture OneDrive bloquée : aucune réponse du backend après 12 secondes.';
      node.style.textAlign='center';
      node.style.padding='20px';
    },WATCHDOG_MS+300);
  }

  function scan(){
    document.querySelectorAll('.piece-preview-loading').forEach(armLoadingNode);
  }

  const observer=new MutationObserver(scan);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  scan();
})();
