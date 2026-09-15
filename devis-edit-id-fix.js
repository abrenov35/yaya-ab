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

/* Devis : le montant reste une donnée comptable existante, mais n'est plus affiché
   ni modifiable dans l'interface Marché. L'édition se fait en cliquant sur le libellé. */
(function(){
  'use strict';
  if(window.__yayaDevisNoAmountUiV2)return;
  window.__yayaDevisNoAmountUiV2=true;

  const style=document.createElement('style');
  style.id='yaya-devis-no-amount-ui-v2';
  style.textContent=`
    #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > .yaya-detail-charge-cost{display:none!important}
    #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row{grid-template-columns:minmax(0,1fr) 46px!important}
    #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > strong{grid-column:1!important;cursor:pointer!important;border-radius:6px!important}
    #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > strong:hover{opacity:.76!important}
    #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > .yaya-detail-document-delete,
    #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > .yaya-initial-devis-delete{grid-column:2!important}
    .yaya-devis-fast-modal .yaya-devis-fast-field:has(#edMt),
    .yaya-devis-fast-modal .yaya-devis-fast-field:has(#eavMt){display:none!important}
  `;
  document.head.appendChild(style);

  function bind(){
    document.querySelectorAll('#pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row').forEach(function(row){
      const title=row.querySelector('strong');
      const edit=row.querySelector('.yaya-detail-document-edit[data-kind][data-row-id]');
      if(!title||!edit||title.dataset.yayaDevisTitleEditBound==='1')return;
      title.dataset.yayaDevisTitleEditBound='1';
      title.setAttribute('role','button');
      title.setAttribute('tabindex','0');
      title.setAttribute('title','Modifier le devis');
      function open(e){
        if(e){e.preventDefault();e.stopPropagation();}
        const current=row.querySelector('.yaya-detail-document-edit[data-kind][data-row-id]');
        if(current){remember(current);current.click();setTimeout(applyToModal,0);setTimeout(applyToModal,50);}
      }
      title.addEventListener('click',open);
      title.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' ')open(e);});
    });
  }

  let raf=0;
  function schedule(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;bind();});}
  bind();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('yaya:data-refreshed',schedule);
})();
