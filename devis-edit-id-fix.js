(function(){
  'use strict';
  if(window.__yayaDevisEditIdFixV1)return;
  window.__yayaDevisEditIdFixV1=true;
  let active={kind:'',id:''};
  function remember(edit){if(!edit)return;active={kind:String(edit.dataset.kind||''),id:String(edit.dataset.rowId||'')};}
  function applyToModal(){
    const modal=document.querySelector('.yaya-devis-fast-modal');
    if(!modal||!active.id)return;
    modal.dataset.yayaQuoteKind=active.kind;modal.dataset.yayaQuoteId=active.id;
    if(active.kind!=='avenant')return;
    const id=active.id;
    const save=[...modal.querySelectorAll('button')].find(b=>/Enregistrer/i.test(String(b.textContent||'')));
    if(!save)return;
    save.dataset.yayaQuoteId=id;save.onclick=null;save.removeAttribute('onclick');
    if(save.dataset.yayaDevisIdFixBound==='1')return;
    save.dataset.yayaDevisIdFixBound='1';
    save.addEventListener('click',async function(e){
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
      const quoteId=String(this.dataset.yayaQuoteId||id);
      try{
        if(typeof window.saveAvenantComplet==='function')await window.saveAvenantComplet(quoteId);
        else if(typeof saveAvenantComplet==='function')await saveAvenantComplet(quoteId);
        else throw new Error('fonction saveAvenantComplet introuvable');
      }catch(err){try{if(typeof toast==='function')toast('Enregistrement du devis impossible',true);}catch(x){}console.error('Yaya devis edit id fix',err);}
    },true);
  }
  document.addEventListener('click',function(e){
    const amount=e.target&&e.target.closest?e.target.closest('#pane-chantiers .yaya-detail-market-row .yaya-detail-charge-cost[data-yaya-market-edit="1"]'):null;
    if(amount){const row=amount.closest('.yaya-detail-market-row');const edit=row&&row.querySelector('.yaya-detail-document-edit[data-kind][data-row-id]');if(edit)remember(edit);setTimeout(applyToModal,0);setTimeout(applyToModal,50);setTimeout(applyToModal,150);return;}
    const edit=e.target&&e.target.closest?e.target.closest('#pane-chantiers .yaya-detail-market-row .yaya-detail-document-edit[data-kind][data-row-id]'):null;
    if(edit){remember(edit);setTimeout(applyToModal,0);setTimeout(applyToModal,50);}
  },true);
  new MutationObserver(function(){applyToModal();}).observe(document.documentElement,{childList:true,subtree:true});
})();

(function(){
  'use strict';
  if(window.__yayaDevisNoAmountUiV3)return;
  window.__yayaDevisNoAmountUiV3=true;
  const style=document.createElement('style');
  style.textContent=`
    #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > .yaya-detail-charge-cost{display:none!important}
    #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row{grid-template-columns:minmax(0,1fr) 46px!important}
    #pane-chantiers .yaya-detail-markets-pane .yaya-detail-market-row > strong{cursor:pointer!important}
  `;
  document.head.appendChild(style);

  function hideAmountInDevisModal(modal){
    if(!modal)return;
    const text=String(modal.textContent||'');
    if(!/devis/i.test(text))return;
    modal.querySelectorAll('input').forEach(function(input){
      const signature=[input.placeholder,input.name,input.id,input.getAttribute('aria-label')].join(' ');
      if(!/montant/i.test(signature)||!/(ht|devis)/i.test(signature))return;
      let box=input.parentElement;
      let p=input;
      for(let i=0;i<3&&p;i++,p=p.parentElement){
        if(p.querySelector&&p.querySelector('label')&&/montant\s*ht/i.test(String(p.textContent||''))){box=p;break;}
      }
      if(box)box.style.setProperty('display','none','important');
      input.style.setProperty('display','none','important');
    });
    modal.querySelectorAll('label').forEach(function(label){
      if(!/montant\s*ht/i.test(String(label.textContent||'')))return;
      let box=label.parentElement;
      if(box)box.style.setProperty('display','none','important');
    });
  }

  function clean(){
    document.querySelectorAll('.yaya-devis-fast-modal,[role="dialog"],.modal').forEach(hideAmountInDevisModal);
    document.querySelectorAll('#pane-chantiers .yaya-detail-market-row').forEach(function(row){
      const edit=row.querySelector('.yaya-detail-document-edit[data-kind="avenant"]');
      if(!edit)return;
      row.querySelectorAll('.yaya-detail-charge-cost,[data-yaya-market-edit="1"]').forEach(el=>el.style.setProperty('display','none','important'));
      const title=row.querySelector('strong');
      if(title&&title.dataset.yayaDevisTitleEditBound!=='1'){
        title.dataset.yayaDevisTitleEditBound='1';title.style.cursor='pointer';title.title='Modifier le devis';
        title.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();remember(edit);edit.click();setTimeout(clean,0);setTimeout(clean,100);});
      }
    });
  }
  let pending=false;
  function schedule(){if(pending)return;pending=true;requestAnimationFrame(function(){pending=false;clean();});}
  clean();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('click',function(){setTimeout(clean,0);setTimeout(clean,100);},true);
})();
