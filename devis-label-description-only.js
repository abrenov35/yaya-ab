(function(){
'use strict';
if(window.__yayaDevisLabelDescriptionOnlyV1)return;
window.__yayaDevisLabelDescriptionOnlyV1=true;

function hideAmountFields(root){
  root=root||document;
  root.querySelectorAll('.yaya-devis-fast-modal, .modal, [role="dialog"]').forEach(function(modal){
    var title=String((modal.querySelector('h1,h2,h3,.modal-title')||{}).textContent||'');
    if(!/devis/i.test(title))return;
    modal.querySelectorAll('input').forEach(function(input){
      var ph=String(input.placeholder||'');
      var name=String(input.name||'');
      var id=String(input.id||'');
      if(/montant.*ht|ht.*montant/i.test(ph+' '+name+' '+id)){
        var wrap=input.closest('.field,.form-group,.yaya-field,label')||input.parentElement;
        if(wrap)wrap.style.setProperty('display','none','important');
        else input.style.setProperty('display','none','important');
      }
    });
    modal.querySelectorAll('label').forEach(function(label){
      if(/montant\s*ht/i.test(String(label.textContent||''))){
        var wrap=label.closest('.field,.form-group,.yaya-field')||label.parentElement;
        if(wrap)wrap.style.setProperty('display','none','important');
      }
    });
  });
}

function hideMarketAmounts(){
  document.querySelectorAll('#pane-chantiers .yaya-detail-market-row').forEach(function(row){
    var edit=row.querySelector('.yaya-detail-document-edit[data-kind]');
    if(!edit || String(edit.dataset.kind||'')!=='avenant')return;
    row.querySelectorAll('.yaya-detail-charge-cost,[data-yaya-market-edit="1"]').forEach(function(el){
      el.style.setProperty('display','none','important');
    });
  });
}

function run(){hideAmountFields(document);hideMarketAmounts();}
new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('click',function(){setTimeout(run,0);setTimeout(run,100);},true);
run();
})();
