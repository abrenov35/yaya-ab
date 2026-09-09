(function(){
  'use strict';

  if(window.__yayaFinanceVisibleDeleteFixV1)return;
  window.__yayaFinanceVisibleDeleteFixV1=true;

  const pending=new Set();

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

  async function supprimer(btn,id,isExpense){
    if(!id||pending.has(id))return;
    const label=isExpense?'cette dépense':'cette charge';
    if(!window.confirm('Supprimer '+label+' de Yaya ?\n\nLe fichier original Drive ou Dropbox sera conservé.'))return;

    pending.add(id);
    if(btn){btn.disabled=true;btn.style.opacity='.45';}

    try{
      const fresh=await apiGet(true);
      if(!fresh||!Array.isArray(fresh.achats))throw new Error('liste des achats serveur indisponible');

      const avant=fresh.achats;
      const existe=avant.some(function(a){return String(a&&a.id||'')===String(id);});
      if(!existe){
        applyAchats(avant);
        toastSafe((isExpense?'Dépense':'Charge')+' déjà supprimée — affichage actualisé ✓');
        return;
      }

      const apres=avant.filter(function(a){return String(a&&a.id||'')!==String(id);});
      const ok=await apiPost('setAchats',apres);
      if(!ok)throw new Error('le serveur a refusé la suppression');

      const verification=await apiGet(true);
      if(!verification||!Array.isArray(verification.achats))throw new Error('vérification serveur impossible');
      if(verification.achats.some(function(a){return String(a&&a.id||'')===String(id);} )){
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
      pending.delete(id);
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

    const id=achatIdFromButton(btn);
    if(!id){
      toastSafe('Suppression impossible : identifiant de la ligne introuvable.',true);
      return;
    }

    const isExpense=!!btn.closest('.yaya-detail-expense-row');
    supprimer(btn,id,isExpense);
  },true);
})();
