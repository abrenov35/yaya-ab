(function(){
  'use strict';

  if(window.__yayaOneDriveTimeoutDiagnosticV1)return;
  window.__yayaOneDriveTimeoutDiagnosticV1=true;

  const nativeFetch=window.fetch.bind(window);

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
    },15000);

    const nextInit=Object.assign({},init||{}, {signal:ctrl.signal});

    return nativeFetch(input,nextInit)
      .catch(function(err){
        if(ctrl.signal.aborted){
          throw new Error('Lecture OneDrive bloquée : le backend Yaya ne répond pas après 15 secondes.');
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
})();
