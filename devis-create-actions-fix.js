(function(){
  'use strict';

  const STYLE_ID='yaya-devis-create-actions-fix-v1';

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .yaya-devis-create-actions{
        display:flex!important;
        align-items:center!important;
        justify-content:flex-start!important;
        gap:10px!important;
        flex-wrap:nowrap!important;
        margin-top:18px!important;
      }
      .yaya-devis-create-actions > button{
        position:static!important;
        width:auto!important;
        min-width:0!important;
        max-width:none!important;
        height:42px!important;
        min-height:42px!important;
        margin:0!important;
        padding:0 20px!important;
        flex:0 0 auto!important;
        white-space:nowrap!important;
      }
      .yaya-devis-create-actions > .yaya-devis-import{
        background:#249457!important;
        border:1px solid #249457!important;
        color:#fff!important;
        opacity:1!important;
        filter:none!important;
      }
      .yaya-devis-create-actions > .yaya-devis-import:hover{
        background:#1d7f49!important;
        border-color:#1d7f49!important;
        color:#fff!important;
      }
    `;
    document.head.appendChild(style);
  }

  function getRoot(){
    return document.getElementById('modalRoot');
  }

  function patch(){
    const root=getRoot();
    if(!root)return;

    const modal=[...root.querySelectorAll('.overlay .modal')].find(function(item){
      const title=String(item.querySelector('h5')&&item.querySelector('h5').textContent||'').trim();
      const hasSave=[...item.querySelectorAll('button')].some(function(button){
        return /Enregistrer le devis/i.test(String(button.textContent||''));
      });
      return /^Ajouter le devis/i.test(title) || hasSave || item.classList.contains('yaya-devis-create-patched');
    });
    if(!modal)return;

    modal.classList.add('yaya-devis-create-patched');

    let buttons=[...modal.querySelectorAll('button')];
    const paste=buttons.find(function(button){
      return /Coller une capture/i.test(String(button.textContent||''));
    });
    if(paste)paste.remove();

    buttons=[...modal.querySelectorAll('button')];
    const cancel=buttons.find(function(button){
      return /^Annuler$/i.test(String(button.textContent||'').trim());
    });
    if(cancel)cancel.remove();

    buttons=[...modal.querySelectorAll('button')];
    const upload=buttons.find(function(button){
      const txt=String(button.textContent||'').trim();
      return /Importer le devis/i.test(txt) || /^Importer$/i.test(txt);
    });
    const save=buttons.find(function(button){
      const txt=String(button.textContent||'').trim();
      return /Enregistrer le devis/i.test(txt) || /^Enregistrer$/i.test(txt);
    });
    const close=buttons.find(function(button){
      return /^Fermer$/i.test(String(button.textContent||'').trim());
    });

    if(!upload||!save||!close)return;

    upload.textContent='Importer';
    save.textContent='Enregistrer';
    upload.classList.add('yaya-devis-import');

    let footer=modal.querySelector('.yaya-devis-create-actions');
    if(!footer){
      footer=save.closest('.mfoot');
      if(!footer){
        footer=document.createElement('div');
        modal.appendChild(footer);
      }
      footer.classList.add('mfoot','yaya-devis-create-actions');
    }

    if(upload.parentElement!==footer)footer.appendChild(upload);
    if(save.parentElement!==footer)footer.appendChild(save);
    if(close.parentElement!==footer)footer.appendChild(close);
  }

  function install(){
    installStyle();
    patch();

    const root=getRoot();
    if(!root)return;

    let raf=0;
    const observer=new MutationObserver(function(){
      if(raf)return;
      raf=requestAnimationFrame(function(){
        raf=0;
        patch();
      });
    });
    observer.observe(root,{childList:true,subtree:true});
  }

  if(document.body)install();
  else document.addEventListener('DOMContentLoaded',install,{once:true});
})();

// Devis 2+ : l'interface est libérée immédiatement. L'écriture et son contrôle
// continuent en arrière-plan, en file d'attente pour éviter les écrasements.
(function(){
  'use strict';

  const originalSave=typeof saveAvenant==='function'?saveAvenant:null;
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

  async function freshAvenants(){
    if(typeof apiGet!=='function')throw new Error('Lecture de la base indisponible');
    const fresh=await apiGet(true);
    if(!fresh||!Array.isArray(fresh.avenants))throw new Error('Liste des devis indisponible dans la base');
    return fresh.avenants.slice();
  }

  function sameQuote(v,row){
    return String(v&&v.chantierId||'')===String(row.chantierId||'')
      && String(v&&v.libelle||'').trim()===String(row.libelle||'').trim()
      && Number(v&&v.montantHT||0)===Number(row.montantHT||0)
      && String(v&&v.date||'').slice(0,10)===String(row.date||'').slice(0,10)
      && String(v&&v.lien||'')===String(row.lien||'');
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
      if(existing&&!S.avenants.some(function(v){return String(v&&v.id||'')===String(existing.id||'');}))S.avenants.push(existing);
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

  function saveBackground(cid){
    let numero=0;
    try{numero=Number(devisNumeroEnCours)||0;}catch(e){}
    if(numero<=1){
      if(originalSave)return originalSave(cid);
      return;
    }

    const mtInput=document.getElementById('avMt');
    if(!mtInput)return;

    const montantHT=Number(String(mtInput.value||'0').replace(',','.'))||0;
    if(!montantHT){toastSafe('Indique le montant HT du devis',true);return;}

    const libInput=document.getElementById('avLib');
    const libelle=String(libInput&&libInput.value||'').trim()||('Devis '+numero);

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

    // Immédiat : le devis apparaît et la modale se ferme. Yaya reste utilisable.
    addLocal(row);
    try{avenantLien='';devisNumeroExtrait='';}catch(e){}
    try{if(typeof closeModal==='function')closeModal();}catch(e){}
    toastSafe('Devis '+numero+' pris en compte — enregistrement en arrière-plan…');

    queue=queue
      .catch(function(){})
      .then(function(){return wait(0);})
      .then(function(){return persistRow(row,numero);})
      .catch(function(e){
        console.error('Yaya — enregistrement devis '+numero+' non confirmé :',e);
        removeLocal(row.id);
        toastSafe('Devis '+numero+' non enregistré — réessaie. ('+String(e&&e.message||e)+')',true);
      });

    return Promise.resolve(true);
  }

  saveBackground.__yayaBackgroundSave=true;
  window.saveAvenant=saveBackground;
  try{saveAvenant=saveBackground;}catch(e){}
})();
