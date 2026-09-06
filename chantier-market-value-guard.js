(function(){
  'use strict';

  if(window.__yayaMarketValueGuardInstalled)return;
  window.__yayaMarketValueGuardInstalled=true;

  function copy(v){
    return v&&typeof v==='object'?Object.assign({},v):v;
  }

  function install(){
    if(typeof window.apiPost!=='function'||typeof window.apiGet!=='function'){
      setTimeout(install,120);
      return;
    }
    if(window.apiPost.__yayaMarketValueGuard)return;

    const previousApiPost=window.apiPost;

    async function guardedApiPost(action,data){
      if(action!=='setChantiers'||!Array.isArray(data)){
        return previousApiPost(action,data);
      }

      let safeData=data.map(copy);

      try{
        const fresh=await window.apiGet(true);
        const server=Array.isArray(fresh&&fresh.chantiers)?fresh.chantiers:[];
        const byId=new Map();
        server.forEach(function(c){
          const id=String(c&&c.id||'').trim();
          if(id&&!byId.has(id))byId.set(id,c);
        });

        safeData=safeData.map(function(c){
          const row=copy(c)||{};
          const id=String(row.id||'').trim();
          const old=byId.get(id);
          if(!old)return row;

          const serverMarket=Number(old.montantMarcheHT)||0;
          const incomingMarket=Number(row.montantMarcheHT)||0;

          // Une ancienne copie locale ne doit jamais effacer un marché chiffré.
          // Si le serveur possède déjà un montant > 0 et que la liste locale
          // tente de le remettre à 0/vide, on conserve la valeur serveur.
          if(serverMarket>0&&incomingMarket===0){
            console.warn(
              'Sécurité Yaya : remise à zéro du marché bloquée pour',
              id,
              old.nom,
              serverMarket
            );
            row.montantMarcheHT=serverMarket;
          }

          return row;
        });
      }catch(e){
        console.warn('Sécurité marché : contrôle serveur indisponible, écriture bloquée.',e);
        return false;
      }

      return previousApiPost(action,safeData);
    }

    guardedApiPost.__yayaMarketValueGuard=true;
    guardedApiPost.__yayaPreviousApiPost=previousApiPost;
    window.apiPost=guardedApiPost;
  }

  install();
})();
