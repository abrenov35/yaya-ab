(function(){
  'use strict';

  if(window.__yayaDevisBackgroundSaveV1)return;
  window.__yayaDevisBackgroundSaveV1=true;

  const CACHE_DATA_KEY='YAYA_CACHE_DATA_V2';
  let queue=Promise.resolve();

  function wait(ms){
    return new Promise(function(resolve){setTimeout(resolve,ms);});
  }

  function toastSafe(message,isError){
    try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}
  }

  function persistState(){
    try{
      if(typeof S!=='undefined'&&S&&typeof S==='object'){
        localStorage.setItem(CACHE_DATA_KEY,JSON.stringify(S));
      }
    }catch(e){}
  }

  function dateToday(){
    try{return typeof isoDate==='function'?isoDate(new Date()):new Date().toISOString().slice(0,10);}catch(e){return new Date().toISOString().slice(0,10);}
  }

  function sameQuote(v,row){
    return String(v&&v.chantierId||'')===String(row.chantierId||'')
      && String(v&&v.libelle||'').trim()===String(row.libelle||'').trim()
      && Number(v&&v.montantHT||0)===Number(row.montantHT||0)
      && String(v&&v.date||'').slice(0,10)===String(row.date||'').slice(0,10)
      && String(v&&v.lien||'')===String(row.lien||'');
  }

  async function freshAvenants(){
    if(typeof apiGet!=='function')throw new Error('Lecture de la base indisponible');
    const fresh=await apiGet(true);
    if(!fresh||!Array.isArray(fresh.avenants))throw new Error('Liste des devis indisponible dans la base');
    return fresh.avenants.slice();
  }

  function addLocal(row){
    try{
      if(typeof S==='undefined'||!S)return;
      if(!Array.isArray(S.avenants))S.avenants=[];
      if(!S.avenants.some(function(v){return String(v&&v.id||'')===String(row.id);})){S.avenants.push(row);}
      persistState();
      if(typeof render==='function')render();
    }catch(e){}
  }

  function removeLocal(rowId){
    try{
      if(typeof S==='undefined'||!S||!Array.isArray(S.avenants))return;
      S.avenants=S.avenants.filter(function(v){return String(v&&v.id||'')!==String(rowId);});
      persistState();
      if(typeof render==='function')render();
    }catch(e){}
  }

  function reconcileExisting(row,existing){
    try{
      if(typeof S==='undefined'||!S||!Array.isArray(S.avenants))return;
      S.avenants=S.avenants.filter(function(v){return String(v&&v.id||'')!==String(row.id);});
      if(existing&&!S.avenants.some(function(v){return String(v&&v.id||'')===String(existing.id||'');})){
        S.avenants.push(existing);
      }
      persistState();
      if(typeof render==='function')render();
    }catch(e){}
  }

  async function persistRow(row,numero){
    let base=await freshAvenants();

    const already=base.find(function(v){return sameQuote(v,row);});
    if(already){
      reconcileExisting(row,already);
      toastSafe('Devis '+numero+' enregistré ✓');
      return;
    }

    const payload=base.concat([row]);
    let ok=typeof apiPost==='function'?await apiPost('setAvenants',payload):false;
    if(!ok){
      await wait(500);
      ok=typeof apiPost==='function'?await apiPost('setAvenants',payload):false;
    }
    if(!ok)throw new Error('Écriture dans la base impossible');

    let confirmed=false;
    for(let attempt=0;attempt<3;attempt++){
      if(attempt)await wait(450*attempt);
      const check=await freshAvenants();
      if(check.some(function(v){return String(v&&v.id||'')===String(row.id);})){
        confirmed=true;
        break;
      }
    }
    if(!confirmed)throw new Error('Enregistrement non confirmé par le serveur');

    persistState();
    toastSafe('Devis '+numero+' enregistré ✓');
  }

  function install(){
    if(typeof window.saveAvenant!=='function'){
      setTimeout(install,120);
      return;
    }
    if(window.saveAvenant.__yayaBackgroundSave)return;

    const previous=window.saveAvenant;

    async function backgroundSave(cid){
      let numero=0;
      try{numero=Number(devisNumeroEnCours)||0;}catch(e){}

      // Le devis 1 conserve son mécanisme existant.
      if(numero<=1)return previous.apply(this,arguments);

      const mtInput=document.getElementById('avMt');
      if(!mtInput)return;

      const montantHT=Number(String(mtInput.value||'0').replace(',','.'))||0;
      if(!montantHT){
        toastSafe('Indique le montant HT du devis',true);
        return;
      }

      let libelle='Devis '+numero;
      const libInput=document.getElementById('avLib');
      if(libInput&&String(libInput.value||'').trim())libelle=String(libInput.value||'').trim();

      let lien='';
      try{lien=String(avenantLien||'');}catch(e){}

      const row={
        id:(typeof uid==='function'?uid():(Date.now().toString(36)+Math.random().toString(36).slice(2,8))),
        chantierId:String(cid||''),
        libelle:libelle,
        montantHT:montantHT,
        date:dateToday(),
        lien:lien
      };

      // Réponse immédiate à l'utilisateur : on libère la modale avant les appels réseau.
      addLocal(row);
      try{avenantLien='';devisNumeroExtrait='';}catch(e){}
      try{if(typeof closeModal==='function')closeModal();}catch(e){}
      toastSafe('Devis '+numero+' pris en compte — enregistrement en arrière-plan…');

      // Les écritures sont sérialisées pour éviter que deux devis simultanés s'écrasent.
      queue=queue
        .catch(function(){})
        .then(function(){return wait(0);})
        .then(function(){return persistRow(row,numero);})
        .catch(function(err){
          console.error('Yaya — enregistrement devis '+numero+' non confirmé :',err);
          removeLocal(row.id);
          toastSafe('Devis '+numero+' non enregistré — réessaie. ('+String(err&&err.message||err)+')',true);
        });

      return Promise.resolve(true);
    }

    backgroundSave.__yayaBackgroundSave=true;
    window.saveAvenant=backgroundSave;
    try{saveAvenant=backgroundSave;}catch(e){}
  }

  install();
  setTimeout(install,500);
  setTimeout(install,1200);
  window.addEventListener('yaya:data-refreshed',function(){setTimeout(install,0);});
})();
