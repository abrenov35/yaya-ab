(function(){
  'use strict';

  if(window.__yayaFinanceVisibleDeleteFixV2)return;
  window.__yayaFinanceVisibleDeleteFixV2=true;

  const pending=new Set();

  function txt(v){return String(v==null?'':v).replace(/\s+/g,' ').trim();}
  function norm(v){
    return txt(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
  }
  function toastSafe(message,error){
    try{if(typeof toast==='function')toast(message,!!error);}catch(e){}
  }
  function updateCache(data){
    try{
      const raw=localStorage.getItem('YAYA_CACHE_DATA_V2');
      const cached=raw?JSON.parse(raw):{};
      cached.achats=Array.isArray(data)?data:[];
      localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(cached));
    }catch(e){}
  }
  function applyAchats(list){
    try{S.achats=Array.isArray(list)?list:[];}catch(e){}
    updateCache(list);
    try{if(typeof render==='function')render();}catch(e){}
    try{window.dispatchEvent(new CustomEvent('yaya:data-refreshed'));}catch(e){}
  }
  function achatIdFromButton(btn){
    let id=String(btn&&btn.dataset&&btn.dataset.achatId||'').trim();
    if(id)return id;
    const row=btn&&btn.closest?btn.closest('.yaya-detail-charge-row'):null;
    if(!row)return '';
    id=String(row.dataset&&row.dataset.achatId||'').trim();
    if(id)return id;
    const ref=row.querySelector('[data-achat-id]');
    return String(ref&&ref.dataset&&ref.dataset.achatId||'').trim();
  }
  function chantierIdFromRow(row){
    const card=row&&row.closest?row.closest('.card'):null;
    if(card){
      const actions=Array.from(card.querySelectorAll('[onclick]'));
      for(const el of actions){
        const raw=String(el.getAttribute('onclick')||'');
        const m=raw.match(/(?:toggleChantier|delChantier|editMontantDevis|openAvenant|openDocumentModal|openAchat|openExistingChantierModal)\(['\"]([^'\"]+)/);
        if(m&&m[1])return String(m[1]);
      }
    }
    try{if(typeof focusChantier!=='undefined'&&focusChantier)return String(focusChantier);}catch(e){}
    return '';
  }
  function amountFromRow(row){
    const el=row&&row.querySelector?row.querySelector('.yaya-detail-charge-cost'):null;
    if(!el)return NaN;
    let s=txt(el.textContent).replace(/\u00a0/g,' ').replace(/\s/g,'').replace(/€/g,'').replace(/EUR/ig,'');
    s=s.replace(/[^0-9,.-]/g,'').replace(',','.');
    const n=Number(s);
    return Number.isFinite(n)?Math.abs(n):NaN;
  }
  function isSubcontract(a){
    return /sous[-\s]?trait/i.test(String(a&&a.typeDoc||'')) || txt(a&&a.sousTraitant)!=='';
  }
  function resolveServerId(list,row,domId,isExpense){
    const cid=chantierIdFromRow(row);
    const exact=(list||[]).find(function(a){
      if(String(a&&a.id||'')!==String(domId||''))return false;
      if(cid&&String(a&&a.chantierId||'')!==cid)return false;
      return true;
    });
    if(exact)return String(exact.id||'');

    const amount=amountFromRow(row);
    const rowText=norm(row&&row.textContent||'');
    const candidates=(list||[]).filter(function(a){
      if(cid&&String(a&&a.chantierId||'')!==cid)return false;
      if(!isExpense&&!isSubcontract(a))return false;
      if(isExpense&&isSubcontract(a))return false;
      if(Number.isFinite(amount)&&Math.abs(Math.abs(Number(a&&a.montantHT)||0)-amount)>0.01)return false;
      const supplier=norm(a&&a.sousTraitant||a&&a.fournisseur||'');
      if(supplier&&rowText.indexOf(supplier)===-1)return false;
      return true;
    });
    return candidates.length===1?String(candidates[0].id||''):'';
  }

  async function supprimer(btn,row,domId,isExpense){
    const label=isExpense?'cette dépense':'cette charge';
    if(!window.confirm('Supprimer '+label+' de Yaya ?\n\nLe fichier original Drive ou Dropbox sera conservé.'))return;

    const pendingKey=String(domId||Math.random());
    if(pending.has(pendingKey))return;
    pending.add(pendingKey);
    if(btn){btn.disabled=true;btn.style.opacity='.45';}

    try{
      const fresh=await apiGet(true);
      if(!fresh||!Array.isArray(fresh.achats))throw new Error('liste des achats serveur indisponible');

      const avant=fresh.achats;
      const id=resolveServerId(avant,row,domId,isExpense);
      if(!id){
        throw new Error('impossible d’identifier de façon unique cette ligne dans le Sheet');
      }

      const apres=avant.filter(function(a){return String(a&&a.id||'')!==id;});
      if(apres.length===avant.length){
        applyAchats(avant);
        toastSafe((isExpense?'Dépense':'Charge')+' déjà supprimée — affichage actualisé ✓');
        return;
      }

      const ok=await apiPost('setAchats',apres);
      if(!ok)throw new Error('le serveur a refusé la suppression');

      const verification=await apiGet(true);
      if(!verification||!Array.isArray(verification.achats))throw new Error('vérification serveur impossible');
      if(verification.achats.some(function(a){return String(a&&a.id||'')===id;})){
        throw new Error('la ligne est toujours présente dans Yaya après enregistrement');
      }

      applyAchats(verification.achats);
      toastSafe((isExpense?'Dépense':'Charge')+' supprimée de Yaya — fichier conservé ✓');
    }catch(err){
      toastSafe('Suppression impossible : '+String(err&&err.message||err),true);
      try{
        const fresh=await apiGet(true);
        if(fresh&&Array.isArray(fresh.achats))applyAchats(fresh.achats);
      }catch(e){}
    }finally{
      pending.delete(pendingKey);
      if(btn&&document.contains(btn)){btn.disabled=false;btn.style.opacity='';}
    }
  }

  document.addEventListener('click',function(event){
    const btn=event.target&&event.target.closest
      ?event.target.closest('#pane-chantiers .yaya-detail-charge-delete')
      :null;
    if(!btn)return;

    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();

    const row=btn.closest('.yaya-detail-charge-row');
    const id=achatIdFromButton(btn);
    const isExpense=!!btn.closest('.yaya-detail-expense-row');
    supprimer(btn,row,id,isExpense);
  },true);
})();
