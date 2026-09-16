(function(){
  'use strict';
  if(window.__yayaReliableAddAchatV1)return;
  window.__yayaReliableAddAchatV1=true;

  function wait(ms){return new Promise(function(resolve){setTimeout(resolve,ms);});}

  function hasAchat(rows,id){
    return Array.isArray(rows)&&rows.some(function(a){return String(a&&a.id||'')===String(id||'');});
  }

  async function verify(row){
    if(typeof window.apiGet!=='function')return false;
    try{
      await wait(700);
      const fresh=await window.apiGet(true);
      const rows=fresh&&Array.isArray(fresh.achats)?fresh.achats:[];
      if(!hasAchat(rows,row&&row.id))return false;
      try{
        if(typeof S!=='undefined'&&S)S.achats=rows;
      }catch(e){}
      return true;
    }catch(e){
      console.warn('Yaya achat · vérification serveur impossible',e);
      return false;
    }
  }

  function isTransportToast(message,isError){
    if(!isError)return false;
    const text=String(message||'');
    return /Échec d'enregistrement dans le Sheet/i.test(text)
      || /Réponse Google temporairement invalide/i.test(text)
      || /Unexpected token/i.test(text)
      || /not valid JSON/i.test(text);
  }

  async function callOriginal(original,action,data){
    const realToast=typeof window.toast==='function'?window.toast:null;
    let proxy=null;
    if(realToast){
      proxy=function(message,isError){
        if(isTransportToast(message,isError))return;
        return realToast.apply(this,arguments);
      };
      window.toast=proxy;
    }
    try{
      return await original(action,data);
    }finally{
      if(proxy&&window.toast===proxy)window.toast=realToast;
    }
  }

  function install(){
    if(typeof window.apiPost!=='function'||typeof window.apiGet!=='function'){
      setTimeout(install,120);
      return;
    }
    if(window.apiPost.__yayaReliableAddAchatV1)return;

    const original=window.apiPost;
    const wrapped=async function(action,data){
      if(String(action||'')!=='addAchat')return original.apply(this,arguments);

      window.__yayaWriteInFlight=(Number(window.__yayaWriteInFlight)||0)+1;
      try{
        let ok=false;
        try{ok=await callOriginal(original,action,data);}catch(e){console.warn('Yaya achat · premier POST',e);}
        if(ok===true)return true;
        if(await verify(data))return true;

        await wait(500);
        try{ok=await callOriginal(original,action,data);}catch(e){console.warn('Yaya achat · second POST',e);}
        if(ok===true)return true;
        return await verify(data);
      }finally{
        window.__yayaWriteInFlight=Math.max(0,(Number(window.__yayaWriteInFlight)||1)-1);
        window.__yayaLastWriteAt=Date.now();
      }
    };

    wrapped.__yayaReliableAddAchatV1=true;
    wrapped.__yayaWrappedApiPost=original;
    window.apiPost=wrapped;
    try{apiPost=wrapped;}catch(e){}
  }

  install();
  setTimeout(install,300);
  setTimeout(install,1000);
})();
