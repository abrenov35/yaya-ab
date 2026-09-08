(function(){
  'use strict';

  const STYLE_ID='yaya-commande-action-modal-style-v3';

  function esc(v){
    const d=document.createElement('div');
    d.textContent=String(v==null?'':v);
    return d.innerHTML;
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      .yaya-commande-edit-overlay,
      .yaya-commande-delete-overlay,
      .yaya-commande-depense-overlay{
        position:fixed!important;
        inset:0!important;
        z-index:24000!important;
        background:rgba(22,45,73,.48)!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        padding:16px!important;
        overflow:auto!important;
      }
      .yaya-commande-edit-modal,
      .yaya-commande-delete-modal,
      .yaya-commande-depense-modal{
        width:min(440px,100%)!important;
        max-height:calc(100vh - 32px)!important;
        overflow:auto!important;
        margin:auto!important;
        background:#fff!important;
        border-radius:14px!important;
        padding:20px!important;
        box-shadow:0 18px 55px rgba(0,0,0,.28)!important;
      }
      .yaya-commande-edit-modal h3,
      .yaya-commande-delete-modal h3,
      .yaya-commande-depense-modal h3{
        margin:0 0 14px!important;
        font-size:17px!important;
        color:#162d49!important;
      }
      .yaya-commande-delete-text,
      .yaya-commande-depense-text{
        margin:0!important;
        font-size:14px!important;
        line-height:1.5!important;
        color:#334155!important;
      }
      .yaya-commande-edit-field{display:block!important;margin:10px 0!important;font-size:12px!important;font-weight:700!important;color:#4b5b70!important}
      .yaya-commande-edit-field input{display:block!important;width:100%!important;margin-top:5px!important;padding:9px 10px!important;border:1px solid #cbd5e1!important;border-radius:7px!important;font:inherit!important;color:#162d49!important;background:#fff!important;box-sizing:border-box!important}
      .yaya-commande-edit-actions,
      .yaya-commande-delete-actions,
      .yaya-commande-depense-actions{
        display:flex!important;
        justify-content:flex-end!important;
        gap:10px!important;
        margin-top:18px!important;
        flex-wrap:wrap!important;
      }
      .yaya-commande-edit-actions button,
      .yaya-commande-delete-actions button,
      .yaya-commande-depense-actions button{
        min-height:42px!important;
        padding:9px 15px!important;
        border-radius:8px!important;
        font-weight:700!important;
        cursor:pointer!important;
      }
      .yaya-commande-cancel,
      .yaya-commande-delete-cancel,
      .yaya-commande-depense-no{border:1px solid #cbd5e1!important;background:#fff!important;color:#334155!important}
      .yaya-commande-save{border:1px solid #285943!important;background:#285943!important;color:#fff!important}
      .yaya-commande-delete-confirm{border:1px solid #b42318!important;background:#b42318!important;color:#fff!important;font-weight:800!important}
      .yaya-commande-depense-yes{border:1px solid #0f4f8d!important;background:#0f4f8d!important;color:#fff!important;font-weight:800!important}
      .yaya-commande-delete-confirm:disabled,
      .yaya-commande-depense-yes:disabled{opacity:.6!important;cursor:default!important}
    `;
    document.head.appendChild(s);
  }

  function endpoint(){
    try{if(typeof API!=='undefined'&&API)return String(API);}catch(e){}
    return 'https://script.google.com/macros/s/AKfycbx6IwMFf2plAq7i8qf8qF6f6MMC-1-WynAqn1ZRqCZrVqHeE9a1ygSSTzp5uOf0L3bn/exec';
  }

  async function setCommandes(rows){
    const r=await fetch(endpoint(),{method:'POST',cache:'no-store',body:JSON.stringify({action:'setCommandes',data:rows})});
    const txt=await r.text();
    let json;
    try{json=JSON.parse(txt);}catch(e){throw new Error('Réponse Yaya invalide');}
    if(!json||json.ok!==true)throw new Error((json&&json.error)||'Enregistrement impossible');
  }

  function findCommande(id){
    return typeof S!=='undefined'&&Array.isArray(S.commandes)
      ? (S.commandes.find(c=>String(c.id||'')===String(id))||null)
      : null;
  }

  function parseMontant(v){
    const n=Number(String(v||'').replace(/\s/g,'').replace(',','.'));
    return Number.isFinite(n)?n:0;
  }

  function refreshLocal(rows){
    if(typeof S!=='undefined')S.commandes=rows;
    try{if(typeof render==='function')render();}catch(e){}
    try{window.dispatchEvent(new Event('yaya:data-refreshed'));}catch(e){}
  }

  function openEdit(commande){
    installStyle();
    document.querySelectorAll('.yaya-commande-edit-overlay').forEach(x=>x.remove());
    const overlay=document.createElement('div');
    overlay.className='yaya-commande-edit-overlay';
    overlay.innerHTML='<div class="yaya-commande-edit-modal" role="dialog" aria-modal="true">'
      +'<h3>Modifier la commande</h3>'
      +'<label class="yaya-commande-edit-field">Fournisseur<input data-field="fournisseur" value="'+esc(commande.fournisseur||'')+'"></label>'
      +'<label class="yaya-commande-edit-field">Description<input data-field="designation" value="'+esc(commande.designation||commande.pieceNom||'')+'"></label>'
      +'<label class="yaya-commande-edit-field">Montant HT<input data-field="montantHT" inputmode="decimal" value="'+esc(commande.montantHT||0)+'"></label>'
      +'<label class="yaya-commande-edit-field">Date<input data-field="date" type="date" value="'+esc(String(commande.date||'').slice(0,10))+'"></label>'
      +'<div class="yaya-commande-edit-actions"><button type="button" class="yaya-commande-save">Enregistrer</button><button type="button" class="yaya-commande-cancel">Annuler</button></div></div>';
    document.body.appendChild(overlay);

    const close=()=>overlay.remove();
    overlay.querySelector('.yaya-commande-cancel').onclick=close;
    overlay.addEventListener('click',e=>{if(e.target===overlay)close();});

    overlay.querySelector('.yaya-commande-save').onclick=async function(){
      const btn=this;
      btn.disabled=true;
      try{
        const updated=Object.assign({},commande,{
          fournisseur:String(overlay.querySelector('[data-field="fournisseur"]').value||'').trim(),
          designation:String(overlay.querySelector('[data-field="designation"]').value||'').trim(),
          montantHT:parseMontant(overlay.querySelector('[data-field="montantHT"]').value),
          date:String(overlay.querySelector('[data-field="date"]').value||'').trim()
        });
        const next=(S.commandes||[]).map(c=>String(c.id||'')===String(updated.id)?updated:c);
        await setCommandes(next);
        close();
        refreshLocal(next);
      }catch(err){
        btn.disabled=false;
        alert('Modification impossible : '+String(err&&err.message||err));
      }
    };
  }

  function demanderSuppression(commande){
    installStyle();
    document.querySelectorAll('.yaya-commande-delete-overlay').forEach(x=>x.remove());

    return new Promise(function(resolve){
      const overlay=document.createElement('div');
      overlay.className='yaya-commande-delete-overlay';

      const libelle=String(
        commande.designation||
        commande.pieceNom||
        commande.fournisseur||
        'cette commande'
      ).trim();

      overlay.innerHTML='<div class="yaya-commande-delete-modal" role="dialog" aria-modal="true" aria-labelledby="yayaCommandeDeleteTitle">'
        +'<h3 id="yayaCommandeDeleteTitle">Supprimer la commande ?</h3>'
        +'<p class="yaya-commande-delete-text">Confirmer la suppression de <b>« '+esc(libelle)+' »</b> ?</p>'
        +'<div class="yaya-commande-delete-actions">'
        +'<button type="button" class="yaya-commande-delete-cancel">Annuler</button>'
        +'<button type="button" class="yaya-commande-delete-confirm">Supprimer</button>'
        +'</div></div>';

      function done(value){
        if(overlay.parentNode)overlay.remove();
        resolve(value);
      }

      overlay.querySelector('.yaya-commande-delete-cancel').onclick=function(){done(false);};
      overlay.querySelector('.yaya-commande-delete-confirm').onclick=function(){done(true);};
      overlay.addEventListener('click',function(e){if(e.target===overlay)done(false);});
      document.body.appendChild(overlay);
      setTimeout(function(){
        const b=overlay.querySelector('.yaya-commande-delete-cancel');
        if(b)b.focus();
      },0);
    });
  }

  async function removeCommande(id){
    const commande=findCommande(id);
    if(!commande)return;

    const ok=await demanderSuppression(commande);
    if(!ok)return;

    try{
      const next=(S.commandes||[]).filter(c=>String(c.id||'')!==String(id));
      await setCommandes(next);
      refreshLocal(next);
    }catch(err){
      alert('Suppression impossible : '+String(err&&err.message||err));
    }
  }

  document.addEventListener('click',function(e){
    const view=e.target.closest&&e.target.closest('.yaya-detail-commande-view');
    if(view){
      e.preventDefault();
      e.stopPropagation();
      const lien=String(view.dataset.lien||'');
      if(lien){
        try{
          if(typeof voirPiece==='function')voirPiece(lien);
          else window.open(lien,'_blank','noopener,noreferrer');
        }catch(err){
          window.open(lien,'_blank','noopener,noreferrer');
        }
      }
      return;
    }

    const edit=e.target.closest&&e.target.closest('.yaya-detail-commande-edit');
    if(edit){
      e.preventDefault();
      e.stopPropagation();
      const c=findCommande(edit.dataset.commandeId);
      if(c)openEdit(c);
      return;
    }

    const del=e.target.closest&&e.target.closest('.yaya-detail-commande-delete');
    if(del){
      e.preventDefault();
      e.stopPropagation();
      removeCommande(del.dataset.commandeId);
    }
  },true);

  // --- Commande -> Dépense : une seule saisie ---
  const knownCommandeIds=new Set();
  const promptedCommandeIds=new Set();
  let lastCreateSaveAt=0;
  let knownReady=false;

  function toastSafe(message,isError){
    try{if(typeof toast==='function')toast(message,!!isError);}catch(e){}
  }

  function seedKnownCommandes(){
    try{
      if(typeof S==='undefined'||!S||!Array.isArray(S.commandes))return false;
      S.commandes.forEach(function(c){
        const id=String(c&&c.id||'').trim();
        if(id)knownCommandeIds.add(id);
      });
      knownReady=true;
      return true;
    }catch(e){return false;}
  }

  function demanderAjoutDepense(commande){
    installStyle();
    document.querySelectorAll('.yaya-commande-depense-overlay').forEach(x=>x.remove());

    return new Promise(function(resolve){
      const overlay=document.createElement('div');
      overlay.className='yaya-commande-depense-overlay';
      overlay.innerHTML='<div class="yaya-commande-depense-modal" role="dialog" aria-modal="true" aria-labelledby="yayaCommandeDepenseTitle">'
        +'<h3 id="yayaCommandeDepenseTitle">Enregistrer aussi dans Dépenses ?</h3>'
        +'<p class="yaya-commande-depense-text">La commande est enregistrée. Voulez-vous enregistrer <b>la même pièce et le même montant</b> dans Dépenses ?</p>'
        +'<div class="yaya-commande-depense-actions">'
        +'<button type="button" class="yaya-commande-depense-no">Non</button>'
        +'<button type="button" class="yaya-commande-depense-yes">Oui, dans Dépenses</button>'
        +'</div></div>';

      function done(value){
        if(overlay.parentNode)overlay.remove();
        resolve(value);
      }

      overlay.querySelector('.yaya-commande-depense-no').onclick=function(){done(false);};
      overlay.querySelector('.yaya-commande-depense-yes').onclick=function(){done(true);};
      overlay.addEventListener('click',function(e){if(e.target===overlay)done(false);});
      document.body.appendChild(overlay);
      setTimeout(function(){
        const b=overlay.querySelector('.yaya-commande-depense-no');
        if(b)b.focus();
      },0);
    });
  }

  function makeAchatId(){
    try{if(typeof uid==='function')return uid();}catch(e){}
    return 'ach_cmd_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);
  }

  function achatFromCommande(commande){
    return {
      id:makeAchatId(),
      chantierId:String(commande.chantierId||''),
      typeDoc:'Bon de commande',
      fournisseur:String(commande.fournisseur||''),
      designation:String(commande.designation||commande.pieceNom||''),
      date:String(commande.date||'').slice(0,10),
      montantHT:Number(commande.montantHT)||0,
      sousTraitant:'',
      lien:String(commande.lien||''),
      statutValidation:'VALIDEE',
      origine:'COMMANDE',
      commandeId:String(commande.id||''),
      pieceNom:String(commande.pieceNom||'')
    };
  }

  function persistAchatLocal(row){
    try{
      if(typeof S==='undefined'||!S)return false;
      if(!Array.isArray(S.achats))S.achats=[];
      if(S.achats.some(function(a){return String(a&&a.commandeId||'')===String(row.commandeId);} ))return false;
      S.achats.push(row);

      try{
        const key='YAYA_CACHE_DATA_V2';
        const raw=localStorage.getItem(key);
        const cached=raw?JSON.parse(raw):null;
        if(cached&&typeof cached==='object'){
          const rows=Array.isArray(cached.achats)?cached.achats:[];
          if(!rows.some(function(a){return String(a&&a.commandeId||'')===String(row.commandeId);} ))rows.push(row);
          cached.achats=rows;
          localStorage.setItem(key,JSON.stringify(cached));
        }
      }catch(e){}

      try{if(typeof render==='function')render();}catch(e){}
      return true;
    }catch(e){return false;}
  }

  function rollbackAchat(row){
    try{
      if(typeof S!=='undefined'&&S&&Array.isArray(S.achats)){
        S.achats=S.achats.filter(function(a){return String(a&&a.id)!==String(row.id);});
        if(typeof render==='function')render();
      }
    }catch(e){}
  }

  async function enregistrerCommandeEnDepense(commande){
    try{
      if(typeof S!=='undefined'&&S&&Array.isArray(S.achats)){
        const deja=S.achats.some(function(a){
          return String(a&&a.commandeId||'')===String(commande.id||'');
        });
        if(deja){toastSafe('Cette commande est déjà dans Dépenses',true);return;}
      }
    }catch(e){}

    const row=achatFromCommande(commande);
    if(!persistAchatLocal(row)){
      toastSafe('Cette commande est déjà dans Dépenses',true);
      return;
    }

    toastSafe('Ajoutée dans Dépenses ✓');

    Promise.resolve()
      .then(function(){
        return (typeof apiPost==='function')?apiPost('addAchat',row):false;
      })
      .then(function(ok){
        if(ok)return;
        rollbackAchat(row);
        toastSafe('Ajout dans Dépenses non enregistré',true);
      })
      .catch(function(err){
        console.error('Commande -> Dépense :',err);
        rollbackAchat(row);
        toastSafe('Ajout dans Dépenses non enregistré',true);
      });
  }

  async function proposerDepensePourCommande(commande){
    const id=String(commande&&commande.id||'').trim();
    if(!id||promptedCommandeIds.has(id))return;
    if(!String(commande&&commande.lien||'').trim())return;
    promptedCommandeIds.add(id);

    const oui=await demanderAjoutDepense(commande);
    if(oui)enregistrerCommandeEnDepense(commande);
  }

  document.addEventListener('click',function(e){
    const save=e.target&&e.target.closest?e.target.closest('.yaya-commande-create-save'):null;
    if(save)lastCreateSaveAt=Date.now();
  },true);

  window.addEventListener('yaya:data-refreshed',function(){
    if(!knownReady){
      seedKnownCommandes();
      return;
    }

    let list=[];
    try{list=Array.isArray(S&&S.commandes)?S.commandes.slice():[];}catch(e){return;}
    const newlyAdded=[];

    list.forEach(function(c){
      const id=String(c&&c.id||'').trim();
      if(!id)return;
      if(!knownCommandeIds.has(id))newlyAdded.push(c);
      knownCommandeIds.add(id);
    });

    if(Date.now()-lastCreateSaveAt>120000)return;
    newlyAdded.forEach(function(c){
      if(String(c&&c.origine||'')!=='YAYA')return;
      setTimeout(function(){proposerDepensePourCommande(c);},50);
    });
  });

  installStyle();
  if(!seedKnownCommandes())setTimeout(seedKnownCommandes,200);
})();
