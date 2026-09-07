(function(){
  'use strict';

  if(window.__yayaCreateAuthorizeCompatV1)return;
  window.__yayaCreateAuthorizeCompatV1=true;

  let intentUntil=0;
  let beforeIds=new Set();

  function currentIds(){
    try{
      return new Set((Array.isArray(S&&S.chantiers)?S.chantiers:[]).map(function(c){
        return String(c&&c.id||'').trim();
      }).filter(Boolean));
    }catch(e){
      return new Set();
    }
  }

  function markCreateIntent(event){
    const target=event&&event.target;
    const btn=target&&target.closest?target.closest('#chCreateBtn'):null;
    if(!btn)return;
    beforeIds=currentIds();
    intentUntil=Date.now()+60000;
  }

  document.addEventListener('pointerdown',markCreateIntent,true);
  document.addEventListener('click',markCreateIntent,true);

  function install(){
    const current=window.apiPost;
    if(typeof current!=='function'){
      setTimeout(install,120);
      return;
    }
    if(current.__yayaCreateAuthorizeCompatV1)return;

    const original=current;

    async function compatApiPost(action,data){
      if(
        action==='setChantiers' &&
        Array.isArray(data) &&
        intentUntil>Date.now() &&
        typeof window.yayaAuthorizeChantierCreate==='function'
      ){
        const added=data.filter(function(c){
          const id=String(c&&c.id||'').trim();
          return id&&!beforeIds.has(id);
        });

        if(added.length===1){
          window.yayaAuthorizeChantierCreate(added[0]);
          intentUntil=0;
          beforeIds=new Set();
        }
      }

      return original.apply(this,arguments);
    }

    compatApiPost.__yayaCreateAuthorizeCompatV1=true;
    compatApiPost.__yayaOriginalApiPost=original;
    window.apiPost=compatApiPost;
  }

  install();
})();
