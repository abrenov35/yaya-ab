(function(){
  'use strict';

  if(window.__yayaChargeDeleteDirectV1)return;
  window.__yayaChargeDeleteDirectV1=true;

  const pending=new Set();

  function txt(v){return String(v==null?'':v).replace(/\s+/g,' ').trim();}
  function norm(v){
    return txt(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
  }
  function toastSafe(message,error){
    try{if(typeof toast==='function')toast(message,!!error);}catch(e){}
  }
  function isSousTraitant(a){
    return /sous[-\s]?trait/i.test(String(a&&a.typeDoc||'')) || txt(a&&a.sousTraitant)!=='';
  }
  function cardId(row){
    const card=row&&row.closest?row.closest('.card'):null;
    if(card){
      const nodes=Array.from(card.querySelectorAll('[onclick]'));
      for(const el of nodes){
        const code=String(el.getAttribute('onclick')||'');
        const m=code.match(/(?:toggleChantier|delChantier|editMontantDevis|openAvenant|openDocumentModal|openAchat|openExistingChantierModal)\(['\"]([^'\"]+)/);
        if(m&&m[1])return String(m[1]);
      }
    }
    try{if(typeof focusChantier!=='undefined'&&focusChantier)return String(focusChantier);}catch(e){}
    return '';
  }
  function numericAmount(row){
    const el=row&&row.querySelector?row.querySelector('.yaya-detail-charge-cost,.charge-montant'):null;
    if(!el)return NaN;
    let s=txt(el.textContent).replace(/\u00a0/g,' ').replace(/\s/g,'').replace(/€/g,'').replace(/EUR/ig,'');
    s=s.replace(/[^0-9,.-]/g,'').replace(',','.');
    const n=Number(s);
    return Number.isFinite(n)?Math.abs(n):NaN;
  }
  function idFromRow(row){
    if(!row)return '';
    if(row.dataset&&row.dataset.achatId)return String(row.dataset.achatId);
    const ref=row.querySelector&&row.querySelector('[data-achat-id]');
    if(ref&&ref.dataset&&ref.dataset.achatId)return String(ref.dataset.achatId);

    const all=Array.from(row.querySelectorAll?row.querySelectorAll('[onclick]'):[])
      .map(el=>String(el.getAttribute('onclick')||''))
      .join(' ');
    let m=all.match(/(?:delAchat|editAchat|editMontantAchat)\(['\"]([^'\"]+)['\"]\)/);
    if(m&&m[1])return String(m[1]);

    try{
      if(typeof S==='undefined'||!S||!Array.isArray(S.achats))return '';
      const cid=cardId(row);
      const amount=numericAmount(row);
      const rowText=norm(row.textContent);
      const candidates=S.achats.filter(function(a){
        if(!isSousTraitant(a))return false;
        if(cid&&String(a&&a.chantierId||'')!==cid)return false;
        if(Number.isFinite(amount)&&Math.abs(Math.abs(Number(a&&a.montantHT)||0)-amount)>0.01)return false;
        const supplier=norm(a&&a.sousTraitant||a&&a.fournisseur||'');
        const designation=norm(a&&a.designation||'');
        if(supplier&&rowText.indexOf(supplier)===-1)return false;
        if(designation&&designation.length>3&&rowText.indexOf(designation)===-1)return false;
        return true;
      });
      if(candidates.length===1)return String(candidates[0].id||'');
    }catch(e){}
    return '';
  }
  function isDeleteButton(btn){
    if(!btn||btn.tagName!=='BUTTON')return false;
    const row=btn.closest&&btn.closest('.yaya-detail-charges-pane .yaya-detail-charge-row,.yaya-charge-legacy-row,.achligne.ligR,.charge-row-standard,.charge-validee-ligne');
    if(!row)return false;
    const cls=String(btn.className||'');
    const title=String(btn.getAttribute('title')||'');
    const aria=String(btn.getAttribute('aria-label')||'');
    const code=String(btn.getAttribute('onclick')||'');
    const t=txt(btn.textContent);
    return /delete|suppr|finance-delete|charge-delete/i.test(cls)
      || /supprimer/i.test(title)
      || /supprimer/i.test(aria)
      || /delAchat\s*\(/.test(code)
      || /^[×✕✖❌]$/.test(t);
  }
  function updateLocalCache(achats){
    try{
      const raw=localStorage.getItem('YAYA_CACHE_DATA_V2');
      if(!raw)return;
      const data=JSON.parse(raw);
      if(data&&typeof data==='object'){
        data.achats=achats;
        localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(data));
      }
    }catch(e){}
  }
  function applyFresh(fresh){
    if(!fresh||!Array.isArray(fresh.achats))return;
    try{S.achats=fresh.achats;}catch(e){}
    updateLocalCache(fresh.achats);
    try{if(typeof render==='function')render();}catch(e){}
    try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed'));}catch(e){}
  }
  async function deleteCharge(id){
    const sid=String(id||'').trim();
    if(!sid||pending.has(sid))return;

    const ok=window.confirm('Supprimer cette charge de Yaya ?\n\nLe fichier original Drive ou Dropbox sera conservé.');
    if(!ok)return;

    pending.add(sid);
    try{
      let fresh=null;
      try{fresh=await apiGet(true);}catch(e){}
      const serverAchats=fresh&&Array.isArray(fresh.achats)?fresh.achats:(typeof S!=='undefined'&&S&&Array.isArray(S.achats)?S.achats.slice():[]);

      const exists=serverAchats.some(a=>String(a&&a.id||'')===sid);
      if(!exists){
        if(fresh)applyFresh(fresh);
        else{
          S.achats=serverAchats.filter(a=>String(a&&a.id||'')!==sid);
          updateLocalCache(S.achats);
          render();
        }
        toastSafe('Charge déjà supprimée — affichage actualisé ✓');
        return;
      }

      const next=serverAchats.filter(a=>String(a&&a.id||'')!==sid);
      const saved=await apiPost('setAchats',next);
      if(!saved)throw new Error('écriture Yaya refusée');

      let after=null;
      try{after=await apiGet(true);}catch(e){}
      if(after&&Array.isArray(after.achats)){
        if(after.achats.some(a=>String(a&&a.id||'')===sid)){
          throw new Error('la charge est encore présente après enregistrement');
        }
        applyFresh(after);
      }else{
        S.achats=next;
        updateLocalCache(next);
        render();
        try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed'));}catch(e){}
      }

      toastSafe('Charge supprimée de Yaya — fichier conservé ✓');
    }catch(err){
      toastSafe('Suppression impossible : '+String(err&&err.message||err),true);
      try{
        const fresh=await apiGet(true);
        applyFresh(fresh);
      }catch(e){}
    }finally{
      pending.delete(sid);
    }
  }

  // Capture au niveau window : passe avant les anciens gestionnaires de clic de Yaya.
  window.addEventListener('click',function(event){
    const btn=event.target&&event.target.closest?event.target.closest('button'):null;
    if(!isDeleteButton(btn))return;
    const row=btn.closest('.yaya-detail-charge-row,.yaya-charge-legacy-row,.achligne.ligR,.charge-row-standard,.charge-validee-ligne');
    const id=idFromRow(row);

    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();

    if(!id){
      toastSafe('Impossible d’identifier cette charge. Recharge Yaya puis réessaie.',true);
      return;
    }
    deleteCharge(id);
  },true);
})();
