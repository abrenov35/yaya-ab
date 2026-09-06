(function(){
  'use strict';

  const STYLE_ID='yaya-devis-delete-confirm-style-v1';
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
      @media(max-width:640px){.yaya-devis-confirm-box{padding:20px}.yaya-devis-confirm-actions button{min-height:46px}}
    `;
    document.head.appendChild(style);
  }

  function closeConfirm(){
    document.querySelector('.yaya-devis-confirm-overlay')?.remove();
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
    overlay.addEventListener('click',function(e){if(e.target===overlay)closeConfirm();});
    cancel.addEventListener('click',closeConfirm);
    ok.addEventListener('click',function(){
      closeConfirm();
      if(id&&typeof delAvenant==='function')delAvenant(id);
      else if(typeof toast==='function')toast('Suppression du devis indisponible',true);
    });
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
