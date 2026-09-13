(function(){
  'use strict';

  const STYLE_ID='yaya-devis-delete-confirm-style-v3';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .yaya-devis-confirm-overlay{
        position:fixed;inset:0;z-index:130000;display:flex;align-items:center;justify-content:center;
        padding:18px;background:rgba(22,45,73,.48);
      }
      .yaya-devis-confirm-box{
        width:min(420px,calc(100vw - 32px));background:#fff;border-radius:15px;
        box-shadow:0 18px 55px rgba(0,0,0,.28);padding:24px;color:#162d49;text-align:center;
      }
      .yaya-devis-confirm-icon{font-size:30px;margin-bottom:8px}
      .yaya-devis-confirm-box h3{margin:0 0 8px;font-size:20px}
      .yaya-devis-confirm-box p{margin:0 0 20px;color:#68778a;font-size:13px;line-height:1.45}
      .yaya-devis-confirm-actions{display:flex;gap:10px}
      .yaya-devis-confirm-actions button{flex:1;min-height:42px;border-radius:9px;font-weight:750;font-family:inherit;cursor:pointer}
      .yaya-devis-confirm-cancel{background:#fff;border:1px solid #cbd5e1;color:#334155}
      .yaya-devis-confirm-ok{background:#d93636;border:1px solid #d93636;color:#fff}
      .yaya-devis-confirm-ok:disabled{opacity:.6;cursor:default}
      @media(max-width:640px){.yaya-devis-confirm-box{padding:20px}.yaya-devis-confirm-actions button{min-height:46px}}
    `;
    document.head.appendChild(style);
  }

  function closeConfirm(){
    document.querySelector('.yaya-devis-confirm-overlay')?.remove();
  }

  function toastSafe(msg,err){
    try{if(typeof toast==='function')toast(msg,!!err);}catch(e){}
  }

  function renderSafe(){
    try{if(typeof render==='function')render();}catch(e){}
  }

  async function deleteAvenantDirect(id,ok,overlay){
    if(!id||typeof S==='undefined'||!S||!Array.isArray(S.avenants)){
      toastSafe('Suppression du devis indisponible',true);
      return;
    }

    const before=S.avenants.slice();
    const wanted=String(id);
    const originalIndex=before.findIndex(v=>String(v&&v.id)===wanted);
    const removed=originalIndex>=0?before[originalIndex]:null;
    const next=before.filter(v=>String(v&&v.id)!==wanted);

    if(next.length===before.length){
      toastSafe('Devis introuvable',true);
      return;
    }

    if(ok){
      ok.disabled=true;
      ok.textContent='Suppression…';
    }

    /*
     * Suppression optimiste : la modale se ferme tout de suite.
     * L'écriture Sheet continue ensuite sans bloquer l'écran.
     */
    S.avenants=next;
    renderSafe();
    if(overlay&&overlay.isConnected)overlay.remove();
    toastSafe('Suppression en cours…');

    try{
      const saved=typeof apiPost==='function'
        ? await apiPost('setAvenants',next)
        : false;

      if(!saved)throw new Error('enregistrement impossible');
      toastSafe('Devis supprimé ✓');
    }catch(e){
      /*
       * En cas d'échec, on restaure uniquement le devis supprimé sans écraser
       * d'éventuelles autres modifications faites pendant l'attente réseau.
       */
      if(removed&&typeof S!=='undefined'&&S&&Array.isArray(S.avenants)){
        const current=S.avenants.slice();
        const alreadyThere=current.some(v=>String(v&&v.id)===wanted);
        if(!alreadyThere){
          current.splice(Math.min(Math.max(originalIndex,0),current.length),0,removed);
          S.avenants=current;
        }
      }else{
        S.avenants=before;
      }
      renderSafe();
      toastSafe('Suppression non enregistrée — devis restauré',true);
    }
  }

  function openConfirm(id){
    closeConfirm();
    const overlay=document.createElement('div');
    overlay.className='yaya-devis-confirm-overlay';
    overlay.innerHTML=''
      +'<div class="yaya-devis-confirm-box" role="dialog" aria-modal="true" aria-labelledby="yayaDevisConfirmTitle">'
      +'<div class="yaya-devis-confirm-icon">🗑️</div>'
      +'<h3 id="yayaDevisConfirmTitle">Supprimer ce devis ?</h3>'
      +'<p>Le devis sera retiré de Yaya. Le fichier source n’est pas supprimé.</p>'
      +'<div class="yaya-devis-confirm-actions">'
      +'<button type="button" class="yaya-devis-confirm-cancel">Annuler</button>'
      +'<button type="button" class="yaya-devis-confirm-ok">Supprimer</button>'
      +'</div></div>';
    document.body.appendChild(overlay);

    const cancel=overlay.querySelector('.yaya-devis-confirm-cancel');
    const ok=overlay.querySelector('.yaya-devis-confirm-ok');
    overlay.addEventListener('click',function(e){if(e.target===overlay&&!ok.disabled)closeConfirm();});
    cancel.addEventListener('click',function(){if(!ok.disabled)closeConfirm();});
    ok.addEventListener('click',function(){deleteAvenantDirect(id,ok,overlay);});
  }

  document.addEventListener('click',function(e){
    const btn=e.target&&e.target.closest?e.target.closest('#pane-chantiers .yaya-detail-markets-pane .yaya-detail-document-delete'):null;
    if(!btn||btn.classList.contains('yaya-initial-devis-delete'))return;
    const id=String(btn.dataset.rowId||'');
    if(!id)return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    openConfirm(id);
  },true);
})();

/*
 * Devis principal : le marqueur de suppression peut être renvoyé par le serveur
 * avec le marqueur de date de signature [[YAYA_SIG:...]]. Les anciens scripts
 * testaient une égalité stricte et considéraient alors le devis comme non supprimé.
 * On normalise l'état local avant les décorateurs Marché pour que la suppression
 * reste stable après actualisation automatique.
 */
(function(){
  'use strict';

  if(window.__yayaMainQuoteDeletePersistFixInstalled)return;
  window.__yayaMainQuoteDeletePersistFixInstalled=true;

  const DELETED='__YAYA_DEVIS_INITIAL_SUPPRIME__';
  const SIG_RE=/\[\[YAYA_SIG:(\d{4}-\d{2})\]\]/;

  function normalizeDeletedMainQuotes(){
    try{
      if(typeof S==='undefined'||!S||!Array.isArray(S.chantiers))return false;
      let changed=false;

      S.chantiers.forEach(function(c){
        if(!c)return;
        const notes=String(c.notes||'');
        if(!notes.includes(DELETED))return;
        if((Number(c.montantDevisHT)||0)!==0)return;

        const sig=notes.match(SIG_RE);
        if(sig&&sig[1]&&!String(c.dateSignature||'').trim()){
          c.dateSignature=sig[1];
          changed=true;
        }

        if(notes!==DELETED){
          c.notes=DELETED;
          changed=true;
        }
      });

      return changed;
    }catch(e){
      return false;
    }
  }

  function forceHiddenRows(){
    try{
      document.querySelectorAll('#pane-chantiers .yaya-detail-market-row').forEach(function(row){
        const edit=row.querySelector('.yaya-detail-document-edit[data-kind="main"]');
        if(!edit)return;
        const id=String(edit.dataset.rowId||'');
        const c=(typeof S!=='undefined'&&S&&Array.isArray(S.chantiers))
          ?S.chantiers.find(function(x){return String(x&&x.id)===id;})
          :null;
        if(!c)return;

        const deleted=String(c.notes||'').includes(DELETED)&&!(Number(c.montantDevisHT)||0);
        if(deleted){
          row.dataset.yayaInitialDeleted='1';
          row.style.setProperty('display','none','important');
        }
      });
    }catch(e){}
  }

  let scheduled=false;
  function apply(){
    normalizeDeletedMainQuotes();
    forceHiddenRows();
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(function(){
      scheduled=false;
      apply();
    });
  }

  apply();

  window.addEventListener('yaya:data-refreshed',function(){
    normalizeDeletedMainQuotes();
    schedule();
  });

  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});

  setTimeout(apply,50);
  setTimeout(apply,250);
})();

/* V51 — la suppression d'un devis se fait uniquement depuis la modale Modifier le devis. */
(function(){
  'use strict';

  if(window.__yayaDevisDeleteInEditModalV51)return;
  window.__yayaDevisDeleteInEditModalV51=true;

  const STYLE_ID='yaya-devis-delete-in-edit-modal-v51';
  let current={kind:'',id:''};

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row{
        grid-template-columns:minmax(0,1fr) 90px!important;
      }
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row .yaya-detail-document-delete,
      #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row .yaya-initial-devis-delete,
      #pane-chantiers .yaya-detail-markets-pane button.yaya-detail-document-delete.yaya-initial-devis-delete{
        display:none!important;
      }
      .yaya-devis-fast-modal .yaya-devis-fast-delete{
        background:#fff3f3!important;
        color:#b42318!important;
        border:1px solid #efb4b4!important;
      }
      .yaya-devis-fast-modal .yaya-devis-fast-delete:hover{
        background:#ffe7e7!important;
        border-color:#e78d8d!important;
      }
      @media(max-width:640px){
        #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row{
          grid-template-columns:minmax(0,1fr) 72px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function remember(edit){
    if(!edit)return;
    const id=String(edit.dataset.rowId||'').trim();
    if(!id)return;
    current={kind:String(edit.dataset.kind||'').trim(),id:id};
  }

  function contextFromModal(modal){
    if(!modal)return {kind:'',id:''};
    const kind=String(modal.dataset.yayaQuoteKind||'').trim();
    const id=String(modal.dataset.yayaQuoteId||'').trim();
    if(id)return {kind:kind,id:id};
    if(current.id)return current;
    if(modal.querySelector('#edNom,#edNum,#edMt')){
      try{
        if(typeof focusChantier!=='undefined'&&focusChantier){
          return {kind:'main',id:String(focusChantier)};
        }
      }catch(e){}
    }
    return {kind:'',id:''};
  }

  function findDeleteButton(ctx){
    if(!ctx||!ctx.id)return null;
    const rows=document.querySelectorAll('#pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row');
    for(const row of rows){
      const edit=row.querySelector('.yaya-detail-document-edit[data-kind][data-row-id]');
      if(!edit)continue;
      if(String(edit.dataset.rowId||'')!==String(ctx.id))continue;
      if(ctx.kind&&String(edit.dataset.kind||'')!==String(ctx.kind))continue;
      return row.querySelector('.yaya-initial-devis-delete,.yaya-detail-document-delete');
    }
    return null;
  }

  function decorateModal(){
    installStyle();
    const modal=document.querySelector('.yaya-devis-fast-modal');
    if(!modal)return;
    const footer=modal.querySelector('.yaya-devis-fast-foot,.mfoot');
    if(!footer)return;
    const ctx=contextFromModal(modal);
    if(ctx.id){
      modal.dataset.yayaQuoteKind=ctx.kind||'';
      modal.dataset.yayaQuoteId=ctx.id;
    }

    let button=footer.querySelector('[data-yaya-delete-from-edit="1"]');
    if(!button){
      button=footer.querySelector('#yayaFastCancel,.yaya-devis-fast-cancel');
      if(!button){
        button=[...footer.querySelectorAll('button')].find(function(b){return /^annuler$/i.test(String(b.textContent||'').trim());})||null;
      }
      if(!button)return;
      button.dataset.yayaDeleteFromEdit='1';
      button.classList.add('yaya-devis-fast-delete');
      button.textContent='Supprimer';
      button.title='Supprimer ce devis';
      button.setAttribute('aria-label','Supprimer ce devis');
    }
  }

  document.addEventListener('click',function(e){
    const edit=e.target&&e.target.closest?e.target.closest('#pane-chantiers .yaya-detail-market-row .yaya-detail-document-edit[data-kind][data-row-id]'):null;
    if(edit)remember(edit);
    const amount=e.target&&e.target.closest?e.target.closest('#pane-chantiers .yaya-detail-market-row .yaya-detail-charge-cost'):null;
    if(amount){
      const row=amount.closest('.yaya-detail-market-row');
      remember(row&&row.querySelector('.yaya-detail-document-edit[data-kind][data-row-id]'));
    }
  },true);

  document.addEventListener('click',function(e){
    const button=e.target&&e.target.closest?e.target.closest('.yaya-devis-fast-modal [data-yaya-delete-from-edit="1"]'):null;
    if(!button)return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const modal=button.closest('.yaya-devis-fast-modal');
    const ctx=contextFromModal(modal);
    const hiddenDelete=findDeleteButton(ctx);
    if(!hiddenDelete){
      try{if(typeof toast==='function')toast('Suppression du devis indisponible',true);}catch(err){}
      return;
    }

    try{if(typeof closeModal==='function')closeModal();}catch(err){}
    setTimeout(function(){hiddenDelete.click();},0);
  },true);

  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(function(){
      scheduled=false;
      installStyle();
      decorateModal();
    });
  }

  installStyle();
  schedule();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',schedule);
})();
