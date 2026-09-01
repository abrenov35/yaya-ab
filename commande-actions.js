(function(){
  'use strict';

  const STYLE_ID='yaya-commande-action-modal-style-v1';

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
      .yaya-commande-edit-overlay{position:fixed!important;inset:0!important;z-index:10050!important;background:rgba(22,45,73,.45)!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:16px!important}
      .yaya-commande-edit-modal{width:min(440px,100%)!important;background:#fff!important;border-radius:12px!important;padding:18px!important;box-shadow:0 12px 40px rgba(0,0,0,.28)!important}
      .yaya-commande-edit-modal h3{margin:0 0 14px!important;font-size:17px!important;color:#162d49!important}
      .yaya-commande-edit-field{display:block!important;margin:10px 0!important;font-size:12px!important;font-weight:700!important;color:#4b5b70!important}
      .yaya-commande-edit-field input{display:block!important;width:100%!important;margin-top:5px!important;padding:9px 10px!important;border:1px solid #cbd5e1!important;border-radius:7px!important;font:inherit!important;color:#162d49!important;background:#fff!important}
      .yaya-commande-edit-actions{display:flex!important;justify-content:flex-end!important;gap:9px!important;margin-top:16px!important}
      .yaya-commande-edit-actions button{padding:9px 14px!important;border-radius:7px!important;font-weight:700!important;cursor:pointer!important}
      .yaya-commande-cancel{border:1px solid #cbd5e1!important;background:#fff!important;color:#475569!important}
      .yaya-commande-save{border:1px solid #285943!important;background:#285943!important;color:#fff!important}
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
      +'<div class="yaya-commande-edit-actions"><button type="button" class="yaya-commande-cancel">Annuler</button><button type="button" class="yaya-commande-save">Enregistrer</button></div></div>';
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

  async function removeCommande(id){
    if(!findCommande(id)||!confirm('Supprimer cette commande ?'))return;
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

  installStyle();
})();
