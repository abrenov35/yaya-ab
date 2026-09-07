(function(){
  'use strict';

  function patchFunction(name, transform){
    try{
      const fn=window[name];
      if(typeof fn!=='function')return false;
      const before=fn.toString();
      const after=transform(before);
      if(!after||after===before)return false;
      window[name]=(0,eval)('('+after+')');
      return true;
    }catch(e){
      console.warn('[Yaya recent-items] '+name,e);
      return false;
    }
  }

  function install(){
    let changed=false;

    changed=patchFunction('renderAchats',src=>
      src.replace(/\.slice\(0\s*,\s*5\)/g,'.slice(0,10)')
    )||changed;

    changed=patchFunction('renderDocuments',src=>
      src.replace(
        "historiquePiecesYaya().filter(d=>String(d.origine||'document')!=='charge')",
        "historiquePiecesYaya().filter(d=>String(d.origine||'document')!=='charge').slice(0,10)"
      )
    )||changed;

    if(changed&&typeof window.render==='function'){
      try{window.render();}catch(e){}
    }
  }

  setTimeout(install,0);
  setTimeout(install,150);
})();

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

  function installCreateCompat(){
    const current=window.apiPost;
    if(typeof current!=='function'){
      setTimeout(installCreateCompat,120);
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

  installCreateCompat();
})();

(function(){
  'use strict';
  if(window.__yayaMarcheDevisLoaderV1)return;
  window.__yayaMarcheDevisLoaderV1=true;
  const script=document.createElement('script');
  script.src='marche-add-devis-action.js?v=marchedevis-1';
  script.async=false;
  document.head.appendChild(script);
})();
