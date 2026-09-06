(function(){
  'use strict';

  if(window.__yayaMainQuoteDeletePersistFixV2Installed)return;
  window.__yayaMainQuoteDeletePersistFixV2Installed=true;

  const DELETED='__YAYA_DEVIS_INITIAL_SUPPRIME__';
  const SIG_RE=/\[\[YAYA_SIG:(\d{4}-\d{2})\]\]/;
  let scheduled=false;

  function deletedMain(c){
    return !!c
      && String(c.notes||'').includes(DELETED)
      && !(Number(c.montantDevisHT)||0);
  }

  function normalizeDeletedMainQuotes(){
    try{
      if(typeof S==='undefined'||!S||!Array.isArray(S.chantiers))return false;
      let changed=false;

      S.chantiers.forEach(function(c){
        if(!deletedMain(c))return;

        const notes=String(c.notes||'');
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

      if(changed){
        try{localStorage.setItem('YAYA_CACHE_DATA_V2',JSON.stringify(S));}catch(e){}
      }

      return changed;
    }catch(e){
      return false;
    }
  }

  function forceHiddenRows(){
    try{
      if(typeof S==='undefined'||!S||!Array.isArray(S.chantiers))return;

      document.querySelectorAll('#pane-chantiers .yaya-detail-market-row').forEach(function(row){
        const edit=row.querySelector('.yaya-detail-document-edit[data-kind="main"]');
        if(!edit)return;

        const id=String(edit.dataset.rowId||'');
        const c=S.chantiers.find(function(x){return String(x&&x.id)===id;});
        if(!deletedMain(c))return;

        row.dataset.yayaInitialDeleted='1';
        row.style.setProperty('display','none','important');

        const view=row.querySelector('.yaya-detail-document-view');
        if(view){
          view.dataset.yayaMarketDeleted='1';
          view.style.setProperty('visibility','hidden','important');
          view.style.setProperty('pointer-events','none','important');
        }
      });
    }catch(e){}
  }

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

  function installDeleteVerification(){
    if(typeof window.apiPost!=='function'||typeof window.apiGet!=='function'){
      setTimeout(installDeleteVerification,120);
      return;
    }
    if(window.apiPost.__yayaMainQuoteDeleteVerifyV2)return;

    const original=window.apiPost;

    async function wrappedApiPost(action,data){
      const wantedDeletes=(
        action==='setChantiers'&&Array.isArray(data)
      )
        ?data.filter(deletedMain).map(function(c){return String(c.id||'');}).filter(Boolean)
        :[];

      const ok=await original.apply(this,arguments);
      if(!ok||!wantedDeletes.length)return ok;

      try{
        const fresh=await window.apiGet(true);
        const rows=fresh&&Array.isArray(fresh.chantiers)?fresh.chantiers:[];

        for(const id of wantedDeletes){
          const stored=rows.find(function(c){return String(c&&c.id)===id;});
          if(!deletedMain(stored)){
            try{
              if(typeof toast==='function'){
                toast('Suppression du devis principal non conservée par le serveur',true);
              }
            }catch(e){}
            console.error('Yaya : suppression devis principal non persistée',id,stored);
            return false;
          }
        }
      }catch(err){
        console.warn('Yaya : vérification suppression devis principal impossible',err);
      }

      normalizeDeletedMainQuotes();
      schedule();
      return ok;
    }

    wrappedApiPost.__yayaMainQuoteDeleteVerifyV2=true;
    wrappedApiPost.__yayaOriginalApiPost=original;
    window.apiPost=wrappedApiPost;
  }

  apply();
  installDeleteVerification();

  window.addEventListener('yaya:data-refreshed',function(){
    normalizeDeletedMainQuotes();
    schedule();
  });

  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});

  setTimeout(apply,50);
  setTimeout(apply,250);
  setTimeout(apply,800);
})();
