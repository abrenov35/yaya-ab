(function(){
  'use strict';

  if(window.__yayaCommandeUploadNoAiFixV1)return;
  window.__yayaCommandeUploadNoAiFixV1=true;

  const nativeFetch=window.fetch.bind(window);

  window.fetch=function(input,init){
    try{
      const options=init||{};
      const body=options.body;
      const modalOpen=!!document.querySelector('.yaya-commande-create-overlay');

      if(modalOpen&&typeof body==='string'){
        const payload=JSON.parse(body);
        if(payload&&payload.action==='extraireDocument'&&payload.data&&payload.data.base64){
          payload.action='archiverDevis';
          options.body=JSON.stringify(payload);
          return nativeFetch(input,options);
        }
      }
    }catch(e){}

    return nativeFetch(input,init);
  };
})();
