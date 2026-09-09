(function(){
  'use strict';

  const deletePending=new Set();

  function confirmationSuppression(type){
    return new Promise(function(resolve){
      const isDoc=type==='document';
      const isCharge=type==='charge';
      const libelle=isDoc?'ce document':(isCharge?'cette charge':'cette dépense');
      const overlay=document.createElement('div');
      overlay.className='yaya-delete-preserve-overlay';
      overlay.style.cssText='position:fixed;inset:0;background:rgba(22,45,73,.45);z-index:9500;display:flex;align-items:center;justify-content:center;padding:16px';
      overlay.innerHTML=''
        +'<div style="background:#fff;border-radius:14px;padding:22px;max-width:390px;width:100%;box-shadow:0 14px 45px rgba(0,0,0,.22);text-align:left">'
        +'<div style="font-size:16px;font-weight:800;color:#162D49;margin-bottom:10px">Supprimer '+libelle+' de Yaya ?</div>'
        +'<div style="font-size:13px;line-height:1.5;color:#556579;margin-bottom:16px">'
        +'<b style="color:#2E7D46">Suppression Yaya uniquement.</b><br>'
        +'Le fichier restera conservé dans le dossier chantier sur Dropbox / Drive. Il ne sera pas supprimé ni déplacé.'
        +'</div>'
        +'<div style="display:flex;gap:9px;justify-content:flex-end">'
        +'<button type="button" data-yaya-delete-cancel style="padding:9px 14px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;color:#334155;font-weight:700;cursor:pointer">Annuler</button>'
        +'<button type="button" data-yaya-delete-ok style="padding:9px 14px;border-radius:8px;border:0;background:#dc2626;color:#fff;font-weight:700;cursor:pointer">Supprimer de Yaya</button>'
        +'</div></div>';

      function close(value){
        if(overlay.parentNode)overlay.parentNode.removeChild(overlay);
        resolve(value);
      }

      overlay.querySelector('[data-yaya-delete-cancel]').onclick=function(){close(false);};
      overlay.querySelector('[data-yaya-delete-ok]').onclick=function(){close(true);};
      overlay.onclick=function(e){if(e.target===overlay)close(false);};
      document.body.appendChild(overlay);
      setTimeout(function(){
        const btn=overlay.querySelector('[data-yaya-delete-cancel]');
        if(btn)btn.focus();
      },0);
    });
  }

  function toastSafe(message,error){
    try{
      if(typeof toast==='function')toast(message,!!error);
    }catch(e){}
  }

  window.delDocument=async function(id){
    if(!Array.isArray(S.documents)||!S.documents.some(function(x){return String(x.id)===String(id);} ))return;
    const ok=await confirmationSuppression('document');
    if(!ok)return;
    const avant=S.documents.slice();
    S.documents=S.documents.filter(function(x){return String(x.id)!==String(id);});
    render();
    const saved=await apiPost('setDocuments',S.documents);
    if(saved){
      toastSafe('Document supprimé de Yaya — fichier conservé dans le dossier chantier ✓');
    }else{
      S.documents=avant;
      render();
      toastSafe('Suppression non enregistrée — le document a été restauré dans Yaya.',true);
    }
  };

  window.delAchat=async function(id){
    const sid=String(id||'');
    if(!sid||deletePending.has(sid))return;
    if(!Array.isArray(S.achats))return;
    const achat=S.achats.find(function(x){return String(x&&x.id||'')===sid;});
    if(!achat){
      toastSafe('Charge introuvable dans Yaya. Recharge la fiche puis réessaie.',true);
      return;
    }

    const isCharge=String(achat.typeDoc||'').toLowerCase()==='facture sous-traitant'
      || String(achat.sousTraitant||'').trim()!=='';
    const ok=await confirmationSuppression(isCharge?'charge':'depense');
    if(!ok)return;

    deletePending.add(sid);
    const avant=S.achats.slice();
    try{
      S.achats=S.achats.filter(function(x){return String(x&&x.id||'')!==sid;});
      render();
      const saved=await apiPost('setAchats',S.achats);
      if(saved){
        toastSafe((isCharge?'Charge':'Dépense')+' supprimée de Yaya — fichier conservé dans le dossier chantier ✓');
      }else{
        S.achats=avant;
        render();
        toastSafe('Suppression non enregistrée — la ligne a été restaurée dans Yaya.',true);
      }
    }finally{
      deletePending.delete(sid);
    }
  };

  function extractIdFromCode(code){
    const m=String(code||'').match(/(?:delAchat|editAchat|editMontantAchat)\(['\"]([^'\"]+)['\"]\)/);
    return m&&m[1]?String(m[1]):'';
  }

  function chargeIdFromButton(btn){
    if(!btn)return '';
    if(btn.dataset&&btn.dataset.achatId)return String(btn.dataset.achatId);
    if(btn.dataset&&btn.dataset.yayaChargeDeleteId)return String(btn.dataset.yayaChargeDeleteId);

    const direct=extractIdFromCode(btn.getAttribute&&btn.getAttribute('onclick'));
    if(direct)return direct;

    const row=btn.closest&&btn.closest('.yaya-detail-charge-row,.achligne,.ligR,.charge-row-standard,.charge-validee-ligne,.charge-row,.controle-row');
    if(!row)return '';
    if(row.dataset&&row.dataset.achatId)return String(row.dataset.achatId);

    const ref=row.querySelector&&row.querySelector('[data-achat-id]');
    if(ref&&ref.dataset&&ref.dataset.achatId)return String(ref.dataset.achatId);

    const action=row.querySelectorAll?Array.from(row.querySelectorAll('[onclick]')).map(function(el){return el.getAttribute('onclick')||'';}).join(' '):'';
    return extractIdFromCode(action);
  }

  function isChargeDeleteButton(btn){
    if(!btn||btn.tagName!=='BUTTON')return false;
    const inChargePane=!!(btn.closest&&btn.closest('#pane-chantiers .yaya-detail-charges-pane'));
    const inChargePage=!!(btn.closest&&btn.closest('#pane-achats'));
    if(!inChargePane&&!inChargePage)return false;

    const cls=String(btn.className||'');
    const title=String(btn.getAttribute('title')||'');
    const aria=String(btn.getAttribute('aria-label')||'');
    const onclick=String(btn.getAttribute('onclick')||'');
    const text=String(btn.textContent||'').trim();

    return /charge-delete|finance-delete|\bx\b/i.test(cls)
      || /delAchat\s*\(/.test(onclick)
      || /supprimer/i.test(title)
      || /supprimer/i.test(aria)
      || /^[×✕✖❌]$/.test(text);
  }

  document.addEventListener('click',function(event){
    const btn=event.target&&event.target.closest?event.target.closest('button'):null;
    if(!isChargeDeleteButton(btn))return;

    const id=chargeIdFromButton(btn);
    if(!id){
      event.preventDefault();
      event.stopPropagation();
      if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
      toastSafe('Impossible d’identifier cette charge. Recharge la fiche puis réessaie.',true);
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
    window.delAchat(id);
  },true);
})();
