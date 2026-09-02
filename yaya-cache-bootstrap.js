(function(){
  'use strict';

  if(window.__yayaCacheBootstrapInstalled)return;
  window.__yayaCacheBootstrapInstalled=true;

  const API_URL='https://script.google.com/macros/s/AKfycbx6IwMFf2plAq7i8qf8qF6f6MMC-1-WynAqn1ZRqCZrVqHeE9a1ygSSTzp5uOf0L3bn/exec';
  const CACHE_KEY='yaya.data.cache.v3';
  const nativeFetch=window.fetch.bind(window);
  let firstMainGet=true;

  window.__yayaNativeFetch=nativeFetch;

  function validData(data){
    return !!(
      data &&
      typeof data==='object' &&
      Array.isArray(data.chantiers) &&
      Array.isArray(data.achats) &&
      Array.isArray(data.heures)
    );
  }

  function readCache(){
    try{
      const raw=localStorage.getItem(CACHE_KEY);
      if(!raw)return null;
      const parsed=JSON.parse(raw);
      if(!parsed||!validData(parsed.data))return null;
      return parsed;
    }catch(e){
      return null;
    }
  }

  function writeCache(data,meta){
    if(!validData(data))return false;
    try{
      const current=readCache()||{};
      localStorage.setItem(CACHE_KEY,JSON.stringify({
        schema:3,
        savedAt:Date.now(),
        checkedAt:current.checkedAt||0,
        meta:meta||current.meta||null,
        data:data
      }));
      return true;
    }catch(e){
      // Si le navigateur a atteint sa limite de stockage, on conserve le site
      // fonctionnel et on retentera au prochain chargement.
      return false;
    }
  }

  function patchCache(values){
    try{
      const current=readCache();
      if(!current)return;
      Object.assign(current,values||{});
      localStorage.setItem(CACHE_KEY,JSON.stringify(current));
    }catch(e){}
  }

  window.__yayaCache={
    key:CACHE_KEY,
    read:readCache,
    write:writeCache,
    patch:patchCache,
    clear:function(){try{localStorage.removeItem(CACHE_KEY);}catch(e){}}
  };

  function requestUrl(input){
    if(typeof input==='string')return input;
    try{return String(input&&input.url||'');}catch(e){return '';}
  }

  function requestMethod(input,init){
    if(init&&init.method)return String(init.method).toUpperCase();
    try{return String(input&&input.method||'GET').toUpperCase();}catch(e){return 'GET';}
  }

  function isMainApiGet(input,init){
    if(requestMethod(input,init)!=='GET')return false;
    const url=requestUrl(input);
    if(!url||url.indexOf(API_URL)!==0)return false;
    try{
      const u=new URL(url,location.href);
      if(u.searchParams.get('mode')==='meta')return false;
      if(u.searchParams.has('tabs'))return false;
      if(u.searchParams.get('_yaya_force')==='1')return false;
    }catch(e){}
    return true;
  }

  function cachedResponse(data){
    return new Response(JSON.stringify({
      ok:true,
      data:data,
      cache:true
    }),{
      status:200,
      headers:{'Content-Type':'application/json;charset=utf-8'}
    });
  }

  window.fetch=async function(input,init){
    const mainGet=isMainApiGet(input,init);

    if(mainGet&&firstMainGet){
      firstMainGet=false;
      const cached=readCache();
      if(cached&&validData(cached.data)){
        window.__yayaStartedFromCache=true;
        window.__yayaCacheAgeMs=Math.max(0,Date.now()-Number(cached.savedAt||0));
        return cachedResponse(cached.data);
      }
      window.__yayaStartedFromCache=false;
    }

    const response=await nativeFetch(input,init);

    if(mainGet&&response&&response.ok){
      try{
        response.clone().json().then(function(json){
          if(json&&json.ok&&validData(json.data))writeCache(json.data,json.meta||null);
        }).catch(function(){});
      }catch(e){}
    }

    return response;
  };
})();
