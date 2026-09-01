(function(){
  'use strict';

  const STYLE_ID='yaya-commande-actions-style-v6';
  let rendering=false;

  function esc(v){
    const d=document.createElement('div');
    d.textContent=String(v==null?'':v);
    return d.innerHTML;
  }

  function cardId(card){
    try{if(typeof focusChantier!=='undefined'&&focusChantier)return String(focusChantier);}catch(e){}
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

  function nativeSignature(rows){
    return JSON.stringify(rows.map(row=>[
      row.id||'',row.fournisseur||'',row.designation||'',row.pieceNom||'',
      row.montantHT||0,row.date||'',row.lien||'',row.oneDriveWebUrl||''
    ]));
  }

  function dateFr(v){
    const raw=String(v||'').slice(0,10);
    const m=raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m?m[3]+'/'+m[2]+'/'+m[1]:raw;
  }

  function euro(v){
    return (Number(v)||0).toLocaleString('fr-FR',{maximumFractionDigits:2})+' €';
  }

  function installStyle(){
    document.querySelectorAll('[id^="yaya-commande-actions-style"]').forEach(x=>x.remove());
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      #pane-chantiers .yaya-detail-commandes-pane .yaya-detail-commande-row{
        display:grid!important;
        grid-template-columns:minmax(0,1fr) 105px 90px 102px!important;
        align-items:center!important;
        gap:12px!important;
        width:100%!important;
        min-height:50px!important;
        padding:9px 0!important;
        margin:0!important;
        border-bottom:1px solid #e6ebf1!important;
      }
      #pane-chantiers .yaya-detail-commandes-pane .yaya-detail-commande-row:last-child{border-bottom:0!important}
      #pane-chantiers .yaya-commande-info{min-width:0!important}
      #pane-chantiers .yaya-commande-info strong{display:block!important;color:#162d49!important;font-size:13px!important;line-height:1.2!important}
      #pane-chantiers .yaya-commande-desc{display:block!important;margin-top:2px!important;color:#526b91!important;font-size:11.5px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      #pane-chantiers .yaya-commande-date{display:block!important;margin-top:3px!important;color:#718096!important;font-size:10.5px!important}
      #pane-chantiers .yaya-commande-type{color:#183b68!important;text-align:left!important;white-space:nowrap!important}
      #pane-chantiers .yaya-commande-amount{font-weight:700!important;text-align:right!important;white-space:nowrap!important;color:#162d49!important}
      #pane-chantiers .yaya-commande-actions{
        display:flex!important;align-items:center!important;justify-content:flex-end!important;
        gap:6px!important;width:102px!important;min-width:102px!important;margin:0!important;padding:0!important;
      }
      #pane-chantiers .yaya-commande-actions button{
        position:static!important;float:none!important;display:inline-flex!important;
        align-items:center!important;justify-content:center!important;flex:0 0 30px!important;
        width:30px!important;height:30px!important;min-width:30px!important;min-height:30px!important;
        max-width:30px!important;margin:0!important;padding:0!important;border-radius:7px!important;
        font-size:14px!important;line-height:1!important;box-shadow:0 1px 3px rgba(22,45,73,.14)!important;
      }
      #pane-chantiers .yaya-detail-commande-view{border:1px solid #a9c8e8!important;background:#f3f8fd!important;color:#174d7d!important;font-size:16px!important}
      #pane-chantiers .yaya-detail-commande-view::before,
      #pane-chantiers .yaya-detail-commande-view::after{content:none!important;display:none!important}
      #pane-chantiers .yaya-detail-commande-edit{border:1px solid #a8d5b5!important;background:#f2faf4!important;color:#26703b!important}
      #pane-chantiers .yaya-detail-commande-delete{border:1px solid #e6a7a7!important;background:#fff3f3!important;color:#c83c3c!important}
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
        #pane-chantiers .yaya-detail-commandes-pane .yaya-detail-commande-row{
          grid-template-columns:minmax(0,1fr) 72px 70px 102px!important;gap:7px!important;padding:8px 0!important;
        }
        #pane-chantiers .yaya-commande-type{font-size:11px!important}
        #pane-chantiers .yaya-commande-amount{font-size:12px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function rowHtml(c){
    const id=String(c.id||'');
    const lien=String(c.lien||c.oneDriveWebUrl||'').trim();
    const desc=String(c.designation||c.pieceNom||'Bon de commande');
    return '<div class="yaya-detail-commande-row" data-commande-id="'+esc(id)+'">'
      +'<div class="yaya-commande-info"><strong>'+esc(c.fournisseur||'Fournisseur')+'</strong>'
      +'<span class="yaya-commande-desc">'+esc(desc)+'</span>'
      +'<span class="yaya-commande-date">'+esc(dateFr(c.date))+'</span></div>'
      +'<span class="yaya-commande-type">Commande</span>'
      +'<span class="yaya-commande-amount">'+esc(euro(c.montantHT))+'</span>'
      +'<span class="yaya-commande-actions">'
      +'<button type="button" class="yaya-detail-commande-view" data-lien="'+esc(lien)+'" title="Voir" aria-label="Voir"'+(lien?'':' disabled')+'>👁️</button>'
      +'<button type="button" class="yaya-detail-commande-edit" data-commande-id="'+esc(id)+'" title="Modifier" aria-label="Modifier">✏️</button>'
      +'<button type="button" class="yaya-detail-commande-delete" data-commande-id="'+esc(id)+'" title="Supprimer" aria-label="Supprimer">🗑️</button>'
      +'</span></div>';
  }

  function rowStructureOk(pane,rows){
    const rendered=[...pane.querySelectorAll(':scope > .yaya-detail-commande-row')];
    if(rendered.length!==rows.length)return false;
    return rendered.every(function(row){
      const actions=row.querySelector(':scope > .yaya-commande-actions');
      if(!actions)return false;
      if(actions.querySelectorAll(':scope > button').length!==3)return false;
      return !!(
        actions.querySelector(':scope > .yaya-detail-commande-view') &&
        actions.querySelector(':scope > .yaya-detail-commande-edit') &&
        actions.querySelector(':scope > .yaya-detail-commande-delete')
      );
    });
  }

  function renderCard(card){
    const pane=card.querySelector(':scope > .yaya-detail-commandes-pane');
    if(!pane)return;
    const rows=commandesFor(card);
    const sig=nativeSignature(rows);
    if(pane.dataset.yayaCommandesRendered===sig && rowStructureOk(pane,rows))return;
    pane.innerHTML=rows.map(rowHtml).join('');
    pane.dataset.empty=rows.length?'0':'1';
    pane.dataset.yayaCommandesRendered=sig;
    pane._yayaRowsSignature=sig;
  }

  function renderAll(){
    if(rendering)return;
    rendering=true;
    try{
      installStyle();
      const root=document.getElementById('pane-chantiers');
      if(root)root.querySelectorAll('.card').forEach(renderCard);
    }finally{rendering=false;}
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
    setTimeout(renderAll,0);setTimeout(renderAll,80);setTimeout(renderAll,250);
  }

  function openEdit(commande){
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
      const btn=this;btn.disabled=true;
      try{
        const updated=Object.assign({},commande,{
          fournisseur:String(overlay.querySelector('[data-field="fournisseur"]').value||'').trim(),
          designation:String(overlay.querySelector('[data-field="designation"]').value||'').trim(),
          montantHT:parseMontant(overlay.querySelector('[data-field="montantHT"]').value),
          date:String(overlay.querySelector('[data-field="date"]').value||'').trim()
        });
        const next=(S.commandes||[]).map(c=>String(c.id||'')===String(updated.id)?updated:c);
        await setCommandes(next);close();refreshLocal(next);
      }catch(err){btn.disabled=false;alert('Modification impossible : '+String(err&&err.message||err));}
    };
  }

  async function removeCommande(id){
    if(!findCommande(id)||!confirm('Supprimer cette commande ?'))return;
    try{
      const next=(S.commandes||[]).filter(c=>String(c.id||'')!==String(id));
      await setCommandes(next);refreshLocal(next);
    }catch(err){alert('Suppression impossible : '+String(err&&err.message||err));}
  }

  document.addEventListener('click',function(e){
    const view=e.target.closest&&e.target.closest('.yaya-detail-commande-view');
    if(view){
      e.preventDefault();e.stopPropagation();
      const lien=String(view.dataset.lien||'');
      if(lien){try{if(typeof voirPiece==='function')voirPiece(lien);else window.open(lien,'_blank','noopener,noreferrer');}catch(err){window.open(lien,'_blank','noopener,noreferrer');}}
      return;
    }
    const edit=e.target.closest&&e.target.closest('.yaya-detail-commande-edit');
    if(edit){e.preventDefault();e.stopPropagation();const c=findCommande(edit.dataset.commandeId);if(c)openEdit(c);return;}
    const del=e.target.closest&&e.target.closest('.yaya-detail-commande-delete');
    if(del){e.preventDefault();e.stopPropagation();removeCommande(del.dataset.commandeId);}
  },true);

  installStyle();
  renderAll();
  const root=document.getElementById('pane-chantiers')||document.documentElement;
  new MutationObserver(function(){clearTimeout(window.__yayaCommandeRenderTimer);window.__yayaCommandeRenderTimer=setTimeout(renderAll,0);}).observe(root,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',renderAll);
  setTimeout(renderAll,100);setTimeout(renderAll,500);
})();
