(function(){
  'use strict';

  const DELETED='__YAYA_DEVIS_INITIAL_SUPPRIME__';
  const STYLE_ID='yaya-market-initial-actions-v1';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-initial-devis-delete{
        width:28px!important;height:28px!important;min-width:28px!important;padding:0!important;margin:0!important;
        display:inline-flex!important;align-items:center!important;justify-content:center!important;
        border:1px solid #e6a7a7!important;border-radius:7px!important;background:#fff3f3!important;color:#c83c3c!important;
        box-shadow:0 1px 3px rgba(22,45,73,.14)!important;font-size:14px!important;line-height:1!important;cursor:pointer!important;
      }
      #pane-chantiers .yaya-initial-devis-delete[data-empty="1"]{visibility:hidden!important;pointer-events:none!important}
      .yaya-devis-fast-replace{border-color:#a9c8e8!important;background:#f3f8fd!important;color:#174d7d!important}
      .yaya-devis-delete-overlay{position:fixed;inset:0;z-index:120000;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(22,45,73,.48)}
      .yaya-devis-delete-box{width:min(430px,calc(100vw - 32px));background:#fff;border-radius:15px;box-shadow:0 18px 55px rgba(0,0,0,.28);padding:24px;color:#162d49;text-align:center}
      .yaya-devis-delete-box h3{margin:0 0 8px;font-size:20px}.yaya-devis-delete-box p{margin:0 0 20px;color:#68778a;font-size:13px;line-height:1.45}
      .yaya-devis-delete-actions{display:flex;gap:10px}.yaya-devis-delete-actions button{flex:1;min-height:42px;border-radius:9px;font-weight:750}
      .yaya-devis-delete-cancel{background:#fff;border:1px solid #cbd5e1;color:#334155}.yaya-devis-delete-ok{background:#d93636;border:1px solid #d93636;color:#fff}
    `;
    document.head.appendChild(style);
  }

  function chantier(id){
    try{return Array.isArray(S&&S.chantiers)?S.chantiers.find(c=>String(c&&c.id)===String(id))||null:null;}catch(e){return null;}
  }
  function toastSafe(msg,err){try{if(typeof toast==='function')toast(msg,!!err);}catch(e){}}
  function renderSafe(){try{if(typeof render==='function')render();}catch(e){}}

  function confirmDelete(c,id){
    document.querySelector('.yaya-devis-delete-overlay')?.remove();
    const overlay=document.createElement('div');overlay.className='yaya-devis-delete-overlay';
    overlay.innerHTML='<div class="yaya-devis-delete-box" role="dialog" aria-modal="true">'
      +'<div style="font-size:30px;margin-bottom:8px">🗑️</div>'
      +'<h3>Supprimer le devis initial ?</h3>'
      +'<p>Le chantier reste en place. Le montant et le lien du devis initial seront retirés de Yaya. Le fichier source Drive / OneDrive n’est pas supprimé.</p>'
      +'<div class="yaya-devis-delete-actions"><button type="button" class="yaya-devis-delete-cancel">Annuler</button><button type="button" class="yaya-devis-delete-ok">Supprimer</button></div>'
      +'</div>';
    document.body.appendChild(overlay);
    const close=()=>overlay.remove();
    overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
    overlay.querySelector('.yaya-devis-delete-cancel').onclick=close;
    overlay.querySelector('.yaya-devis-delete-ok').onclick=async function(){
      this.disabled=true;this.textContent='Suppression…';
      const before={montantDevisHT:c.montantDevisHT,notes:c.notes};
      c.montantDevisHT=0;c.notes=DELETED;
      close();renderSafe();
      try{
        const ok=typeof apiPost==='function'?await apiPost('setChantiers',S.chantiers):false;
        if(!ok)throw new Error('enregistrement impossible');
        toastSafe('Devis initial supprimé ✓');
      }catch(e){
        c.montantDevisHT=before.montantDevisHT;c.notes=before.notes;renderSafe();toastSafe('Suppression du devis impossible',true);
      }
    };
  }

  function decorateRows(){
    document.querySelectorAll('#pane-chantiers .yaya-detail-market-row').forEach(row=>{
      const edit=row.querySelector('.yaya-detail-document-edit[data-kind="main"]');
      if(!edit)return;
      const id=String(edit.dataset.rowId||'');
      const c=chantier(id);if(!c)return;
      let del=row.querySelector('.yaya-initial-devis-delete');
      if(!del){
        del=document.createElement('button');del.type='button';del.className='yaya-detail-document-delete yaya-initial-devis-delete';del.textContent='🗑️';del.title='Supprimer le devis initial';del.setAttribute('aria-label','Supprimer le devis initial');
        const placeholder=row.lastElementChild;
        if(placeholder&&placeholder.tagName==='SPAN'&&!placeholder.textContent.trim())placeholder.replaceWith(del);else row.appendChild(del);
        del.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const cc=chantier(id);if(cc)confirmDelete(cc,id);});
      }
      const empty=String(c.notes||'')===DELETED&&!(Number(c.montantDevisHT)||0);
      del.dataset.empty=empty?'1':'0';
    });
  }

  let currentMainId='';
  document.addEventListener('click',function(e){
    const btn=e.target&&e.target.closest?e.target.closest('#pane-chantiers .yaya-detail-market-row .yaya-detail-document-edit[data-kind="main"]'):null;
    if(btn)currentMainId=String(btn.dataset.rowId||'');
  },true);

  function injectReplace(){
    const modal=document.querySelector('.yaya-devis-fast-modal');if(!modal)return;
    const id=currentMainId||String(document.querySelector('#pane-chantiers .yaya-detail-market-row .yaya-detail-document-edit[data-kind="main"]')?.dataset.rowId||'');
    if(!id)return;
    let zone=modal.querySelector('#pj-zone');
    if(zone&&(/scan-zone|scan-ok/.test(zone.className)))return;
    if(!zone){
      zone=modal.querySelector('.yaya-devis-fast-piece');
      if(zone)zone.id='pj-zone';
    }
    if(!zone){
      const foot=modal.querySelector('.yaya-devis-fast-foot');
      if(!foot)return;
      zone=document.createElement('div');zone.className='yaya-devis-fast-piece';zone.id='pj-zone';
      zone.innerHTML='<span>Aucune pièce jointe</span>';
      foot.insertAdjacentElement('beforebegin',zone);
    }
    if(zone.querySelector('.yaya-devis-fast-replace'))return;
    const btn=document.createElement('button');btn.type='button';btn.className='yaya-devis-fast-replace';btn.textContent='🔄 Remplacer';btn.title='Remplacer le devis';
    btn.addEventListener('click',function(e){
      e.preventDefault();e.stopPropagation();
      if(typeof remplacerPJ==='function')remplacerPJ('devis',id);
      else toastSafe('Remplacement indisponible',true);
    });
    zone.appendChild(btn);
  }

  let scheduled=false;
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;decorateRows();injectReplace();});}
  schedule();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',schedule);
})();
