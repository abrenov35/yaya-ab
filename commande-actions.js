(function(){
  'use strict';

  const STYLE_ID='yaya-commande-actions-style';
  let decorating=false;

  function esc(v){
    const d=document.createElement('div');
    d.textContent=String(v==null?'':v);
    return d.innerHTML;
  }

  function cardId(card){
    try{
      if(typeof focusChantier!=='undefined'&&focusChantier)return String(focusChantier);
    }catch(e){}
    if(!card)return '';
    const nodes=[...card.querySelectorAll('[onclick]')];
    for(const el of nodes){
      const raw=String(el.getAttribute('onclick')||'');
      const m=raw.match(/(?:toggleChantier|delChantier|editMontantDevis|openAvenant|openDocumentModal|openAchat|openExistingChantierModal)\(['\"]([^'\"]+)/);
      if(m&&m[1])return String(m[1]);
    }
    return '';
  }

  function commandesFor(card){
    const cid=cardId(card);
    if(!cid||typeof S==='undefined'||!Array.isArray(S.commandes))return [];
    return S.commandes
      .filter(c=>String(c.chantierId||'')===cid)
      .filter(c=>String(c.statutValidation||'')!=='REJETEE'&&String(c.statutValidation||'')!=='DOUBLON')
      .sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||String(b.id||'').localeCompare(String(a.id||'')));
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      .yaya-detail-commande-row{
        grid-template-columns:minmax(120px,1fr) 90px 110px 28px 28px 28px!important;
      }
      .yaya-detail-commande-edit,
      .yaya-detail-commande-delete{
        width:28px!important;height:28px!important;padding:0!important;margin:0!important;
        display:inline-flex!important;align-items:center!important;justify-content:center!important;
        border-radius:7px!important;box-shadow:0 1px 3px rgba(22,45,73,.14)!important;
        font-size:14px!important;line-height:1!important;cursor:pointer!important;
      }
      .yaya-detail-commande-edit{border:1px solid #a8d5b5!important;background:#f2faf4!important;color:#26703b!important}
      .yaya-detail-commande-delete{border:1px solid #e6a7a7!important;background:#fff3f3!important;color:#c83c3c!important}
      .yaya-commande-edit-overlay{position:fixed!important;inset:0!important;z-index:10050!important;background:rgba(22,45,73,.45)!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:16px!important}
      .yaya-commande-edit-modal{width:min(440px,100%)!important;background:#fff!important;border-radius:12px!important;padding:18px!important;box-shadow:0 12px 40px rgba(0,0,0,.28)!important}
      .yaya-commande-edit-modal h3{margin:0 0 14px!important;font-size:17px!important;color:#162d49!important}
      .yaya-commande-edit-field{display:block!important;margin:10px 0!important;font-size:12px!important;font-weight:700!important;color:#4b5b70!important}
      .yaya-commande-edit-field input{display:block!important;width:100%!important;margin-top:5px!important;padding:9px 10px!important;border:1px solid #cbd5e1!important;border-radius:7px!important;font:inherit!important;color:#162d49!important;background:#fff!important}
      .yaya-commande-edit-actions{display:flex!important;justify-content:flex-end!important;gap:9px!important;margin-top:16px!important}
      .yaya-commande-edit-actions button{padding:9px 14px!important;border-radius:7px!important;font-weight:700!important;cursor:pointer!important}
      .yaya-commande-cancel{border:1px solid #cbd5e1!important;background:#fff!important;color:#475569!important}
      .yaya-commande-save{border:1px solid #285943!important;background:#285943!important;color:#fff!important}
      @media(max-width:640px){
        .yaya-detail-commande-row{grid-template-columns:minmax(90px,1fr) 72px 86px 28px 28px 28px!important;gap:7px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function decorateCard(card){
    const pane=card.querySelector(':scope > .yaya-detail-commandes-pane');
    if(!pane)return;
    const commandes=commandesFor(card);
    const rows=[...pane.querySelectorAll('.yaya-detail-commande-row')];
    rows.forEach((row,index)=>{
      const commande=commandes[index];
      if(!commande)return;
      const id=String(commande.id||'');
      row.dataset.commandeId=id;

      let edit=row.querySelector('.yaya-detail-commande-edit');
      if(!edit){
        edit=document.createElement('button');
        edit.type='button';
        edit.className='yaya-detail-commande-edit';
        edit.title='Modifier';
        edit.setAttribute('aria-label','Modifier');
        edit.textContent='✏️';
        row.appendChild(edit);
      }
      edit.dataset.commandeId=id;

      let del=row.querySelector('.yaya-detail-commande-delete');
      if(!del){
        del=document.createElement('button');
        del.type='button';
        del.className='yaya-detail-commande-delete';
        del.title='Supprimer';
        del.setAttribute('aria-label','Supprimer');
        del.textContent='🗑️';
        row.appendChild(del);
      }
      del.dataset.commandeId=id;
    });
  }

  function decorate(){
    if(decorating)return;
    decorating=true;
    try{
      installStyle();
      const root=document.getElementById('pane-chantiers');
      if(!root)return;
      root.querySelectorAll('.card').forEach(decorateCard);
    }finally{
      decorating=false;
    }
  }

  function endpoint(){
    try{
      if(typeof API!=='undefined'&&API)return String(API);
    }catch(e){}
    return 'https://script.google.com/macros/s/AKfycbx6IwMFf2plAq7i8qf8qF6f6MMC-1-WynAqn1ZRqCZrVqHeE9a1ygSSTzp5uOf0L3bn/exec';
  }

  async function setCommandes(rows){
    const r=await fetch(endpoint(),{
      method:'POST',
      cache:'no-store',
      body:JSON.stringify({action:'setCommandes',data:rows})
    });
    const txt=await r.text();
    let json;
    try{json=JSON.parse(txt);}catch(e){throw new Error('Réponse Yaya invalide');}
    if(!json||json.ok!==true)throw new Error((json&&json.error)||'Enregistrement impossible');
    return json;
  }

  function refreshLocal(rows){
    if(typeof S!=='undefined')S.commandes=rows;
    try{
      if(typeof render==='function')render();
      else window.dispatchEvent(new Event('yaya:data-refreshed'));
    }catch(e){window.dispatchEvent(new Event('yaya:data-refreshed'));}
    setTimeout(decorate,60);
    setTimeout(decorate,250);
  }

  function findCommande(id){
    if(typeof S==='undefined'||!Array.isArray(S.commandes))return null;
    return S.commandes.find(c=>String(c.id||'')===String(id))||null;
  }

  function parseMontant(v){
    const n=Number(String(v||'').replace(/\s/g,'').replace(',','.'));
    return Number.isFinite(n)?n:0;
  }

  function openEdit(commande){
    document.querySelectorAll('.yaya-commande-edit-overlay').forEach(x=>x.remove());
    const overlay=document.createElement('div');
    overlay.className='yaya-commande-edit-overlay';
    overlay.innerHTML=`
      <div class="yaya-commande-edit-modal" role="dialog" aria-modal="true">
        <h3>Modifier la commande</h3>
        <label class="yaya-commande-edit-field">Fournisseur<input data-field="fournisseur" value="${esc(commande.fournisseur||'')}"></label>
        <label class="yaya-commande-edit-field">Description<input data-field="designation" value="${esc(commande.designation||commande.pieceNom||'')}"></label>
        <label class="yaya-commande-edit-field">Montant HT<input data-field="montantHT" inputmode="decimal" value="${esc(commande.montantHT||0)}"></label>
        <label class="yaya-commande-edit-field">Date<input data-field="date" type="date" value="${esc(String(commande.date||'').slice(0,10))}"></label>
        <div class="yaya-commande-edit-actions">
          <button type="button" class="yaya-commande-cancel">Annuler</button>
          <button type="button" class="yaya-commande-save">Enregistrer</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const close=()=>overlay.remove();
    overlay.querySelector('.yaya-commande-cancel').addEventListener('click',close);
    overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
    overlay.querySelector('.yaya-commande-save').addEventListener('click',async()=>{
      const btn=overlay.querySelector('.yaya-commande-save');
      btn.disabled=true;
      try{
        const updated={
          ...commande,
          fournisseur:String(overlay.querySelector('[data-field="fournisseur"]').value||'').trim(),
          designation:String(overlay.querySelector('[data-field="designation"]').value||'').trim(),
          montantHT:parseMontant(overlay.querySelector('[data-field="montantHT"]').value),
          date:String(overlay.querySelector('[data-field="date"]').value||'').trim()
        };
        const next=(S.commandes||[]).map(c=>String(c.id||'')===String(updated.id)?updated:c);
        await setCommandes(next);
        close();
        refreshLocal(next);
      }catch(err){
        btn.disabled=false;
        alert('Modification impossible : '+String(err&&err.message||err));
      }
    });
  }

  async function removeCommande(id){
    const commande=findCommande(id);
    if(!commande)return;
    if(!confirm('Supprimer cette commande ?'))return;
    try{
      const next=(S.commandes||[]).filter(c=>String(c.id||'')!==String(id));
      await setCommandes(next);
      refreshLocal(next);
    }catch(err){
      alert('Suppression impossible : '+String(err&&err.message||err));
    }
  }

  document.addEventListener('click',e=>{
    const edit=e.target&&e.target.closest?e.target.closest('.yaya-detail-commande-edit'):null;
    if(edit){
      e.preventDefault();e.stopPropagation();
      const commande=findCommande(edit.dataset.commandeId);
      if(commande)openEdit(commande);
      return;
    }
    const del=e.target&&e.target.closest?e.target.closest('.yaya-detail-commande-delete'):null;
    if(del){
      e.preventDefault();e.stopPropagation();
      removeCommande(del.dataset.commandeId);
    }
  },true);

  installStyle();
  decorate();
  const root=document.getElementById('pane-chantiers')||document.documentElement;
  const obs=new MutationObserver(()=>{
    clearTimeout(window.__yayaCommandeActionsTimer);
    window.__yayaCommandeActionsTimer=setTimeout(decorate,0);
  });
  obs.observe(root,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',decorate);
  setTimeout(decorate,100);
  setTimeout(decorate,500);
})();
