(function(){
  'use strict';
  if(window.__yayaDevisEditIdFixV1)return;
  window.__yayaDevisEditIdFixV1=true;

  let active={kind:'',id:''};

  function remember(edit){
    if(!edit)return;
    active={kind:String(edit.dataset.kind||''),id:String(edit.dataset.rowId||'')};
  }

  function applyToModal(){
    const modal=document.querySelector('.yaya-devis-fast-modal');
    if(!modal||!active.id)return;
    modal.dataset.yayaQuoteKind=active.kind;
    modal.dataset.yayaQuoteId=active.id;

    if(active.kind!=='avenant')return;
    const id=active.id;
    const save=[...modal.querySelectorAll('button')].find(function(b){
      return /Enregistrer/i.test(String(b.textContent||''));
    });
    if(!save)return;

    save.dataset.yayaQuoteId=id;
    save.onclick=null;
    save.removeAttribute('onclick');
    if(save.dataset.yayaDevisIdFixBound==='1')return;
    save.dataset.yayaDevisIdFixBound='1';
    save.addEventListener('click',async function(e){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const quoteId=String(this.dataset.yayaQuoteId||id);
      try{
        if(typeof window.saveAvenantComplet==='function'){
          await window.saveAvenantComplet(quoteId);
        }else if(typeof saveAvenantComplet==='function'){
          await saveAvenantComplet(quoteId);
        }else{
          throw new Error('fonction saveAvenantComplet introuvable');
        }
      }catch(err){
        try{if(typeof toast==='function')toast('Enregistrement du devis impossible',true);}catch(x){}
        console.error('Yaya devis edit id fix',err);
      }
    },true);
  }

  document.addEventListener('click',function(e){
    const amount=e.target&&e.target.closest?e.target.closest('#pane-chantiers .yaya-detail-market-row .yaya-detail-charge-cost[data-yaya-market-edit="1"]'):null;
    if(amount){
      const row=amount.closest('.yaya-detail-market-row');
      const edit=row&&row.querySelector('.yaya-detail-document-edit[data-kind][data-row-id]');
      if(edit)remember(edit);
      setTimeout(applyToModal,0);
      setTimeout(applyToModal,50);
      setTimeout(applyToModal,150);
      return;
    }
    const edit=e.target&&e.target.closest?e.target.closest('#pane-chantiers .yaya-detail-market-row .yaya-detail-document-edit[data-kind][data-row-id]'):null;
    if(edit){remember(edit);setTimeout(applyToModal,0);setTimeout(applyToModal,50);}
  },true);

  new MutationObserver(function(){applyToModal();}).observe(document.documentElement,{childList:true,subtree:true});
})();
